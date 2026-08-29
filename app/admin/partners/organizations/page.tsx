import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { PartnerAdminReadModel } from "../_components/PartnerAdminReadModel";

export default function AdminPartnerOrganizationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Organizations">
        <PartnerAdminReadModel mode="organizations" />
      </AdminShell>
    </AdminProtected>
  );
}
