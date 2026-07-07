"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

type ReviewProceedStatusProps = {
  message?: string;
  state: "idle" | "processing" | "success" | "error";
};

export default function ReviewProceedStatus({
  message,
  state,
}: ReviewProceedStatusProps) {
  if (state === "idle" && !message) return null;

  const tone =
    state === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : state === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-black ${tone}`}>
      <div className="flex items-center gap-2">
        {state === "processing" ? (
          <Loader2 size={17} className="animate-spin" />
        ) : state === "error" ? (
          <AlertTriangle size={17} />
        ) : (
          <CheckCircle2 size={17} />
        )}
        {message || "Preparing your booking handoff..."}
      </div>
    </div>
  );
}
