"use client";

import { ArrowDown, MapPinned, Route } from "lucide-react";

import type { TransportMovement } from "./ReviewTransportCoverageCard";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReviewTransportTimelineProps = {
  movements: TransportMovement[];
  routeStops: string[];
};

function statusClass(status: TransportMovement["status"]) {
  return getReviewStatusVisual(status).badgeClass;
}

export default function ReviewTransportTimeline({
  movements,
  routeStops,
}: ReviewTransportTimelineProps) {
  const stops = routeStops.filter(Boolean);

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Master Transport Timeline
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Actual Movement Flow
          </h3>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Route size={22} />
        </span>
      </div>

      {!stops.length && !movements.length ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <MapPinned className="mx-auto text-slate-400" size={32} />
          <p className="mt-3 text-sm font-black text-slate-700">
            No route information available.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {(stops.length ? stops : ["Journey start"]).map((stop, index) => {
            const relatedMovements = movements.filter(
              (movement) =>
                movement.from?.toLowerCase() === stop.toLowerCase() ||
                movement.city?.toLowerCase() === stop.toLowerCase() ||
                movement.to?.toLowerCase() === stop.toLowerCase()
            );

            return (
              <div key={`${stop}-${index}`} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4">
                <div className="flex flex-col items-center">
                  <span className="mt-2 h-4 w-4 rounded-full border-4 border-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] shadow-[0_0_0_1px_rgba(79,70,229,0.22)]" />
                  {index < stops.length - 1 ? (
                    <span className="h-full min-h-20 w-px bg-gradient-to-b from-[#4f46e5]/60 to-slate-200" />
                  ) : null}
                </div>
                <div className="min-w-0 pb-5">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-lg font-black text-slate-950">{stop}</p>
                    {relatedMovements.length ? (
                      <div className="mt-3 grid gap-2">
                        {relatedMovements.map((movement) => (
                          <div key={movement.id} className={`rounded-2xl border border-white p-3 ${getReviewStatusVisual(movement.status).cardClass}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {movement.title}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-500">
                                  {movement.from} → {movement.to}
                                </p>
                              </div>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(movement.status)}`}>
                                {movement.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        No transfer planning available.
                      </p>
                    )}
                  </div>
                  {index < stops.length - 1 ? (
                    <div className="ml-5 mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-500">
                      <ArrowDown size={13} />
                      Next movement
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
