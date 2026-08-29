import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { PartnerAdminReadModel } from "../_components/PartnerAdminReadModel";

export default function AdminPartnerApplicationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Applications">
        <PartnerAdminReadModel mode="applications" />
      </AdminShell>
    </AdminProtected>
  );
}
