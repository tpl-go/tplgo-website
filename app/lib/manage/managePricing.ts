import {
  BaggageSelection,
  ManageQuote,
  MealSelection,
  SeatSelection,
} from "./manageTypes";

function calculateDiffFromPrices(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

function sumPositive(values: number[]) {
  return Number(
    values
      .filter((v) => v > 0)
      .reduce((acc, curr) => acc + curr, 0)
      .toFixed(2)
  );
}

function sumNegativeAbs(values: number[]) {
  return Number(
    Math.abs(
      values
        .filter((v) => v < 0)
        .reduce((acc, curr) => acc + curr, 0)
    ).toFixed(2)
  );
}

export function calculateSeatDiff(seats: SeatSelection[]) {
  return Number(
    seats
      .reduce((acc, item) => acc + calculateDiffFromPrices(item.oldPrice, item.newPrice), 0)
      .toFixed(2)
  );
}

export function calculateMealDiff(meals: MealSelection[]) {
  return Number(
    meals
      .reduce((acc, item) => acc + calculateDiffFromPrices(item.oldPrice, item.newPrice), 0)
      .toFixed(2)
  );
}

export function calculateBaggageDiff(baggage: BaggageSelection[]) {
  return Number(
    baggage
      .reduce((acc, item) => acc + calculateDiffFromPrices(item.oldPrice, item.newPrice), 0)
      .toFixed(2)
  );
}

export function buildManageQuote(params: {
  seats: SeatSelection[];
  meals: MealSelection[];
  baggage: BaggageSelection[];
  airlineCharges?: number;
}): ManageQuote {
  const seatItemDiffs = params.seats.map((item) =>
    calculateDiffFromPrices(item.oldPrice, item.newPrice)
  );
  const mealItemDiffs = params.meals.map((item) =>
    calculateDiffFromPrices(item.oldPrice, item.newPrice)
  );
  const baggageItemDiffs = params.baggage.map((item) =>
    calculateDiffFromPrices(item.oldPrice, item.newPrice)
  );

  const seatDiff = Number(
    seatItemDiffs.reduce((acc, curr) => acc + curr, 0).toFixed(2)
  );
  const mealDiff = Number(
    mealItemDiffs.reduce((acc, curr) => acc + curr, 0).toFixed(2)
  );
  const baggageDiff = Number(
    baggageItemDiffs.reduce((acc, curr) => acc + curr, 0).toFixed(2)
  );

  const allDiffs = [...seatItemDiffs, ...mealItemDiffs, ...baggageItemDiffs];

  const upgradeTotal = sumPositive(allDiffs);
  const downgradeTotal = sumNegativeAbs(allDiffs);

  const charges = Number((params.airlineCharges ?? 0).toFixed(2));

  const netAmount = Number((upgradeTotal - downgradeTotal - charges).toFixed(2));

  if (netAmount > 0) {
    return {
      seatDiff,
      mealDiff,
      baggageDiff,
      upgradeTotal,
      downgradeTotal,
      airlineCharges: charges,
      netPayable: netAmount,
      walletCredit: 0,
      settlementMode: "payment",
    };
  }

  if (netAmount < 0) {
    return {
      seatDiff,
      mealDiff,
      baggageDiff,
      upgradeTotal,
      downgradeTotal,
      airlineCharges: charges,
      netPayable: 0,
      walletCredit: Math.abs(netAmount),
      settlementMode: "wallet_credit",
    };
  }

  return {
    seatDiff,
    mealDiff,
    baggageDiff,
    upgradeTotal,
    downgradeTotal,
    airlineCharges: charges,
    netPayable: 0,
    walletCredit: 0,
    settlementMode: "save",
  };
}