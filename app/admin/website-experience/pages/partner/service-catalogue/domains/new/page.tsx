import AdminProtected from "../../../../../../_components/AdminProtected";
import AdminShell from "../../../../../../_components/AdminShell";
import { AdminPartnerServiceCatalogueDomainEditorClient } from "../../../../../../partners/services/AdminPartnerServiceCatalogueDomainEditorClient";

export default function AdminWebsiteExperiencePartnerServiceCatalogueAddDomainPage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.manage"]}>
      <AdminShell title="Add Domain">
        <AdminPartnerServiceCatalogueDomainEditorClient mode="new" />
      </AdminShell>
    </AdminProtected>
  );
}
