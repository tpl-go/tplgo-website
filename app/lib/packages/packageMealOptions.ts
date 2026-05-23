import type { PackageMealOption } from "./packageSelectionTypes";

export function getPackageMealOptions(): PackageMealOption[] {
  return [
    {
      id: "meal-cp",
      title: "Breakfast Included (CP)",
      description: "Daily breakfast at the hotel",
      fareDiff: 0,
      included: true,
    },
    {
      id: "meal-map",
      title: "Breakfast + Dinner (MAP)",
      description: "Daily breakfast and dinner included",
      fareDiff: 2500,
      included: false,
    },
    {
      id: "meal-ap",
      title: "All Meals (AP)",
      description: "Breakfast, lunch and dinner included",
      fareDiff: 4500,
      included: false,
    },
    {
      id: "meal-premium",
      title: "Premium Dining Add-on",
      description: "Selected premium dining experiences during stay",
      fareDiff: 6200,
      included: false,
    },
  ];
}