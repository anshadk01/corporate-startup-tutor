import PromptLog from "../models/PromptLog.js";
import { createAppendOnlyLog } from "../services/promptLogService.js";

/**
 * GET /api/prompt-logs
 * Strictly read-only.
 * - Students can only query their own groupId.
 * - Instructors can view all groups or filter by groupId.
 */
export const getPromptLogs = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "STUDENT") {
      query.groupId = req.user.groupId;
    } else if (req.query.groupId) {
      query.groupId = req.query.groupId;
    }

    if (req.query.feature) {
      query.feature = req.query.feature;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      query.$or = [
        { prompt: searchRegex },
        { studentNotes: searchRegex }
      ];
    }

    const logs = await PromptLog.find(query)
      .sort({ sequenceNumber: -1 })
      .populate("authorId", "name email role rollNumber")
      .populate("groupId", "name tutorName");

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/prompt-logs/verify-chain/:groupId
 * Allows instructor or students to audit the cryptographic integrity of the group's prompt logs.
 */
export const verifyGroupChain = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (req.user.role === "STUDENT" && req.user.groupId?.toString() !== groupId) {
      return res.status(403).json({ message: "Access denied to other groups." });
    }

    const audit = await PromptLog.verifyChain(groupId);
    res.json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/prompt-logs/notes
 * Records an updated note as a NEW append-only entry marked with isEdit=true.
 * Never mutates past log entries in place!
 */
export const addNoteVersion = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructors cannot modify student notes. Use Instructor Comments." });
    }

    const { parentLogId, studentNotes } = req.body;
    const parentLog = await PromptLog.findById(parentLogId);

    if (!parentLog) {
      return res.status(404).json({ message: "Parent prompt log not found." });
    }

    if (parentLog.groupId.toString() !== req.user.groupId?.toString()) {
      return res.status(403).json({ message: "Unauthorized to annotate another group's prompt log." });
    }

    const newLog = await createAppendOnlyLog({
      groupId: parentLog.groupId,
      authorId: req.user._id,
      feature: parentLog.feature,
      prompt: `[Note Update for Log #${parentLog.sequenceNumber}] ${parentLog.prompt}`,
      aiResponse: parentLog.aiResponse,
      modelName: parentLog.modelName,
      modelVersion: parentLog.modelVersion,
      studentNotes: studentNotes || "",
      isEdit: true,
      parentLogId: parentLog._id,
      editSummary: `Student updated note at ${new Date().toISOString()}`
    });

    const populated = await PromptLog.findById(newLog._id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
