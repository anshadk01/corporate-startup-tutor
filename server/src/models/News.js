import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    headline: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    startupPartner: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    source: { type: String, required: true, trim: true },
    sourceType: {
      type: String,
      enum: ["LinkedIn Post", "Company Announcement", "Startup Announcement", "Industry/VC Media"],
      required: true,
      default: "Company Announcement"
    },
    sourceUrl: { type: String, required: true, trim: true },
    sourceExcerpt: { type: String, required: true, trim: true },
    retrievedAt: { type: Date, default: Date.now },
    summary: { type: String, required: true, trim: true },
    whyItMatters: { type: String, required: true, trim: true },
    collaborationType: {
      type: String,
      required: true,
      enum: [
        "Corporate Venture Capital",
        "Accelerator / Incubator",
        "Co-Innovation Lab",
        "Strategic Alliance",
        "Startup Acquisition",
        "Global Capability Center",
        "Commercial Pilot / POC",
        "Technology Integration",
        "Outside-In Program",
        "Inside-Out Platform Program"
      ],
      default: "Strategic Alliance"
    },
    fortnightCycleId: { type: mongoose.Schema.Types.ObjectId, ref: "FortnightCycle" },
    verifiedByStudent: { type: Boolean, default: true },
    studentNotes: { type: String, default: "" },
    isAiGenerated: { type: Boolean, default: false },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    promptLogId: { type: mongoose.Schema.Types.ObjectId, ref: "PromptLog" },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
