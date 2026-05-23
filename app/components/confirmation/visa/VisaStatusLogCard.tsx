"use client";

import { Clock3 } from "lucide-react";
import type { VisaStatusLog } from "@/app/lib/visa/visaStatusStorage";

type Props = {
  logs: VisaStatusLog[];
};

export default function VisaStatusLogCard({ logs }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">Status Log</h2>

      <p className="mt-1 text-sm font-semibold text-gray-600">
        All visa status updates will appear here.
      </p>

      <div className="mt-5 space-y-4">
        {(logs || []).map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-gray-950">{log.title}</p>

                <p className="mt-1 text-xs font-semibold text-gray-600">
                  {log.message}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-gray-500">
                <Clock3 size={14} />
                {new Date(log.createdAt).toLocaleString("en-IN")}
              </div>
            </div>

            <p className="mt-2 text-[11px] font-bold uppercase text-orange-600">
              Updated by: {log.createdBy}
            </p>
          </div>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
            No status log available.
          </div>
        )}
      </div>
    </div>
  );
}