import AdminProtected from "../../../../_components/AdminProtected";
import AdminShell from "../../../../_components/AdminShell";
import { AdminPartnerServiceCatalogueClient } from "../../../../partners/services/AdminPartnerServiceCatalogueClient";

export default function AdminWebsiteExperiencePartnerServiceCataloguePage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.read"]}>
      <AdminShell title="Website Experience">
        <AdminPartnerServiceCatalogueClient />
      </AdminShell>
    </AdminProtected>
  );
}
