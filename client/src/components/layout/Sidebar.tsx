import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Newspaper,
  ScrollText,
  Users,
  ShieldCheck,
  Bot,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR";
  const groupName = typeof user?.groupId === "object" ? user?.groupId?.name : "Group";
  const tutorName = typeof user?.groupId === "object" ? user?.groupId?.tutorName : "AI Agent Tutor";

  const navItems = [
    { name: "Dashboard", to: "/", icon: LayoutDashboard },
    { name: "Class Reflections", to: "/reflections", icon: BookOpen },
    { name: "Fortnightly News", to: "/news", icon: Newspaper },
    { name: "Prompt Log", to: "/prompt-log", icon: ScrollText },
    { name: "Group Workspace", to: "/workspace", icon: Users },
  ];

  if (isInstructor) {
    navItems.push({
      name: "Instructor Dashboard",
      to: "/instructor",
      icon: ShieldCheck
    });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Corporate-Startup
            </h1>
            <p className="text-xs font-semibold text-blue-400 mt-0.5">AI Tutor Platform</p>
          </div>
        </div>
        <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Course</span>
          <span className="text-[11px] font-bold text-emerald-400">ENT 3805</span>
        </div>
      </div>

      {/* Tutor Banner */}
      {!isInstructor && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/60 border border-slate-700/60 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Agent Tutor</span>
          </div>
          <p className="text-xs font-medium text-white truncate">{tutorName || "Group Agent Tutor"}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{groupName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Academic Attribution */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">BML Munjal University</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Corporate Synergies Lab</p>
      </div>
    </aside>
  );
};