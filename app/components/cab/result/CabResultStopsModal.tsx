"use client";

type Props = {
  open: boolean;
  stops: string[];
  onClose: () => void;
  onChangeStop: (index: number, value: string) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
};

export default function CabResultStopsModal({
  open,
  stops,
  onClose,
  onChangeStop,
  onAddStop,
  onRemoveStop,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-start justify-center bg-black/35 px-4 pt-24">
      <div className="w-full max-w-[760px] rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[22px] font-extrabold text-slate-900">
            Add Stops
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Close stops modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-[60px] flex-1 items-center rounded-2xl border border-slate-300 bg-white px-4">
                <span className="mr-4 shrink-0 text-[16px] font-bold text-slate-700">
                  Stop {index + 1}
                </span>

                <input
                  type="text"
                  value={stop}
                  onChange={(e) => onChangeStop(index, e.target.value)}
                  placeholder="Enter stop location"
                  className="w-full min-w-0 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="off"
                />
              </div>

              <button
                type="button"
                onClick={() => onRemoveStop(index)}
                className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                aria-label={`Remove stop ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onAddStop}
            disabled={stops.length >= 5}
            className={`text-[16px] font-extrabold ${
              stops.length >= 5
                ? "cursor-not-allowed text-slate-400"
                : "text-sky-600 hover:text-sky-700"
            }`}
          >
            + ADD STOP
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-[50px] rounded-2xl bg-sky-500 px-9 text-[14px] font-extrabold text-white transition hover:bg-sky-600"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}