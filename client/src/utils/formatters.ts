export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const formatDateTime = (dateString: string | Date | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getCollaborationColor = (type: string): { bg: string; text: string; border: string } => {
  switch (type) {
    case "Corporate Venture Capital":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "Accelerator / Incubator":
      return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
    case "Co-Innovation Lab":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    case "Strategic Alliance":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "Startup Acquisition":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "Global Capability Center":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    case "Commercial Pilot / POC":
      return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  }
};