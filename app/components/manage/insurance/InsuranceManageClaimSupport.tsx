"use client";

type Props = {
  policyNumber: string;
  provider: string;
  emergencyHelpline?: string;
  insurerContact?: string;
  onDownloadPolicy: () => void;
};

export default function InsuranceManageClaimSupport({
  policyNumber,
  provider,
  emergencyHelpline,
  insurerContact,
  onDownloadPolicy,
}: Props) {
  return (
    <div className="min-w-0 rounded-[20px] border border-black/5 bg-white p-4 shadow-sm md:rounded-[30px] md:p-6">
      <div className="mb-4 md:mb-5">
        <h2 className="break-words text-lg font-black text-[#111827] md:text-xl">
          Claim Support & Emergency Help
        </h2>
        <p className="break-words text-sm font-semibold leading-5 text-[#6b7280]">
          Use these details during emergency claim or travel support.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <InfoCard label="Policy Number" value={policyNumber || "-"} />
        <InfoCard label="Insurance Provider" value={provider || "-"} />
        <InfoCard
          label="Emergency Helpline"
          value={emergencyHelpline || "TPL emergency desk will assist"}
        />
        <InfoCard
          label="Insurer Contact"
          value={insurerContact || "Available on policy document"}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 md:mt-6 md:p-5">
        <h3 className="break-words text-base font-black text-[#111827]">
          Claim Process
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <StepBox
            step="1"
            title="Inform Emergency Desk"
            description="Contact insurer or TPL support immediately."
          />
          <StepBox
            step="2"
            title="Keep Documents"
            description="Bills, passport, policy, medical reports and receipts."
          />
          <StepBox
            step="3"
            title="Submit Claim"
            description="TPL will assist with insurer claim process."
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onDownloadPolicy}
        className="mt-4 h-11 w-full rounded-2xl bg-orange-500 px-5 text-sm font-black text-white hover:bg-orange-600 sm:w-auto md:mt-5"
      >
        Download Policy Document
      </button>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#f8fafc] p-4">
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-1 break-words text-sm font-black leading-5 text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function StepBox({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-white p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
        {step}
      </div>
      <p className="mt-3 break-words text-sm font-black text-[#111827]">{title}</p>
      <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#6b7280]">
        {description}
      </p>
    </div>
  );
}
