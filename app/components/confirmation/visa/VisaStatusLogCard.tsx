"use client";

import { Clock3 } from "lucide-react";
import type { VisaStatusLog } from "@/app/lib/visa/visaStatusStorage";

type Props = {
  logs: VisaStatusLog[];
};

export default function VisaStatusLogCard({ logs }: Props) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-lg font-black text-gray-950 md:text-xl">
        Status Log
      </h2>

      <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-600">
        All visa status updates will appear here.
      </p>

      <div className="mt-4 space-y-4 md:mt-5">
        {(logs || []).map((log) => (
          <div
            key={log.id}
            className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="break-words text-sm font-black text-gray-950">
                  {log.title}
                </p>

                <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-600">
                  {log.message}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-gray-500">
                <Clock3 size={14} />
                {new Date(log.createdAt).toLocaleString("en-IN")}
              </div>
            </div>

            <p className="mt-2 break-words text-[11px] font-bold uppercase leading-5 text-orange-600">
              Updated by: {log.createdBy}
            </p>
          </div>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="break-words rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold leading-5 text-gray-600">
            No status log available.
          </div>
        )}
      </div>
    </div>
  );
}
