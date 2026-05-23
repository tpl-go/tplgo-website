"use client";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border rounded-2xl p-5 shadow-sm">
    <h3 className="text-sm font-bold text-black">{title}</h3>
    <div className="mt-3 text-sm text-gray-700 leading-relaxed">{children}</div>
  </div>
);

export default function PoliciesTab() {
  return (
    <div className="space-y-4">
      <Section title="Cancellation Policy">
        <ul className="list-disc pl-5 space-y-1">
          <li>Cancellation charges depend on date/time of cancellation.</li>
          <li>Flight / hotel cancellation may have separate charges.</li>
          <li>Peak season dates may have stricter rules.</li>
        </ul>
        <div className="mt-3 text-xs text-gray-500">
          *Final policy will be shown from backend once connected.
        </div>
      </Section>

      <Section title="Payment Policy">
        <ul className="list-disc pl-5 space-y-1">
          <li>Booking confirmation after successful payment.</li>
          <li>Partial payment option (if applicable) can be enabled later.</li>
          <li>Any convenience fee / taxes as per payment gateway rules.</li>
        </ul>
      </Section>

      <Section title="Important Notes">
        <ul className="list-disc pl-5 space-y-1">
          <li>Check-in/Check-out as per hotel policy.</li>
          <li>Itinerary may change due to weather/road conditions.</li>
          <li>ID proof is mandatory for all travelers.</li>
        </ul>
      </Section>
    </div>
  );
}