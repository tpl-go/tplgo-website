import AdminProtected from "@/app/admin/_components/AdminProtected";
import AdminShell from "@/app/admin/_components/AdminShell";
import { AdminPartnerServiceCatalogueServiceEditorClient } from "@/app/admin/partners/services/AdminPartnerServiceCatalogueServiceEditorClient";

export default async function AdminWebsiteExperiencePartnerServiceCatalogueAddServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ domainId: string }>;
  searchParams: Promise<{ parent?: string }>;
}) {
  const { domainId } = await params;
  const { parent } = await searchParams;
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.manage"]}>
      <AdminShell title="Add Service">
        <AdminPartnerServiceCatalogueServiceEditorClient mode="new" domainId={decodeURIComponent(domainId)} parentCode={parent ? decodeURIComponent(parent) : undefined} />
      </AdminShell>
    </AdminProtected>
  );
}
