import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { PartnerAdminReadModel } from "../_components/PartnerAdminReadModel";

export default function AdminPartnerDocumentsCompliancePage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Documents & Compliance">
        <PartnerAdminReadModel mode="documents" />
      </AdminShell>
    </AdminProtected>
  );
}
