import type { TiyaDayPlan, TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaComfortBalance = {
  comfortScore: number;
  routeEfficiencyScore: number;
  stayBalanceScore: number;
  transferLoadScore: number;
  note: string;
};

function clampScore(value: number) {
  return Math.max(30, Math.min(98, Math.round(value)));
}

export function generatePlannerComfortBalance({
  intent,
  days,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
}): TiyaComfortBalance {
  const safeDays = Array.isArray(days) ? days : [];
  const transferDays = safeDays.filter((day) =>
    (Array.isArray(day.items) ? day.items : []).some(
      (item) => item.type === "transport"
    )
  ).length;
  const stayComfort =
    intent.stayPreference === "Villa" || intent.stayPreference === "Resort"
      ? 92
      : intent.stayPreference === "Hotel"
        ? 82
        : intent.stayPreference === "Homestay"
          ? 76
          : intent.stayPreference === "Hostel" || intent.stayPreference === "Camp"
            ? 58
            : 48;
  const routeComfort = selectedRoute?.comfortScore ?? 76;
  const transferLoadScore = clampScore(92 - transferDays * 12);
  const familyBoost = intent.children > 0 || intent.seniors > 0 ? -8 : 0;
  const comfortScore = clampScore(
    (stayComfort + routeComfort + transferLoadScore) / 3 + familyBoost
  );

  return {
    comfortScore,
    routeEfficiencyScore: clampScore(
      selectedRoute?.id === "fastest" ? 90 : selectedRoute?.id === "budget" ? 76 : 68
    ),
    stayBalanceScore: clampScore(stayComfort),
    transferLoadScore,
    note:
      comfortScore >= 82
        ? "Comfort remains strong while savings are possible in transport and clustering."
        : "Comfort can improve by reducing transfer pressure or upgrading key stay nights.",
  };
}
