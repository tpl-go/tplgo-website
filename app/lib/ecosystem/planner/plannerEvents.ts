import type {
  PlannerBundlePayload,
  PlannerCheckoutBridgePayload,
  PlannerQuotePayload,
} from "@/types/ecosystem/planner/api";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "./plannerTypes";

export type PlannerEventName =
  | "trip.updated"
  | "scenario.changed"
  | "variant.selected"
  | "itinerary.regenerated"
  | "quote.updated"
  | "bundle.selected"
  | "checkout.prepared";

export type PlannerEventPayloadMap = {
  "trip.updated": {
    intent: TiyaTripIntent;
    plan?: TiyaGeneratedPlan;
  };
  "scenario.changed": {
    scenarioId: string;
    scenarioName?: string;
  };
  "variant.selected": {
    variantId: string;
    variantName?: string;
  };
  "itinerary.regenerated": {
    days: TiyaDayPlan[];
    reason: string;
  };
  "quote.updated": PlannerQuotePayload;
  "bundle.selected": PlannerBundlePayload;
  "checkout.prepared": PlannerCheckoutBridgePayload;
};

export type PlannerEvent<TName extends PlannerEventName = PlannerEventName> = {
  id: string;
  name: TName;
  payload: PlannerEventPayloadMap[TName];
  createdAt: string;
  source: "tiya-smart-planner";
};

export type PlannerEventHandler<TName extends PlannerEventName> = (
  event: PlannerEvent<TName>
) => void;

export function createPlannerEvent<TName extends PlannerEventName>(
  name: TName,
  payload: PlannerEventPayloadMap[TName]
): PlannerEvent<TName> {
  return {
    id: `tiya-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    payload,
    createdAt: new Date().toISOString(),
    source: "tiya-smart-planner",
  };
}

export function createPlannerEventBus() {
  const handlers = new Map<PlannerEventName, Set<(event: PlannerEvent) => void>>();

  function on<TName extends PlannerEventName>(
    name: TName,
    handler: PlannerEventHandler<TName>
  ) {
    const eventHandlers = handlers.get(name) ?? new Set();
    eventHandlers.add(handler as (event: PlannerEvent) => void);
    handlers.set(name, eventHandlers);

    return () => {
      eventHandlers.delete(handler as (event: PlannerEvent) => void);
    };
  }

  function emit<TName extends PlannerEventName>(
    name: TName,
    payload: PlannerEventPayloadMap[TName]
  ) {
    const event = createPlannerEvent(name, payload);
    handlers.get(name)?.forEach((handler) => handler(event as PlannerEvent));
    return event;
  }

  function clear() {
    handlers.clear();
  }

  return {
    on,
    emit,
    clear,
  };
}

export const plannerEventBus = createPlannerEventBus();
