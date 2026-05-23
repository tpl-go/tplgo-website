"use client";

type SuggestionBase = {
  id: string;
  label: string;
  description?: string;
};

type CruiseSuggestionDropdownProps<T extends SuggestionBase> = {
  items: T[];
  onSelect: (item: T) => void;
  emptyText?: string;
};

export default function CruiseSuggestionDropdown<T extends SuggestionBase>({
  items,
  onSelect,
  emptyText = "No results found.",
}: CruiseSuggestionDropdownProps<T>) {
  if (!items.length) {
    return (
      <div className="px-4 py-4 text-sm text-neutral-500">
        {emptyText}
      </div>
    );
  }

  return (
    <ul className="max-h-72 overflow-y-auto py-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-orange-50"
          >
            <span className="text-sm font-semibold text-neutral-900">
              {item.label}
            </span>

            {item.description ? (
              <span className="mt-1 text-xs text-neutral-500">
                {item.description}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}