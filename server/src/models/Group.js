import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    tutorName: { type: String, default: "ENT-3805 Group Tutor" },
    description: { type: String, default: "BML Munjal University - ENT 3805 Course Group" },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);