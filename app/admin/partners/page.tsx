import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { PartnerAdminReadModel } from "./_components/PartnerAdminReadModel";

export default function AdminPartnersOverviewPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partners">
        <PartnerAdminReadModel mode="overview" />
      </AdminShell>
    </AdminProtected>
  );
}
