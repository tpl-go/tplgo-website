import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminContentOperationsCenter } from "../_components/AdminContentOperationsCenter";

export default function AdminContentPage() {
  return (
    <AdminProtected>
      <AdminShell title="Content">
        <AdminContentOperationsCenter />
      </AdminShell>
    </AdminProtected>
  );
}
