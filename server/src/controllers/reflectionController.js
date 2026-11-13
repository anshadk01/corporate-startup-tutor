import Reflection from "../models/Reflection.js";
import PromptLog from "../models/PromptLog.js";
import { callAI } from "../services/ai/index.js";
import { createAppendOnlyLog } from "../services/promptLogService.js";

/**
 * Generates reflection draft strictly from student notes using the AI Service.
 * Prompt and response are recorded in the immutable prompt log.
 */
export const generateReflection = async (req, res) => {
  try {
    const { studentNotes, sessionTitle, sessionNumber } = req.body;
    const groupId = req.user.groupId || req.body.groupId;

    if (!groupId && req.user.role !== "INSTRUCTOR") {
      return res.status(400).json({ message: "Student must belong to a group to generate reflections." });
    }

    if (!studentNotes || studentNotes.trim().length < 15) {
      return res.status(400).json({ message: "Please provide class discussion notes (minimum 15 characters)." });
    }

    const sessNum = Number(sessionNumber) || 1;
    const sessTitle = (sessionTitle || `Session ${sessNum}`).trim();

    // Call unified AI service with SOURCE TEXT ONLY
    const aiResult = await callAI("CLASS_REFLECTION", studentNotes, {
      sessionTitle: sessTitle,
      sessionNumber: sessNum
    });

    // Record immutable append-only prompt log with SHA-256 hash chaining
    const promptLog = await createAppendOnlyLog({
      groupId,
      authorId: req.user._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session ${sessNum}: ${sessTitle}] Student Discussion Notes:\n${studentNotes.trim()}`,
      aiResponse: aiResult.result,
      modelName: aiResult.modelName,
      modelVersion: aiResult.modelVersion,
      studentNotes: ""
    });

    res.json({
      keyPoints: aiResult.result.keyPoints,
      openQuestion: aiResult.result.openQuestion,
      promptLogId: promptLog._id,
      modelName: aiResult.modelName,
      modelVersion: aiResult.modelVersion
    });
  } catch (error) {
    console.error("[generateReflection Error]", error);
    res.status(500).json({ message: error.message || "Failed to generate reflection." });
  }
};

/**
 * Creates and finalizes a class reflection.
 * Enforces session 1-13 validation and single-string open question.
 */
export const createReflection = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({
        message: "Instructors have read-only access to student reflections. Use Instructor Comments."
      });
    }

    const {
      sessionNumber,
      sessionTitle,
      classDate,
      studentInput,
      keyPoints,
      openQuestion,
      noneOutstanding = false,
      studentNotes = "",
      promptLogId
    } = req.body;

    const groupId = req.user.groupId;
    if (!groupId) {
      return res.status(400).json({ message: "Student must be assigned to a group to save a reflection." });
    }

    const sessNum = Number(sessionNumber);
    if (!sessNum || sessNum < 1 || sessNum > 13) {
      return res.status(400).json({ message: "sessionNumber must be an integer between 1 and 13." });
    }

    if (!sessionTitle || !classDate || !studentInput || !keyPoints) {
      return res.status(400).json({ message: "All required reflection fields must be provided." });
    }

    // Validate openQuestion: single question string or explicit noneOutstanding flag
    const cleanedQuestion = (openQuestion || "").trim();
    if (!noneOutstanding) {
      if (!cleanedQuestion) {
        return res.status(400).json({
          message: "Please provide exactly ONE open question, or check 'none outstanding'."
        });
      }
      const qCount = (cleanedQuestion.match(/\?/g) || []).length;
      if (qCount > 1) {
        return res.status(400).json({
          message: "openQuestion must be a single question (multiple question marks detected). Please consolidate into ONE question."
        });
      }
    }

    // Check if reflection for this session already exists for this group
    const existing = await Reflection.findOne({ groupId, sessionNumber: sessNum });
    if (existing) {
      return res.status(400).json({
        message: `A reflection for Session ${sessNum} already exists for this group. Please edit the existing entry.`
      });
    }

    const reflection = await Reflection.create({
      groupId,
      sessionNumber: sessNum,
      sessionTitle: sessionTitle.trim(),
      classDate: new Date(classDate),
      studentInput: studentInput.trim(),
      keyPoints: Array.isArray(keyPoints) ? keyPoints.filter(p => p.trim().length > 0) : [keyPoints],
      openQuestion: noneOutstanding ? "" : cleanedQuestion,
      noneOutstanding: Boolean(noneOutstanding),
      studentNotes: studentNotes.trim(),
      authorId: req.user._id,
      promptLogId: promptLogId || null
    });

    // If student provided initial notes and we had a prompt log, append version log (never mutate old log)
    if (studentNotes.trim().length > 0 && promptLogId) {
      const parentLog = await PromptLog.findById(promptLogId);
      if (parentLog) {
        await createAppendOnlyLog({
          groupId,
          authorId: req.user._id,
          feature: "CLASS_REFLECTION",
          prompt: `[Session ${sessNum} Finalization] Saved Notes`,
          aiResponse: {
            keyPoints: reflection.keyPoints,
            openQuestion: reflection.openQuestion
          },
          modelName: parentLog.modelName,
          modelVersion: parentLog.modelVersion,
          studentNotes: reflection.studentNotes,
          isEdit: true,
          parentLogId: parentLog._id,
          editSummary: "Initial student notes added upon reflection submission"
        });
      }
    }

    const populated = await Reflection.findById(reflection._id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName");

    res.status(201).json(populated);
  } catch (error) {
    console.error("[createReflection Error]", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves reflections for the authenticated user's group or requested group (for instructors).
 */
export const getReflections = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "STUDENT") {
      query.groupId = req.user.groupId;
    } else if (req.query.groupId) {
      query.groupId = req.query.groupId;
    }

    const reflections = await Reflection.find(query)
      .sort({ sessionNumber: 1, classDate: 1 })
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName");

    res.json(reflections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a single reflection by ID with group isolation enforcement.
 */
export const getReflectionById = async (req, res) => {
  try {
    const reflection = await Reflection.findById(req.params.id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName");

    if (!reflection) {
      return res.status(404).json({ message: "Reflection not found." });
    }

    if (req.user.role === "STUDENT" && req.user.groupId.toString() !== reflection.groupId._id.toString()) {
      return res.status(403).json({ message: "Access denied: cannot access another group's reflection." });
    }

    res.json(reflection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates a reflection. Students only.
 * Appends an audit log for note/content changes.
 */
export const updateReflection = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({
        message: "Instructors have read-only access to student content. Use Instructor Comments."
      });
    }

    const reflection = await Reflection.findById(req.params.id);
    if (!reflection) {
      return res.status(404).json({ message: "Reflection not found." });
    }

    if (req.user.groupId.toString() !== reflection.groupId.toString()) {
      return res.status(403).json({ message: "Unauthorized to modify another group's reflection." });
    }

    const { keyPoints, openQuestion, noneOutstanding, studentNotes } = req.body;

    if (keyPoints && Array.isArray(keyPoints)) {
      reflection.keyPoints = keyPoints.filter(p => p.trim().length > 0);
    }

    if (typeof noneOutstanding === "boolean") {
      reflection.noneOutstanding = noneOutstanding;
      if (noneOutstanding) {
        reflection.openQuestion = "";
      }
    }

    if (openQuestion !== undefined && !reflection.noneOutstanding) {
      const cleaned = openQuestion.trim();
      const qCount = (cleaned.match(/\?/g) || []).length;
      if (qCount > 1) {
        return res.status(400).json({
          message: "openQuestion must be a single question. Please consolidate into ONE question."
        });
      }
      reflection.openQuestion = cleaned;
    }

    if (typeof studentNotes === "string") {
      reflection.studentNotes = studentNotes.trim();
    }

    await reflection.save();

    // Append versioned audit log (append-only, immutable)
    await createAppendOnlyLog({
      groupId: reflection.groupId,
      authorId: req.user._id,
      feature: "CLASS_REFLECTION",
      prompt: `[Session ${reflection.sessionNumber} Update] Note & Content Revision`,
      aiResponse: {
        keyPoints: reflection.keyPoints,
        openQuestion: reflection.openQuestion
      },
      studentNotes: reflection.studentNotes,
      isEdit: true,
      parentLogId: reflection.promptLogId || null,
      editSummary: `Student updated reflection/notes at ${new Date().toISOString()}`
    });

    const updated = await Reflection.findById(reflection._id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Deletes a reflection document. Students only.
 * Immutable prompt logs are preserved for auditability.
 */
export const deleteReflection = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructors cannot delete student reflections." });
    }

    const reflection = await Reflection.findById(req.params.id);
    if (!reflection) {
      return res.status(404).json({ message: "Reflection not found." });
    }

    if (req.user.groupId.toString() !== reflection.groupId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete another group's reflection." });
    }

    await Reflection.findByIdAndDelete(req.params.id);
    res.json({ message: "Reflection deleted successfully. Audit prompt logs remain preserved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
