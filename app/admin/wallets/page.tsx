import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminWalletsWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminWalletsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Wallets">
        <AdminWalletsWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
