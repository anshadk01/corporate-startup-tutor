import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Group from "../models/Group.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }
    next();
  };
};

/**
 * Enforces group isolation on every group-scoped route:
 * - If STUDENT: can only access their assigned groupId.
 * - If INSTRUCTOR: can inspect any group, but is read-only on student content.
 */
export const enforceGroupMembership = async (req, res, next) => {
  const targetGroupId = req.params.groupId || req.params.id || req.body.groupId || req.query.groupId;

  if (!targetGroupId) {
    if (req.user.role === "STUDENT") {
      req.resolvedGroupId = req.user.groupId ? req.user.groupId.toString() : null;
      return next();
    }
    return next();
  }

  if (req.user.role === "STUDENT") {
    if (!req.user.groupId || req.user.groupId.toString() !== targetGroupId.toString()) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to view or modify another group's workspace."
      });
    }
    req.resolvedGroupId = req.user.groupId.toString();
  } else if (req.user.role === "INSTRUCTOR") {
    req.resolvedGroupId = targetGroupId.toString();
  }

  next();
};

/**
 * Prohibits instructors from modifying or creating student reflections and news.
 * Instructors can only post instructor comments or view content.
 */
export const requireStudentAuthor = (req, res, next) => {
  if (req.user.role === "INSTRUCTOR") {
    return res.status(403).json({
      message: "Instructors have read-only access to student content. Please use Instructor Comments to leave feedback."
    });
  }
  next();
};
