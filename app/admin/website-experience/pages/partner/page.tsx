import AdminProtected from "../../../_components/AdminProtected";
import AdminShell from "../../../_components/AdminShell";
import { AdminWebsiteExperienceLanding } from "../../../_components/AdminWebsiteExperienceLanding";

export default function AdminWebsiteExperiencePartnerPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Partner">
        <AdminWebsiteExperienceLanding view="partner" />
      </AdminShell>
    </AdminProtected>
  );
}
