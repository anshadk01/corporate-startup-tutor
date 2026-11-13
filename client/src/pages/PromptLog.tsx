import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Bot,
  User,
  Eye,
  Lock,
  Layers,
  Clock,
  MessageSquare,
  Hash,
  ShieldCheck,
  CornerDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { PromptLog as PromptLogType } from "../types/index.ts";
import { formatDateTime } from "../utils/formatters.ts";
import { Modal } from "../components/common/Modal.tsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/EmptyState.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { TamperBadge } from "../components/common/TamperBadge.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";

export const PromptLog: React.FC = () => {
  const { user } = useAuth();
  const isMotionSafe = useMotionSafe();
  const isInstructor = user?.role === "INSTRUCTOR";
  const groupId = typeof user?.groupId === "object" ? user?.groupId?._id : user?.groupId;

  const [logs, setLogs] = useState<PromptLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<PromptLogType | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = "/prompt-logs";
      const params = new URLSearchParams();
      if (selectedFeature !== "ALL") {
        params.append("feature", selectedFeature);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch prompt logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedFeature]);

  const filteredLogs = logs.filter((log) => {
    const author = log.authorId || log.userId;
    const q = searchQuery.toLowerCase();
    const promptMatch = log.prompt?.toLowerCase().includes(q);
    const userMatch = author?.name?.toLowerCase().includes(q) || author?.email?.toLowerCase().includes(q);
    const groupMatch = log.groupId?.name?.toLowerCase().includes(q);
    const notesMatch = log.studentNotes?.toLowerCase().includes(q);
    return promptMatch || userMatch || groupMatch || notesMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Mandatory Transparency Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Prompt Log</h1>
            <Badge variant="purple" size="md">{logs.length} Cryptographically Chained Entries</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory transparent audit trail: Visible to all group members and the instructor in the shared space.
          </p>
        </div>

        {/* Tamper Chain Status */}
        {groupId && <TamperBadge groupId={groupId} />}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt logs by student name, prompt content, notes, or group..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="ALL">All Course Features</option>
            <option value="CLASS_REFLECTION">Class Reflections</option>
            <option value="FORTNIGHTLY_NEWS">Fortnightly News</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {loading ? (
        <LoadingSpinner message="Loading immutable prompt chain..." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No prompt logs found"
          description="Prompt logs are generated automatically when a group member interacts with the Agent Tutor."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const author = log.authorId || log.userId;
              return (
                <div
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className="p-5 hover:bg-slate-50/70 transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.feature === "CLASS_REFLECTION" ? "blue" : "amber"}>
                        {log.feature === "CLASS_REFLECTION" ? "Class Reflection" : "Fortnightly News"}
                      </Badge>
                      {log.sequenceNumber && (
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Seq #{log.sequenceNumber}
                        </span>
                      )}
                      <span className="font-bold text-slate-800">{author?.name}</span>
                      {log.isEdit && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                      <span>{formatDateTime(log.createdAt || log.timestamp || "")}</span>
                      {log.hash && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Hash: {log.hash.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-mono text-xs text-slate-800 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                    {log.prompt}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-[10px] text-slate-400">
                      Model: {log.modelName || "gemini-1.5-flash"} ({log.modelVersion || "v1beta"})
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View Full 3-Column Inspection
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `Prompt Log #${selectedLog.sequenceNumber || "1"} Audit` : ""}
        maxWidth="max-w-3xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">Student Author</span>
                <p className="font-semibold text-slate-800">
                  {(selectedLog.authorId || selectedLog.userId)?.name}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">Timestamp</span>
                <p className="font-mono text-slate-700">
                  {formatDateTime(selectedLog.createdAt || selectedLog.timestamp || "")}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase text-[10px]">Model & Version</span>
                <p className="font-mono text-slate-700">
                  {selectedLog.modelName} ({selectedLog.modelVersion})
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Previous Hash:</span>
                <span className="truncate max-w-[350px]">{selectedLog.previousHash || "GENESIS"}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Entry Hash:</span>
                <span className="truncate max-w-[350px]">{selectedLog.hash || "CALCULATING"}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1 uppercase text-[10px]">
                1. Student Prompt (Raw Input)
              </span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedLog.prompt}
              </pre>
            </div>

            <div>
              <span className="font-bold text-emerald-800 block mb-1 uppercase text-[10px]">
                2. AI Response
              </span>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-h-48 overflow-y-auto font-mono text-[11px] text-slate-800">
                <pre className="whitespace-pre-wrap">
                  {typeof selectedLog.aiResponse === "object"
                    ? JSON.stringify(selectedLog.aiResponse, null, 2)
                    : selectedLog.aiResponse}
                </pre>
              </div>
            </div>

            <div>
              <span className="font-bold text-purple-900 block mb-1 uppercase text-[10px]">
                3. Student-Added Notes
              </span>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950">
                {selectedLog.studentNotes ? (
                  <p className="whitespace-pre-wrap font-medium">{selectedLog.studentNotes}</p>
                ) : (
                  <p className="italic text-slate-400">No notes recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
