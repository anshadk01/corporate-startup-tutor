import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bot,
  BookOpen,
  Newspaper,
  ScrollText,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Search,
  Download,
  KeyRound
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api.ts";
import { InstructorDashboardData } from "../types/index.ts";
import { formatDateTime } from "../utils/formatters.ts";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { CoverageGrid } from "../components/common/CoverageGrid.tsx";
import { useMotionSafe } from "../hooks/useMotionSafe.ts";

export const InstructorDashboard: React.FC = () => {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const isMotionSafe = useMotionSafe();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/instructor/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCsv = async (groupId: string, groupName: string) => {
    try {
      const response = await api.get(`/instructor/export/${groupId}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ENT3805_${groupName.replace(/\s+/g, '_')}_Audit.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner message="Loading course analytics..." size="lg" />;
  }

  const { summary, groups, recentActivity } = data;

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.tutorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Faculty Command Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Instructor Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Designing Corporate-Startup Synergies (ENT 3805)
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Faculty audit platform: Monitor the 13-session reflection progression, audit fortnightly news intelligence, and verify cryptographic SHA-256 prompt logs across all student cohorts.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Groups</span>
          <p className="text-2xl font-bold text-slate-900">{summary.totalGroups}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Students</span>
          <p className="text-2xl font-bold text-slate-900">{summary.totalStudents}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Reflections</span>
          <p className="text-2xl font-bold text-slate-900">{summary.totalReflections}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Curated News</span>
          <p className="text-2xl font-bold text-slate-900">{summary.totalNews}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Prompt Audits</span>
          <p className="text-2xl font-bold text-purple-700">{summary.totalPromptLogs}</p>
        </div>
      </div>

      {/* Per-Group Coverage Grids & Management */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cohort Syllabus & Prompt Inspection</h2>
            <p className="text-xs text-slate-500">
              Each group operates ONE Agent Tutor. Evaluate the 13 sessions matrix and export immutable audit records.
            </p>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter cohorts..."
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {filteredGroups.map((grp) => (
            <motion.div
              key={grp.id}
              initial={isMotionSafe ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-slate-900">{grp.name}</h3>
                    <Badge variant="brand" size="sm">{grp.tutorName}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                    <span className="font-semibold text-slate-700">{grp.memberCount} Members:</span>
                    <span>{grp.members.map((m) => m.name).join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start lg:self-auto">
                  <button
                    onClick={() => handleExportCsv(grp.id, grp.name)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title="Export Group Audit CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <Link
                    to={`/instructor/groups/${grp.id}`}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <span>Inspect Shared Space</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 13-Session Coverage Grid */}
              {grp.sessionCoverage && <CoverageGrid coverage={grp.sessionCoverage} />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
