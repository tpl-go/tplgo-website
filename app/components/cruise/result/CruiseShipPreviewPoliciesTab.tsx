"use client";

export default function CruiseShipPreviewPoliciesTab() {
  return (
    <div className="space-y-3">
      {["Pregnancy Policy", "Minor Accompany Policy", "Smoking Policy"].map(
        (label) => (
          <details
            key={label}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <summary className="cursor-pointer list-none px-4 py-4 text-[15px] font-medium text-slate-800">
              {label}
            </summary>
            <div className="border-t border-slate-200 px-4 py-4 text-[14px] text-slate-600">
              Detailed policy content will appear here.
            </div>
          </details>
        )
      )}
    </div>
  );
}