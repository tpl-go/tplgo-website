import AdminProtected from "../_components/AdminProtected";
import { AdminEnterpriseEcosystemCenter } from "../_components/AdminEnterpriseEcosystemCenter";
import AdminShell from "../_components/AdminShell";

export default function AdminEnterpriseEcosystemPage() {
  return (
    <AdminProtected>
      <AdminShell title="Enterprise Ecosystem">
        <AdminEnterpriseEcosystemCenter />
      </AdminShell>
    </AdminProtected>
  );
}
