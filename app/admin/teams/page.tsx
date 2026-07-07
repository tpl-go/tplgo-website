import AdminProtected from "../_components/AdminProtected";
import AdminShell from "../_components/AdminShell";
import { AdminTeamCenter } from "../_components/AdminTeamCenter";

export default function AdminTeamsPage() {
  return (
    <AdminProtected>
      <AdminShell title="Teams / RACI">
        <AdminTeamCenter />
      </AdminShell>
    </AdminProtected>
  );
}
