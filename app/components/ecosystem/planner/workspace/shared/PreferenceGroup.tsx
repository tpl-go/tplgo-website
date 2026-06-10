export default function PreferenceGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={`${title}-${option}`}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border px-3 py-2 text-xs font-black transition ${
              selected === option
                ? "border-orange-300 bg-orange-50 text-orange-700"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
