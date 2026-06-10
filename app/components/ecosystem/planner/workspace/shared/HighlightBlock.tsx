export default function HighlightBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={`${title}-${item}`}
            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
