import mongoose from "mongoose";

const reflectionSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    sessionNumber: {
      type: Number,
      required: true,
      min: [1, "Session number must be between 1 and 13"],
      max: [13, "Session number must be between 1 and 13"]
    },
    sessionTitle: { type: String, required: true, trim: true },
    classDate: { type: Date, required: true },
    studentInput: { type: String, required: true },
    keyPoints: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Key points must contain at least one point."
      }
    },
    // openQuestion: exactly ONE single string, or null if noneOutstanding is true
    openQuestion: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (this.noneOutstanding) {
            return val === null || val === undefined || val === "";
          }
          if (typeof val !== "string" || val.trim().length === 0) {
            return false;
          }
          // Reject multiple questions (e.g. "? ... ?")
          const qCount = (val.match(/\?/g) || []).length;
          return qCount <= 1;
        },
        message: "openQuestion must be a single string representing exactly ONE unresolved question, or empty if noneOutstanding is true."
      }
    },
    noneOutstanding: { type: Boolean, default: false },
    studentNotes: { type: String, default: "" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    promptLogId: { type: mongoose.Schema.Types.ObjectId, ref: "PromptLog" },
  },
  { timestamps: true }
);

export default mongoose.model("Reflection", reflectionSchema);
