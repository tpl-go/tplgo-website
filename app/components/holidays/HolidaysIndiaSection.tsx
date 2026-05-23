"use client";

import { useRouter } from "next/navigation";

const states = [
  "Rajasthan",
  "Goa",
  "Kashmir",
  "Kerala",
  "Himachal Pradesh",
  "Uttarakhand",
  "Ladakh",
  "Sikkim",
  "Meghalaya",
  "Andaman",
];

export default function HolidaysIndiaSection() {
  const router = useRouter();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Domestic Holidays
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Explore India by State
          </h2>
        </div>

        <button
          type="button"
          onClick={() => router.push("/popular/india")}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-black text-white"
        >
          View All
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
        {states.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() =>
              router.push(
                `/popular/india?matchedState=${encodeURIComponent(
                  state
                )}&searchMode=holiday`
              )
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-black text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
          >
            {state}
          </button>
        ))}
      </div>
    </section>
  );
}