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
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-[18px] font-extrabold leading-6 text-slate-900 md:text-[20px]">
            {bus.operatorName} ({bus.busName})
          </h2>

          <p className="mt-1 break-words text-[13px] font-medium text-slate-600">
            {bus.busType}
          </p>
        </div>

        <div className="text-left md:text-right">
          <div className="break-words text-[13px] font-semibold text-slate-600">
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

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 md:mt-6 md:grid-cols-[1fr_140px_1fr] md:items-start md:gap-6">
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:border-0 md:bg-transparent md:p-0">
          <p className="text-[22px] font-bold leading-none text-slate-900">
            {bus.departureTime}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-700">
            {bus.departureDate}
          </p>
          <p className="mt-2 text-[14px] text-slate-800">
            {bus.fromCity}
          </p>
          <p className="mt-3 break-words text-[12px] leading-5 text-slate-600">
            {selectedBoardingPoint.name}
            <br />
            {selectedBoardingPoint.address}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-3 text-left md:border-0 md:p-0 md:pt-4 md:text-center">
          <p className="text-[13px] font-medium text-slate-500">
            {bus.duration}
          </p>
          <div className="mt-2 h-[1px] w-full bg-slate-300" />
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left md:border-0 md:bg-transparent md:p-0 md:text-right">
          <p className="text-[22px] font-bold leading-none text-slate-900">
            {bus.arrivalTime}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-700">
            {bus.arrivalDate}
          </p>
          <p className="mt-2 text-[14px] text-slate-800">
            {bus.toCity}
          </p>
          <p className="mt-3 break-words text-[12px] leading-5 text-slate-600">
            {selectedDroppingPoint.name}
            <br />
            {selectedDroppingPoint.address}
          </p>
        </div>
      </div>
    </section>
  );
}
