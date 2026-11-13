import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Group from "../models/Group.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
    expiresIn: "30d"
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "STUDENT", groupName, groupId, rollNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let assignedGroupId = groupId;

    // If student provided a groupName and no groupId, find or create group
    if (role === "STUDENT" && !assignedGroupId && groupName) {
      let group = await Group.findOne({ name: groupName.trim() });
      if (!group) {
        group = await Group.create({
          name: groupName.trim(),
          tutorName: `${groupName.trim()} Agent Tutor`,
          description: `ENT 3805 Group - ${groupName.trim()}`
        });
      }
      assignedGroupId = group._id;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role.toUpperCase() === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT",
      groupId: assignedGroupId,
      rollNumber: rollNumber ? rollNumber.trim() : undefined
    });

    if (assignedGroupId) {
      await Group.findByIdAndUpdate(assignedGroupId, {
        $addToSet: { memberIds: user._id }
      });
    }

    const populatedUser = await User.findById(user._id).select("-passwordHash").populate("groupId");

    res.status(201).json({
      token: generateToken(user._id),
      user: populatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const populatedUser = await User.findById(user._id).select("-passwordHash").populate("groupId");

    res.json({
      token: generateToken(user._id),
      user: populatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash").populate("groupId");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};