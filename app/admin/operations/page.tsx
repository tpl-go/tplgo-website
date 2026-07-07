import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminOperationsIntelligenceCenter } from "../_components/AdminOperationsIntelligence";

export default function AdminOperationsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Operations Intelligence">
        <AdminOperationsIntelligenceCenter />
      </AdminShell>
    </AdminProtected>
  );
}
