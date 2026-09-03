import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminWebsiteExperienceServiceRequestsClient } from "../../_components/AdminWebsiteExperienceCentralizedQueues";

export default function AdminWebsiteExperienceServiceRequestsPage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.read"]}>
      <AdminShell title="Service Requests">
        <AdminWebsiteExperienceServiceRequestsClient />
      </AdminShell>
    </AdminProtected>
  );
}
