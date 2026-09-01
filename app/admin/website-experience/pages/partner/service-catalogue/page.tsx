import AdminProtected from "../../../../_components/AdminProtected";
import AdminShell from "../../../../_components/AdminShell";
import { AdminPartnerServiceCatalogueClient } from "../../../../partners/services/AdminPartnerServiceCatalogueClient";

export default function AdminWebsiteExperiencePartnerServiceCataloguePage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.read"]}>
      <AdminShell title="Service Catalogue">
        <div className="mb-4 rounded-2xl border border-sky-300/15 bg-[#0b1628]/95 p-4 text-sm font-semibold text-slate-300 shadow-lg shadow-black/20">
          <span className="text-slate-500">Website Experience &gt; Pages &gt; Partner &gt; </span>
          <span className="text-cyan-100">Service Catalogue</span>
        </div>
        <AdminPartnerServiceCatalogueClient />
      </AdminShell>
    </AdminProtected>
  );
}
