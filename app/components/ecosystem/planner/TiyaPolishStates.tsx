import { Bot, Sparkles, type LucideIcon } from "lucide-react";

type TiyaEmptyStateProps = {
  icon?: LucideIcon;
  eyebrow: string;
  title: string;
  detail: string;
  tone?: "light" | "dark";
};

export function TiyaEmptyState({
  icon: Icon = Sparkles,
  eyebrow,
  title,
  detail,
  tone = "dark",
}: TiyaEmptyStateProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 ${
        isDark
          ? "border-white/10 bg-white/[0.07] text-white"
          : "border-blue-100 bg-white/80 text-slate-950"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.12),transparent_28%)]"
            : "bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.1),transparent_28%)]"
        }`}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isDark ? "bg-white/10 text-cyan-100" : "bg-blue-950 text-white"
          }`}
        >
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.18em] ${
              isDark ? "text-cyan-100" : "text-blue-700"
            }`}
          >
            {eyebrow}
          </p>
          <h3
            className={`mt-1 text-base font-black ${
              isDark ? "text-white" : "text-slate-950"
            }`}
          >
            {title}
          </h3>
          <p
            className={`mt-1 text-sm font-semibold leading-6 ${
              isDark ? "text-white/65" : "text-slate-600"
            }`}
          >
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TiyaAISkeleton({ label = "Tiya is refining this module" }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-4 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.09)_42%,transparent_74%)] animate-[pulse_1.8s_ease-in-out_infinite]" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <Bot size={18} className="animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">
            AI thinking state
          </p>
          <p className="mt-1 text-sm font-bold text-white/70">{label}</p>
        </div>
      </div>
      <div className="relative mt-4 grid gap-2">
        <div className="h-3 rounded-full bg-white/10" />
        <div className="h-3 w-5/6 rounded-full bg-white/10" />
        <div className="h-3 w-2/3 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
