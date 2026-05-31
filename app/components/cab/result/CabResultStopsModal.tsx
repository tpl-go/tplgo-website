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
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/35 px-0 pt-0 sm:items-start sm:px-4 sm:pt-24">
      <div className="flex max-h-[86vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-h-[60px] flex-1 flex-col justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 sm:flex-row sm:items-center sm:py-0">
                  <span className="mb-2 shrink-0 text-[13px] font-bold text-slate-700 sm:mb-0 sm:mr-4 sm:text-[16px]">
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
                  className="flex h-[48px] w-full shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 sm:h-[56px] sm:w-[56px]"
                  aria-label={`Remove stop ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onAddStop}
            disabled={stops.length >= 5}
            className={`h-[48px] rounded-2xl border border-slate-200 px-5 text-[16px] font-extrabold sm:border-0 sm:px-0 ${
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
            className="h-[50px] w-full rounded-2xl bg-sky-500 px-9 text-[14px] font-extrabold text-white transition hover:bg-sky-600 sm:w-auto"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
