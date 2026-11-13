import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Plus,
  Sparkles,
  ExternalLink,
  Search,
  Calendar,
  Building2,
  Rocket,
  Trash2,
  Edit3,
  AlertCircle,
  Save,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { NewsItem, CollaborationType, NewsSourceType, FortnightCycle } from "../types/index.ts";
import { formatDate, getCollaborationColor } from "../utils/formatters.ts";
import { Modal } from "../components/common/Modal.tsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/EmptyState.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { FortnightCountdown } from "../components/common/FortnightCountdown.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";

const COLLABORATION_TYPES: CollaborationType[] = [
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
];

const SOURCE_TYPES: NewsSourceType[] = [
  "LinkedIn Post",
  "Company Announcement",
  "Startup Announcement",
  "Industry/VC Media"
];

export const News: React.FC = () => {
  const { user } = useAuth();
  const isMotionSafe = useMotionSafe();
  const isInstructor = user?.role === "INSTRUCTOR";

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [cycles, setCycles] = useState<FortnightCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSourceType, setSelectedSourceType] = useState<string>("ALL");

  // AI Curation Modal State
  const [isCurateOpen, setIsCurateOpen] = useState(false);
  const [sourceExcerpt, setSourceExcerpt] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<NewsSourceType>("Company Announcement");
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [companyHint, setCompanyHint] = useState("");
  const [startupPartnerHint, setStartupPartnerHint] = useState("");

  // Extracted / Editable fields
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftHeadline, setDraftHeadline] = useState("");
  const [draftCompany, setDraftCompany] = useState("");
  const [draftStartup, setDraftStartup] = useState("");
  const [draftSummary, setDraftSummary] = useState("");
  const [draftWhyItMatters, setDraftWhyItMatters] = useState("");
  const [draftCollabType, setDraftCollabType] = useState<CollaborationType>("Strategic Alliance");
  const [studentNotes, setStudentNotes] = useState("");
  const [promptLogId, setPromptLogId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note Modal
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchCycles = async () => {
    try {
      const res = await api.get("/cycles");
      setCycles(res.data);
      if (res.data.length > 0 && !selectedCycleId) {
        setSelectedCycleId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load cycles:", err);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "ALL") params.append("collaborationType", selectedType);
      if (selectedSourceType !== "ALL") params.append("sourceType", selectedSourceType);
      const url = params.toString() ? `/news?${params.toString()}` : "/news";
      const res = await api.get(url);
      setNewsList(res.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
    fetchNews();
  }, [selectedType, selectedSourceType]);

  const handleSynthesizeSource = async () => {
    if (!sourceExcerpt || sourceExcerpt.trim().length < 20) {
      setError("Please paste the announcement text or LinkedIn post (minimum 20 characters).");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await api.post("/news/generate", {
        sourceExcerpt,
        sourceUrl,
        sourceType,
        fortnightCycleId: selectedCycleId,
        companyHint,
        startupPartnerHint
      });

      const draft = res.data.draft;
      setDraftHeadline(draft.headline || "");
      setDraftCompany(draft.company || "");
      setDraftStartup(draft.startupPartner || "");
      setDraftSummary(draft.summary || "");
      setDraftWhyItMatters(draft.whyItMatters || "");
      if (draft.collaborationType) setDraftCollabType(draft.collaborationType);
      setPromptLogId(res.data.promptLogId);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "AI service unavailable. You can enter the summary and reasons manually below."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCuratedNews = async () => {
    if (!draftHeadline || !draftCompany || !draftStartup || !draftSummary || !draftWhyItMatters || !sourceUrl || !sourceExcerpt) {
      setError("Please ensure headline, corporate partner, startup partner, source URL, source excerpt, summary, and why it matters are completed.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await api.post("/news", {
        headline: draftHeadline,
        company: draftCompany,
        startupPartner: draftStartup,
        source: sourceType,
        sourceType,
        sourceUrl,
        sourceExcerpt,
        summary: draftSummary,
        whyItMatters: draftWhyItMatters,
        collaborationType: draftCollabType,
        fortnightCycleId: selectedCycleId || null,
        studentNotes,
        promptLogId
      });

      setIsCurateOpen(false);
      resetCurateForm();
      fetchNews();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save news curation.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetCurateForm = () => {
    setSourceExcerpt("");
    setSourceUrl("");
    setDraftHeadline("");
    setDraftCompany("");
    setDraftStartup("");
    setDraftSummary("");
    setDraftWhyItMatters("");
    setStudentNotes("");
    setPromptLogId(null);
    setError(null);
  };

  const handleSaveNote = async () => {
    if (!selectedNews) return;
    setIsSavingNote(true);
    try {
      await api.put(`/news/${selectedNews._id}`, {
        studentNotes: noteText
      });
      setSelectedNews(null);
      fetchNews();
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this news curation?")) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const filteredNews = newsList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.headline.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.startupPartner.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.whyItMatters.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600">
            <Newspaper className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mandatory Task #2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fortnightly Collaboration News</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Curate updates once every fortnight: LinkedIn posts, company websites, and startup announcements. Summarize and note why they matter for corporate-startup synergies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <FortnightCountdown />

          {!isInstructor && (
            <button
              onClick={() => {
                resetCurateForm();
                setIsCurateOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Curate News from Source</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news by company, startup, summary..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSourceType}
            onChange={(e) => setSelectedSourceType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Source Types</option>
            {SOURCE_TYPES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Collaboration Types</option>
            {COLLABORATION_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>

      {/* News Cards */}
      {loading ? (
        <LoadingSpinner message="Loading curated news intelligence..." />
      ) : filteredNews.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No news curated for this cycle yet"
          description="Collect a corporate-startup collaboration post from LinkedIn, company press releases, or startup announcements."
          actionText={!isInstructor ? "Curate Fortnightly News" : undefined}
          onAction={!isInstructor ? () => setIsCurateOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNews.map((item) => {
            const author = item.authorId || item.createdBy;
            const cycleObj = typeof item.fortnightCycleId === "object" ? item.fortnightCycleId : null;
            return (
              <motion.div
                key={item._id}
                initial={isMotionSafe ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge variant="amber">{item.sourceType}</Badge>
                      {cycleObj && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Cycle #{cycleObj.cycleNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{formatDate(item.date)}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {item.headline}
                  </h3>

                  {/* Company & Startup Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center space-x-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      <Building2 className="w-3 h-3 text-blue-500" />
                      <span>{item.company}</span>
                    </span>
                    <span className="text-slate-300 font-bold">×</span>
                    <span className="inline-flex items-center space-x-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      <Rocket className="w-3 h-3 text-emerald-500" />
                      <span>{item.startupPartner}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium ml-auto">
                      {item.collaborationType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                    <span className="font-extrabold uppercase text-[10px] block mb-0.5 text-emerald-800 tracking-wider">
                      Why it matters for Corporate-Startup Synergy:
                    </span>
                    <p className="leading-relaxed">{item.whyItMatters}</p>
                  </div>

                  {item.studentNotes && (
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/70 text-xs text-purple-950">
                      <span className="font-extrabold uppercase text-[10px] block mb-0.5 text-purple-800">
                        Student-Added Notes:
                      </span>
                      <p>{item.studentNotes}</p>
                    </div>
                  )}
                </div>

                {/* Footer with Verified Source & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold truncate max-w-[180px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Verified Source Link</span>
                    </a>
                    <span>•</span>
                    <span>Curated by {author?.name || "Student"}</span>
                  </div>

                  {!isInstructor && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedNews(item);
                          setNoteText(item.studentNotes || "");
                        }}
                        className="text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete News Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CURATE NEWS MODAL */}
      <Modal
        isOpen={isCurateOpen}
        onClose={() => setIsCurateOpen(false)}
        title="Curate Fortnightly Corporate-Startup Collaboration News"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as NewsSourceType)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
              >
                {SOURCE_TYPES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Fortnight Cycle</label>
              <select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
              >
                {cycles.map((c) => (
                  <option key={c._id} value={c._id}>
                    Cycle #{c.cycleNumber}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Verified Source URL (LinkedIn post, company press release, or startup announcement)
            </label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/posts/... or https://company.com/press/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Pasted Source Text / Excerpt (Source Text Only)
            </label>
            <textarea
              rows={4}
              placeholder="Paste the announcement text from LinkedIn, press release, or website..."
              value={sourceExcerpt}
              onChange={(e) => setSourceExcerpt(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *The AI summarizes strictly from this pasted text to prevent factual hallucination.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSynthesizeSource}
              disabled={isGenerating || !sourceExcerpt}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Synthesizing Source Text..." : "Extract Collaboration Intelligence"}</span>
            </button>
          </div>

          {/* Form Fields for Review / Editing */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Headline</label>
              <input
                type="text"
                placeholder="Factual headline describing the partnership"
                value={draftHeadline}
                onChange={(e) => setDraftHeadline(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Established Corporate</label>
                <input
                  type="text"
                  placeholder="e.g. BMW Group"
                  value={draftCompany}
                  onChange={(e) => setDraftCompany(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Startup Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Figure AI"
                  value={draftStartup}
                  onChange={(e) => setDraftStartup(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Collaboration Type</label>
                <select
                  value={draftCollabType}
                  onChange={(e) => setDraftCollabType(e.target.value as CollaborationType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  {COLLABORATION_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Summary (2-3 sentences)</label>
              <textarea
                rows={2}
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                placeholder="Factual summary of the collaboration..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-emerald-900 block mb-1">
                Why it matters for Corporate-Startup Synergies
              </label>
              <textarea
                rows={2}
                value={draftWhyItMatters}
                onChange={(e) => setDraftWhyItMatters(e.target.value)}
                placeholder="Strategic rationale (e.g. POC speed, corporate scale, distribution access, CVC learning)..."
                className="w-full p-2.5 border border-emerald-300 rounded-xl bg-emerald-50/40"
              />
            </div>

            <div>
              <label className="font-bold text-purple-900 block mb-1">Student Notes (Optional)</label>
              <input
                type="text"
                placeholder="Student reflection on relevance to midterm or capstone..."
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                className="w-full p-2.5 border border-purple-200 rounded-xl bg-purple-50/40"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCurateOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCuratedNews}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save News Curation"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT NOTE MODAL */}
      <Modal
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
        title="Student Notes on Curated News"
        maxWidth="max-w-lg"
      >
        {selectedNews && (
          <div className="space-y-4 text-xs">
            <p className="font-bold text-slate-800">{selectedNews.headline}</p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add or update notes on why this partnership matters..."
              className="w-full p-3 border border-purple-200 rounded-xl bg-purple-50/40"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
              >
                {isSavingNote ? "Saving..." : "Save Note Revision"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
