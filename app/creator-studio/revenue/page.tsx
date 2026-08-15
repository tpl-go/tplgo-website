import CreatorRevenueDashboard from "@/app/components/creators/studio/revenue/CreatorRevenueDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revenue & Wallet | Creator Studio", description: "Preview Creator earnings, payouts, invoices and tax summaries." };

export default function CreatorStudioRevenuePage() { return <CreatorRevenueDashboard />; }
