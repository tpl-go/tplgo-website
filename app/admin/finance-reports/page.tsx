import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminFinanceReportsWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminFinanceReportsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Finance Reports">
        <AdminFinanceReportsWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
