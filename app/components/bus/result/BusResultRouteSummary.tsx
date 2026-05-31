type Props = {
  fromCity: string;
  toCity: string;
  date: string;
  resultsCount: number;
};

function formatBusDate(date: string) {
  if (!date) return "No date selected";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function BusResultRouteSummary({
  fromCity,
  toCity,
  date,
  resultsCount,
}: Props) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-lg font-bold leading-6 text-slate-800 md:text-xl md:leading-tight">
            Buses from {fromCity || "From City"} to {toCity || "To City"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {formatBusDate(date)}
          </p>
        </div>

        <div className="text-sm font-medium text-slate-500">
          {resultsCount} buses found
        </div>
      </div>
    </div>
  );
}
