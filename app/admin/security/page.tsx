import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminSecurityCommandCenter } from "../_components/AdminSecurityCommandCenter";

export default function AdminSecurityPage() {
  return (
    <AdminProtected>
      <AdminShell title="Security">
        <AdminSecurityCommandCenter />
      </AdminShell>
    </AdminProtected>
  );
}
