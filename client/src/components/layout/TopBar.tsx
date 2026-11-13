import React, { useState } from "react";
import { LogOut, ChevronDown, Check, Sparkles, Bot, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import { Badge } from "../common/Badge.tsx";

export const TopBar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const isInstructor = user?.role === "INSTRUCTOR";
  const groupObj = typeof user?.groupId === "object" ? user?.groupId : null;
  const tutorName = isInstructor ? "Faculty Review Mode" : (groupObj?.tutorName || "Group Agent Tutor");
  const groupName = isInstructor ? "Course Faculty (ENT 3805)" : (groupObj?.name || "Group Workspace");

  // Only expose in development mode
  const isDevMode = import.meta.env.DEV;

  const demoAccounts = [
    { role: "INSTRUCTOR", name: "Prof. Elena Rostova", email: "instructor.demo@university.edu", label: "Course Faculty Lead" },
    { role: "STUDENT", name: "Alex Rivera", email: "alex.demo@university.edu", label: "Group 01 Mobility Lead" },
    { role: "STUDENT", name: "Jordan Chen", email: "jordan.demo@university.edu", label: "Group 01 Member" },
    { role: "STUDENT", name: "Morgan Patel", email: "morgan.demo@university.edu", label: "Group 02 Enterprise Lead" },
    { role: "STUDENT", name: "Samira Khan", email: "samira.demo@university.edu", label: "Group 02 Member" },
  ];

  const handleSwitch = async (email: string) => {
    setSwitching(true);
    setDropdownOpen(false);
    try {
      await switchDemoUser(email);
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-30 sticky top-0 shadow-sm">
      {/* Left Info: Active Tutor & Course Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            {isInstructor ? <ShieldCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                {tutorName}
              </span>
              <Badge variant={isInstructor ? "purple" : "brand"} size="sm">
                {isInstructor ? "INSTRUCTOR" : "STUDENT"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[320px]">
              {groupName} • ENT 3805
            </p>
          </div>
        </div>
      </div>

      {/* Right User & Switcher */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Role Switcher - Rendered ONLY in dev mode */}
        {isDevMode && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={switching}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition"
              title="Switch Demo Role (Dev Mode)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Roles</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch Demo Account (Dev Only)
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleSwitch(acc.email)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{acc.name}</p>
                      <p className="text-[10px] text-slate-400">{acc.label}</p>
                    </div>
                    {user?.email === acc.email && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-300">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
