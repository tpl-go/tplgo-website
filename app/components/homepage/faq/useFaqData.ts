export type FaqItemData = {
  id: number;
  question: string;
  answer: string;
};

export const faqData: FaqItemData[] = [
  {
    id: 1,
    question: "How can I book a travel package with TPL?",
    answer:
      "You can book directly through our website, contact our support team, or request a customized quote. Our travel experts assist you throughout the booking process.",
  },
  {
    id: 2,
    question: "Can I customize my travel itinerary?",
    answer:
      "Yes. TPL specializes in fully customized travel experiences based on your budget, preferences, and travel goals.",
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, Net Banking, Debit/Credit Cards, and select EMI options depending on the package value.",
  },
  {
    id: 4,
    question: "Is visa assistance included?",
    answer:
      "Yes, we provide complete visa guidance and documentation support for eligible international destinations.",
  },
  {
    id: 5,
    question: "Do you offer 24/7 customer support?",
    answer:
      "Absolutely. Our support team is available 24/7 for booking assistance, modifications, and emergency travel help.",
  },
  {
    id: 6,
    question: "What is your cancellation policy?",
    answer:
      "Cancellation policies vary depending on the destination and service providers. Full details are shared before booking confirmation.",
  },
  {
    id: 7,
    question: "Are flights included in all packages?",
    answer:
      "Flights can be included based on your selected package. We offer flexible options including flight-only or land-only packages.",
  },
  {
    id: 8,
    question: "Is travel insurance provided?",
    answer:
      "Travel insurance can be added to your package for enhanced safety and peace of mind.",
  },
];