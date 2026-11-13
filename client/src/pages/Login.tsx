import React, { useState } from "react";
import { Bot, Sparkles, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

export const Login: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [groupName, setGroupName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name: name.trim(), email: email.trim().toLowerCase(), password, role, groupName: groupName.trim(), rollNumber: rollNumber.trim() });
      } else {
        await login(email.trim().toLowerCase(), password);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Authentication failed. Please check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoUser(demoEmail);
    } catch (err: any) {
      setError(err.response?.data?.message || "Quick demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-4">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Corporate-Startup AI Tutor
        </h2>
        <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          <span className="text-xs font-semibold text-slate-300">BML Munjal University</span>
          <span className="text-slate-500">|</span>
          <span className="text-xs font-bold text-emerald-400">ENT 3805</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
          Designing Corporate-Startup Synergies: Class reflections, fortnightly news, and prompt logs.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Quick 1-Click Demo Profiles */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-2xl mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> 1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-slate-400">Default Password: Password123!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin("kulbir.lamba@bmu.edu.in")}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-left transition flex items-start space-x-2 sm:col-span-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Prof. Kulbir Lamba (Course Lead)</p>
                <p className="text-[10px] text-slate-400">kulbir.lamba@bmu.edu.in • Full Cohort Oversight, Audits & Grading</p>
              </div>
            </button>

            <button
              onClick={() => {
                setEmail("anshadhikari111@gmail.com");
                setPassword("Gymislove@1");
              }}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-left transition flex items-start space-x-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Ansh Adhikari</p>
                <p className="text-[10px] text-slate-400">anshadhikari111@gmail.com • Group 09</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin("alex.demo@university.edu")}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-left transition flex items-start space-x-2"
            >
              <UserCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Alex Rivera</p>
                <p className="text-[10px] text-slate-400">alex.demo@university.edu • Group 01</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin("morgan.demo@university.edu")}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-left transition flex items-start space-x-2 sm:col-span-2"
            >
              <UserCheck className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Morgan Patel</p>
                <p className="text-[10px] text-slate-400">STU-DEMO-03 • Group 02 Enterprise SaaS & FinTech</p>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Student Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR")}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll#</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                      placeholder="e.g. 230822"
                    />
                  </div>
                </div>

                {role === "STUDENT" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                      placeholder="e.g. Group 01 — Mobility & DeepTech Synergies"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="university.email@university.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In to Tutor"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isRegister ? "Already have an account? Sign in" : "Need to register a custom student profile? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
