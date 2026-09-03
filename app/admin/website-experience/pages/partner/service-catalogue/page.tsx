import Link from "next/link";
import AdminProtected from "../../../../_components/AdminProtected";
import AdminShell from "../../../../_components/AdminShell";
import { AdminBackButton } from "../../../../_components/AdminBackButton";
import { AdminPartnerServiceCatalogueClient } from "../../../../partners/services/AdminPartnerServiceCatalogueClient";

export default function AdminWebsiteExperiencePartnerServiceCataloguePage() {
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.read"]}>
      <AdminShell title="Service Catalogue">
        <div className="catalogueRouteChrome mb-4">
          <AdminBackButton href="/admin/website-experience/pages/partner" label="Back to Partner" />
        </div>
        <nav className="catalogueRouteChrome mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-300/15 bg-[#0b1628]/95 p-4 text-xs font-black text-slate-400 shadow-lg shadow-black/20" aria-label="Website Experience breadcrumbs">
          <Link href="/admin/website-experience" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            Website Experience
          </Link>
          <span aria-hidden="true" className="text-slate-600">&gt;</span>
          <Link href="/admin/website-experience/pages" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            Pages
          </Link>
          <span aria-hidden="true" className="text-slate-600">&gt;</span>
          <Link href="/admin/website-experience/pages/partner" className="rounded text-sky-200 hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-sky-300">
            Partner
          </Link>
          <span aria-hidden="true" className="text-slate-600">&gt;</span>
          <span aria-current="page" className="text-cyan-100">Service Catalogue</span>
        </nav>
        <AdminPartnerServiceCatalogueClient />
      </AdminShell>
    </AdminProtected>
  );
}
