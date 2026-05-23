import type { PackageSelectionState } from "./packageSelectionTypes";
import { getTotalPackageAdjustment } from "./packageSelectionHelpers";

export function getAdjustedPricePerPerson(
  basePricePerPerson: number,
  selectionState: PackageSelectionState
): number {
  return Math.max(
    Number(basePricePerPerson || 0) + getTotalPackageAdjustment(selectionState),
    0
  );
}