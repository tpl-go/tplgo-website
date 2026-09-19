import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import PartnerOverview from "./_components/PartnerOverview";

export default function AdminPartnersOverviewPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partners">
        <PartnerOverview />
      </AdminShell>
    </AdminProtected>
  );
}
