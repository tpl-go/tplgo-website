import AdminProtected from "../../_components/AdminProtected";
import { AdminBookingOperationsWorkspace } from "../../_components/AdminBookingOperations";
import AdminShell from "../../_components/AdminShell";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <AdminProtected>
      <AdminShell title="Booking Detail">
        <AdminBookingOperationsWorkspace bookingId={bookingId} />
      </AdminShell>
    </AdminProtected>
  );
}
