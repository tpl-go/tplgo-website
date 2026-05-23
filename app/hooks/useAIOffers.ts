"use client";

type Params = {
  service?: string;
  from?: string;
  to?: string;
  bookingValue?: number;
  travelDate?: string;
  autoActivate?: boolean;
};

export function useAIOffers(
  _params: Params
) {
  return {
    bestOffer: null,
    activatedOffer: null,
  };
}