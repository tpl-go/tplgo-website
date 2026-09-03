import AdminProtected from "../../../../../../../_components/AdminProtected";
import AdminShell from "../../../../../../../_components/AdminShell";
import { AdminPartnerServiceCatalogueDomainEditorClient } from "../../../../../../../partners/services/AdminPartnerServiceCatalogueDomainEditorClient";

export default async function AdminWebsiteExperiencePartnerServiceCatalogueEditDomainPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.manage"]}>
      <AdminShell title="Edit Domain">
        <AdminPartnerServiceCatalogueDomainEditorClient mode="edit" domainId={decodeURIComponent(domainId)} />
      </AdminShell>
    </AdminProtected>
  );
}
