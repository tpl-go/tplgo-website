import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminSettlementWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminSettlementPage() {
  return (
    <AdminProtected>
      <AdminShell title="Settlement">
        <AdminSettlementWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
