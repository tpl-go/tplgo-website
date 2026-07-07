import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminExecutiveIntelligenceCenter } from "../_components/AdminExecutiveIntelligenceCenter";

export default function AdminExecutivePage() {
  return (
    <AdminProtected>
      <AdminShell title="Executive Intelligence">
        <AdminExecutiveIntelligenceCenter />
      </AdminShell>
    </AdminProtected>
  );
}
