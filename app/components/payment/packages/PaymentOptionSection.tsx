"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Smartphone,
  CreditCard,
  Landmark,
  ShieldCheck,
  Wallet,
  BadgePercent,
  Circle,
  CheckCircle2,
} from "lucide-react";

type PaymentOptionSectionProps = {
  onPaymentMethodChange?: (method: string) => void;
};

type UpiApp = {
  id: string;
  label: string;
};

type CardMiniOption = {
  id: string;
  label: string;
};

type BankOption = {
  id: string;
  label: string;
};

type PaymentBlockKey = "upi" | "card" | "netbanking";

const upiApps: UpiApp[] = [
  { id: "upi_gpay", label: "Google Pay" },
  { id: "upi_phonepe", label: "PhonePe" },
  { id: "upi_paytm", label: "Paytm" },
  { id: "upi_bhim", label: "BHIM UPI" },
];

const cardOptions: CardMiniOption[] = [
  { id: "card_credit", label: "Credit Card" },
  { id: "card_debit", label: "Debit Card" },
];

const bankOptions: BankOption[] = [
  { id: "nb_hdfc", label: "HDFC Bank" },
  { id: "nb_icici", label: "ICICI Bank" },
  { id: "nb_sbi", label: "State Bank of India" },
  { id: "nb_axis", label: "Axis Bank" },
  { id: "nb_kotak", label: "Kotak Mahindra" },
  { id: "nb_pnb", label: "Punjab National Bank" },
];

function getBlockTitle(key: PaymentBlockKey) {
  if (key === "upi") return "UPI Payments";
  if (key === "card") return "Credit / Debit Cards";
  return "Net Banking";
}

function getBlockSubtitle(key: PaymentBlockKey) {
  if (key === "upi") return "Fastest payment with instant confirmation";
  if (key === "card") return "Secure card payment with OTP authentication";
  return "Pay directly from your bank account";
}

function getMethodLabel(method: string) {
  if (method.startsWith("upi_")) {
    const item = upiApps.find((app) => app.id === method);
    return item?.label || "UPI";
  }

  if (method.startsWith("card_")) {
    const item = cardOptions.find((card) => card.id === method);
    return item?.label || "Card";
  }

  if (method.startsWith("nb_")) {
    const item = bankOptions.find((bank) => bank.id === method);
    return item?.label || "Net Banking";
  }

  return method;
}

export default function PaymentOptionSection({
  onPaymentMethodChange,
}: PaymentOptionSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [expandedBlock, setExpandedBlock] = useState<PaymentBlockKey | null>("upi");
  const [upiId, setUpiId] = useState("");

  const selectedMethodLabel = useMemo(() => {
    return selectedMethod ? getMethodLabel(selectedMethod) : "No method selected";
  }, [selectedMethod]);

  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
    onPaymentMethodChange?.(method);
  };

  const handleSelectUpiIntent = (appId: string) => {
    handleSelectMethod(appId);
  };

  const handleVerifyUpiId = () => {
    const cleanUpiId = upiId.trim();
    if (!cleanUpiId) return;
    handleSelectMethod(`upi_id:${cleanUpiId}`);
  };

  const renderSelectionDot = (active: boolean) => {
    return active ? (
      <CheckCircle2 size={18} className="text-sky-600" />
    ) : (
      <Circle size={18} className="text-slate-400" />
    );
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#eef6ff] via-white to-[#fff5ea] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-extrabold text-emerald-700">
              <ShieldCheck size={13} className="mr-1.5" />
              Secure Payment Options
            </div>

            <div className="mt-3 text-[22px] font-black text-slate-900">
              Choose your payment method
            </div>

            <div className="mt-1 text-[14px] font-medium text-slate-600">
              Premium checkout with secure, fast and reliable payment choices
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MiniInfoCard
              icon={<ShieldCheck size={16} className="text-emerald-600" />}
              title="100% Secure"
              subtitle="Encrypted payment flow"
            />
            <MiniInfoCard
              icon={<Wallet size={16} className="text-sky-600" />}
              title="Fast Checkout"
              subtitle="Instant confirmation"
            />
            <MiniInfoCard
              icon={<BadgePercent size={16} className="text-orange-600" />}
              title="Best Value"
              subtitle="Offers auto-applied"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="rounded-2xl border border-slate-200 bg-[#fcfdff] px-4 py-4">
          <div className="text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
            Selected Payment Method
          </div>
          <div className="mt-2 text-[16px] font-bold text-slate-900">
            {selectedMethodLabel}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* UPI */}
        <PaymentBlock
          title={getBlockTitle("upi")}
          subtitle={getBlockSubtitle("upi")}
          icon={<Smartphone size={18} className="text-sky-600" />}
          isExpanded={expandedBlock === "upi"}
          onToggle={() =>
            setExpandedBlock((prev) => (prev === "upi" ? null : "upi"))
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {upiApps.map((app) => {
                const active = selectedMethod === app.id;

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectUpiIntent(app.id)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-sky-400 bg-sky-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[15px] font-extrabold text-slate-900">
                          {app.label}
                        </div>
                        <div className="mt-1 text-[12px] font-medium text-slate-600">
                          Pay instantly via app intent
                        </div>
                      </div>

                      <div className="shrink-0">{renderSelectionDot(active)}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-4">
              <div className="text-[14px] font-extrabold text-slate-900">
                Pay via UPI ID
              </div>

              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter UPI ID (example@upi)"
                  className="h-[48px] flex-1 rounded-xl border border-slate-300 px-4 text-[14px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                />

                <button
                  type="button"
                  onClick={handleVerifyUpiId}
                  className="h-[48px] rounded-xl bg-sky-600 px-5 text-[14px] font-extrabold text-white transition hover:bg-sky-700"
                >
                  Verify & Select
                </button>
              </div>

              <div className="mt-2 text-[12px] font-medium text-slate-500">
                Example: yourname@oksbi, mobilenumber@upi
              </div>
            </div>
          </div>
        </PaymentBlock>

        {/* CARD */}
        <PaymentBlock
          title={getBlockTitle("card")}
          subtitle={getBlockSubtitle("card")}
          icon={<CreditCard size={18} className="text-indigo-600" />}
          isExpanded={expandedBlock === "card"}
          onToggle={() =>
            setExpandedBlock((prev) => (prev === "card" ? null : "card"))
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cardOptions.map((card) => {
              const active = selectedMethod === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectMethod(card.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-indigo-400 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-extrabold text-slate-900">
                        {card.label}
                      </div>
                      <div className="mt-1 text-[12px] font-medium text-slate-600">
                        Visa, MasterCard, RuPay and more supported
                      </div>
                    </div>

                    <div className="shrink-0">{renderSelectionDot(active)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </PaymentBlock>

        {/* NETBANKING */}
        <PaymentBlock
          title={getBlockTitle("netbanking")}
          subtitle={getBlockSubtitle("netbanking")}
          icon={<Landmark size={18} className="text-emerald-600" />}
          isExpanded={expandedBlock === "netbanking"}
          onToggle={() =>
            setExpandedBlock((prev) => (prev === "netbanking" ? null : "netbanking"))
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bankOptions.map((bank) => {
              const active = selectedMethod === bank.id;

              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => handleSelectMethod(bank.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-extrabold text-slate-900">
                        {bank.label}
                      </div>
                      <div className="mt-1 text-[12px] font-medium text-slate-600">
                        Redirect to bank for secure authentication
                      </div>
                    </div>

                    <div className="shrink-0">{renderSelectionDot(active)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </PaymentBlock>
      </div>
    </section>
  );
}

function PaymentBlock({
  title,
  subtitle,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0">{icon}</div>

          <div className="min-w-0">
            <div className="text-[17px] font-extrabold text-slate-900">
              {title}
            </div>
            <div className="mt-1 text-[13px] font-medium text-slate-600">
              {subtitle}
            </div>
          </div>
        </div>

        <div className="shrink-0 rounded-full border border-slate-300 bg-white p-1.5 text-slate-700">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded ? (
        <div className="border-t border-slate-200 bg-[#fcfdff] px-5 py-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function MiniInfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      <div className="mt-2 text-[13px] font-bold text-slate-900">{subtitle}</div>
    </div>
  );
}