import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminDataGovernanceCenter } from "../_components/AdminDataGovernanceCenter";

export default function AdminDataGovernancePage() {
  return (
    <AdminProtected>
      <AdminShell title="Data Governance">
        <AdminDataGovernanceCenter />
      </AdminShell>
    </AdminProtected>
  );
}
