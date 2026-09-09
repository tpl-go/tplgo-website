import AdminProtected from "../../../../../../../_components/AdminProtected";
import AdminShell from "../../../../../../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../../../../../../_components/WebsiteExperienceManager";

export default async function AdminWebsiteExperiencePartnerApplicationTemplatePage({
  params,
}: {
  params: Promise<{ node: string; unit: string; templateId: string }>;
}) {
  const { node, unit, templateId } = await params;
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Website Experience">
        <WebsiteExperienceManager
          mode="partner-application"
          partnerApplicationNodeId={node}
          partnerApplicationUnitId={unit}
          partnerAgreementTemplateId={templateId}
        />
      </AdminShell>
    </AdminProtected>
  );
}
