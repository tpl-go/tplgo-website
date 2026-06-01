type OfferCard = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  fromCity?: string;
  toCity?: string;
};

const trainOffers: OfferCard[] = [
  {
    id: "tr-offer-1",
    title: "Train Saver Deals",
    description: "Extra savings on selected train routes and classes",
  },
  {
    id: "tr-offer-2",
    title: "Confirmed Ticket Options",
    description: "Higher booking confidence on busy travel dates",
  },
  {
    id: "tr-offer-3",
    title: "Refund Protection",
    description: "Get safer booking choices with refund-friendly fares",
  },
];

export default function TrainOffersStrip({ fromCity, toCity }: Props) {
  return (
    <div className="flex min-w-0 gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
      {trainOffers.map((offer, index) => (
        <div
          key={offer.id}
          className={`min-w-[235px] rounded-xl border border-slate-200 px-4 py-2 shadow-sm md:min-w-0 ${
            index === 0
              ? "bg-[linear-gradient(135deg,#e0f2fe,#ffffff)]"
              : index === 1
              ? "bg-[linear-gradient(135deg,#ede9fe,#ffffff)]"
              : "bg-[linear-gradient(135deg,#dcfce7,#ffffff)]"
          }`}
        >
          <div className="text-[14px] font-semibold text-slate-900">
            {offer.title}
          </div>

          <div className="mt-0.5 text-[12px] leading-4 text-slate-600">
            {offer.description}
          </div>

          {fromCity && toCity && (
            <div className="mt-1 text-[11px] font-medium text-slate-500">
              {fromCity} → {toCity}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
