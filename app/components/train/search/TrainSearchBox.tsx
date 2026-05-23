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
      <div className="mt-7 w-full rounded-[26px] border border-white/45 bg-white/20 px-5 pt-4 pb-5 shadow-xl backdrop-blur-md">
        <TrainModeTabs activeMode={activeMode} onChange={setActiveMode} />

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