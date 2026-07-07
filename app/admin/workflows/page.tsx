import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminWorkflowCenter } from "../_components/AdminWorkflowCenter";

export default function AdminWorkflowsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Workflows">
        <AdminWorkflowCenter />
      </AdminShell>
    </AdminProtected>
  );
}
