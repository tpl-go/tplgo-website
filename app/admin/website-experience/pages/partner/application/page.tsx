import AdminProtected from "../../../../_components/AdminProtected";
import AdminShell from "../../../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../../../_components/WebsiteExperienceManager";

export default function AdminWebsiteExperiencePartnerApplicationPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Partner Application">
        <WebsiteExperienceManager mode="partner-application" />
      </AdminShell>
    </AdminProtected>
  );
}
