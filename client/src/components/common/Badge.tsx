import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "amber" | "rose" | "purple" | "blue" | "gray";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  className = ""
}) => {
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs font-medium" : "px-3 py-1 text-sm font-semibold";

  const variantMap = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    brand: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    gray: "bg-gray-100 text-gray-700 border border-gray-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full ${sizeClasses} ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};