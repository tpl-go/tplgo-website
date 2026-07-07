import AdminProtected from "../_components/AdminProtected";
import { AdminCustomerCrmList } from "../_components/AdminCustomerCrm";
import AdminShell from "../_components/AdminShell";

export default function AdminCustomersPage() {
  return (
    <AdminProtected>
      <AdminShell title="Customers / CRM">
        <AdminCustomerCrmList />
      </AdminShell>
    </AdminProtected>
  );
}
