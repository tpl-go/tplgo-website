import AdminProtected from "../../../../../../_components/AdminProtected";
import AdminShell from "../../../../../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../../../../../_components/WebsiteExperienceManager";
import { redirect } from "next/navigation";

export default async function AdminWebsiteExperiencePartnerApplicationUnitPage({
  params,
}: {
  params: Promise<{ node: string; unit: string }>;
}) {
  const { node, unit } = await params;
  if (node === "step-7-partner-agreement" && unit === "status-messages") {
    redirect(`/admin/website-experience/pages/partner/application/${node}/agreement-status-messages`);
  }
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Partner Application">
        <WebsiteExperienceManager mode="partner-application" partnerApplicationNodeId={node} partnerApplicationUnitId={unit} />
      </AdminShell>
    </AdminProtected>
  );
}
