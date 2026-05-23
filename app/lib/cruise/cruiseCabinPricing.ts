import type {
  CruiseCabinSelectionRow,
  CruiseCabinType,
} from "@/app/lib/cruise/cruiseDetailTypes";

export type CruiseCabinPricingBreakup = {
  cabinKey: string;
  cabinId: string;
  cabinName: string;
  adults: number;
  children: number;
  infants: number;
  nationality: string;

  baseFarePerAdult: number;
  adultMultiplier: number;
  childMultiplier: number;
  infantMultiplier: number;
  nationalityMultiplier: number;

  effectiveAdultFare: number;
  effectiveChildFare: number;
  effectiveInfantFare: number;

  adultFare: number;
  childFare: number;
  infantFare: number;
  subtotal: number;
};

export type CruiseCabinPricingSummary = {
  cabins: CruiseCabinPricingBreakup[];
  cabinsTotal: number;
  taxesAndFees: number;
  grandTotal: number;
};

export function getTravellerCounts(rows: CruiseCabinSelectionRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.adults += row.adults;
      acc.children += row.children;
      acc.infants += row.infants;
      return acc;
    },
    {
      adults: 0,
      children: 0,
      infants: 0,
    }
  );
}

function getPrimaryNationality(rows: CruiseCabinSelectionRow[]) {
  return rows[0]?.nationality || "indian";
}

function getNationalityMultiplier(nationality: string) {
  const key = nationality.trim().toLowerCase();

  const nationalityPricingMap: Record<string, number> = {
    indian: 1,
    india: 1,
    nri: 1.08,
    foreigner: 1.15,
    international: 1.15,
    usa: 1.15,
    uk: 1.15,
    uae: 1.12,
    singapore: 1.1,
  };

  return nationalityPricingMap[key] ?? 1;
}

function getTravellerFareConfig() {
  return {
    adultMultiplier: 1,
    childMultiplier: 0.75,
    infantMultiplier: 0.2,
  };
}

export function buildCabinPricingBreakup(
  cabin: CruiseCabinType,
  rows: CruiseCabinSelectionRow[],
  cabinKey: string
): CruiseCabinPricingBreakup {
  const counts = getTravellerCounts(rows);
  const nationality = getPrimaryNationality(rows);

  const {
    adultMultiplier,
    childMultiplier,
    infantMultiplier,
  } = getTravellerFareConfig();

  const nationalityMultiplier = getNationalityMultiplier(nationality);
  const baseFarePerAdult = cabin.pricePerPerson;

  const effectiveAdultFare = Math.round(
    baseFarePerAdult * adultMultiplier * nationalityMultiplier
  );
  const effectiveChildFare = Math.round(
    baseFarePerAdult * childMultiplier * nationalityMultiplier
  );
  const effectiveInfantFare = Math.round(
    baseFarePerAdult * infantMultiplier * nationalityMultiplier
  );

  const adultFare = counts.adults * effectiveAdultFare;
  const childFare = counts.children * effectiveChildFare;
  const infantFare = counts.infants * effectiveInfantFare;

  return {
    cabinKey,
    cabinId: cabin.id,
    cabinName: cabin.name,
    adults: counts.adults,
    children: counts.children,
    infants: counts.infants,
    nationality,

    baseFarePerAdult,
    adultMultiplier,
    childMultiplier,
    infantMultiplier,
    nationalityMultiplier,

    effectiveAdultFare,
    effectiveChildFare,
    effectiveInfantFare,

    adultFare,
    childFare,
    infantFare,
    subtotal: adultFare + childFare + infantFare,
  };
}

export function buildCruisePricingSummary(
  selectedCabins: {
    cabinId: string;
    rows: CruiseCabinSelectionRow[];
    cabinKey: string;
  }[],
  cabinCatalog: CruiseCabinType[],
  baseTaxesAndFees: number
): CruiseCabinPricingSummary {
  const cabins = selectedCabins
    .map((selected) => {
      const cabin = cabinCatalog.find((item) => item.id === selected.cabinId);
      if (!cabin) return null;

      return buildCabinPricingBreakup(cabin, selected.rows, selected.cabinKey);
    })
    .filter(Boolean) as CruiseCabinPricingBreakup[];

  const cabinsTotal = cabins.reduce((sum, cabin) => sum + cabin.subtotal, 0);
  const taxesAndFees = baseTaxesAndFees;
  const grandTotal = cabinsTotal + taxesAndFees;

  return {
    cabins,
    cabinsTotal,
    taxesAndFees,
    grandTotal,
  };
}