import React, { useState, useEffect } from "react";
import {
  Users,
  Bot,
  BookOpen,
  Newspaper,
  ScrollText,
  Clock,
  ShieldCheck,
  Download,
  Filter,
  MessageSquare,
  Sparkles,
  Lock,
  UserCheck,
  Send,
  MessageCircle,
  Hash,
  CornerDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { Reflection, NewsItem, PromptLog, Group, User, InstructorComment } from "../types/index.ts";
import { formatDate, formatDateTime } from "../utils/formatters.ts";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { TamperBadge } from "../components/common/TamperBadge.tsx";
import { ProgressRing } from "../components/common/ProgressRing.tsx";
import { FortnightCountdown } from "../components/common/FortnightCountdown.tsx";
import { StreamingReveal } from "../components/common/StreamingReveal.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";

export const GroupWorkspace: React.FC = () => {
  const { user } = useAuth();
  const isMotionSafe = useMotionSafe();
  const [activeTab, setActiveTab] = useState<"UNIFIED" | "REFLECTIONS" | "NEWS" | "PROMPTS" | "COMMENTS">("UNIFIED");

  const [group, setGroup] = useState<Group | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [promptLogs, setPromptLogs] = useState<PromptLog[]>([]);
  const [comments, setComments] = useState<InstructorComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sessionFilter, setSessionFilter] = useState<string>("ALL");
  const [memberFilter, setMemberFilter] = useState<string>("ALL");

  // Instructor comment state
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const isInstructor = user?.role === "INSTRUCTOR";
  const groupId = typeof user?.groupId === "object" ? user?.groupId?._id : user?.groupId;

  const fetchWorkspaceData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [grpRes, refRes, newsRes, logsRes, commRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get("/reflections"),
        api.get("/news"),
        api.get("/prompt-logs"),
        api.get(`/instructor/comments/${groupId}`).catch(() => ({ data: [] }))
      ]);

      setGroup(grpRes.data);
      setReflections(refRes.data);
      setNews(newsRes.data);
      setPromptLogs(logsRes.data);
      setComments(commRes.data || []);
    } catch (err) {
      console.error("Workspace fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [groupId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !groupId) return;
    setPostingComment(true);
    try {
      await api.post("/instructor/comments", {
        groupId,
        targetType: "WORKSPACE",
        comment: newComment.trim()
      });
      setNewComment("");
      const commRes = await api.get(`/instructor/comments/${groupId}`);
      setComments(commRes.data);
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleExportCsv = async () => {
    if (!groupId) return;
    try {
      const response = await api.get(`/instructor/export/${groupId}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ENT3805_${group?.name || "Group"}_Audit.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shared group workspace..." size="lg" />;
  }

  const members = (group?.memberIds || []) as User[];

  // Filter logs for unified view
  const filteredLogs = promptLogs.filter((log) => {
    const author = log.authorId || log.userId;
    if (memberFilter !== "ALL" && author?._id !== memberFilter && author?.name !== memberFilter) {
      return false;
    }
    if (sessionFilter !== "ALL") {
      const matchSess = log.prompt.includes(`Session ${sessionFilter}`) || log.prompt.includes(`[Session ${sessionFilter}`);
      if (!matchSess) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Bot className="w-4 h-4" />
                <span>{group?.tutorName || "Group Agent Tutor"}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                ENT 3805: Designing Corporate-Startup Synergies
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {group?.name}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {group?.description}
            </p>
          </div>

          {/* Quick Metrics & Animated Progress Ring */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
              <ProgressRing completed={reflections.length} total={13} size={64} strokeWidth={6} />
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Class Reflections
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {reflections.length} of 13 Sessions
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  Target: 1 per class
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <TamperBadge groupId={groupId || ""} />
              <FortnightCountdown />
            </div>
          </div>
        </div>

        {/* Action Bar / Roster & Export */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Roster:
            </span>
            {members.map((m) => (
              <span
                key={m._id}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{m.name}</span>
                {m.rollNumber && <span className="text-[10px] text-slate-400">({m.rollNumber})</span>}
              </span>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm self-start md:self-auto"
            title="Download full audit log CSV with hashes"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click CSV Export</span>
          </button>
        </div>
      </div>

      {/* Tabs Header with Spring / Safe Motion Indicator */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("UNIFIED")}
          className={`relative flex items-center space-x-2 py-4 px-4 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "UNIFIED" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Unified Shared Space (Prompts + AI + Notes)</span>
          {activeTab === "UNIFIED" && (
            <motion.div
              layoutId={isMotionSafe ? "activeTabIndicator" : undefined}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("REFLECTIONS")}
          className={`relative flex items-center space-x-2 py-4 px-4 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "REFLECTIONS" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Reflections ({reflections.length}/13)</span>
          {activeTab === "REFLECTIONS" && (
            <motion.div
              layoutId={isMotionSafe ? "activeTabIndicator" : undefined}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("NEWS")}
          className={`relative flex items-center space-x-2 py-4 px-4 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "NEWS" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Fortnightly News ({news.length})</span>
          {activeTab === "NEWS" && (
            <motion.div
              layoutId={isMotionSafe ? "activeTabIndicator" : undefined}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("PROMPTS")}
          className={`relative flex items-center space-x-2 py-4 px-4 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "PROMPTS" ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Prompt Log ({promptLogs.length})</span>
          {activeTab === "PROMPTS" && (
            <motion.div
              layoutId={isMotionSafe ? "activeTabIndicator" : undefined}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("COMMENTS")}
          className={`relative flex items-center space-x-2 py-4 px-4 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "COMMENTS" ? "text-purple-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <MessageCircle className="w-4 h-4 text-purple-600" />
          <span>Instructor Feedback ({comments.length})</span>
          {activeTab === "COMMENTS" && (
            <motion.div
              layoutId={isMotionSafe ? "activeTabIndicator" : undefined}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
            />
          )}
        </button>
      </div>

      {/* 1. UNIFIED SHARED SPACE TAB */}
      {activeTab === "UNIFIED" && (
        <div className="space-y-6">
          {/* Requirement Explainer & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Official Syllabus Requirement: Unified 3-Column View
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  "The instructor should be able to see student prompts, AI responses, and student-added notes in the same shared space."
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Session:</span>
                  <select
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">All Sessions</option>
                    {Array.from({ length: 13 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={String(s)}>
                        Session {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <span>Member:</span>
                  <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">All Members</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Interaction Cards */}
          <div className="space-y-5">
            <AnimatePresence>
              {filteredLogs.map((log) => {
                const author = log.authorId || log.userId;
                return (
                  <motion.div
                    key={log._id}
                    initial={isMotionSafe ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={isMotionSafe ? { opacity: 0, y: -10 } : false}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
                  >
                    {/* Header with Sequence & Cryptographic Hash */}
                    <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <Badge variant={log.feature === "CLASS_REFLECTION" ? "blue" : "amber"}>
                          {log.feature === "CLASS_REFLECTION" ? "Class Reflection" : "Fortnightly News"}
                        </Badge>
                        {log.sequenceNumber && (
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                            #{log.sequenceNumber}
                          </span>
                        )}
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          {author?.name || "Student"}
                        </span>
                        {author?.rollNumber && (
                          <span className="text-slate-400 text-[11px]">({author.rollNumber})</span>
                        )}
                        {log.isEdit && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Edited Version
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-slate-400 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(log.createdAt || log.timestamp || "")}
                        </span>
                        {log.hash && (
                          <span
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 truncate max-w-[140px]"
                            title={`Entry Hash: ${log.hash}\nPrevious Hash: ${log.previousHash || "GENESIS"}`}
                          >
                            <Hash className="w-3 h-3 text-slate-400" />
                            {log.hash.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-Column Unified Shared Grid (Stacked on Mobile) */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                      {/* Column 1: Student Prompt / Input */}
                      <div className="space-y-1.5 flex flex-col">
                        <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[11px] flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> 1. Student Prompt / Notes
                        </span>
                        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto whitespace-pre-wrap shadow-inner max-h-60">
                          {log.prompt}
                        </div>
                      </div>

                      {/* Column 2: AI Response */}
                      <div className="space-y-1.5 flex flex-col">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-emerald-600" /> 2. AI Tutor Response
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            {log.modelName || "gemini-1.5-flash"}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex-1 overflow-y-auto space-y-2.5 max-h-60">
                          {log.feature === "CLASS_REFLECTION" && log.aiResponse?.keyPoints ? (
                            <>
                              <div>
                                <span className="font-bold text-emerald-950 block text-[10px] uppercase">
                                  Key Points from Class:
                                </span>
                                <ul className="space-y-1 text-slate-700 text-[11px] mt-1">
                                  {log.aiResponse.keyPoints.map((kp: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-emerald-600 font-bold">•</span>
                                      <span>
                                        <StreamingReveal text={kp} speedMs={8} />
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="pt-2 border-t border-emerald-200">
                                <span className="font-bold text-amber-900 block text-[10px] uppercase">
                                  One Unresolved Open Question:
                                </span>
                                <p className="text-amber-950 italic text-[11px] mt-0.5 font-medium">
                                  "{log.aiResponse.openQuestion}"
                                </p>
                              </div>
                            </>
                          ) : log.aiResponse?.summary ? (
                            <div className="space-y-2">
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">
                                  {log.aiResponse.headline}
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700">
                                  {log.aiResponse.company} × {log.aiResponse.startupPartner}
                                </span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {log.aiResponse.summary}
                              </p>
                              <div className="pt-1.5 border-t border-emerald-200/80">
                                <span className="font-bold text-slate-900 text-[10px] uppercase block">
                                  Why it matters for Corporate-Startup Synergy:
                                </span>
                                <p className="text-emerald-950 font-medium text-[11px] mt-0.5">
                                  {log.aiResponse.whyItMatters}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <pre className="text-[10px] text-slate-700 whitespace-pre-wrap font-mono">
                              {typeof log.aiResponse === "object"
                                ? JSON.stringify(log.aiResponse, null, 2)
                                : log.aiResponse}
                            </pre>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Student-Added Notes */}
                      <div className="space-y-1.5 flex flex-col">
                        <span className="font-extrabold uppercase tracking-wider text-purple-700 text-[11px] flex items-center gap-1">
                          <ScrollText className="w-3.5 h-3.5 text-purple-600" /> 3. Student-Added Notes
                        </span>
                        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 flex-1 overflow-y-auto max-h-60">
                          {log.studentNotes && log.studentNotes.trim().length > 0 ? (
                            <p className="text-purple-950 whitespace-pre-wrap font-medium leading-relaxed">
                              {log.studentNotes}
                            </p>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400">
                              <p className="italic text-xs">No student annotations saved for this log.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs">
                No prompt logs match the active filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. REFLECTIONS TAB */}
      {activeTab === "REFLECTIONS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reflections.map((r) => (
            <div key={r._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <Badge variant="blue">Session {r.sessionNumber} of 13</Badge>
                <span className="text-slate-400">{formatDate(r.classDate)}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{r.sessionTitle}</h3>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Key Points:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {r.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-amber-700">Open Question:</span>
                <p className="text-amber-950 italic text-xs mt-0.5 font-medium">"{r.openQuestion}"</p>
              </div>
              {r.studentNotes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-purple-700">Student Notes:</span>
                  <p className="text-purple-950 text-xs mt-0.5">{r.studentNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. NEWS TAB */}
      {activeTab === "NEWS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <div key={item._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <Badge variant="amber">{item.sourceType}</Badge>
                <span className="text-slate-400">{formatDate(item.date)}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.headline}</h3>
              <p className="text-xs font-semibold text-emerald-700">{item.company} × {item.startupPartner}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                <span className="font-bold uppercase text-[10px] block mb-0.5">Why it matters:</span>
                {item.whyItMatters}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PROMPT LOG TAB */}
      {activeTab === "PROMPTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Immutable Prompt Chain Audit ({promptLogs.length} entries)
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {promptLogs.map((log) => (
              <div key={log._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-slate-400 text-[11px]">
                  <span className="font-mono font-bold text-slate-700">Sequence #{log.sequenceNumber || "1"}</span>
                  <span className="font-mono">{formatDateTime(log.createdAt || log.timestamp || "")}</span>
                </div>
                <p className="font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {log.prompt}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Prev: {log.previousHash ? log.previousHash.slice(0, 16) : "GENESIS"}...</span>
                  <span className="text-emerald-700 font-bold">Hash: {log.hash ? log.hash.slice(0, 16) : ""}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INSTRUCTOR COMMENTS TAB */}
      {activeTab === "COMMENTS" && (
        <div className="space-y-6">
          {/* Post Comment (Instructor Only) */}
          {isInstructor && (
            <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Leave Labeled Instructor Feedback
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Your comments appear in this shared space visible to all group members and preserved for academic grading.
              </p>
              <form onSubmit={handlePostComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Provide constructive guidance on group reflections, POC analysis, or news curation..."
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={postingComment || !newComment.trim()}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{postingComment ? "Posting..." : "Post Instructor Comment"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-950">{c.authorId?.name}</span>
                    <Badge variant="purple">INSTRUCTOR FEEDBACK</Badge>
                  </div>
                  <span className="text-slate-400 font-mono">{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">{c.comment}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No instructor comments posted yet for this group.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
