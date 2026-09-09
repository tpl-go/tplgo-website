import AdminProtected from "../../../../../_components/AdminProtected";
import AdminShell from "../../../../../_components/AdminShell";
import { WebsiteExperienceManager } from "../../../../../_components/WebsiteExperienceManager";
import { redirect } from "next/navigation";

export default async function AdminWebsiteExperiencePartnerApplicationNodePage({
  params,
  searchParams,
}: {
  params: Promise<{ node: string }>;
  searchParams: Promise<{ unit?: string }>;
}) {
  const { node } = await params;
  const { unit } = await searchParams;
  if (node === "step-7-partner-agreement" && unit) {
    redirect(`/admin/website-experience/pages/partner/application/${node}/${unit}`);
  }
  return (
    <AdminProtected requiredPermissions={["content.read"]}>
      <AdminShell title="Website Experience">
        <WebsiteExperienceManager mode="partner-application" partnerApplicationNodeId={node} />
      </AdminShell>
    </AdminProtected>
  );
}
