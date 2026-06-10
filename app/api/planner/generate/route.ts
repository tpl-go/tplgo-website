/**
 * route.ts  (Next.js App Router API Route)
 *
 * Path: src/app/api/planner/generate/route.ts
 *
 * This is the SERVER-SIDE handler. Your Anthropic API key stays here —
 * never exposed to the browser.
 *
 * Add to your .env.local:
 *   ANTHROPIC_API_KEY=sk-ant-...
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  TiyaBudgetLine,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

// ─── Anthropic client ─────────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are Tiya, an expert Indian travel planner for TPL GO (tplgo.com).
Your job is to generate a detailed, day-wise travel itinerary in JSON format.

RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no explanation.
2. Follow the exact schema provided.
3. All prices in INR (Indian Rupees).
4. Be specific — use real Indian city names, landmarks, dhabas, hotels, trains, buses.
5. For each day include a mix of: transport, stay, activity, meal items.
6. Keep language simple — a 65-year-old grandparent should understand.
7. Suggest budget-appropriate options (Economy/Standard/Premium/Luxury).`;
}

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildUserPrompt(intent: TiyaTripIntent, route: TiyaRouteOption): string {
  const days = calculateDays(intent.startDate, intent.endDate);

  return `Generate a ${days}-day travel itinerary for this trip:

FROM: ${intent.fromCity}
TO: ${intent.toCity}
DATES: ${intent.startDate} to ${intent.endDate} (${days} days)
TRAVELLERS: ${intent.adults} adults, ${intent.children} children, ${intent.seniors} seniors
TRANSPORT MODE: ${intent.transportMode}
STAY TYPE: ${intent.stayPreference}
BUDGET LEVEL: ${intent.budgetTier}
CUSTOM BUDGET: ${intent.customBudgetAmount || "Not specified"}
TRAVEL STYLE: ${intent.travelStyle}
PACE: ${intent.pace}
INTERESTS: ${intent.interests.join(", ")}
ROUTE NAME: ${route.name}
ROUTE DISTANCE: ${route.distance}
ROUTE DURATION: ${route.duration}
SPECIAL: ${[
    intent.smartPreferences?.includeLocalMarket && "Include local market visits",
    intent.smartPreferences?.includeCreatorSpots && "Include creator/influencer spots",
    intent.smartPreferences?.avoidNightTravel && "Avoid night travel",
    intent.smartPreferences?.preferScenicRoute && "Prefer scenic route",
    intent.seniors > 0 && "Senior-friendly activities",
    intent.children > 0 && "Family/child-friendly",
  ]
    .filter(Boolean)
    .join(", ") || "None"}

Return this exact JSON structure:
{
  "routeTitle": "City A → City B",
  "subtitle": "Short catchy subtitle",
  "totalBudget": 45000,
  "days": [
    {
      "id": "day-1",
      "day": 1,
      "title": "Day 1: Departure & Arrival",
      "date": "2026-08-12",
      "city": "Delhi",
      "summary": "Short summary of the day",
      "items": [
        {
          "id": "item-1-1",
          "type": "transport",
          "category": "flight",
          "title": "IndiGo Flight 6E-204",
          "detail": "Delhi → Jaipur, Dep 07:30, Arr 08:45",
          "time": "07:30",
          "duration": "1h 15m",
          "price": 4500,
          "unitPrice": 4500,
          "priceBasis": "per_person",
          "displayPriceLabel": "₹4,500 / person",
          "serviceType": "flight",
          "bookingStatus": "recommended",
          "options": [
            {
              "name": "IndiGo 6E-204",
              "detail": "07:30 - 08:45, Non-stop",
              "price": 4500
            },
            {
              "name": "Air India AI-476",
              "detail": "09:00 - 10:20, Non-stop",
              "price": 5200
            }
          ]
        },
        {
          "id": "item-1-2",
          "type": "stay",
          "category": "hotel",
          "title": "Hotel Pearl Palace",
          "detail": "3-star boutique hotel near Hawa Mahal, Jaipur",
          "time": "14:00",
          "duration": "1 night",
          "price": 2800,
          "unitPrice": 2800,
          "priceBasis": "per_night",
          "displayPriceLabel": "₹2,800 / night",
          "serviceType": "hotel",
          "bookingStatus": "recommended",
          "options": [
            {
              "name": "Hotel Pearl Palace",
              "detail": "3-star, near Hawa Mahal",
              "price": 2800
            },
            {
              "name": "Zostel Jaipur",
              "detail": "Budget hostel, great for solo",
              "price": 900
            }
          ]
        },
        {
          "id": "item-1-3",
          "type": "activity",
          "category": "sightseeing",
          "title": "Amber Fort Visit",
          "detail": "UNESCO heritage fort, guided tour available",
          "time": "16:00",
          "duration": "2h",
          "price": 500,
          "unitPrice": 500,
          "priceBasis": "per_person",
          "displayPriceLabel": "₹500 / person",
          "serviceType": "activity",
          "bookingStatus": "recommended"
        }
      ]
    }
  ],
  "routeStops": [
    { "city": "Delhi", "nights": 0, "highlights": ["Departure city"] },
    { "city": "Jaipur", "nights": 3, "highlights": ["Amber Fort", "Hawa Mahal", "Local bazaar"] }
  ],
  "budgetLines": [
    { "label": "Flights / Transport", "amount": 9000, "tone": "blue" },
    { "label": "Hotels / Stay", "amount": 8400, "tone": "orange" },
    { "label": "Activities", "amount": 3000, "tone": "green" },
    { "label": "Meals & Local", "amount": 2500, "tone": "slate" }
  ],
  "insights": [
    {
      "title": "Best time to visit Amber Fort",
      "detail": "Go before 10am to avoid crowds and heat.",
      "type": "tip"
    },
    {
      "title": "Local food you must try",
      "detail": "Dal Baati Churma at Laxmi Misthan Bhandar — very affordable.",
      "type": "food"
    }
  ],
  "routeOptions": []
}

Generate ${days} days of items. Each day must have at least one transport/activity/stay item.
Keep options array to 2-3 choices max per item.`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 3;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diff + 1, 14)); // cap at 14 days
}

function safeParseJSON(text: string): TiyaGeneratedPlan | null {
  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as TiyaGeneratedPlan;
  } catch {
    // Try to extract JSON object if Claude added any preamble
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as TiyaGeneratedPlan;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intent?: TiyaTripIntent;
      selectedRoute?: TiyaRouteOption;
    };

    const { intent, selectedRoute } = body;

    if (!intent || !selectedRoute) {
      return NextResponse.json(
        { error: "Missing intent or selectedRoute in request body" },
        { status: 400 }
      );
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(intent, selectedRoute),
        },
      ],
    });

    // Extract text from response
    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    const plan = safeParseJSON(responseText);

    if (!plan) {
      console.error("[plannerAI] Failed to parse Claude response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Ensure routeOptions exists (required by WorkspacePayload)
    if (!plan.routeOptions) {
      plan.routeOptions = [];
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("[plannerAI] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}