import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminGatewayStatusWorkspace } from "../_components/AdminFinanceOperations";

export default function AdminGatewayStatusPage() {
  return (
    <AdminProtected>
      <AdminShell title="Gateway Status">
        <AdminGatewayStatusWorkspace />
      </AdminShell>
    </AdminProtected>
  );
}
