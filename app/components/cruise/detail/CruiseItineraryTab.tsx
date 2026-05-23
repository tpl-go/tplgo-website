"use client";

type Props = {
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
};

export default function CruiseItineraryTab({ itinerary }: Props) {
  return (
    <div className="space-y-4 p-4">
      {itinerary.map((item) => (
        <div key={item.day} className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-bold text-sky-700">Day {item.day}</div>
          <div className="mt-1 text-[16px] font-semibold text-slate-900">
            {item.title}
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  );
}