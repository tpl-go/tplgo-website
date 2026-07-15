import { cruiseResultsSeed } from "./cruiseResultData";
import {
  CruiseInfoItem,
  CruiseResultItem,
  CruiseResultSearchMeta,
  CruiseSailingOption,
} from "./cruiseResultTypes";

const cruiseLineShipMap: Record<string, string[]> = {
  "Royal Caribbean": [
    "Voyager of the Seas",
    "Quantum of the Seas",
    "Spectrum of the Seas",
  ],
  "MSC Cruises": ["MSC Bellissima", "MSC Virtuosa", "MSC Euribia"],
  "Costa Cruises": ["Costa Toscana", "Costa Smeralda", "Costa Serena"],
  "Princess Cruises": [
    "Crown Princess",
    "Diamond Princess",
    "Majestic Princess",
  ],
  "Norwegian Cruise Line": [
    "Norwegian Spirit",
    "Norwegian Sky",
    "Norwegian Sun",
  ],
};

const destinationConfig = {
  "India/Goa": {
    ports: ["Mumbai", "Goa"],
    cruiseLines: ["Royal Caribbean", "MSC Cruises", "Costa Cruises"],
    defaultPort: "Mumbai",
  },
  "Middle East/Dubai": {
    ports: ["Dubai"],
    cruiseLines: ["MSC Cruises", "Costa Cruises", "Royal Caribbean"],
    defaultPort: "Dubai",
  },
  "Asia/Singapore": {
    ports: ["Singapore"],
    cruiseLines: ["Royal Caribbean", "Princess Cruises", "MSC Cruises"],
    defaultPort: "Singapore",
  },
  Mediterranean: {
    ports: ["Barcelona"],
    cruiseLines: ["Costa Cruises", "MSC Cruises", "Norwegian Cruise Line"],
    defaultPort: "Barcelona",
  },
  Caribbean: {
    ports: ["Miami"],
    cruiseLines: [
      "Royal Caribbean",
      "Norwegian Cruise Line",
      "Princess Cruises",
    ],
    defaultPort: "Miami",
  },
} as const;

function normalizeKey(value?: string | null) {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/-port$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneInfoItem(item: CruiseInfoItem, suffix: string): CruiseInfoItem {
  return {
    ...item,
    id: `${item.id}-${suffix}`,
  };
}

function normalizePort(raw?: string | null) {
  if (!raw) return null;

  const key = normalizeKey(raw);

  if (key.includes("mumbai")) return "Mumbai";
  if (key.includes("goa")) return "Goa";
  if (key.includes("dubai")) return "Dubai";
  if (key.includes("singapore")) return "Singapore";
  if (key.includes("barcelona")) return "Barcelona";
  if (key.includes("miami")) return "Miami";

  return raw;
}

function normalizeDestination(raw?: string | null) {
  if (!raw) return null;

  const key = normalizeKey(raw);

  if (key.includes("goa")) return "India/Goa";
  if (key.includes("dubai")) return "Middle East/Dubai";
  if (key.includes("singapore")) return "Asia/Singapore";
  if (key.includes("mediterranean")) return "Mediterranean";
  if (key.includes("caribbean")) return "Caribbean";

  return raw;
}

function getRequestedDurations(durationId?: string | null) {
  if (!durationId || durationId === "any") return [2, 3, 4, 5, 6, 7, 8];
  if (durationId === "2-3") return [2, 3];
  if (durationId === "4-6") return [4, 5, 6];
  if (durationId === "7-9") return [7, 8, 9];
  if (durationId === "10plus") return [10, 11, 12];

  return [2, 3, 4, 5, 6, 7, 8];
}

function getBaseFare(
  destinationLabel: string,
  durationNights: number,
  index: number
) {
  const d = destinationLabel.toLowerCase();

  let base = 24000;

  if (d.includes("goa") || d.includes("india")) base = 18000;
  else if (d.includes("dubai")) base = 30000;
  else if (d.includes("singapore")) base = 34000;
  else if (d.includes("mediterranean")) base = 52000;
  else if (d.includes("caribbean")) base = 62000;

  return base + durationNights * 900 + index * 1250;
}

function getStartDate(searchMeta: CruiseResultSearchMeta, offsetDays: number) {
  const base = searchMeta.sailingDate
    ? new Date(searchMeta.sailingDate)
    : new Date("2026-04-16");

  base.setDate(base.getDate() + offsetDays);
  return base.toISOString().split("T")[0];
}

function getArrivalPort(departurePort: string) {
  return departurePort;
}

function buildSailingDates(
  source: CruiseResultItem,
  suffix: string,
  startDate: string,
  baseFare: number,
  searchMeta: CruiseResultSearchMeta
) {
  const promoItems = source.promoItems.map((item, idx) =>
    cloneInfoItem(item, `${suffix}-${idx}`)
  );

  return Array.from({ length: 3 })
    .map((_, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index * 10);

      const isoDate = date.toISOString().split("T")[0];
      const priceStep = index * 950;

      return {
        id: `${source.id}-sailing-${suffix}-${index}`,
        date: isoDate,
        monthKey: isoDate.slice(0, 7),
        inside: baseFare + priceStep,
        outside: baseFare + 2600 + priceStep,
        balcony: baseFare + 9800 + priceStep,
        suite: baseFare + 17100 + priceStep,
        badges: promoItems.slice(0, 3).map((info, badgeIndex) => ({
          id: `${source.id}-badge-${suffix}-${index}-${badgeIndex}`,
          label:
            info.label === "Buy One Get One Offer"
              ? "BOGO"
              : info.label === "Non Refundable Deposit"
              ? "NRD"
              : info.label === "Onboard Credit"
              ? "$"
              : "PROMO",
          type: (
            info.label === "Buy One Get One Offer"
              ? "promo"
              : info.label === "Non Refundable Deposit"
              ? "deposit"
              : info.label === "Onboard Credit"
              ? "credit"
              : "special"
          ) as CruiseSailingOption["badges"][number]["type"],
          popup: info,
        })) as CruiseSailingOption["badges"],
        infoItems: promoItems,
      };
    })
    .filter((row) => {
      if (searchMeta.sailingMonth && row.monthKey !== searchMeta.sailingMonth) {
        return false;
      }

      if (searchMeta.sailingDate && row.date < searchMeta.sailingDate) {
        return false;
      }

      return true;
    });
}

export function buildCruiseResultsFromSearch(
  searchMeta: CruiseResultSearchMeta
): CruiseResultItem[] {
  const requestedDestinationLabel =
    normalizeDestination(searchMeta.destinationId) || "India/Goa";

  const destinationSettings =
    destinationConfig[
      requestedDestinationLabel as keyof typeof destinationConfig
    ] || destinationConfig["India/Goa"];

  const requestedPort =
    normalizePort(searchMeta.departurePortId) || destinationSettings.defaultPort;

  const requestedDurations = getRequestedDurations(searchMeta.durationId);

  const generated: CruiseResultItem[] = [];
  const totalCards = 8;

  for (let i = 0; i < totalCards; i++) {
    const seed = cruiseResultsSeed[i % cruiseResultsSeed.length];
    const cruiseLine =
      destinationSettings.cruiseLines[
        i % destinationSettings.cruiseLines.length
      ];

    const ships = cruiseLineShipMap[cruiseLine];
    const shipName = ships[i % ships.length];
    const durationNights = requestedDurations[i % requestedDurations.length];
    const departurePort =
      searchMeta.departurePortId
        ? requestedPort
        : destinationSettings.ports[i % destinationSettings.ports.length];

    const baseFare = getBaseFare(requestedDestinationLabel, durationNights, i);
    const promoItems = seed.promoItems.map((item, idx) =>
      cloneInfoItem(item, `${i}-${idx}`)
    );

    const arrivalPort = getArrivalPort(departurePort);
    const tripLabel = `${durationNights} Night ${departurePort} Getaway Cruise`;
    const title = `${durationNights} Nights | ${requestedDestinationLabel} | ${cruiseLine} | ${shipName}`;

    const sailingDates = buildSailingDates(
      seed,
      String(i),
      getStartDate(searchMeta, i * 2),
      baseFare,
      searchMeta
    );

    if (!sailingDates.length) continue;

    generated.push({
      ...seed,
      id: `${seed.id}-dynamic-${i}`,
      title,
      tripLabel,
      regionLabel: requestedDestinationLabel,
      cruiseLine,
      shipName,
      departurePort,
      arrivalPort,
      durationNights,
      mapImage: seed.mapImage,
      lowestRates: {
        inside: sailingDates[0].inside,
        outside: sailingDates[0].outside,
        balcony: sailingDates[0].balcony,
        suite: sailingDates[0].suite,
      },
      taxesText: `Excludes taxes and fees: ₹${Math.round(
        sailingDates[0].outside * 0.22
      ).toLocaleString("en-IN")}`,
      refundableType: "Non Refundable Deposit",
      callbackEnabled: true,
      badges: promoItems.slice(0, 4).map((info, idx) => ({
        id: `${seed.id}-top-badge-${i}-${idx}`,
        label:
          info.label === "Buy One Get One Offer"
            ? "BOGO"
            : info.label === "Non Refundable Deposit"
            ? "NRD"
            : info.label === "Onboard Credit"
            ? "Onboard Credit"
            : "Special Promotions",
        type: (
          info.label === "Buy One Get One Offer"
            ? "promo"
            : info.label === "Non Refundable Deposit"
            ? "deposit"
            : info.label === "Onboard Credit"
            ? "credit"
            : "special"
        ) as "promo" | "deposit" | "credit" | "special",
        popup: info,
      })),
      promoItems,
      sailingDates,
    });
  }

  let items = generated;

  if (searchMeta.destinationId) {
    const destinationKey = normalizeKey(
      normalizeDestination(searchMeta.destinationId)
    );

    items = items.filter(
      (item) => normalizeKey(item.regionLabel) === destinationKey
    );
  }

  if (searchMeta.departurePortId) {
    const portKey = normalizeKey(normalizePort(searchMeta.departurePortId));

    items = items.filter(
      (item) => normalizeKey(item.departurePort) === portKey
    );
  }

  if (searchMeta.durationId && searchMeta.durationId !== "any") {
    items = items.filter((item) =>
      requestedDurations.includes(item.durationNights)
    );
  }

  return items.length ? items : generated;
}
