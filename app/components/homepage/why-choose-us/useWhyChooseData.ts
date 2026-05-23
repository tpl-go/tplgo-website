import { WhyChooseItemType } from "./types";

export const useWhyChooseData = () => {
  const data: WhyChooseItemType[] = [
    {
      id: "best-price",
      title: "Best Price Guarantee",
      description:
        "Access exclusive negotiated fares on flights, hotels, holidays and curated travel experiences with fully transparent pricing and zero hidden charges.",
      
      rank: 1,
      status: true,
    },
    {
      id: "secure-booking",
      title: "Secure Booking Protection",
      description:
        "End-to-end encrypted transactions with advanced fraud protection and instant booking confirmations for complete peace of mind.",
      
      rank: 2,
      status: true,
    },
    {
      id: "customized-trips",
      title: "Customized Travel Experiences",
      description:
        "Personalized itineraries designed by travel experts based on your interests, preferences, and budget.",
      
      rank: 3,
      status: true,
    },
    {
      id: "priority-access",
      title: "Priority Access & Fast Confirmation",
      description:
        "Priority inventory allocation during peak seasons with faster processing and confirmation turnaround.",
      
      rank: 4,
      status: true,
    },
{
      id: "24x7-support",
    title: "24×7 Dedicated Travel Support",
    description:
      "Round-the-clock human assistance via Call, WhatsApp and Email — before, during and after your journey.",
      
      rank: 5,
      status: true,
    },
{
id: "flexible-changes",
    title: "Flexible Modifications & Assistance",
    description:
      "Hassle-free changes, rebookings and proactive support in case of cancellations or travel disruptions.",
      rank: 6,
      status: true,
    },

{
id: "trusted-network",
    title: "Trusted Partner Network",
    description:
      "Strong partnerships with verified airlines, hotels and local operators ensuring reliable and high-quality service standards.",
      rank: 7,
      status: true,
    },

{
id: "corporate-expertise",
    title: "Corporate & Group Travel Expertise",
    description:
      "Specialized handling for corporate accounts, MICE events and group bookings with structured billing solutions.",
      rank: 8,
      status: true,
    },

  ];

  return data
    .filter((item) => item.status)
    .sort((a, b) => a.rank - b.rank);
};