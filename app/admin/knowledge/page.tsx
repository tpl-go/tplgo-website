import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminKnowledgeCenter } from "../_components/AdminKnowledgeCenter";

export default function AdminKnowledgePage() {
  return (
    <AdminProtected>
      <AdminShell title="Knowledge / Runbooks">
        <AdminKnowledgeCenter />
      </AdminShell>
    </AdminProtected>
  );
}
