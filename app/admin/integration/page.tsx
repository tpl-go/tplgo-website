import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminIntegrationHub } from "../_components/AdminIntegrationHub";

export default function AdminIntegrationPage() {
  return (
    <AdminProtected>
      <AdminShell title="Integration Hub">
        <AdminIntegrationHub />
      </AdminShell>
    </AdminProtected>
  );
}
