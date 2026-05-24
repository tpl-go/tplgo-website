"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import WebCheckInHero from "@/app/components/web-check-in/WebCheckInHero";
import WebCheckInForm from "@/app/components/web-check-in/WebCheckInForm";
import WebCheckInGuidance from "@/app/components/web-check-in/WebCheckInGuidance";
import WebCheckInSideCards from "@/app/components/web-check-in/WebCheckInSideCards";

import { airlines as webCheckInAirlines } from "@/app/lib/web-check-in/webCheckInAirlines";

import {
  formatPassengerLastName,
  formatWebCheckInPnr,
  isValidWebCheckInPayload,
} from "@/app/lib/web-check-in/webCheckInHelpers";

import { getWebCheckInPrefillFromBookingId } from "@/app/lib/web-check-in/webCheckInPrefill";

function WebCheckInPageContent() {
  const searchParams = useSearchParams();

  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [airline, setAirline] = useState("6E");
  const [departureCity, setDepartureCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [prefillSource, setPrefillSource] =
    useState<"manual" | "booking">("manual");

  const [prefilledBookingTitle, setPrefilledBookingTitle] =
    useState("");

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) return;

    const prefill =
      getWebCheckInPrefillFromBookingId(bookingId);

    if (prefill.source !== "booking") return;

    setPnr(prefill.pnr);
    setLastName(prefill.lastName);
    setAirline(prefill.airline || "6E");
    setDepartureCity(prefill.departureCity || "");
    setPrefillSource("booking");
    setPrefilledBookingTitle(
      prefill.booking?.title || ""
    );
  }, [searchParams]);

  const selectedAirline = useMemo(() => {
    return (
      webCheckInAirlines.find(
        (item) => item.code === airline
      ) || webCheckInAirlines[0]
    );
  }, [airline]);

  const formattedPnr = formatWebCheckInPnr(pnr);

  const formattedLastName =
    formatPassengerLastName(lastName);

  const canContinue = isValidWebCheckInPayload({
    pnr: formattedPnr,
    lastName: formattedLastName,
    airline,
  });

  const handleContinue = () => {
    if (!canContinue) return;

    setPnr(formattedPnr);
    setLastName(formattedLastName);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] overflow-x-hidden">
      <WebCheckInHero />

      <WebCheckInForm
        pnr={formattedPnr}
        lastName={lastName}
        airline={airline}
        departureCity={departureCity}
        submitted={submitted}
        canContinue={canContinue}
        prefillSource={prefillSource}
        prefilledBookingTitle={prefilledBookingTitle}
        selectedAirline={selectedAirline}
        airlines={webCheckInAirlines}
        setPnr={setPnr}
        setLastName={setLastName}
        setAirline={setAirline}
        setDepartureCity={setDepartureCity}
        onContinue={handleContinue}
      />

      <section className="max-w-7xl mx-auto px-3 md:px-6 py-8 md:py-12">
        <div className="grid gap-5 md:gap-6 lg:grid-cols-[1fr_380px]">
          <WebCheckInGuidance
            airline={airline}
            airlines={webCheckInAirlines}
          />

          <WebCheckInSideCards />
        </div>
      </section>
    </main>
  );
}

export default function WebCheckInPage() {
  return (
    <Suspense fallback={<div />}>
      <WebCheckInPageContent />
    </Suspense>
  );
}