import AdminProtected from "../../../../../_components/AdminProtected";
import AdminShell from "../../../../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../../../../_components/WebsiteExperienceManager";

export default async function AdminWebsiteExperiencePartnerApplicationNodePage({
  params,
}: {
  params: Promise<{ node: string }>;
}) {
  const { node } = await params;
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Partner Application">
        <WebsiteExperienceManager mode="partner-application" partnerApplicationNodeId={node} />
      </AdminShell>
    </AdminProtected>
  );
}
