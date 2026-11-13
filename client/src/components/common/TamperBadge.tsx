import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, KeyRound } from "lucide-react";
import api from "../../services/api.ts";

interface TamperBadgeProps {
  groupId: string;
}

export const TamperBadge: React.FC<TamperBadgeProps> = ({ groupId }) => {
  const [status, setStatus] = useState<{
    loading: boolean;
    valid?: boolean;
    totalLogs?: number;
    latestHash?: string;
    tamperedAtSequence?: number;
    reason?: string;
  }>({ loading: true });

  const checkIntegrity = async () => {
    if (!groupId) return;
    setStatus({ loading: true });
    try {
      const res = await api.get(`/prompt-logs/verify-chain/${groupId}`);
      setStatus({
        loading: false,
        valid: res.data.valid,
        totalLogs: res.data.totalLogs,
        latestHash: res.data.latestHash,
        tamperedAtSequence: res.data.tamperedAtSequence,
        reason: res.data.reason
      });
    } catch (err: any) {
      setStatus({
        loading: false,
        valid: false,
        reason: err.response?.data?.message || "Audit verification failed"
      });
    }
  };

  useEffect(() => {
    checkIntegrity();
  }, [groupId]);

  if (status.loading) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        <span>Verifying SHA-256 Chain...</span>
      </div>
    );
  }

  if (status.valid) {
    return (
      <div
        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80 shadow-sm"
        title={`Chain root intact. Total logs: ${status.totalLogs}. Latest Hash: ${status.latestHash}`}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="font-mono text-[11px] tracking-tight">
          SHA-256 HASH CHAIN: VALID ({status.totalLogs || 0} entries)
        </span>
        <KeyRound className="w-3 h-3 text-emerald-500 opacity-60" />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-300 shadow-sm"
      title={status.reason || "Hash chain mismatch detected"}
    >
      <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
      <span className="font-mono text-[11px]">
        TAMPER DETECTED: Log #{status.tamperedAtSequence || "?"} Compromised
      </span>
    </div>
  );
};
