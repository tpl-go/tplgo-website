"use client";

type Props = {
  items: string[];
};

export default function CruiseEntertainmentSection({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-xl border bg-white p-4 text-base text-gray-800">
          {item}
        </div>
      ))}
    </div>
  );
}