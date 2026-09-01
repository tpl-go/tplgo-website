import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminPartnerServiceCatalogueClient } from "./AdminPartnerServiceCatalogueClient";

export default function AdminPartnerServicesPage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.read"]}>
      <AdminShell title="Partner Service Catalogue">
        <AdminPartnerServiceCatalogueClient />
      </AdminShell>
    </AdminProtected>
  );
}
