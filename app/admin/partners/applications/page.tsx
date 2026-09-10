import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import AdminPartnerApplicationsClient from "./AdminPartnerApplicationsClient";

export default function AdminPartnerApplicationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Applications">
        <AdminPartnerApplicationsClient />
      </AdminShell>
    </AdminProtected>
  );
}
