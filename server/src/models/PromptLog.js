import mongoose from "mongoose";
import crypto from "crypto";

const promptLogSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    feature: {
      type: String,
      required: true,
      enum: ["CLASS_REFLECTION", "FORTNIGHTLY_NEWS"],
    },
    prompt: { type: String, required: true },
    aiResponse: { type: mongoose.Schema.Types.Mixed, required: true },
    modelName: { type: String, default: "gemini-1.5-flash" },
    modelVersion: { type: String, default: "v1beta" },
    studentNotes: { type: String, default: "" },
    
    // Hash-chaining audit trail
    sequenceNumber: { type: Number, required: true },
    previousHash: { type: String, default: "GENESIS" },
    hash: { type: String, required: true },

    // Versioning for edits without mutating past entries
    isEdit: { type: Boolean, default: false },
    parentLogId: { type: mongoose.Schema.Types.ObjectId, ref: "PromptLog" },
    editSummary: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // strictly append-only, no updatedAt mutation
  }
);

// Calculate SHA-256 hash for a log entry
export const calculateLogHash = (entry) => {
  const content = `${entry.groupId}_${entry.authorId}_${entry.sequenceNumber}_${entry.previousHash}_${entry.feature}_${entry.prompt}_${JSON.stringify(entry.aiResponse)}_${entry.studentNotes || ""}`;
  return crypto.createHash("sha256").update(content).digest("hex");
};

// Check if entire chain for a group is valid
promptLogSchema.statics.verifyChain = async function (groupId) {
  const logs = await this.find({ groupId }).sort({ sequenceNumber: 1 });
  let expectedPrevHash = "GENESIS";

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (log.previousHash !== expectedPrevHash) {
      return {
        valid: false,
        tamperedAtSequence: log.sequenceNumber,
        logId: log._id,
        reason: `Previous hash mismatch at sequence ${log.sequenceNumber}. Expected ${expectedPrevHash}, got ${log.previousHash}`
      };
    }

    const computed = calculateLogHash(log);
    if (computed !== log.hash) {
      return {
        valid: false,
        tamperedAtSequence: log.sequenceNumber,
        logId: log._id,
        reason: `Content hash mismatch at sequence ${log.sequenceNumber}. Expected ${computed}, got ${log.hash}`
      };
    }
    expectedPrevHash = log.hash;
  }

  return { valid: true, totalLogs: logs.length, latestHash: expectedPrevHash };
};

export default mongoose.model("PromptLog", promptLogSchema);
