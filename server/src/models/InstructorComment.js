import mongoose from "mongoose";

const instructorCommentSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["REFLECTION", "NEWS", "PROMPT_LOG", "WORKSPACE"],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    comment: { type: String, required: true, trim: true },
    isInstructorFeedback: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("InstructorComment", instructorCommentSchema);
