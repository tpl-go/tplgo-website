"use client";

type Props = {
  bus: any;
  selectedSeats: { seatNumber: string; price: number }[];
  selectedBoardingPoint: {
    name: string;
    address: string;
    time: string;
  };
  selectedDroppingPoint: {
    name: string;
    address: string;
    time: string;
  };
  onViewPolicies: () => void;
};

export default function BusBookingSummaryCard({
  bus,
  selectedSeats,
  selectedBoardingPoint,
  selectedDroppingPoint,
  onViewPolicies,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900">
            {bus.operatorName} ({bus.busName})
          </h2>

          <p className="mt-1 text-[13px] font-medium text-slate-600">
            {bus.busType}
          </p>
        </div>

        <div className="text-right">
          <div className="text-[13px] font-semibold text-slate-600">
            Seat No: {selectedSeats.map((item) => item.seatNumber).join(", ")}
          </div>

          <button
            type="button"
            onClick={onViewPolicies}
            className="mt-2 text-[13px] font-bold text-sky-600 hover:underline"
          >
            View Policies
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_140px_1fr] items-start gap-6">
        <div>
          <p className="text-[22px] font-bold leading-none text-slate-900">
            {bus.departureTime}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-700">
            {bus.departureDate}
          </p>
          <p className="mt-2 text-[14px] text-slate-800">
            {bus.fromCity}
          </p>
          <p className="mt-3 text-[12px] leading-5 text-slate-600">
            {selectedBoardingPoint.name}
            <br />
            {selectedBoardingPoint.address}
          </p>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[13px] font-medium text-slate-500">
            {bus.duration}
          </p>
          <div className="mt-2 h-[1px] w-full bg-slate-300" />
        </div>

        <div className="text-right">
          <p className="text-[22px] font-bold leading-none text-slate-900">
            {bus.arrivalTime}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-700">
            {bus.arrivalDate}
          </p>
          <p className="mt-2 text-[14px] text-slate-800">
            {bus.toCity}
          </p>
          <p className="mt-3 text-[12px] leading-5 text-slate-600">
            {selectedDroppingPoint.name}
            <br />
            {selectedDroppingPoint.address}
          </p>
        </div>
      </div>
    </section>
  );
}