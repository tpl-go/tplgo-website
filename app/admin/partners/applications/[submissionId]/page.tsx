import AdminProtected from "../../../_components/AdminProtected";
import AdminShell from "../../../_components/AdminShell";
import ApplicationReviewClient from "../ApplicationReviewClient";

export default async function AdminPartnerApplicationDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const resolved = await params;
  return (
    <AdminProtected>
      <AdminShell title="Partner Applications">
        <ApplicationReviewClient submissionId={resolved.submissionId} />
      </AdminShell>
    </AdminProtected>
  );
}
