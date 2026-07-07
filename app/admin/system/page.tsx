import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminSystemView } from "../_components/AdminViews";

export default function AdminSystemPage() {
  return (
    <AdminProtected>
      <AdminShell title="System Health">
        <AdminSystemView />
      </AdminShell>
    </AdminProtected>
  );
}
