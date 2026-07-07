import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminPlatformControlCenter } from "../_components/AdminPlatformControlCenter";

export default function AdminPlatformPage() {
  return (
    <AdminProtected>
      <AdminShell title="Platform">
        <AdminPlatformControlCenter />
      </AdminShell>
    </AdminProtected>
  );
}
