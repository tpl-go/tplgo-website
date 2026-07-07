import AdminProtected from "../_components/AdminProtected";
import { AdminBookingOperationsCenter } from "../_components/AdminBookingOperations";
import AdminShell from "../_components/AdminShell";

export default function AdminBookingsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Bookings">
        <AdminBookingOperationsCenter />
      </AdminShell>
    </AdminProtected>
  );
}
