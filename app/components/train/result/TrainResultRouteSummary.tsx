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
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
        <div className="min-w-0">
          <h1 className="break-words text-[17px] font-bold leading-tight text-slate-800 md:text-xl">
            Trains from {fromCity || "From City"} to {toCity || "To City"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {formatDateLabel(date)}
          </p>
        </div>

        <div className="shrink-0 text-sm font-medium text-slate-500">
          {resultsCount} trains found
        </div>
      </div>
    </div>
  );
}
