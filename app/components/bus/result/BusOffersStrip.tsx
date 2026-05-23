type OfferCard = {
  id: string;
  variant: "assured" | "bank" | "service";
  title: string;
  subtitle?: string;
  description?: string;
};

type BusOffersStripProps = {
  fromCity?: string;
  toCity?: string;
  offers?: OfferCard[];
};

const defaultBusOffers: OfferCard[] = [
  {
    id: "bus-offer-1",
    variant: "assured",
    title: "TPL Assured",
    subtitle: "Trusted Buses",
    description: "Verified bus partners with smoother boarding support.",
  },
  {
    id: "bus-offer-2",
    variant: "bank",
    title: "Flat 10% Instant Discount",
    description: "on selected bank cards for bus bookings",
  },
  {
    id: "bus-offer-3",
    variant: "service",
    title: "Easy Boarding Benefits",
    description: "Better pickup assistance and route-friendly options",
  },
];

export default function BusOffersStrip({
  fromCity,
  toCity,
  offers,
}: BusOffersStripProps) {
  const resolvedOffers = offers ?? defaultBusOffers;

  return (
    <div className="grid grid-cols-[1.4fr_1.1fr_0.8fr] gap-3">
      {resolvedOffers.map((offer) => {
        if (offer.variant === "assured") {
          return (
            <div
              key={offer.id}
              className="rounded-xl bg-white px-4 py-2 shadow-sm"
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-orange-500">
                {offer.title}
              </p>

              <p className="mt-1 text-[13px] font-semibold text-[#111827]">
                {fromCity && toCity
                  ? `${fromCity} to ${toCity} assured route benefits`
                  : "Bus route exclusive offer"}
              </p>

              <p className="text-[12px] text-[#6b7280]">
                {offer.description}
              </p>
            </div>
          );
        }

        if (offer.variant === "bank") {
          return (
            <div
              key={offer.id}
              className="rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#7f1d1d]" />
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {offer.title}
                  </p>
                  <p className="text-[12px] text-[#6b7280]">
                    {offer.description}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={offer.id} className="rounded-xl bg-white shadow-sm">
            <div className="h-full w-full bg-[linear-gradient(135deg,#dbeafe,#ffffff)] px-4 py-3">
              <p className="text-[14px] font-semibold text-[#111827]">
                {offer.title}
              </p>
              <p className="text-[12px] text-[#6b7280]">
                {offer.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}