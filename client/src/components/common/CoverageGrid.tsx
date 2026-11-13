import React from "react";
import { Check, Clock } from "lucide-react";
import { useMotionSafe } from "../../hooks/useMotionSafe.ts";

interface CoverageGridProps {
  coverage: Array<{
    sessionNumber: number;
    completed: boolean;
    classDate?: string | null;
    authorName?: string | null;
  }>;
}

export const CoverageGrid: React.FC<CoverageGridProps> = ({ coverage }) => {
  const isMotionSafe = useMotionSafe();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>13-Session Syllabus Coverage Matrix</span>
        <span className="text-emerald-600 font-extrabold">
          {coverage.filter((c) => c.completed).length} / 13 Completed
        </span>
      </div>
      <div className="grid grid-cols-13 gap-1 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
        {coverage.map((c) => (
          <div
            key={c.sessionNumber}
            title={`Session ${c.sessionNumber}: ${
              c.completed
                ? `Completed by ${c.authorName || "Student"} (${c.classDate ? new Date(c.classDate).toLocaleDateString() : ""})`
                : "Pending reflection"
            }`}
            className={`h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-extrabold cursor-pointer transition-all duration-200 ${
              c.completed
                ? `bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 ${isMotionSafe ? "hover:scale-105" : ""}`
                : "bg-slate-200/70 text-slate-400 hover:bg-slate-300"
            }`}
          >
            {c.completed ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <span>S{c.sessionNumber}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
