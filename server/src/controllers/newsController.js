import News from "../models/News.js";
import PromptLog from "../models/PromptLog.js";
import FortnightCycle from "../models/FortnightCycle.js";
import { callAI } from "../services/ai/index.js";
import { createAppendOnlyLog } from "../services/promptLogService.js";

const VALID_SOURCE_TYPES = [
  "LinkedIn Post",
  "Company Announcement",
  "Startup Announcement",
  "Industry/VC Media"
];

/**
 * GET /api/news
 * Lists news items with group isolation and optional filtering.
 */
export const getNews = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "STUDENT") {
      query.groupId = req.user.groupId;
    } else if (req.query.groupId) {
      query.groupId = req.query.groupId;
    }

    if (req.query.fortnightCycleId) {
      query.fortnightCycleId = req.query.fortnightCycleId;
    }

    if (req.query.sourceType) {
      query.sourceType = req.query.sourceType;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      query.$or = [
        { headline: searchRegex },
        { company: searchRegex },
        { startupPartner: searchRegex },
        { summary: searchRegex },
        { whyItMatters: searchRegex },
        { sourceExcerpt: searchRegex }
      ];
    }

    const newsList = await News.find(query)
      .sort({ createdAt: -1 })
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName")
      .populate("fortnightCycleId", "cycleNumber title dueDate isMissed");

    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/news/:id
 */
export const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName")
      .populate("fortnightCycleId", "cycleNumber title dueDate isMissed");

    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    if (req.user.role === "STUDENT" && req.user.groupId.toString() !== newsItem.groupId._id.toString()) {
      return res.status(403).json({ message: "Access denied: cannot access another group's news curation." });
    }

    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/news/generate
 * Calls AI service using SOURCE TEXT ONLY (never hallucinated/unverified info).
 * Appends prompt log and returns draft news structure.
 */
export const generateNews = async (req, res) => {
  try {
    const {
      sourceExcerpt,
      sourceUrl,
      sourceType = "Company Announcement",
      fortnightCycleId,
      companyHint,
      startupPartnerHint
    } = req.body;

    const groupId = req.user.groupId || req.body.groupId;
    if (!groupId && req.user.role !== "INSTRUCTOR") {
      return res.status(400).json({ message: "Group ID is required to curate news." });
    }

    if (!sourceExcerpt || sourceExcerpt.trim().length < 20) {
      return res.status(400).json({
        message: "Source excerpt is required. Please paste the official announcement text, LinkedIn post, or press release (at least 20 characters)."
      });
    }

    if (!VALID_SOURCE_TYPES.includes(sourceType)) {
      return res.status(400).json({
        message: `Invalid sourceType. Must be one of: ${VALID_SOURCE_TYPES.join(", ")}`
      });
    }

    // Call unified AI with SOURCE TEXT ONLY
    const aiResult = await callAI("FORTNIGHTLY_NEWS", sourceExcerpt, {
      company: companyHint,
      startupPartner: startupPartnerHint,
      sourceType
    });

    // Record immutable append-only prompt log with SHA-256 hash chaining
    const promptLog = await createAppendOnlyLog({
      groupId,
      authorId: req.user._id,
      feature: "FORTNIGHTLY_NEWS",
      prompt: `[Fortnightly Curate: ${sourceType}] Source URL: ${sourceUrl || "N/A"}\nSource Excerpt:\n${sourceExcerpt.trim()}`,
      aiResponse: aiResult.result,
      modelName: aiResult.modelName,
      modelVersion: aiResult.modelVersion,
      studentNotes: ""
    });

    res.json({
      draft: {
        headline: aiResult.result.headline,
        company: aiResult.result.company,
        startupPartner: aiResult.result.startupPartner,
        summary: aiResult.result.summary,
        whyItMatters: aiResult.result.whyItMatters,
        collaborationType: aiResult.result.collaborationType || "Strategic Alliance",
        sourceExcerpt: sourceExcerpt.trim(),
        sourceUrl: sourceUrl ? sourceUrl.trim() : "",
        sourceType,
        fortnightCycleId
      },
      promptLogId: promptLog._id,
      modelName: aiResult.modelName,
      modelVersion: aiResult.modelVersion
    });
  } catch (error) {
    console.error("[generateNews Error]", error);
    res.status(500).json({ message: error.message || "Failed to curate news from source text." });
  }
};

/**
 * POST /api/news
 * Creates a verified fortnightly news entry.
 */
export const createNews = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({
        message: "Instructors have read-only access to student content. Use Instructor Comments."
      });
    }

    const {
      headline,
      company,
      startupPartner,
      date,
      source = "Verified Primary Source",
      sourceType = "Company Announcement",
      sourceUrl,
      sourceExcerpt,
      summary,
      whyItMatters,
      collaborationType = "Strategic Alliance",
      fortnightCycleId,
      verifiedByStudent = true,
      studentNotes = "",
      promptLogId
    } = req.body;

    const groupId = req.user.groupId;
    if (!groupId) {
      return res.status(400).json({ message: "Student must belong to a group to add news." });
    }

    if (!headline || !company || !startupPartner || !sourceUrl || !sourceExcerpt || !summary || !whyItMatters) {
      return res.status(400).json({
        message: "Required fields missing: headline, company, startupPartner, sourceUrl, sourceExcerpt, summary, and whyItMatters."
      });
    }

    if (!VALID_SOURCE_TYPES.includes(sourceType)) {
      return res.status(400).json({
        message: `Invalid sourceType. Must be one of: ${VALID_SOURCE_TYPES.join(", ")}`
      });
    }

    const news = await News.create({
      groupId,
      headline: headline.trim(),
      company: company.trim(),
      startupPartner: startupPartner.trim(),
      date: date || new Date().toISOString().split("T")[0],
      source: source.trim(),
      sourceType,
      sourceUrl: sourceUrl.trim(),
      sourceExcerpt: sourceExcerpt.trim(),
      retrievedAt: new Date(),
      summary: summary.trim(),
      whyItMatters: whyItMatters.trim(),
      collaborationType,
      fortnightCycleId: fortnightCycleId || null,
      verifiedByStudent: Boolean(verifiedByStudent),
      studentNotes: studentNotes.trim(),
      isAiGenerated: Boolean(promptLogId),
      authorId: req.user._id,
      promptLogId: promptLogId || null
    });

    if (studentNotes.trim().length > 0 && promptLogId) {
      const parentLog = await PromptLog.findById(promptLogId);
      if (parentLog) {
        await createAppendOnlyLog({
          groupId,
          authorId: req.user._id,
          feature: "FORTNIGHTLY_NEWS",
          prompt: `[News Finalization] Student Notes on ${news.headline}`,
          aiResponse: {
            headline: news.headline,
            summary: news.summary,
            whyItMatters: news.whyItMatters
          },
          modelName: parentLog.modelName,
          modelVersion: parentLog.modelVersion,
          studentNotes: news.studentNotes,
          isEdit: true,
          parentLogId: parentLog._id,
          editSummary: "Student notes added upon news curation save"
        });
      }
    }

    const populated = await News.findById(news._id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName")
      .populate("fortnightCycleId", "cycleNumber title dueDate isMissed");

    res.status(201).json(populated);
  } catch (error) {
    console.error("[createNews Error]", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/news/:id
 */
export const updateNews = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({
        message: "Instructors have read-only access to student content. Use Instructor Comments."
      });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News item not found." });
    }

    if (req.user.groupId.toString() !== news.groupId.toString()) {
      return res.status(403).json({ message: "Unauthorized to modify another group's news item." });
    }

    const {
      headline,
      company,
      startupPartner,
      sourceType,
      sourceUrl,
      sourceExcerpt,
      summary,
      whyItMatters,
      collaborationType,
      studentNotes,
      fortnightCycleId
    } = req.body;

    if (headline) news.headline = headline.trim();
    if (company) news.company = company.trim();
    if (startupPartner) news.startupPartner = startupPartner.trim();
    if (sourceType && VALID_SOURCE_TYPES.includes(sourceType)) news.sourceType = sourceType;
    if (sourceUrl) news.sourceUrl = sourceUrl.trim();
    if (sourceExcerpt) news.sourceExcerpt = sourceExcerpt.trim();
    if (summary) news.summary = summary.trim();
    if (whyItMatters) news.whyItMatters = whyItMatters.trim();
    if (collaborationType) news.collaborationType = collaborationType;
    if (fortnightCycleId !== undefined) news.fortnightCycleId = fortnightCycleId;
    if (typeof studentNotes === "string") news.studentNotes = studentNotes.trim();

    await news.save();

    // Append versioned audit log
    await createAppendOnlyLog({
      groupId: news.groupId,
      authorId: req.user._id,
      feature: "FORTNIGHTLY_NEWS",
      prompt: `[News Update] Revision of ${news.headline}`,
      aiResponse: {
        headline: news.headline,
        summary: news.summary,
        whyItMatters: news.whyItMatters
      },
      studentNotes: news.studentNotes,
      isEdit: true,
      parentLogId: news.promptLogId || null,
      editSummary: `Student updated news item at ${new Date().toISOString()}`
    });

    const populated = await News.findById(news._id)
      .populate("authorId", "name email rollNumber")
      .populate("groupId", "name tutorName")
      .populate("fortnightCycleId", "cycleNumber title dueDate isMissed");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/news/:id
 */
export const deleteNews = async (req, res) => {
  try {
    if (req.user.role === "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructors cannot delete student news items." });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "News item not found." });
    }

    if (req.user.groupId.toString() !== news.groupId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete another group's news item." });
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News item deleted successfully. Prompt logs preserved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
