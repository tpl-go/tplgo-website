"use client";

import { useMemo } from "react";
import { Experience } from "./types";

export function useExperienceRank(data: Experience[]) {
  return useMemo(() => {
    return [...data].sort((a, b) => b.salesScore - a.salesScore);
  }, [data]);
}