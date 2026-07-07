import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminReconciliationWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminReconciliationPage() {
  return (
    <AdminProtected>
      <AdminShell title="Reconciliation">
        <AdminReconciliationWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
