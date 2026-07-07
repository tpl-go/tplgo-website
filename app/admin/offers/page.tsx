import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminResourceView } from "../_components/AdminViews";

export default function AdminOffersPage() {
  return (
    <AdminProtected>
      <AdminShell title="Offers">
        <AdminResourceView title="Offers" path="/api/v1/admin/offers" columns={["id", "slug", "title", "service", "active"]} />
      </AdminShell>
    </AdminProtected>
  );
}
