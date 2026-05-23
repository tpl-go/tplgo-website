"use client";

type Props = {
  policies: {
    id: string;
    title: string;
    description: string;
  }[];
};

export default function CruisePoliciesTab({ policies }: Props) {
  return (
    <div className="space-y-4 p-4">
      {policies.map((policy) => (
        <div key={policy.id} className="rounded-2xl border bg-white p-4">
          <div className="text-[16px] font-semibold text-slate-900">
            {policy.title}
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-600">
            {policy.description}
          </div>
        </div>
      ))}
    </div>
  );
}