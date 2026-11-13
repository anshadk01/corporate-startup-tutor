import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Newspaper,
  ScrollText,
  Users,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Bot,
  ExternalLink,
  GraduationCap,
  Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { Reflection, NewsItem, PromptLog, InstructorDashboardData } from "../types/index.ts";
import { formatDate, formatDateTime, getCollaborationColor } from "../utils/formatters.ts";
import { Badge } from "../components/common/Badge.tsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.tsx";
import { CourseHandoutModal } from "../components/common/CourseHandoutModal.tsx";
import { COURSE_EVALUATION_COMPONENTS } from "../utils/courseSyllabus.ts";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR";
  const [handoutOpen, setHandoutOpen] = useState(false);

  // Student State
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [promptLogs, setPromptLogs] = useState<PromptLog[]>([]);
  
  // Instructor State
  const [instructorData, setInstructorData] = useState<InstructorDashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const groupName = typeof user?.groupId === "object" ? user?.groupId?.name : "Student Group";
  const tutorName = typeof user?.groupId === "object" ? user?.groupId?.tutorName : "AI Agent Tutor";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (isInstructor) {
          const res = await api.get("/instructor/dashboard");
          setInstructorData(res.data);
        } else {
          const [refRes, newsRes, logsRes] = await Promise.all([
            api.get("/reflections"),
            api.get("/news"),
            api.get("/prompt-logs")
          ]);
          setReflections(refRes.data);
          setNews(newsRes.data);
          setPromptLogs(logsRes.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isInstructor]);

  if (loading) {
    return <LoadingSpinner message="Loading course workspace intelligence..." size="lg" />;
  }

  // Render Instructor Dashboard
  if (isInstructor && instructorData) {
    const { summary, groups, recentActivity } = instructorData;
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Course Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Instructor Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Designing Corporate-Startup Synergies (ENT 3805)
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              Comprehensive oversight of student agent tutors, session reflections, fortnightly news curation, and transparent prompt audit logs across all student cohorts.
            </p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Groups</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalGroups}</p>
            <p className="text-[11px] text-slate-400 mt-1">Active AI Tutors</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Students</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalStudents}</p>
            <p className="text-[11px] text-slate-400 mt-1">Enrolled Scholars</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Class Reflections</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalReflections}</p>
            <p className="text-[11px] text-slate-400 mt-1">Submitted Sessions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Fortnightly News</span>
              <Newspaper className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalNews}</p>
            <p className="text-[11px] text-slate-400 mt-1">Curated Alliances</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">AI Prompt Logs</span>
              <ScrollText className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalPromptLogs}</p>
            <p className="text-[11px] text-slate-400 mt-1">Auditable Interactions</p>
          </div>
        </div>

        {/* Group Performance Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Cohort Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Inspect group compliance, reflections progress, and AI prompt logs</p>
            </div>
            <Link
              to="/prompt-log"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Full Audit Logs</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Group & AI Tutor</th>
                  <th className="py-3 px-6">Members</th>
                  <th className="py-3 px-6">Reflections Progress</th>
                  <th className="py-3 px-6">Curated News</th>
                  <th className="py-3 px-6">AI Interactions</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {groups.map((grp) => (
                  <tr key={grp.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{grp.name}</div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <Bot className="w-3 h-3" /> {grp.tutorName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-700">{grp.memberCount} Students</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {grp.members.map((m) => m.name).join(", ")}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${grp.completionRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">
                          {grp.reflectionsCompleted} / 13 ({grp.completionRate}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">{grp.newsCount} items</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="purple" size="sm">{grp.promptLogCount} logs</Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/instructor/groups/${grp.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                      >
                        <span>Inspect Group</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Class Audit Feed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Recent Transparent AI Activity Stream
            </h2>
            <Link to="/prompt-log" className="text-xs font-bold text-blue-600 hover:underline">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((log) => (
              <div key={log._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={log.feature === "CLASS_REFLECTION" ? "blue" : "amber"} size="sm">
                      {log.feature === "CLASS_REFLECTION" ? "Reflection Assistant" : "News Curator"}
                    </Badge>
                    <span className="font-bold text-slate-800">{log.userId?.name}</span>
                    <span className="text-slate-400">({log.groupId?.name})</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1 italic font-serif">"{log.prompt}"</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-4">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Student Dashboard
  const completedSessions = reflections.length;
  const totalSessions = 13;
  const completionPercentage = Math.min(100, Math.round((completedSessions / totalSessions) * 100));
  const latestReflection = reflections[reflections.length - 1];
  const latestNews = news[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Course Handout Modal */}
      <CourseHandoutModal isOpen={handoutOpen} onClose={() => setHandoutOpen(false)} />

      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <Bot className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{tutorName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {groupName} Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Dedicated academic AI assistant for ENT 3805 (Prof. Kulbir Lamba). Fulfills Component B: creates session reflections from raw class notes, curates fortnightly corporate-startup news, and maintains complete prompt audit transparency.
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <button
            onClick={() => setHandoutOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-sm transition shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>View Course Handout & Rubrics</span>
          </button>
        </div>
      </div>

      {/* Course Evaluation Pattern Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-700">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold uppercase tracking-wider">ENT 3805 Evaluation Components</span>
          </div>
          <button
            onClick={() => setHandoutOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            Full Syllabus (13 Sessions) →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {COURSE_EVALUATION_COMPONENTS.map((comp, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-left transition ${
                comp.name.includes("Corporate Startup Tutor")
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30"
                  : "bg-slate-50 border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-900 truncate">{comp.name.split(" ")[0]} {comp.name.split(" ")[1]}</span>
                <span className="text-[11px] font-black text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  {comp.weight}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">{comp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Class Reflections Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Reflections</span>
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{completedSessions}</span>
            <span className="text-sm font-semibold text-slate-400">/ {totalSessions} completed</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Syllabus Progress</span>
              <span className="text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fortnightly News */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fortnightly Updates</span>
            <Newspaper className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{news.length}</span>
            <span className="text-sm font-semibold text-slate-400">curated updates</span>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            CVC, Accelerators, GCCs, and strategic alliances verified every 2 weeks.
          </p>
        </div>

        {/* AI Interactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Interactions</span>
            <ScrollText className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{promptLogs.length}</span>
            <span className="text-sm font-semibold text-slate-400">logged interactions</span>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Full prompt audit logs visible to all group members & the instructor.
          </p>
        </div>
      </div>

      {/* Two Column Grid: Latest Reflection & Latest News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Reflection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Latest Class Reflection</h2>
              </div>
              <Link to="/reflections" className="text-xs font-bold text-blue-600 hover:underline">
                View All ({reflections.length}) →
              </Link>
            </div>

            {latestReflection ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-blue-700">Session {latestReflection.sessionNumber}</span>
                    <span className="text-slate-400">{formatDate(latestReflection.classDate)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{latestReflection.sessionTitle}</h3>
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    {latestReflection.keyPoints.slice(0, 2).map((pt, i) => (
                      <p key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{pt}</span>
                      </p>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">Unresolved Open Question:</span>
                    <p className="text-amber-800 italic">"{latestReflection.openQuestion}"</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No reflections created yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/reflections"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
            >
              <span>+ Create New Class Reflection</span>
            </Link>
          </div>
        </div>

        {/* Latest News */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Latest Fortnightly News</h2>
              </div>
              <Link to="/news" className="text-xs font-bold text-blue-600 hover:underline">
                View All ({news.length}) →
              </Link>
            </div>

            {latestNews ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">{latestNews.collaborationType}</Badge>
                  <span className="text-[11px] text-slate-400">{formatDate(latestNews.date)}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{latestNews.headline}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{latestNews.summary}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">{latestNews.company} × {latestNews.startupPartner}</span>
                  <a
                    href={latestNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] font-bold text-blue-600 hover:underline gap-1"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No news items curated yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/news"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
            >
              <span>Explore Fortnightly News</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Group Activity Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Recent Group Prompt & Note Activity
          </h2>
          <Link to="/prompt-log" className="text-xs font-bold text-blue-600 hover:underline">
            View Complete Log ({promptLogs.length}) →
          </Link>
        </div>

        <div className="space-y-3">
          {promptLogs.slice(0, 4).map((log) => (
            <div key={log._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-0.5">
                  <Badge variant={log.feature === "CLASS_REFLECTION" ? "blue" : "amber"} size="sm">
                    {log.feature === "CLASS_REFLECTION" ? "Class Reflection" : "Fortnightly News"}
                  </Badge>
                  <span className="font-bold text-slate-800">{log.userId?.name}</span>
                </div>
                <p className="text-slate-500 line-clamp-1 italic font-serif">"{log.prompt}"</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-4">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};