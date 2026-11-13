import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Calendar,
  User,
  Edit3,
  Search,
  MessageSquare,
  Bot,
  AlertTriangle,
  Save,
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { Reflection } from "../types/index.ts";
import { formatDate, formatDateTime } from "../utils/formatters.ts";
import { Modal } from "../components/common/Modal.tsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/EmptyState.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { ProgressRing } from "../components/common/ProgressRing.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";
import { OFFICIAL_SESSIONS } from "../utils/courseSyllabus.ts";

export const Reflections: React.FC = () => {
  const { user } = useAuth();
  const isMotionSafe = useMotionSafe();
  const isInstructor = user?.role === "INSTRUCTOR";

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [classDate, setClassDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentInput, setStudentInput] = useState("");
  const [noneOutstanding, setNoneOutstanding] = useState(false);
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<{
    keyPoints: string[];
    openQuestion: string;
    promptLogId: string;
    modelName?: string;
  } | null>(null);
  
  const [editableKeyPoints, setEditableKeyPoints] = useState<string[]>([]);
  const [editableOpenQuestion, setEditableOpenQuestion] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View / Edit Reflection Details Modal State
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [editNotesText, setEditNotesText] = useState("");
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  const fetchReflections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reflections");
      setReflections(res.data);
      if (res.data.length > 0) {
        const nextSess = Math.min(13, Math.max(...res.data.map((r: Reflection) => r.sessionNumber)) + 1);
        setSessionNumber(nextSess);
      }
    } catch (err) {
      console.error("Failed to fetch reflections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

  const handleGenerateAI = async () => {
    if (!studentInput || studentInput.trim().length < 15) {
      setError("Please enter detailed class/discussion notes (minimum 15 characters).");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await api.post("/reflections/generate", {
        studentNotes: studentInput,
        sessionTitle: sessionTitle || `Session ${sessionNumber}`,
        sessionNumber: Number(sessionNumber)
      });

      setAiGenerated(res.data);
      setEditableKeyPoints(res.data.keyPoints || []);
      setEditableOpenQuestion(res.data.openQuestion || "");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "AI service error. You can still write key points and open questions manually below."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!sessionTitle || !classDate || !studentInput || editableKeyPoints.length === 0) {
      setError("Please complete session title, date, notes, and at least one key point.");
      return;
    }

    if (!noneOutstanding) {
      if (!editableOpenQuestion.trim()) {
        setError("Please provide ONE open question, or check 'No unresolved open questions outstanding'.");
        return;
      }
      const qCount = (editableOpenQuestion.match(/\?/g) || []).length;
      if (qCount > 1) {
        setError("openQuestion must be a single question (multiple question marks detected). Please consolidate into ONE question.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.post("/reflections", {
        sessionNumber: Number(sessionNumber),
        sessionTitle,
        classDate,
        studentInput,
        keyPoints: editableKeyPoints,
        openQuestion: noneOutstanding ? "" : editableOpenQuestion,
        noneOutstanding,
        studentNotes,
        promptLogId: aiGenerated?.promptLogId
      });

      setIsCreateOpen(false);
      resetCreateForm();
      fetchReflections();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save reflection.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetCreateForm = () => {
    setSessionTitle("");
    setStudentInput("");
    setAiGenerated(null);
    setEditableKeyPoints([]);
    setEditableOpenQuestion("");
    setNoneOutstanding(false);
    setStudentNotes("");
    setError(null);
  };

  const handleSaveUpdatedNotes = async () => {
    if (!selectedReflection) return;
    setIsUpdatingNotes(true);
    try {
      const res = await api.put(`/reflections/${selectedReflection._id}`, {
        studentNotes: editNotesText
      });
      setSelectedReflection(res.data);
      fetchReflections();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const filteredReflections = reflections.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.sessionTitle.toLowerCase().includes(q) ||
      r.studentInput.toLowerCase().includes(q) ||
      r.openQuestion.toLowerCase().includes(q) ||
      r.keyPoints.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Mandatory Task #1</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Class Reflections</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            After every session, the Agent Tutor helps the group record: (1) Key points from the class, and (2) Exactly ONE open question not clarified in class.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
            <ProgressRing completed={reflections.length} total={13} size={58} strokeWidth={6} />
            <div className="text-left pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-xs font-extrabold text-slate-800">{reflections.length} / 13 Sessions</span>
            </div>
          </div>

          {!isInstructor && (
            <button
              onClick={() => {
                resetCreateForm();
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Class Reflection</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections by session title, key points, or open question..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Reflections Grid */}
      {loading ? (
        <LoadingSpinner message="Loading course reflections..." />
      ) : filteredReflections.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No reflections recorded yet"
          description="Create your first class reflection using raw discussion notes from ENT 3805."
          actionText={!isInstructor ? "Create Reflection" : undefined}
          onAction={!isInstructor ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReflections.map((r) => {
            const author = r.authorId || r.createdBy;
            return (
              <motion.div
                key={r._id}
                initial={isMotionSafe ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setSelectedReflection(r);
                  setEditNotesText(r.studentNotes || "");
                }}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="blue">Session {r.sessionNumber}</Badge>
                    <span className="text-slate-400 font-medium">{formatDate(r.classDate)}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                    {r.sessionTitle}
                  </h3>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 line-clamp-3">
                      {r.keyPoints.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 truncate">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="truncate">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-600" />
                      {r.noneOutstanding ? "No Open Questions" : "One Unresolved Question:"}
                    </span>
                    <p className="text-xs text-amber-950 font-medium italic mt-0.5 line-clamp-2">
                      {r.noneOutstanding ? "All questions clarified in class." : `"${r.openQuestion}"`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <User className="w-3 h-3 text-slate-400" />
                    {author?.name || "Student"}
                  </span>
                  {r.studentNotes && (
                    <span className="text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                      Has Notes
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE REFLECTION MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record ENT 3805 Class Reflection"
        maxWidth="3xl"
      >
        <div className="space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Select Official ENT 3805 Syllabus Session (1 to 13)
              </label>
              <select
                value={sessionNumber}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setSessionNumber(num);
                  const matched = OFFICIAL_SESSIONS.find((s) => s.sessionNumber === num);
                  if (matched) {
                    setSessionTitle(matched.title);
                  }
                }}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium text-xs text-slate-800"
              >
                {OFFICIAL_SESSIONS.map((s) => (
                  <option key={s.sessionNumber} value={s.sessionNumber}>
                    Session {s.sessionNumber}: {s.title} ({s.courseOutcome})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Session Title / Topic</label>
              <input
                type="text"
                placeholder="e.g. Open Innovation Paradigms: Outside-In vs Inside-Out"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
              />
            </div>

            {/* Syllabus Helper Card */}
            {(() => {
              const currentSess = OFFICIAL_SESSIONS.find((s) => s.sessionNumber === sessionNumber);
              if (!currentSess) return null;
              return (
                <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-900">
                      Syllabus Focus: {currentSess.bloomsLevel} • {currentSess.courseOutcome}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const template = `Class discussion on ${currentSess.title}.\n${
                          currentSess.preRead ? `Pre-read case analysis: ${currentSess.preRead}.\n` : ""
                        }Key concepts covered: ${currentSess.keyTopics.join(", ")}.`;
                        setStudentInput((prev) => (prev ? `${prev}\n\n${template}` : template));
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      + Insert Syllabus Topics
                    </button>
                  </div>
                  {currentSess.preRead && (
                    <p className="text-[11px] text-amber-800 font-medium">
                      📖 Pre-Read: {currentSess.preRead}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-600">
                    Topics: {currentSess.keyTopics.join(" • ")}
                  </p>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Class Date</label>
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Raw Student Discussion Notes (Source Text)
            </label>
            <textarea
              rows={4}
              placeholder="Paste raw discussion notes, slide topics, case study discussion, or lecture highlights..."
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *The Agent Tutor synthesizes strictly from this source text to guarantee zero hallucination.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating || !studentInput}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Synthesizing Source Text..." : "Generate Key Points & Open Question"}</span>
            </button>
          </div>

          {/* Editable Generated Reflection Content */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Key Points (One point per line, editable)
              </label>
              <textarea
                rows={3}
                value={editableKeyPoints.join("\n")}
                onChange={(e) =>
                  setEditableKeyPoints(
                    e.target.value.split("\n").filter((p) => p.trim().length > 0)
                  )
                }
                placeholder="1. Startups provide zero-to-one exploration agility..."
                className="w-full p-3 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-amber-900">
                  Exactly ONE Unresolved Open Question
                </label>
                <label className="inline-flex items-center space-x-1.5 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noneOutstanding}
                    onChange={(e) => {
                      setNoneOutstanding(e.target.checked);
                      if (e.target.checked) setEditableOpenQuestion("");
                    }}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px]">None outstanding</span>
                </label>
              </div>
              <input
                type="text"
                disabled={noneOutstanding}
                value={editableOpenQuestion}
                onChange={(e) => setEditableOpenQuestion(e.target.value)}
                placeholder="Single open question not clarified in class..."
                className={`w-full p-2.5 border rounded-xl ${
                  noneOutstanding ? "bg-slate-100 text-slate-400 border-slate-200" : "border-amber-300 bg-amber-50/50"
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-purple-900 block mb-1">
                Student-Added Notes (Optional student commentary)
              </label>
              <textarea
                rows={2}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Personal thoughts, team division of work, or relevant references..."
                className="w-full p-2.5 border border-purple-200 rounded-xl bg-purple-50/40"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReflection}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Reflection"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedReflection)}
        onClose={() => setSelectedReflection(null)}
        title={selectedReflection ? `Session ${selectedReflection.sessionNumber}: ${selectedReflection.sessionTitle}` : ""}
        maxWidth="2xl"
      >
        {selectedReflection && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Date: {formatDate(selectedReflection.classDate)}</span>
              <span>Author: {(selectedReflection.authorId || selectedReflection.createdBy)?.name}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-500 block mb-1 text-[10px] uppercase">
                Raw Student Input:
              </span>
              <p className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                {selectedReflection.studentInput}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1 text-[10px] uppercase">
                Synthesized Key Points:
              </span>
              <ul className="space-y-1.5 text-slate-700">
                {selectedReflection.keyPoints.map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block text-[10px] uppercase">
                Unresolved Open Question:
              </span>
              <p className="italic text-amber-950 font-medium mt-0.5">
                {selectedReflection.noneOutstanding
                  ? "None outstanding (fully clarified in class)."
                  : `"${selectedReflection.openQuestion}"`}
              </p>
            </div>

            {!isInstructor && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="font-bold text-purple-900 block text-[10px] uppercase">
                  Add / Edit Student Notes:
                </span>
                <textarea
                  rows={3}
                  value={editNotesText}
                  onChange={(e) => setEditNotesText(e.target.value)}
                  placeholder="Update group notes for this reflection..."
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-xs bg-purple-50/40"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveUpdatedNotes}
                    disabled={isUpdatingNotes}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition"
                  >
                    <span>{isUpdatingNotes ? "Updating..." : "Save Note Revision"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
