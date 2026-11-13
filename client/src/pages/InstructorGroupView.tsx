import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Newspaper,
  ScrollText,
  ShieldCheck,
  Bot,
  MessageSquare,
  Sparkles,
  UserCheck,
  Clock,
  Download,
  Send,
  MessageCircle,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.ts";
import { Reflection, NewsItem, PromptLog, Group, User, InstructorComment } from "../types/index.ts";
import { formatDate, formatDateTime } from "../utils/formatters.ts";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { TamperBadge } from "../components/common/TamperBadge.tsx";
import { StreamingReveal } from "../components/common/StreamingReveal.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";

export const InstructorGroupView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isMotionSafe = useMotionSafe();
  const [data, setData] = useState<{
    group: Group;
    reflections: Reflection[];
    news: NewsItem[];
    promptLogs: PromptLog[];
    comments?: InstructorComment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"UNIFIED" | "REFLECTIONS" | "NEWS" | "PROMPTS" | "COMMENTS">("UNIFIED");
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const fetchGroupData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [res, commRes] = await Promise.all([
        api.get(`/instructor/groups/${id}`),
        api.get(`/instructor/comments/${id}`).catch(() => ({ data: [] }))
      ]);
      setData({
        ...res.data,
        comments: commRes.data || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    setPostingComment(true);
    try {
      await api.post("/instructor/comments", {
        groupId: id,
        targetType: "WORKSPACE",
        comment: newComment.trim()
      });
      setNewComment("");
      await fetchGroupData();
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleExportCsv = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/instructor/export/${id}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ENT3805_${data?.group?.name || "Group"}_Audit.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner message="Inspecting group workspace records..." size="lg" />;
  }

  const { group, reflections, news, promptLogs, comments = [] } = data;
  const members = (group.memberIds || []) as User[];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/instructor"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Faculty Command Center</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-purple-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Faculty Inspection Space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {group.name}
          </h1>
          <p className="text-xs text-slate-500">{group.tutorName} • {group.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TamperBadge groupId={group._id} />
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click CSV Export</span>
          </button>
        </div>
      </div>

      {/* Roster & Instructor Information */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Group Members:</span>
          <span className="text-slate-600">{members.map((m) => `${m.name} (${m.email})`).join(", ")}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab("UNIFIED")}
          className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "UNIFIED" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Unified Shared Space (Prompts + AI + Notes)</span>
        </button>

        <button
          onClick={() => setActiveTab("REFLECTIONS")}
          className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "REFLECTIONS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Reflections ({reflections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("NEWS")}
          className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "NEWS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Fortnightly News ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PROMPTS")}
          className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "PROMPTS" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Prompt Log ({promptLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("COMMENTS")}
          className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "COMMENTS" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Instructor Comments ({comments.length})</span>
        </button>
      </div>

      {/* 1. UNIFIED SHARED AUDIT SPACE */}
      {activeTab === "UNIFIED" && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-xs">
            <p className="text-purple-950 font-medium">
              <strong>Unified Interaction Inspection:</strong> Student prompts, AI responses, and student-added notes are audited here in the same space as mandated by the course specification.
            </p>
          </div>

          <div className="space-y-5">
            {promptLogs.map((log) => {
              const author = log.authorId || log.userId;
              return (
                <div key={log._id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-xs">
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.feature === "CLASS_REFLECTION" ? "blue" : "amber"}>
                        {log.feature === "CLASS_REFLECTION" ? "Class Reflection" : "Fortnightly News"}
                      </Badge>
                      {log.sequenceNumber && (
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          #{log.sequenceNumber}
                        </span>
                      )}
                      <span className="font-bold text-slate-800">{author?.name}</span>
                      {author?.rollNumber && <span className="text-slate-400 text-[11px]">({author.rollNumber})</span>}
                      {log.isEdit && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Edited Version
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                      <span>{formatDateTime(log.createdAt || log.timestamp || "")}</span>
                      {log.hash && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {log.hash.slice(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div>
                      <span className="font-extrabold uppercase text-[11px] text-slate-500 block mb-1.5 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> 1. Student Prompt / Raw Notes
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {log.prompt}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold uppercase text-[11px] text-emerald-700 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-emerald-600" /> 2. AI Response
                        </span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          {log.modelName || "gemini-1.5-flash"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 max-h-56 overflow-y-auto space-y-2">
                        {log.feature === "CLASS_REFLECTION" && log.aiResponse?.keyPoints ? (
                          <>
                            <ul className="space-y-1 text-slate-700 text-[11px]">
                              {log.aiResponse.keyPoints.map((kp: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{kp}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-2 border-t border-emerald-200">
                              <span className="font-bold text-amber-900 block text-[10px] uppercase">Open Question:</span>
                              <p className="text-amber-950 italic text-[11px] font-medium">"{log.aiResponse.openQuestion}"</p>
                            </div>
                          </>
                        ) : log.aiResponse?.summary ? (
                          <div className="space-y-1.5">
                            <span className="font-bold text-slate-900 block">{log.aiResponse.headline}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">{log.aiResponse.company} × {log.aiResponse.startupPartner}</span>
                            <p className="text-slate-700 text-[11px]">{log.aiResponse.summary}</p>
                            <p className="text-emerald-950 text-[11px] font-medium pt-1 border-t border-emerald-200">
                              <strong>Why it matters:</strong> {log.aiResponse.whyItMatters}
                            </p>
                          </div>
                        ) : (
                          <pre className="text-[10px] text-slate-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(log.aiResponse, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-extrabold uppercase text-[11px] text-purple-700 block mb-1.5 flex items-center gap-1">
                        <ScrollText className="w-3.5 h-3.5 text-purple-600" /> 3. Student-Added Notes
                      </span>
                      <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 max-h-56 overflow-y-auto">
                        {log.studentNotes && log.studentNotes.trim().length > 0 ? (
                          <p className="text-purple-950 whitespace-pre-wrap font-medium">{log.studentNotes}</p>
                        ) : (
                          <p className="text-slate-400 italic">No notes added by student.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. INSTRUCTOR FEEDBACK & COMPOSER TAB */}
      {activeTab === "COMMENTS" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Leave Labeled Faculty Feedback for {group.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Instructors cannot edit student text, but your comments are attached to the student group workspace.
            </p>
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write feedback for this group..."
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
                  <span>{postingComment ? "Posting..." : "Post Comment"}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c._id} className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-2 text-xs">
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
          </div>
        </div>
      )}
    </div>
  );
};
