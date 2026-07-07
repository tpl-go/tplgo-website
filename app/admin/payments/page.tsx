import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminPaymentsWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminPaymentsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Payments">
        <AdminPaymentsWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
