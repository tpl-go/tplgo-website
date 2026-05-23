import { TravellerMealSelection, TravellerSeatSelection } from "./ancillaryTypes";

function getDiff(oldPrice: number, newPrice: number) {
  return Number((newPrice - oldPrice).toFixed(2));
}

export function getSeatTotal(selections: TravellerSeatSelection[]) {
  return selections.reduce((sum, item) => sum + item.newPrice, 0);
}

export function getMealTotal(selections: TravellerMealSelection[]) {
  return selections.reduce((sum, item) => sum + item.newPrice, 0);
}

export function getSeatDiffTotal(selections: TravellerSeatSelection[]) {
  return selections.reduce((sum, item) => sum + getDiff(item.oldPrice, item.newPrice), 0);
}

export function getMealDiffTotal(selections: TravellerMealSelection[]) {
  return selections.reduce((sum, item) => sum + getDiff(item.oldPrice, item.newPrice), 0);
}