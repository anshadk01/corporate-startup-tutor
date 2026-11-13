import React from "react";
import { useMotionSafe } from "../../hooks/useMotionSafe.ts";

interface ProgressRingProps {
  completed: number;
  total?: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  completed,
  total = 13,
  size = 76,
  strokeWidth = 7
}) => {
  const isMotionSafe = useMotionSafe();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.round((completed / total) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-emerald-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: isMotionSafe ? "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none"
          }}
        />
      </svg>
      {/* Centered Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-black text-slate-900 leading-none">
          {completed}/{total}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
