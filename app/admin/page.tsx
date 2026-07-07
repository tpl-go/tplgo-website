import AdminProtected from "./_components/AdminProtected";
import AdminShell from "./_components/AdminShell";
import { AdminDashboardView } from "./_components/AdminViews";

export default function AdminDashboardPage() {
  return (
    <AdminProtected>
      <AdminShell title="Dashboard">
        <AdminDashboardView />
      </AdminShell>
    </AdminProtected>
  );
}
