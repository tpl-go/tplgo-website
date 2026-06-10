import { AlertTriangle, Bell, Info, ShieldAlert } from "lucide-react";
import type { TiyaSmartAlert } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaSmartAlertsProps = {
  alerts: TiyaSmartAlert[];
};

const severityStyles: Record<TiyaSmartAlert["severity"], string> = {
  info: "border-blue-100 bg-blue-50 text-blue-700",
  warning: "border-orange-100 bg-orange-50 text-orange-700",
  critical: "border-rose-100 bg-rose-50 text-rose-700",
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

export default function TiyaSmartAlerts({ alerts }: TiyaSmartAlertsProps) {
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <section className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <Bell size={15} />
            AI smart alerts
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Alert center
          </h2>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
          {safeAlerts.length} signals
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {safeAlerts.map((alert) => {
          const Icon = severityIcons[alert.severity];

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-3 ${severityStyles[alert.severity]}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-black">{alert.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 opacity-80">
                    {alert.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
