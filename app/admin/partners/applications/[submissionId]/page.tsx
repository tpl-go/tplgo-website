import AdminProtected from "../../../_components/AdminProtected";
import AdminShell from "../../../_components/AdminShell";
import AdminPartnerApplicationsClient from "../AdminPartnerApplicationsClient";

export default async function AdminPartnerApplicationDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const resolved = await params;
  return (
    <AdminProtected>
      <AdminShell title="Partner Applications">
        <AdminPartnerApplicationsClient initialSubmissionId={resolved.submissionId} />
      </AdminShell>
    </AdminProtected>
  );
}
