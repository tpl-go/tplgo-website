import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminSuppliersCenter } from "../_components/AdminSuppliersCenter";

export default function AdminSuppliersPage() {
  return (
    <AdminProtected>
      <AdminShell title="Suppliers">
        <AdminSuppliersCenter />
      </AdminShell>
    </AdminProtected>
  );
}
