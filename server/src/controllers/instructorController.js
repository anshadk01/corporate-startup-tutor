import Group from "../models/Group.js";
import User from "../models/User.js";
import Reflection from "../models/Reflection.js";
import News from "../models/News.js";
import PromptLog from "../models/PromptLog.js";
import InstructorComment from "../models/InstructorComment.js";

export const getInstructorDashboard = async (req, res) => {
  try {
    const [groups, totalStudents, totalReflections, totalNews, totalPromptLogs, recentLogs] = await Promise.all([
      Group.find().populate("memberIds", "name email rollNumber"),
      User.countDocuments({ role: "STUDENT" }),
      Reflection.countDocuments(),
      News.countDocuments(),
      PromptLog.countDocuments(),
      PromptLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("authorId", "name email rollNumber")
        .populate("groupId", "name")
    ]);

    // Build per-group analytics and 13-session coverage grid
    const groupAnalytics = await Promise.all(
      groups.map(async (grp) => {
        const [reflections, newsCount, logCount] = await Promise.all([
          Reflection.find({ groupId: grp._id }).select("sessionNumber classDate authorId keyPoints openQuestion").populate("authorId", "name"),
          News.countDocuments({ groupId: grp._id }),
          PromptLog.countDocuments({ groupId: grp._id })
        ]);

        // Map sessions 1 to 13 completion status
        const sessionCoverage = [];
        for (let s = 1; s <= 13; s++) {
          const matched = reflections.find(r => r.sessionNumber === s);
          sessionCoverage.push({
            sessionNumber: s,
            completed: Boolean(matched),
            classDate: matched ? matched.classDate : null,
            authorName: matched?.authorId?.name || null
          });
        }

        return {
          id: grp._id,
          name: grp.name,
          tutorName: grp.tutorName,
          memberCount: grp.memberIds.length,
          members: grp.memberIds,
          reflectionsCompleted: reflections.length,
          totalExpectedSessions: 13,
          completionRate: Math.min(100, Math.round((reflections.length / 13) * 100)),
          sessionCoverage,
          newsCount,
          promptLogCount: logCount,
          lastActiveSession: reflections.length > 0
            ? `Session ${Math.max(...reflections.map(r => r.sessionNumber))}`
            : "None"
        };
      })
    );

    res.json({
      summary: {
        totalGroups: groups.length,
        totalStudents,
        totalReflections,
        totalNews,
        totalPromptLogs,
        courseName: "Designing Corporate-Startup Synergies (ENT 3805)",
        institution: "BML Munjal University"
      },
      groups: groupAnalytics,
      recentActivity: recentLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId)
      .populate("memberIds", "name email rollNumber")
      .populate("instructorId", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const [reflections, news, promptLogs, comments, chainAudit] = await Promise.all([
      Reflection.find({ groupId }).sort({ sessionNumber: 1 }).populate("authorId", "name email rollNumber"),
      News.find({ groupId }).sort({ createdAt: -1 }).populate("authorId", "name email rollNumber").populate("fortnightCycleId", "cycleNumber title"),
      PromptLog.find({ groupId }).sort({ sequenceNumber: 1 }).populate("authorId", "name email rollNumber"),
      InstructorComment.find({ groupId }).sort({ createdAt: -1 }).populate("authorId", "name email role"),
      PromptLog.verifyChain(groupId)
    ]);

    res.json({
      group,
      reflections,
      news,
      promptLogs,
      comments,
      chainAudit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/instructor/comments
 * Adds an instructor comment on student content.
 */
export const addInstructorComment = async (req, res) => {
  try {
    const { groupId, targetType, targetId, comment } = req.body;

    if (!groupId || !targetType || !comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "groupId, targetType, and comment are required." });
    }

    const newComment = await InstructorComment.create({
      groupId,
      authorId: req.user._id,
      targetType,
      targetId: targetId || null,
      comment: comment.trim(),
      isInstructorFeedback: true
    });

    const populated = await InstructorComment.findById(newComment._id)
      .populate("authorId", "name email role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/instructor/comments/:groupId
 * Returns all instructor comments for a given group.
 */
export const getGroupComments = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (req.user.role === "STUDENT" && req.user.groupId?.toString() !== groupId) {
      return res.status(403).json({ message: "Access denied to other groups' comments." });
    }

    const comments = await InstructorComment.find({ groupId })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email role");

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/instructor/export/:groupId
 * Generates an academic audit CSV with:
 * Student Prompts, AI Responses, Student Notes, Author, Timestamp, and Cryptographic Hash.
 */
export const exportGroupDataCsv = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (req.user.role === "STUDENT" && req.user.groupId?.toString() !== groupId) {
      return res.status(403).json({ message: "Access denied to export another group's data." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const [logs, reflections, news, chainAudit] = await Promise.all([
      PromptLog.find({ groupId }).sort({ sequenceNumber: 1 }).populate("authorId", "name email rollNumber"),
      Reflection.find({ groupId }).sort({ sessionNumber: 1 }).populate("authorId", "name email"),
      News.find({ groupId }).sort({ createdAt: 1 }).populate("authorId", "name email"),
      PromptLog.verifyChain(groupId)
    ]);

    // CSV format escape helper
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const text = typeof str === "object" ? JSON.stringify(str) : String(str);
      return `"${text.replace(/"/g, '""')}"`;
    };

    let csv = "Seq#,Feature,Author Name,Author Email,Student Prompt,AI Response,Student Notes,Timestamp,Model,Previous Hash,Entry Hash,Chain Integrity\n";

    logs.forEach((log) => {
      const row = [
        log.sequenceNumber,
        log.feature,
        log.authorId?.name || "N/A",
        log.authorId?.email || "N/A",
        escapeCsv(log.prompt),
        escapeCsv(log.aiResponse),
        escapeCsv(log.studentNotes || ""),
        log.createdAt ? new Date(log.createdAt).toISOString() : "N/A",
        `${log.modelName} (${log.modelVersion})`,
        log.previousHash,
        log.hash,
        chainAudit.valid ? "VERIFIED_VALID" : "TAMPERED"
      ];
      csv += row.join(",") + "\n";
    });

    const safeGroupName = group.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=ENT3805_${safeGroupName}_PromptLog_Audit.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
