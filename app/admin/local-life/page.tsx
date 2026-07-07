import AdminProtected from "../_components/AdminProtected";
import { AdminLocalLifeCenter } from "../_components/AdminLocalLifeCenter";
import AdminShell from "../_components/AdminShell";

export default function AdminLocalLifePage() {
  return (
    <AdminProtected>
      <AdminShell title="TPL Local Life">
        <AdminLocalLifeCenter />
      </AdminShell>
    </AdminProtected>
  );
}
