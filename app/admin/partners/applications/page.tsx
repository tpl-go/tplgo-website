import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import PartnerModuleSection from "../_components/PartnerModuleSection";

export default function AdminPartnerApplicationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partners">
        <PartnerModuleSection section="applications" />
      </AdminShell>
    </AdminProtected>
  );
}
