import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminObservabilityCommandCenter } from "../_components/AdminObservabilityCommandCenter";

export default function AdminObservabilityPage() {
  return (
    <AdminProtected>
      <AdminShell title="Observability">
        <AdminObservabilityCommandCenter />
      </AdminShell>
    </AdminProtected>
  );
}
