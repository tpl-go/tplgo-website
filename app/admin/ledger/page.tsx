import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminLedgerWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminLedgerPage() {
  return (
    <AdminProtected>
      <AdminShell title="Ledger">
        <AdminLedgerWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
