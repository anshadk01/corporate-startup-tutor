import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import api from "../../services/api.ts";
import { useMotionSafe } from "../../hooks/useMotionSafe.ts";

interface Cycle {
  _id: string;
  cycleNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  isMissed: boolean;
}

export const FortnightCountdown: React.FC = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const isMotionSafe = useMotionSafe();

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await api.get("/cycles");
        setCycles(res.data);
      } catch (err) {
        console.error("Failed to load cycles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  if (loading || cycles.length === 0) return null;

  const now = new Date();
  // Find current cycle or closest upcoming cycle
  const activeCycle = cycles.find((c) => new Date(c.dueDate) >= now) || cycles[cycles.length - 1];
  const dueDate = new Date(activeCycle.dueDate);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 3 && diffDays >= 0;

  return (
    <div
      className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 text-xs transition ${
        isUrgent
          ? `bg-amber-50/80 border-amber-300 text-amber-900 ${isMotionSafe ? "animate-pulse" : ""}`
          : "bg-slate-50 border-slate-200/80 text-slate-700"
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? "text-amber-600" : "text-slate-400"}`} />
      <div>
        <span className="font-bold text-slate-900 block text-[11px] leading-tight">
          {activeCycle.title}
        </span>
        <span className="text-[10px] text-slate-500">
          Due: {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} •{" "}
          <strong className={isUrgent ? "text-amber-700 font-extrabold" : "text-slate-700"}>
            {diffDays > 0 ? `${diffDays} days remaining` : "Due today"}
          </strong>
        </span>
      </div>
    </div>
  );
};
