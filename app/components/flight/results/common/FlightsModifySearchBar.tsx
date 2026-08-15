"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import TripTypeTabs from "../../search/TripTypeTabs";
import AirportSelect from "../../search/AirportSelect";
import Calendar from "../../search/Calendar";
import TravelSelector from "../../search/TravelSelector";
import SearchButton from "../../search/SearchButton";
import FareTypeSelector from "../../search/FareTypeSelector";
import { FlightState } from "../../hooks";

type FlightsModifySearchBarProps = {
  state: FlightState;
  dispatch: any;
  selectedDate?: Date;
  onExpandedChange?: (expanded: boolean) => void;
};

export default function FlightsModifySearchBar({
  state,
  dispatch,
  selectedDate,
  onExpandedChange,
}: FlightsModifySearchBarProps) {
  const [isMultiCityExpanded, setIsMultiCityExpanded] = useState(false);

  const isMultiCity = state.tripType === "multicity";

  useEffect(() => {
    if (!selectedDate) return;

    dispatch({
      type: "SET_SEGMENT_FIELD",
      index: 0,
      field: "departure",
      value: selectedDate,
    });
  }, [selectedDate, dispatch]);

  useEffect(() => {
    if (state.tripType === "multicity") {
      onExpandedChange?.(isMultiCityExpanded);
    } else {
      onExpandedChange?.(false);
    }
  }, [state.tripType, isMultiCityExpanded, onExpandedChange]);

  const multiCitySummary = useMemo(() => {
    if (!state.segments?.length) return "Select route";

    const filledSegments = state.segments.filter(
      (seg: any) => seg.from?.city && seg.to?.city
    );

    if (!filledSegments.length) return "Select route";

    const firstFrom = filledSegments[0]?.from?.city || "";
    const lastTo = filledSegments[filledSegments.length - 1]?.to?.city || "";

    const viaCities = filledSegments
      .map((seg: any) => seg.to.city)
      .slice(0, -1);

    if (!viaCities.length) {
      return `${firstFrom} to ${lastTo}`;
    }

    return `${firstFrom} to ${lastTo} via ${viaCities.join(", ")}`;
  }, [state.segments]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] px-3 py-3 shadow-[0_18px_45px_rgba(2,6,23,0.28)] sm:px-4 sm:py-4">
      {!isMultiCity ? (
        <>
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:gap-[6px]">
            <div className="w-full overflow-x-auto overflow-y-hidden pb-1 xl:w-auto xl:shrink-0 xl:overflow-visible xl:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-max xl:min-w-0">
                <TripTypeTabs
                  tripType={state.tripType}
                  dispatch={dispatch}
                  variant="results"
                />
              </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center xl:gap-[6px]">
              <AirportSelect
                state={state}
                dispatch={dispatch}
                variant="results"
              />

              <Calendar
                state={state}
                dispatch={dispatch}
                variant="results"
              />

              <TravelSelector
                state={state}
                dispatch={dispatch}
                variant="results"
              />
            </div>

            <div className="w-full shrink-0 xl:ml-auto xl:w-[140px]">
              <SearchButton state={state} variant="results" />
            </div>
          </div>

          <div className="mt-3 overflow-x-auto overflow-y-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-max xl:min-w-0">
              <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:gap-[8px]">
            <div className="w-full overflow-x-auto overflow-y-hidden pb-1 xl:w-auto xl:shrink-0 xl:overflow-visible xl:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-max xl:min-w-0">
                <TripTypeTabs
                  tripType={state.tripType}
                  dispatch={dispatch}
                  variant="results"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMultiCityExpanded((prev) => !prev)}
              className="flex h-[56px] w-full min-w-0 items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 text-left transition hover:bg-white/[0.1] sm:h-[60px] sm:px-4 xl:flex-1"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300 sm:text-[11px]">
                  Route
                </div>
                <div className="mt-1 truncate text-[14px] font-extrabold text-white sm:text-[16px]">
                  {multiCitySummary}
                </div>
              </div>

              <Pencil className="ml-3 h-4 w-4 shrink-0 text-cyan-300" />
            </button>

            <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:items-center xl:gap-[8px]">
              <TravelSelector
                state={state}
                dispatch={dispatch}
                variant="results"
              />

              <div className="w-full shrink-0 xl:w-[140px]">
                <SearchButton
                  state={state}
                  variant="results"
                  onSearchComplete={() => {
                    setIsMultiCityExpanded(false);
                  }}
                />
              </div>
            </div>
          </div>

          {isMultiCityExpanded && (
            <div className="relative z-[130] mt-4 max-h-none space-y-3 overflow-visible rounded-xl border border-white/10 bg-white/[0.04] p-3 xl:max-h-[60vh] xl:overflow-visible">
              {state.segments.map((seg: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 xl:flex xl:items-center xl:gap-[8px] xl:border-0 xl:bg-transparent xl:p-0"
                >
                  <AirportSelect
                    state={state}
                    dispatch={dispatch}
                    segmentIndex={index}
                    variant="results"
                  />

                  <Calendar
                    state={state}
                    dispatch={dispatch}
                    segmentIndex={index}
                    variant="results"
                    multiCityMode
                  />

                  {state.segments.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "REMOVE_SEGMENT", index })
                      }
                      className="h-[40px] rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {state.segments.length < 5 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "ADD_SEGMENT" })}
                  className="text-sm font-extrabold text-cyan-300"
                >
                  + Add City
                </button>
              )}
            </div>
          )}

          <div className="mt-3 overflow-x-auto overflow-y-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-max xl:min-w-0">
              <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
