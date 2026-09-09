import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminWebsiteExperienceLanding } from "../../_components/AdminWebsiteExperienceLanding";

export default function AdminWebsiteExperiencePagesPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Website Experience">
        <AdminWebsiteExperienceLanding view="pages" />
      </AdminShell>
    </AdminProtected>
  );
}
