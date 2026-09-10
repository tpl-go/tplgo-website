import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminWebsiteExperienceVersionsAuditClient } from "../../_components/AdminWebsiteExperienceCentralizedQueues";

export default function AdminWebsiteExperienceVersionsAuditPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="History">
        <AdminWebsiteExperienceVersionsAuditClient />
      </AdminShell>
    </AdminProtected>
  );
}
