import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminCreatorsCenter } from "../_components/AdminCreatorsCenter";

export default function AdminCreatorsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Creators">
        <AdminCreatorsCenter />
      </AdminShell>
    </AdminProtected>
  );
}
