"use client";

import { useEffect, useState } from "react";

import ReviewPageShell from "@/app/components/ecosystem/planner/review/ReviewPageShell";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import {
  TIYA_CHECKOUT_PAYLOAD_KEY,
  TIYA_REVIEW_DRAFT_KEY,
  TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY,
} from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import { resolvePlannerPayloadRecord } from "@/app/lib/ecosystem/planner/plannerPayloadStorage";

type StoredReviewDraft = {
  checkoutPayload?: TiyaSmartPlannerReviewPayload;
};

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPayloadFromStorage(): TiyaSmartPlannerReviewPayload | null {
  if (typeof window === "undefined") return null;

  const storageReads: Array<() => TiyaSmartPlannerReviewPayload | null> = [
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<unknown>(window.sessionStorage.getItem(TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY))
      ),
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<unknown>(window.localStorage.getItem(TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY))
      ),
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<StoredReviewDraft>(window.sessionStorage.getItem(TIYA_REVIEW_DRAFT_KEY))
          ?.checkoutPayload
      ),
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<StoredReviewDraft>(window.localStorage.getItem(TIYA_REVIEW_DRAFT_KEY))
          ?.checkoutPayload
      ),
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<unknown>(window.sessionStorage.getItem(TIYA_CHECKOUT_PAYLOAD_KEY))
      ),
    () =>
      resolvePlannerPayloadRecord<TiyaSmartPlannerReviewPayload>(
        parseJson<unknown>(window.localStorage.getItem(TIYA_CHECKOUT_PAYLOAD_KEY))
      ),
  ];

  for (const read of storageReads) {
    const payload = read();
    if (payload?.source === "smart-planner") return payload;
  }

  return null;
}

export default function SmartPlannerReviewPage() {
  const [payload, setPayload] =
    useState<TiyaSmartPlannerReviewPayload | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPayload(readPayloadFromStorage());
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return <ReviewPageShell hasLoaded={hasLoaded} payload={payload} />;
}
