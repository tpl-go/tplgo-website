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
    <div className="space-y-3 p-3 lg:space-y-4 lg:p-4">
      {policies.map((policy) => (
        <div key={policy.id} className="rounded-2xl border bg-white p-4 shadow-sm lg:shadow-none">
          <div className="text-[15px] font-black text-slate-900 lg:text-[16px] lg:font-semibold">
            {policy.title}
          </div>
          <div className="mt-2 text-[13px] font-medium leading-6 text-slate-600 lg:text-sm lg:font-normal">
            {policy.description}
          </div>
        </div>
      ))}
    </div>
  );
}
