import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminCommunicationsCenter } from "../_components/AdminCommunicationsCenter";

export default function AdminCommunicationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Communications">
        <AdminCommunicationsCenter />
      </AdminShell>
    </AdminProtected>
  );
}
