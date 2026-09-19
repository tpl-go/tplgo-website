import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import PartnerModuleSection from "./_components/PartnerModuleSection";

export default function AdminPartnersOverviewPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partners">
        <PartnerModuleSection section="overview" />
      </AdminShell>
    </AdminProtected>
  );
}
