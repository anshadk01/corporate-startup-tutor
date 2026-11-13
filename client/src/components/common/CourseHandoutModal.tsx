import React, { useState } from "react";
import { Modal } from "./Modal.tsx";
import {
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  Calendar,
  ExternalLink,
  UserCheck,
  FileText,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import {
  COURSE_FACULTY,
  COURSE_EVALUATION_COMPONENTS,
  OFFICIAL_SESSIONS
} from "../../utils/courseSyllabus.ts";

interface CourseHandoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseHandoutModal: React.FC<CourseHandoutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"syllabus" | "evaluation" | "faculty">("syllabus");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ENT 3805: Designing Corporate-Startup Synergies" maxWidth="3xl">
      <div className="space-y-5 text-slate-800">
        {/* Course Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[11px] font-semibold text-blue-200 mb-2">
                <span>BML Munjal University • School of Engineering & Technology</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Designing Corporate-Startup Synergies</h2>
              <p className="text-xs text-blue-200 mt-1">Course Code: ENT 3805 • 2-1-0 Credits • 45 Total Hours</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Course Lead</span>
              <span className="text-xs font-bold text-white">{COURSE_FACULTY.name}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`pb-2.5 flex items-center space-x-1.5 transition border-b-2 ${
              activeTab === "syllabus"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>13-Session Syllabus Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`pb-2.5 flex items-center space-x-1.5 transition border-b-2 ${
              activeTab === "evaluation"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Evaluation Pattern (100%)</span>
          </button>
          <button
            onClick={() => setActiveTab("faculty")}
            className={`pb-2.5 flex items-center space-x-1.5 transition border-b-2 ${
              activeTab === "faculty"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Faculty & Background</span>
          </button>
        </div>

        {/* TAB 1: SYLLABUS ROADMAP */}
        {activeTab === "syllabus" && (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-500">
              Official 13-week curriculum for ENT 3805. Each session includes targeted Course Outcomes and mapped pre-reads:
            </p>
            <div className="space-y-2.5">
              {OFFICIAL_SESSIONS.map((sess) => (
                <div
                  key={sess.sessionNumber}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0 mt-0.5">
                        {sess.sessionNumber}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{sess.title}</h4>
                        {sess.preRead && (
                          <p className="text-[11px] text-amber-800 mt-1 font-medium bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                            📖 Pre-Read: {sess.preRead}
                          </p>
                        )}
                        <ul className="mt-1.5 space-y-0.5">
                          {sess.keyTopics.map((top, idx) => (
                            <li key={idx} className="text-[11px] text-slate-600 flex items-center space-x-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              <span>{top}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 block">
                        {sess.courseOutcome}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{sess.bloomsLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: EVALUATION PATTERN */}
        {activeTab === "evaluation" && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COURSE_EVALUATION_COMPONENTS.map((comp, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    comp.name.includes("Corporate Startup Tutor")
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{comp.name}</span>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {comp.weight}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 mb-2">
                    <span>{comp.timeline}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{comp.cos}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{comp.description}</p>
                </div>
              ))}
            </div>

            {/* Component B Specific Mandate Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Component B Handout Rules (Corporate Startup Tutor)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The course handout mandates: Each group creates <strong>one Agent Tutor</strong> for the course with access to all group members and the instructor.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="font-bold text-white block mb-1">Task 1: Session Reflections</span>
                  <span className="text-[11px] text-slate-400">
                    Record (1) key points from class, and (2) exactly ONE open question not clarified in class.
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="font-bold text-white block mb-1">Task 2: Fortnightly News</span>
                  <span className="text-[11px] text-slate-400">
                    Curate LinkedIn posts, company websites, and startup announcements; summarize and state why they matter.
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-300 pt-1">
                ✓ Visible prompt log requirement fulfilled via SHA-256 tamper-evident cryptographic hash chaining.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: FACULTY & BACKGROUND */}
        {activeTab === "faculty" && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base flex-shrink-0">
                  KL
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{COURSE_FACULTY.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{COURSE_FACULTY.title}</p>
                  <p className="text-[11px] text-slate-500">{COURSE_FACULTY.institution}</p>
                  <a
                    href={`mailto:${COURSE_FACULTY.email}`}
                    className="text-xs font-mono text-slate-700 hover:text-blue-600 mt-1 inline-block"
                  >
                    ✉ {COURSE_FACULTY.email}
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {COURSE_FACULTY.bio}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">The Innovation Paradox</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Most academic programs study startups or large enterprises in isolation. ENT 3805 bridges this gap by teaching students how agile emerging ventures and established corporations co-create value through Open Innovation, Corporate Venture Capital, Co-Innovation Labs, and Incubation programs like the Maruti Suzuki MISA initiative and Global Capability Centers (GCCs).
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};
