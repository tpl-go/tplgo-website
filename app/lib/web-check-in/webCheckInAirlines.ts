export type AirlineOption = {
  name: string;
  code: string;
  note: string;
  checkInWindow: string;
  webCheckInUrl?: string;
};

export const airlines: AirlineOption[] = [
  {
    name: "IndiGo",
    code: "6E",
    note:
      "Web check-in usually opens before departure as per airline rules.",
    checkInWindow:
      "48 hrs to 60 mins before departure",
    webCheckInUrl:
      "https://www.goindigo.in/web-check-in.html",
  },

  {
    name: "Air India",
    code: "AI",
    note:
      "Keep PNR and passenger last name ready before proceeding.",
    checkInWindow:
      "48 hrs to 2 hrs before departure",
    webCheckInUrl:
      "https://www.airindia.com/in/en/manage/web-checkin.html",
  },

  {
    name: "Vistara",
    code: "UK",
    note:
      "Seat selection and boarding pass generation depend on airline policy.",
    checkInWindow:
      "48 hrs to 1 hr before departure",
    webCheckInUrl:
      "https://www.airvistara.com/in/en/web-check-in",
  },

  {
    name: "SpiceJet",
    code: "SG",
    note:
      "Online check-in timing may vary by airport and route.",
    checkInWindow:
      "48 hrs to 75 mins before departure",
    webCheckInUrl:
      "https://www.spicejet.com/#web-check-in",
  },

  {
    name: "Akasa Air",
    code: "QP",
    note:
      "Boarding pass availability depends on airport eligibility.",
    checkInWindow:
      "48 hrs to 1 hr before departure",
    webCheckInUrl:
      "https://www.akasaair.com/check-in",
  },
];