"use client";

import { CheckCircle2, CircleDashed, FileSearch, Landmark, Send } from "lucide-react";

type Props = {
  currentStatus?: string;
};

export default function VisaConfirmationStatusTimeline({
  currentStatus = "Documents Received",
}: Props) {
  const steps = [
    {
      key: "Application Received",
      title: "Application Received",
      desc: "Your visa application has been created.",
      icon: CheckCircle2,
    },
    {
      key: "Documents Received",
      title: "Documents Received",
      desc: "Uploaded documents are attached with the application.",
      icon: FileSearch,
    },
    {
      key: "Under Verification",
      title: "Under Verification",
      desc: "TPL Visa Desk will verify documents and details.",
      icon: CircleDashed,
    },
    {
      key: "Submitted to Embassy/VFS",
      title: "Embassy / VFS Processing",
      desc: "Application will move as per destination visa rules.",
      icon: Landmark,
    },
    {
      key: "Decision Awaited",
      title: "Decision Awaited",
      desc: "Final approval depends on embassy / immigration authority.",
      icon: Send,
    },
  ];

  const activeIndex = Math.max(
    steps.findIndex((step) => step.key === currentStatus),
    1
  );

  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-lg font-black text-gray-950 md:text-xl">
        Visa Status Tracker
      </h2>

      <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-600">
        Track the application journey from submission to final decision.
      </p>

      <div className="mt-5 space-y-1 md:mt-6 md:space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = index <= activeIndex;
          const current = index === activeIndex;

          return (
            <div key={step.key} className="flex min-w-0 gap-3 md:gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full md:h-10 md:w-10 ${
                    current
                      ? "bg-orange-100 text-orange-700 ring-4 ring-orange-50"
                      : completed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon size={18} />
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`h-10 w-[2px] ${
                      completed ? "bg-green-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0 pb-4">
                <h3
                  className={`break-words text-sm font-black ${
                    current
                      ? "text-orange-700"
                      : completed
                      ? "text-gray-950"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-600">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
