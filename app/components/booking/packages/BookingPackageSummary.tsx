"use client";

import {
  CalendarDays,
  MapPin,
  Plane,
  Users,
  BedDouble,
  Hotel,
  Car,
  UtensilsCrossed,
  Ticket,
  IndianRupee,
  Clock3,
} from "lucide-react";

type Room = {
  adults: number;
  children: number;
};

type FlightItem = {
  airline?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  fareDiff?: number;
};

type HotelItem = {
  hotelName?: string;
  roomType?: string;
  city?: string;
  fareDiff?: number;
};

type TransferItem = {
  title?: string;
  vehicleType?: string;
  fareDiff?: number;
};

type MealItem = {
  title?: string;
  fareDiff?: number;
};

type ActivityItem = {
  title?: string;
  fareDiff?: number;
};

type PackageSelectionState = {
  finalPrice?: number;
  selectedFlights?: FlightItem[];
  selectedHotels?: HotelItem[];
  selectedTransfers?: TransferItem[];
  selectedMeals?: MealItem[];
  selectedActivities?: ActivityItem[];
};

type FareSnapshot = {
  basePrice: number;
  upgradedDiffTotal: number;
  feesAndTaxes: number;
  couponDiscount: number;
  tplCreditUsed: number;
  grandTotal: number;
  appliedCoupon: string;
  baseAfterOffer?: number;
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  totalBeforeWallet?: number;
};

type Props = {
  packageTitle: string;
  route?: string[] | string;
  nights?: number;
  days?: number;
  variant?: "withFlight" | "withoutFlight";
  travelDate?: string;
  originCity?: string;
  rooms?: Room[];
  totalAdults?: number;
  totalChildren?: number;
  totalRooms?: number;
  pricePerPerson?: number;
  totalPrice?: number;
  packageSlug?: string;
  selectionState?: PackageSelectionState | null;
  fareSnapshot?: FareSnapshot;

  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];
};

function formatDate(value?: string) {
  if (!value) return "Date not selected";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function buildRouteLabel(route?: string[] | string) {
  if (Array.isArray(route)) return route.join(" • ");
  return route || "Route not available";
}

function buildTravellerLabel(
  totalAdults?: number,
  totalChildren?: number,
  totalRooms?: number
) {
  const adults = Math.max(totalAdults || 0, 0);
  const children = Math.max(totalChildren || 0, 0);
  const rooms = Math.max(totalRooms || 0, 0);

  const parts: string[] = [];

  if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  if (rooms > 0) parts.push(`${rooms} Room${rooms > 1 ? "s" : ""}`);

  return parts.length ? parts.join(" • ") : "Traveller details not available";
}

function getRoomMixLabel(rooms?: Room[], totalRooms?: number) {
  if (Array.isArray(rooms) && rooms.length > 0) {
    return rooms
      .map(
        (room, index) =>
          `R${index + 1}: ${room.adults}A${
            room.children ? `/${room.children}C` : ""
          }`
      )
      .join(" • ");
  }

  return `${totalRooms || 1} Room${(totalRooms || 1) > 1 ? "s" : ""}`;
}

function getFlightLabel(
  flights?: FlightItem[],
  variant?: "withFlight" | "withoutFlight",
  includedFlightLabels?: string[]
) {
  if (variant === "withoutFlight") {
    return {
      title: "Land package",
      meta: "Flight not included",
    };
  }

  const first = Array.isArray(flights) ? flights.find(Boolean) : undefined;

  if (first?.airline) {
    const label = [
      first.airline,
      first.departureTime,
      first.from && first.to ? `${first.from} → ${first.to}` : "",
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      title: label || "Selected flight",
      meta: `${(flights || []).filter(Boolean).length} selected`,
    };
  }

  if (includedFlightLabels?.length) {
    return {
      title: includedFlightLabels[0],
      meta: `${includedFlightLabels.length} included`,
    };
  }

  return {
    title: "Included flight",
    meta: "Included in package",
  };
}

function getHotelLabel(hotels?: HotelItem[], includedHotelLabels?: string[]) {
  const first = Array.isArray(hotels) ? hotels.find(Boolean) : undefined;

  if (first?.hotelName) {
    const label = [first.hotelName, first.roomType, first.city]
      .filter(Boolean)
      .join(" • ");

    return {
      title: label || "Selected hotel",
      meta: `${(hotels || []).filter(Boolean).length} selected`,
    };
  }

  if (includedHotelLabels?.length) {
    return {
      title: includedHotelLabels[0],
      meta: `${includedHotelLabels.length} included`,
    };
  }

  return {
    title: "Included hotel",
    meta: "Included in package",
  };
}

function getTransferLabel(
  transfers?: TransferItem[],
  includedTransferLabels?: string[]
) {
  const first = Array.isArray(transfers) ? transfers.find(Boolean) : undefined;

  if (first?.title) {
    return {
      title: [first.title, first.vehicleType].filter(Boolean).join(" • "),
      meta: `${(transfers || []).filter(Boolean).length} selected`,
    };
  }

  if (includedTransferLabels?.length) {
    return {
      title: includedTransferLabels[0],
      meta: `${includedTransferLabels.length} included`,
    };
  }

  return {
    title: "Included transfer",
    meta: "Included in package",
  };
}

function getMealLabel(meals?: MealItem[], includedMealLabels?: string[]) {
  const first = Array.isArray(meals) ? meals.find(Boolean) : undefined;

  if (first?.title) {
    return {
      title: first.title,
      meta: `${(meals || []).filter(Boolean).length} selected`,
    };
  }

  if (includedMealLabels?.length) {
    return {
      title: includedMealLabels[0],
      meta: `${includedMealLabels.length} included`,
    };
  }

  return {
    title: "Included meal",
    meta: "Included in package",
  };
}

function getActivityLabel(
  activities?: ActivityItem[],
  includedActivityLabels?: string[]
) {
  const first = Array.isArray(activities) ? activities.find(Boolean) : undefined;

  if (first?.title) {
    return {
      title: first.title,
      meta: `${(activities || []).filter(Boolean).length} selected`,
    };
  }

  if (includedActivityLabels?.length) {
    return {
      title: includedActivityLabels[0],
      meta: `${includedActivityLabels.length} included`,
    };
  }

  return {
    title: "Included activity",
    meta: "Included in package",
  };
}

export default function BookingPackageSummary({
  packageTitle,
  route,
  nights = 0,
  days = 0,
  variant = "withFlight",
  travelDate,
  originCity = "Delhi",
  rooms = [],
  totalAdults = 2,
  totalChildren = 0,
  totalRooms = 1,
  pricePerPerson = 0,
  totalPrice = 0,
  packageSlug = "",
  selectionState,
  fareSnapshot,

  includedFlightLabels = [],
  includedHotelLabels = [],
  includedTransferLabels = [],
  includedMealLabels = [],
  includedActivityLabels = [],
}: Props) {
  const flights = selectionState?.selectedFlights || [];
  const hotels = selectionState?.selectedHotels || [];
  const transfers = selectionState?.selectedTransfers || [];
  const meals = selectionState?.selectedMeals || [];
  const activities = selectionState?.selectedActivities || [];

  const fallbackTotal =
    Number(selectionState?.finalPrice || 0) > 0
      ? Number(selectionState?.finalPrice || 0)
      : Number(totalPrice || 0);

  const finalTotal =
    Number(fareSnapshot?.grandTotal || 0) > 0
      ? Number(fareSnapshot?.grandTotal || 0)
      : fallbackTotal;

  const baseAmount =
    Number(fareSnapshot?.basePrice || 0) > 0
      ? Number(fareSnapshot?.basePrice || 0)
      : Number(pricePerPerson || 0) * Math.max(totalAdults || 1, 1);

  const offerDiscount = Number(fareSnapshot?.couponDiscount || 0);
  const upgradeAmount = Number(fareSnapshot?.upgradedDiffTotal || 0);
  const walletUsed = Number(fareSnapshot?.tplCreditUsed || 0);
  const baseAfterOffer = Number(fareSnapshot?.baseAfterOffer || 0);
  const finalPerTraveller =
    Math.max(totalAdults || 1, 1) > 0
      ? Math.round(finalTotal / Math.max(totalAdults || 1, 1))
      : finalTotal;

  const routeLabel = buildRouteLabel(route);
  const durationLabel = `${nights}N / ${days}D`;
  const travellerLabel = buildTravellerLabel(
    totalAdults,
    totalChildren,
    totalRooms
  );

  const roomMixLabel = getRoomMixLabel(rooms, totalRooms);

  const flightInfo = getFlightLabel(flights, variant, includedFlightLabels);
  const hotelInfo = getHotelLabel(hotels, includedHotelLabels);
  const transferInfo = getTransferLabel(transfers, includedTransferLabels);
  const mealInfo = getMealLabel(meals, includedMealLabels);
  const activityInfo = getActivityLabel(activities, includedActivityLabels);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b bg-gradient-to-r from-orange-50 via-white to-blue-50 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                Review Your Package
              </span>

              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {variant === "withFlight" ? "With Flight" : "Without Flight"}
              </span>

              {packageSlug ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Code: {packageSlug}
                </span>
              ) : null}
            </div>

            <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">
              {packageTitle}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
              <span className="truncate">{routeLabel}</span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 shadow-sm lg:min-w-[330px] lg:px-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Final Package Total
            </div>

            <div className="mt-1 flex items-center gap-1 text-2xl font-bold text-gray-900">
              <IndianRupee className="h-5 w-5" />
              <span>{Number(finalTotal || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-600">
                Base: {formatCurrency(baseAmount)}
              </span>

              {offerDiscount > 0 ? (
                <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                  Offer: -{formatCurrency(offerDiscount)}
                </span>
              ) : null}

              {baseAfterOffer > 0 ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  After Offer: {formatCurrency(baseAfterOffer)}
                </span>
              ) : null}

              {upgradeAmount > 0 ? (
                <span className="rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-700">
                  Upgrade: +{formatCurrency(upgradeAmount)}
                </span>
              ) : null}

              {walletUsed > 0 ? (
                <span className="rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-700">
                  Wallet: -{formatCurrency(walletUsed)}
                </span>
              ) : null}
            </div>

            <div className="mt-2 text-xs font-semibold text-blue-700">
              Per Person: {formatCurrency(finalPerTraveller)}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              Travel Date
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(travelDate)}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Plane className="h-4 w-4 text-orange-500" />
              Origin City
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {originCity || "Delhi"}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Clock3 className="h-4 w-4 text-orange-500" />
              Duration
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {durationLabel}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Users className="h-4 w-4 text-orange-500" />
              Travellers
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {travellerLabel}
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <BedDouble className="h-4 w-4 text-orange-500" />
              Room Mix
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {roomMixLabel}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-200 bg-[#fcfcfd]">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">
              Selected Package Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard icon={<Plane className="h-4 w-4 text-blue-500" />} title="Flights" info={flightInfo} />
            <SummaryCard icon={<Hotel className="h-4 w-4 text-blue-500" />} title="Hotels" info={hotelInfo} />
            <SummaryCard icon={<Car className="h-4 w-4 text-blue-500" />} title="Transfers" info={transferInfo} />
            <SummaryCard icon={<UtensilsCrossed className="h-4 w-4 text-blue-500" />} title="Meals" info={mealInfo} />
            <SummaryCard icon={<Ticket className="h-4 w-4 text-blue-500" />} title="Activities" info={activityInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  info,
}: {
  icon: React.ReactNode;
  title: string;
  info: {
    title: string;
    meta: string;
  };
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
        {icon}
        {title}
      </div>

      <div className="mt-2 text-sm font-semibold text-gray-900">
        {info.title}
      </div>

      <div className="mt-1 text-xs text-gray-500">{info.meta}</div>
    </div>
  );
}
