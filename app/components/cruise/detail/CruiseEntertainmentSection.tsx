"use client";

type Props = {
  items: string[];
};

export default function CruiseEntertainmentSection({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm lg:rounded-xl lg:shadow-none">
          <div className="text-[11px] font-black uppercase tracking-wide text-purple-700">
            Ship Area {idx + 1}
          </div>
          <div className="mt-2 text-[14px] font-semibold leading-6 text-gray-800 lg:text-base lg:font-normal">
            {item}
          </div>
        </div>
      ))}
    </div>
  );
}
