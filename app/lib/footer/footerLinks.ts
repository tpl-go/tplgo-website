import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  type LucideIcon,
} from "lucide-react";

export type FooterLinkItem = {
  label: string;
  href: string;
};

export type FooterSocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const companyLinks: FooterLinkItem[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Blog / Travel Guide", href: "/travel-guide" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Share Your Experience", href: "/share-your-experience" },
];

export const serviceLinks: FooterLinkItem[] = [
  {
    label: "Flights",
    href: "/?service=flights",
  },

  {
    label: "Bus",
    href: "/?service=bus",
  },

  {
    label: "Hotels",
    href: "/?service=hotels",
  },

  {
    label: "Train",
    href: "/?service=train",
  },

  {
    label: "Homestay",
    href: "/?service=homestays",
  },

  {
    label: "Cab",
    href: "/?service=cab",
  },

  {
    label: "Holidays",
    href: "/?service=holidays",
  },

  {
    label: "Cruise",
    href: "/?service=cruise",
  },

  {
    label: "Insurance",
    href: "/?service=insurance",
  },

  {
    label: "Visa",
    href: "/?service=visa",
  },
];

export const supportLinks: FooterLinkItem[] = [
  { label: "Cancellation Policy", href: "/cancellation-policy" },

  { label: "Privacy Policy", href: "/privacy-policy" },

  { label: "Terms & Conditions", href: "/terms-and-conditions" },

  { label: "Customer Support", href: "/customer-support" },

  { label: "Flight Tracking", href: "/flight-tracking" },
];

export const socialLinks: FooterSocialLink[] = [
  {
    label: "Facebook",
    href: "https://facebook.com/tplgo",
    icon: Facebook,
  },

  {
    label: "Instagram",
    href: "https://instagram.com/tplgotravel",
    icon: Instagram,
  },

  {
    label: "YouTube",
    href: "https://youtube.com/@TPLGO",
    icon: Youtube,
  },

  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
  },
];