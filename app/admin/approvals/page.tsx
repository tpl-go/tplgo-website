import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminApprovalCenter } from "../_components/AdminApprovalCenter";

export default function AdminApprovalsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Approval / Governance">
        <AdminApprovalCenter />
      </AdminShell>
    </AdminProtected>
  );
}
