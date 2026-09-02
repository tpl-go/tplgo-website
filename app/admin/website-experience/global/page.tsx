import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminWebsiteExperienceLanding } from "../../_components/AdminWebsiteExperienceLanding";

export default function AdminWebsiteExperienceGlobalPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Global Experience">
        <AdminWebsiteExperienceLanding view="global" />
      </AdminShell>
    </AdminProtected>
  );
}
