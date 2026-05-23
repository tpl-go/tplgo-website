"use client";

interface Props {
  states: string[];
  activeState: string;
  setActiveState: (state: string) => void;
}

export default function IndiaTabs({
  states,
  activeState,
  setActiveState,
}: Props) {
  return (
    <div className="w-full bg-white border rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6 text-black">
        Top Destinations in India
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {states.map((state) => {
          const isActive = activeState === state;

          return (
            <button
              key={state}
              onClick={() => setActiveState(isActive ? "" : state)}
              className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-md
                border
                text-sm
                transition
                ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-black border-gray-300 hover:border-orange-400"
                }
              `}
            >
              {state}
            </button>
          );
        })}
      </div>
    </div>
  );
}