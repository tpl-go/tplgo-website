import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminSearchCenter } from "../_components/AdminSearchCenter";

export default function AdminSearchPage() {
  return (
    <AdminProtected>
      <AdminShell title="Enterprise Search">
        <AdminSearchCenter />
      </AdminShell>
    </AdminProtected>
  );
}
