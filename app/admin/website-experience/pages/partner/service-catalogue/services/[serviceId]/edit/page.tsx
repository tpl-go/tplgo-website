import AdminProtected from "@/app/admin/_components/AdminProtected";
import AdminShell from "@/app/admin/_components/AdminShell";
import { AdminPartnerServiceCatalogueServiceEditorClient } from "@/app/admin/partners/services/AdminPartnerServiceCatalogueServiceEditorClient";

export default async function AdminWebsiteExperiencePartnerServiceCatalogueEditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <AdminProtected requiredPermissions={["partner_service_catalogue.manage"]}>
      <AdminShell title="Edit Service">
        <AdminPartnerServiceCatalogueServiceEditorClient mode="edit" serviceId={decodeURIComponent(serviceId)} />
      </AdminShell>
    </AdminProtected>
  );
}
