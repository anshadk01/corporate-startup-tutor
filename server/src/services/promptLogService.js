import PromptLog, { calculateLogHash } from "../models/PromptLog.js";

/**
 * Creates an immutable, append-only prompt log entry linked to the previous entry in the group's hash chain.
 */
export const createAppendOnlyLog = async ({
  groupId,
  authorId,
  feature,
  prompt,
  aiResponse,
  modelName = "gemini-1.5-flash",
  modelVersion = "v1beta",
  studentNotes = "",
  isEdit = false,
  parentLogId = null,
  editSummary = ""
}) => {
  // Find latest entry for this group to chain previousHash
  const latestLog = await PromptLog.findOne({ groupId }).sort({ sequenceNumber: -1 });
  const sequenceNumber = latestLog ? latestLog.sequenceNumber + 1 : 1;
  const previousHash = latestLog ? latestLog.hash : "GENESIS";

  const draft = {
    groupId,
    authorId,
    feature,
    prompt,
    aiResponse,
    modelName,
    modelVersion,
    studentNotes,
    sequenceNumber,
    previousHash,
    isEdit,
    parentLogId,
    editSummary
  };

  const hash = calculateLogHash(draft);

  const logEntry = await PromptLog.create({
    ...draft,
    hash
  });

  return logEntry;
};
