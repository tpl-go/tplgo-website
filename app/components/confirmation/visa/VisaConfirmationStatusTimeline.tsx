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
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">
        Visa Status Tracker
      </h2>

      <p className="mt-1 text-sm font-semibold text-gray-600">
        Track the application journey from submission to final decision.
      </p>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = index <= activeIndex;

          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    completed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon size={20} />
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`h-10 w-[2px] ${
                      completed ? "bg-green-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="pb-4">
                <h3
                  className={`text-sm font-black ${
                    completed ? "text-gray-950" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 text-xs font-semibold text-gray-600">
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