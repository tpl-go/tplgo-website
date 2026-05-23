type Props = {
  fromCity: string;
  toCity: string;
  date: string;
  resultsCount: number;
};

function formatDateLabel(date: string) {
  if (!date) return "No date selected";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function TrainResultRouteSummary({
  fromCity,
  toCity,
  date,
  resultsCount,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight text-slate-800">
            Trains from {fromCity || "From City"} to {toCity || "To City"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {formatDateLabel(date)}
          </p>
        </div>

        <div className="text-sm font-medium text-slate-500">
          {resultsCount} trains found
        </div>
      </div>
    </div>
  );
}