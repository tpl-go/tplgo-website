"use client";

import { useState } from "react";
import { getLiveTrainStatus, getTrainPNRStatus } from "./trainData";
import TrainBookTicketForm from "./TrainBookTicketForm";
import TrainLiveStatusForm from "./TrainLiveStatusForm";
import TrainLiveStatusModal from "./TrainLiveStatusModal";
import TrainModeTabs from "./TrainModeTabs";
import TrainPNRForm from "./TrainPNRForm";
import TrainPNRStatusModal from "./TrainPNRStatusModal";
import type {
  TrainLiveStatusResult,
  TrainPNRResult,
  TrainSearchMode,
} from "./trainTypes";

export default function TrainSearchBox() {
  const [activeMode, setActiveMode] = useState<TrainSearchMode>("book");
  const [pnrModalOpen, setPnrModalOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [pnrResult, setPnrResult] = useState<TrainPNRResult | null>(null);
  const [liveResult, setLiveResult] =
    useState<TrainLiveStatusResult | null>(null);

  return (
    <>
      <div className="mt-4 md:mt-7 w-full rounded-[24px] md:rounded-[26px] border border-white/45 bg-white/20 px-3 md:px-5 pt-4 pb-5 shadow-xl backdrop-blur-md">
        {/* Desktop Tabs — untouched */}
        <div className="hidden md:block">
          <TrainModeTabs activeMode={activeMode} onChange={setActiveMode} />
        </div>

        {/* Mobile Dropdown */}
        <div className="mb-4 md:hidden">
          <label className="mb-1 block text-[11px] font-extrabold text-white">
            Train Search Type
          </label>

          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as TrainSearchMode)}
            className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
          >
            <option value="book">Book Train Ticket</option>
            <option value="pnr">Check PNR Status</option>
            <option value="live">Live Train Status</option>
          </select>
        </div>

        {activeMode === "book" && <TrainBookTicketForm />}

        {activeMode === "pnr" && (
          <TrainPNRForm
            onSubmit={(pnr) => {
              setPnrResult(getTrainPNRStatus(pnr));
              setPnrModalOpen(true);
            }}
          />
        )}

        {activeMode === "live" && (
          <TrainLiveStatusForm
            onSubmit={({ trainInput }) => {
              setLiveResult(getLiveTrainStatus(trainInput));
              setLiveModalOpen(true);
            }}
          />
        )}
      </div>

      <TrainPNRStatusModal
        open={pnrModalOpen}
        onClose={() => setPnrModalOpen(false)}
        data={pnrResult}
      />

      <TrainLiveStatusModal
        open={liveModalOpen}
        onClose={() => setLiveModalOpen(false)}
        data={liveResult}
      />
    </>
  );
}