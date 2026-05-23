import { SmartOfferItem, SmartOfferService } from "./smartOfferTypes";
import { activateSmartOffer } from "./smartOfferSession";
import {
  buildHolidayResolvedUrl,
  resolveHolidaySearchTarget,
} from "@/app/lib/holidays/resolveHolidaySearchTarget";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();

  return query ? `?${query}` : "";
}

function getFlightCity(city: string) {
  const data: Record<string, { code: string; airport: string }> = {
    Delhi: { code: "DEL", airport: "Indira Gandhi Intl" },
    Mumbai: { code: "BOM", airport: "Chhatrapati Shivaji Intl" },
    Goa: { code: "GOI", airport: "Goa International Airport" },
    Dubai: { code: "DXB", airport: "Dubai International" },
    Bengaluru: { code: "BLR", airport: "Kempegowda Intl" },
    Bangalore: { code: "BLR", airport: "Kempegowda Intl" },
    Jaipur: { code: "JAI", airport: "Jaipur International" },
    Kashmir: { code: "SXR", airport: "Sheikh ul-Alam Intl" },
  };

  return data[city] || data.Mumbai;
}

function getDefaultDestination(offer: SmartOfferItem) {
  const ruleDestination = offer.rule?.destinations?.[0];

  if (ruleDestination) return ruleDestination;

  const title = String(offer.title || "").toLowerCase();
  const slug = String(offer.slug || "").toLowerCase();
  const subtitle = String(offer.subtitle || "").toLowerCase();
  const description = String(offer.description || "").toLowerCase();

  const text = `${title} ${slug} ${subtitle} ${description}`;

  if (text.includes("caribbean")) return "Caribbean";
  if (text.includes("mediterranean")) return "Mediterranean";

  if (text.includes("italy")) return "Italy";
  if (text.includes("france")) return "France";
  if (text.includes("switzerland")) return "Switzerland";
  if (text.includes("spain")) return "Spain";
  if (text.includes("germany")) return "Germany";
  if (text.includes("united kingdom") || text.includes(" uk ")) {
    return "United Kingdom";
  }

  if (text.includes("thailand")) return "Thailand";
  if (text.includes("singapore")) return "Singapore";
  if (text.includes("maldives")) return "Maldives";
  if (text.includes("bali")) return "Bali";
  if (text.includes("dubai")) return "Dubai";

  if (text.includes("goa")) return "Goa";
  if (text.includes("rajasthan")) return "Rajasthan";
  if (text.includes("kerala")) return "Kerala";
  if (text.includes("himachal")) return "Himachal Pradesh";
  if (text.includes("uttarakhand")) return "Uttarakhand";
  if (text.includes("kashmir")) return "Kashmir";
  if (text.includes("jaipur")) return "Jaipur";
  if (text.includes("delhi")) return "Delhi";
  if (text.includes("mumbai")) return "Mumbai";

  if (text.includes("europe")) return "Europe";
  if (text.includes("asia")) return "Asia";
  if (text.includes("africa")) return "Africa";
  if (text.includes("north america")) return "North America";
  if (text.includes("south america")) return "South America";

  if (
    text.includes("australia") ||
    text.includes("new zealand") ||
    text.includes("oceania")
  ) {
    return "Australia and New Zealand";
  }

  if (offer.rule?.internationalOnly) return "Dubai";
  if (offer.rule?.domesticOnly) return "Goa";

  return "Mumbai";
}

function getCruiseDestinationId(offer: SmartOfferItem) {
  const ruleDestination = String(offer.rule?.destinations?.[0] || "")
    .trim()
    .toLowerCase();

  const destination = getDefaultDestination(offer).toLowerCase();

  const text = `${offer.title || ""} ${offer.slug || ""} ${
    offer.subtitle || ""
  } ${offer.description || ""} ${ruleDestination}`.toLowerCase();

  if (ruleDestination) {
    if (ruleDestination.includes("caribbean")) return "caribbean";
    if (ruleDestination.includes("mediterranean")) return "mediterranean";
    if (ruleDestination.includes("dubai")) return "dubai";
    if (ruleDestination.includes("singapore")) return "singapore";
    if (ruleDestination.includes("maldives")) return "maldives";
  }

  if (destination.includes("caribbean") || text.includes("caribbean")) {
    return "caribbean";
  }

  if (
    destination.includes("mediterranean") ||
    destination.includes("europe") ||
    destination.includes("italy") ||
    destination.includes("france") ||
    destination.includes("spain") ||
    text.includes("mediterranean") ||
    text.includes("europe")
  ) {
    return "mediterranean";
  }

  if (destination.includes("dubai") || text.includes("dubai")) return "dubai";

  if (destination.includes("singapore") || text.includes("singapore")) {
    return "singapore";
  }

  if (destination.includes("maldives") || text.includes("maldives")) {
    return "maldives";
  }

  return "caribbean";
}

function getCruiseDeparturePortId(offer: SmartOfferItem) {
  const rulePorts = (offer.rule as any)?.ports || [];
  const ruleDeparturePorts = (offer.rule as any)?.departurePorts || [];
  const firstRulePort = String(rulePorts[0] || ruleDeparturePorts[0] || "")
    .trim()
    .toLowerCase();

  if (firstRulePort) {
    if (firstRulePort.includes("mumbai")) return "mumbai";
    if (firstRulePort.includes("singapore")) return "singapore";
    if (firstRulePort.includes("dubai")) return "dubai";
    if (firstRulePort.includes("miami")) return "miami";
    if (firstRulePort.includes("barcelona")) return "barcelona";
  }

  const text = `${offer.title || ""} ${offer.slug || ""} ${
    offer.subtitle || ""
  } ${offer.description || ""}`.toLowerCase();

  if (text.includes("mumbai")) return "mumbai";
  if (text.includes("singapore")) return "singapore";
  if (text.includes("dubai")) return "dubai";
  if (text.includes("miami")) return "miami";
  if (text.includes("barcelona")) return "barcelona";

  const destinationId = getCruiseDestinationId(offer);

  if (destinationId === "caribbean") return "barcelona";
  if (destinationId === "mediterranean") return "barcelona";
  if (destinationId === "dubai") return "dubai";
  if (destinationId === "singapore") return "singapore";
  if (destinationId === "maldives") return "singapore";

  return "barcelona";
}

function getBusRouteFromOffer(offer: SmartOfferItem) {
  const destination = getDefaultDestination(offer);

  const ruleFrom =
    (offer.rule as any)?.fromCity ||
    (offer.rule as any)?.originCity ||
    (offer.rule as any)?.fromCities?.[0] ||
    (offer.rule as any)?.origins?.[0] ||
    "";

  const ruleTo =
    (offer.rule as any)?.toCity ||
    (offer.rule as any)?.destinationCity ||
    (offer.rule as any)?.toCities?.[0] ||
    (offer.rule as any)?.destinations?.[0] ||
    destination ||
    "";

  if (ruleFrom && ruleTo) {
    return {
      fromCity: String(ruleFrom),
      toCity: String(ruleTo),
    };
  }

  const routeMap: Record<string, { fromCity: string; toCity: string }> = {
    Delhi: { fromCity: "Jaipur", toCity: "Delhi" },
    Jaipur: { fromCity: "Delhi", toCity: "Jaipur" },
    Udaipur: { fromCity: "Jaipur", toCity: "Udaipur" },
    Goa: { fromCity: "Mumbai", toCity: "Goa" },
    Mumbai: { fromCity: "Pune", toCity: "Mumbai" },
    Bangalore: { fromCity: "Chennai", toCity: "Bangalore" },
    Bengaluru: { fromCity: "Chennai", toCity: "Bengaluru" },
    Kerala: { fromCity: "Bangalore", toCity: "Kochi" },
    "Himachal Pradesh": { fromCity: "Delhi", toCity: "Manali" },
    Uttarakhand: { fromCity: "Delhi", toCity: "Dehradun" },
    Kashmir: { fromCity: "Jammu", toCity: "Srinagar" },
    Rajasthan: { fromCity: "Jaipur", toCity: "Udaipur" },
  };

  return (
    routeMap[destination] || {
      fromCity: "Jaipur",
      toCity: destination || "Udaipur",
    }
  );
}

function getCabRouteFromOffer(offer: SmartOfferItem) {
  const destination = getDefaultDestination(offer);

  const ruleFrom =
    (offer.rule as any)?.fromCity ||
    (offer.rule as any)?.originCity ||
    (offer.rule as any)?.from ||
    (offer.rule as any)?.fromCities?.[0] ||
    (offer.rule as any)?.origins?.[0] ||
    "";

  const ruleTo =
    (offer.rule as any)?.toCity ||
    (offer.rule as any)?.destinationCity ||
    (offer.rule as any)?.to ||
    (offer.rule as any)?.toCities?.[0] ||
    (offer.rule as any)?.destinations?.[0] ||
    destination ||
    "";

  if (ruleFrom && ruleTo) {
    return {
      from: String(ruleFrom),
      to: String(ruleTo),
    };
  }

  const routeMap: Record<string, { from: string; to: string }> = {
    Delhi: { from: "Jaipur", to: "Delhi" },
    Jaipur: { from: "Delhi", to: "Jaipur" },
    Udaipur: { from: "Jaipur", to: "Udaipur" },
    Goa: { from: "Mumbai", to: "Goa" },
    Mumbai: { from: "Pune", to: "Mumbai" },
    Pune: { from: "Mumbai", to: "Pune" },
    Bangalore: { from: "Chennai", to: "Bangalore" },
    Bengaluru: { from: "Chennai", to: "Bengaluru" },
    Kerala: { from: "Bangalore", to: "Kochi" },
    "Himachal Pradesh": { from: "Delhi", to: "Manali" },
    Uttarakhand: { from: "Delhi", to: "Dehradun" },
    Kashmir: { from: "Jammu", to: "Srinagar" },
    Rajasthan: { from: "Jaipur", to: "Udaipur" },
  };

  return (
    routeMap[destination] || {
      from: "Mumbai",
      to: destination || "Pune",
    }
  );
}

function getTrainRouteFromOffer(offer: SmartOfferItem) {
  const destination = getDefaultDestination(offer);

  const ruleFrom =
    (offer.rule as any)?.fromCity ||
    (offer.rule as any)?.originCity ||
    (offer.rule as any)?.from ||
    (offer.rule as any)?.fromCities?.[0] ||
    (offer.rule as any)?.origins?.[0] ||
    "";

  const ruleTo =
    (offer.rule as any)?.toCity ||
    (offer.rule as any)?.destinationCity ||
    (offer.rule as any)?.to ||
    (offer.rule as any)?.toCities?.[0] ||
    (offer.rule as any)?.destinations?.[0] ||
    destination ||
    "";

  const codeMap: Record<string, string> = {
    Ujjain: "UJN",
    Jaipur: "JP",
    Delhi: "NDLS",
    Mumbai: "MMCT",
    Pune: "PUNE",
    Goa: "MAO",
    Madgaon: "MAO",
    Ahmedabad: "ADI",
    Chennai: "MAS",
    Bangalore: "SBC",
    Bengaluru: "SBC",
    Jammu: "JAT",
  };

  if (ruleFrom && ruleTo) {
    const fromCity = String(ruleFrom);
    const toCity = String(ruleTo);

    return {
      fromCity,
      fromCode: codeMap[fromCity] || "UJN",
      toCity,
      toCode: codeMap[toCity] || "JP",
    };
  }

  const routeMap: Record<
    string,
    { fromCity: string; fromCode: string; toCity: string; toCode: string }
  > = {
    Delhi: {
      fromCity: "Jaipur",
      fromCode: "JP",
      toCity: "Delhi",
      toCode: "NDLS",
    },
    Jaipur: {
      fromCity: "Ujjain",
      fromCode: "UJN",
      toCity: "Jaipur",
      toCode: "JP",
    },
    Mumbai: {
      fromCity: "Ahmedabad",
      fromCode: "ADI",
      toCity: "Mumbai",
      toCode: "MMCT",
    },
    Goa: {
      fromCity: "Mumbai",
      fromCode: "MMCT",
      toCity: "Madgaon",
      toCode: "MAO",
    },
    Bangalore: {
      fromCity: "Chennai",
      fromCode: "MAS",
      toCity: "Bangalore",
      toCode: "SBC",
    },
    Bengaluru: {
      fromCity: "Chennai",
      fromCode: "MAS",
      toCity: "Bengaluru",
      toCode: "SBC",
    },
    Kashmir: {
      fromCity: "Delhi",
      fromCode: "NDLS",
      toCity: "Jammu",
      toCode: "JAT",
    },
    Rajasthan: {
      fromCity: "Ujjain",
      fromCode: "UJN",
      toCity: "Jaipur",
      toCode: "JP",
    },
  };

  return (
    routeMap[destination] || {
      fromCity: "Ujjain",
      fromCode: "UJN",
      toCity: destination || "Jaipur",
      toCode: codeMap[destination] || "JP",
    }
  );
}

export function getSmartOfferServicePath(service: SmartOfferService) {
  switch (service) {
    case "flight":
      return "/flights";
    case "hotel":
      return "/hotels/results";
    case "holiday":
      return "/packages";
    case "homestay":
      return "/homestays/results";
    case "bus":
      return "/bus/result";
    case "train":
      return "/train/result";
    case "cab":
      return "/cab/result";
    case "cruise":
      return "/cruise/result";
    case "insurance":
      return "/insurance/results";
    case "visa":
      return "/visa/results";
    default:
      return "/";
  }
}

export function buildSmartOfferRedirectUrl(offer: SmartOfferItem) {
  if (offer.service === "flight") {
    const fromCity = "Delhi";
    const toCity = getDefaultDestination(offer);

    const from = getFlightCity(fromCity);
    const to = getFlightCity(toCity);

    return (
      "/flights" +
      buildQuery({
        tripType: "oneway",
        fareType: "Regular",
        adults: 1,
        children: 0,
        infants: 0,
        cabin: "Economy",
        from: from.code,
        fromCity,
        fromAirport: from.airport,
        to: to.code,
        toCity,
        toAirport: to.airport,
        departure: addDays(15),
        returnDate: addDays(16),
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  if (offer.service === "hotel") {
    return (
      "/hotels/results" +
      buildQuery({
        destination: getDefaultDestination(offer),
        checkIn: addDays(15),
        checkOut: addDays(17),
        rooms: 1,
        adults: 2,
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  if (offer.service === "holiday") {
  const offerCode = offer.couponCode || offer.slug;

  const ruleCountries = Array.isArray(offer.rule?.countries)
    ? offer.rule.countries
    : [];

  const ruleDestinations = Array.isArray(offer.rule?.destinations)
    ? offer.rule.destinations
    : [];

  const ruleThemes = Array.isArray((offer.rule as any)?.themes)
    ? (offer.rule as any).themes
    : [];

  const ruleSubThemes = Array.isArray((offer.rule as any)?.subThemes)
    ? (offer.rule as any).subThemes
    : [];

  const primaryTheme = ruleThemes[0] || "";
  const primarySubTheme = ruleSubThemes[0] || "";

  const smartIntent =
    primaryTheme || primarySubTheme || ruleDestinations[0] || "India";

  const isIndiaOffer =
    offer.rule?.domesticOnly ||
    ruleCountries.some(
      (item: string) => String(item).trim().toLowerCase() === "india"
    );

  const hasRealDestination = ruleDestinations.length > 0;

  if (isIndiaOffer && !hasRealDestination) {
    return (
      "/popular/india" +
      buildQuery({
        origin: "Delhi",
        toCity: smartIntent,
        date: addDays(30),
        adults: 2,
        children: 0,
        rooms: 1,
        flightPreference: "withFlight",

        searchMode: "destination",
        destinationKind: "india",
        matchedCountry: "India",
        matchedContinent: "asia",
        matchedCity: smartIntent,
        smartQuery: smartIntent,

        offer: offerCode,
        offerMode: "package",
        selectedTheme: primaryTheme,
        selectedSubTheme: primarySubTheme,
      })
    );
  }

  const destination = ruleDestinations[0] || getDefaultDestination(offer);

  const resolved = resolveHolidaySearchTarget({
    originCity: "Delhi",
    toCity: destination,
    departureDate: addDays(30),
    adults: 2,
    children: 0,
    rooms: 1,
    selectedTheme: primaryTheme,
    selectedSubTheme: primarySubTheme,
    filters: {
      flightPreference: "withFlight",
    },
  });

  const url = buildHolidayResolvedUrl(resolved);
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}offer=${offerCode}&offerMode=package`;
}

  if (offer.service === "bus") {
    const selectedRoute = getBusRouteFromOffer(offer);

    return (
      "/bus/result" +
      buildQuery({
        fromCity: selectedRoute.fromCity,
        fromPoint: "All Boarding Points",
        toCity: selectedRoute.toCity,
        toPoint: "All Drop Points",
        date: addDays(15),
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  if (offer.service === "cab") {
    const selectedRoute = getCabRouteFromOffer(offer);

    return (
      "/cab/result" +
      buildQuery({
        rideType: "outstationOneWay",
        from: selectedRoute.from,
        to: selectedRoute.to,
        departureDate: addDays(15),
        pickupTime: "10:30",
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  if (offer.service === "train") {
    const selectedRoute = getTrainRouteFromOffer(offer);

    return (
      "/train/result" +
      buildQuery({
        fromCity: selectedRoute.fromCity,
        fromCode: selectedRoute.fromCode,
        toCity: selectedRoute.toCity,
        toCode: selectedRoute.toCode,
        date: addDays(15),
        class: "ALL",
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  if (offer.service === "cruise") {
    const sailingDate = addDays(30);
    const sailingMonth = sailingDate.slice(0, 7);

    return (
      "/cruise/result" +
      buildQuery({
        destination: getCruiseDestinationId(offer),
        port: getCruiseDeparturePortId(offer),
        sailingMode: "date",
        date: sailingDate,
        month: sailingMonth,
        duration: "",
        adults: 2,
        children: 0,
        infants: 0,
        offer: offer.couponCode || offer.slug,
      })
    );
  }

  return (
    getSmartOfferServicePath(offer.service) +
    buildQuery({
      offer: offer.couponCode || offer.slug,
    })
  );
}

export function activateAndBuildSmartOfferUrl(offer: SmartOfferItem) {
  activateSmartOffer(offer, "homepage");

  return buildSmartOfferRedirectUrl(offer);
}