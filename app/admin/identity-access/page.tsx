import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminIdentityAccessCenter } from "../_components/AdminIdentityAccessCenter";

export default function AdminIdentityAccessPage() {
  return (
    <AdminProtected requiredPermissions={["auth_activity.read"]}>
      <AdminShell title="Identity & Access">
        <AdminIdentityAccessCenter />
      </AdminShell>
    </AdminProtected>
  );
}
