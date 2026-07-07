import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminResourceView } from "../_components/AdminViews";

export default function AdminPlannerPage() {
  return (
    <AdminProtected>
      <AdminShell title="Planner Trips">
        <AdminResourceView title="Planner Trips" path="/api/v1/admin/planner/trips" columns={["bookingRef", "mobile", "status", "bookingStatus", "paymentStatus"]} />
      </AdminShell>
    </AdminProtected>
  );
}
