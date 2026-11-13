import mongoose from "mongoose";

const fortnightCycleSchema = new mongoose.Schema(
  {
    cycleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    isMissed: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("FortnightCycle", fortnightCycleSchema);
