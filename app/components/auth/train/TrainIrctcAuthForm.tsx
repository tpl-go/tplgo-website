"use client";

type Props = {
  irctcUsername: string;
  password: string;
  captcha: string;
  paymentActionState?: "idle" | "processing" | "success" | "failure";
  isExpired?: boolean;
  onPasswordChange: (value: string) => void;
  onCaptchaChange: (value: string) => void;
  onVerify: () => void;
  onRetry?: () => void;
};

export default function TrainIrctcAuthForm({
  irctcUsername,
  password,
  captcha,
  paymentActionState = "idle",
  isExpired = false,
  onPasswordChange,
  onCaptchaChange,
  onVerify,
  onRetry,
}: Props) {
  const isProcessing = paymentActionState === "processing";
  const isSuccess = paymentActionState === "success";
  const isFailure = paymentActionState === "failure";

  function handleAction() {
    if (isExpired || isProcessing) return;

    if (isFailure) {
      onRetry?.();
      return;
    }

    onVerify();
  }

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 md:px-5">
        <div className="text-[18px] font-extrabold text-slate-900 md:text-[19px]">
          IRCTC Authentication
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          Enter your IRCTC password and captcha to complete booking.
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">
        <label className="block">
          <div className="mb-2 text-[13px] font-bold text-slate-700">
            IRCTC Username
          </div>
          <input
            type="text"
            value={irctcUsername}
            readOnly
            className="h-[46px] w-full rounded-xl border border-slate-300 bg-slate-100 px-3 text-[14px] font-medium text-slate-900 outline-none"
          />
        </label>

        <label className="block">
          <div className="mb-2 text-[13px] font-bold text-slate-700">
            IRCTC Password
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter IRCTC password"
            className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium text-slate-900 outline-none"
          />
        </label>

        <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-[13px] font-bold text-slate-700">
            Captcha Verification
          </div>

          <div className="mb-3 flex h-[54px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-[18px] font-black tracking-[0.2em] text-slate-700 md:tracking-[0.3em]">
            X7K9P
          </div>

          <input
            type="text"
            value={captcha}
            onChange={(e) => onCaptchaChange(e.target.value.toUpperCase())}
            placeholder="Enter captcha"
            className="h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] font-medium uppercase text-slate-900 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAction}
          disabled={isExpired || isProcessing}
          className={`min-h-12 w-full rounded-full px-4 text-[15px] font-extrabold text-white transition ${
            isExpired || isProcessing
              ? "cursor-not-allowed bg-slate-300"
              : isSuccess
              ? "bg-gradient-to-r from-emerald-500 to-green-600"
              : isFailure
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-sky-500 to-blue-600 hover:scale-[1.01]"
          }`}
        >
          {isExpired
            ? "Session Expired"
            : isProcessing
            ? "Verifying..."
            : isSuccess
            ? "Verified Successfully ✅"
            : isFailure
            ? "Retry Verification"
            : "Verify & Complete Booking"}
        </button>
      </div>
    </section>
  );
}
