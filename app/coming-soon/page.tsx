import type { Metadata } from "next";

import ComingSoonPage from "../components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Coming Soon | TPL",
  description:
    "TPL is upgrading with real-time booking, payment, and travel APIs.",
};

export default function Page() {
  return <ComingSoonPage />;
}
