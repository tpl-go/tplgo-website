import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminNotificationCenter } from "../_components/AdminNotificationCenter";

export default function AdminNotificationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Notifications">
        <AdminNotificationCenter />
      </AdminShell>
    </AdminProtected>
  );
}
