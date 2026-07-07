import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminAiOperationsCenter } from "../_components/AdminAiOperationsCenter";

export default function AdminAiPage() {
  return (
    <AdminProtected>
      <AdminShell title="AI Operations">
        <AdminAiOperationsCenter />
      </AdminShell>
    </AdminProtected>
  );
}
