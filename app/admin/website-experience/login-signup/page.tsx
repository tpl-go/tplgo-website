import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../_components/WebsiteExperienceManager";

export default function AdminWebsiteExperienceLoginSignupPage() {
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Login & Signup">
        <WebsiteExperienceManager />
      </AdminShell>
    </AdminProtected>
  );
}
