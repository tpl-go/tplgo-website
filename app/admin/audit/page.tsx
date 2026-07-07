import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminResourceView } from "../_components/AdminViews";

export default function AdminAuditPage() {
  return (
    <AdminProtected>
      <AdminShell title="Audit Events">
        <AdminResourceView title="Audit Events" path="/api/v1/admin/audit/events" columns={["action", "entityType", "entityId", "requestId", "createdAt"]} />
      </AdminShell>
    </AdminProtected>
  );
}
