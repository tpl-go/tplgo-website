import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminRefundsWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminRefundsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Refunds">
        <AdminRefundsWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
