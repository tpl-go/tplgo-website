import {
  CruiseDestination,
  CruisePort,
  CruiseTravellers,
} from "./cruiseTypes";

const normalize = (value: string) => value.trim().toLowerCase();

export function searchCruiseDestinations(
  destinations: CruiseDestination[],
  query: string
) {
  const q = normalize(query);

  if (!q) {
    return [...destinations].sort((a, b) => {
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;
      return bPopular - aPopular || a.label.localeCompare(b.label);
    });
  }

  return destinations
    .filter((item) => {
      const labelMatch = normalize(item.label).includes(q);
      const descMatch = item.description
        ? normalize(item.description).includes(q)
        : false;
      const keywordMatch = item.keywords?.some((k) => normalize(k).includes(q));

      return labelMatch || descMatch || !!keywordMatch;
    })
    .sort((a, b) => {
      const aStarts = normalize(a.label).startsWith(q) ? 1 : 0;
      const bStarts = normalize(b.label).startsWith(q) ? 1 : 0;
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;

      return (
        bStarts - aStarts ||
        bPopular - aPopular ||
        a.label.localeCompare(b.label)
      );
    });
}

export function searchCruisePorts(ports: CruisePort[], query: string) {
  const q = normalize(query);

  if (!q) {
    return [...ports].sort((a, b) => {
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;
      return bPopular - aPopular || a.label.localeCompare(b.label);
    });
  }

  return ports
    .filter((item) => {
      const labelMatch = normalize(item.label).includes(q);
      const keywordMatch = item.keywords?.some((k) => normalize(k).includes(q));
      return labelMatch || !!keywordMatch;
    })
    .sort((a, b) => {
      const aStarts = normalize(a.label).startsWith(q) ? 1 : 0;
      const bStarts = normalize(b.label).startsWith(q) ? 1 : 0;
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;

      return (
        bStarts - aStarts ||
        bPopular - aPopular ||
        a.label.localeCompare(b.label)
      );
    });
}

export function prioritizePortsByDestination(
  ports: CruisePort[],
  destinationId: string | null
) {
  if (!destinationId) {
    return [...ports].sort((a, b) => {
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;
      return bPopular - aPopular || a.label.localeCompare(b.label);
    });
  }

  const matched = ports.filter(
    (port) =>
      port.destinationIds?.includes(destinationId) ||
      port.regionIds?.includes(destinationId)
  );

  const remaining = ports.filter(
    (port) =>
      !port.destinationIds?.includes(destinationId) &&
      !port.regionIds?.includes(destinationId)
  );

  return [...matched, ...remaining].sort((a, b) => {
    const aMatched =
      a.destinationIds?.includes(destinationId) || a.regionIds?.includes(destinationId)
        ? 1
        : 0;
    const bMatched =
      b.destinationIds?.includes(destinationId) || b.regionIds?.includes(destinationId)
        ? 1
        : 0;
    const aPopular = a.popular ? 1 : 0;
    const bPopular = b.popular ? 1 : 0;

    return (
      bMatched - aMatched ||
      bPopular - aPopular ||
      a.label.localeCompare(b.label)
    );
  });
}

export function getCruiseTravellersLabel(travellers: CruiseTravellers) {
  const { adults, children, infants } = travellers;
  const parts = [`${adults} Adult${adults > 1 ? "s" : ""}`];

  if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
  if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);

  return parts.join(", ");
}