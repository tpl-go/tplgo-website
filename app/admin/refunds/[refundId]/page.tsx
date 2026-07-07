import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminRefundDetailWorkspace } from "../../_components/AdminFinanceOperations";

export default async function AdminRefundDetailPage({
  params,
}: {
  params: Promise<{ refundId: string }>;
}) {
  const { refundId } = await params;
  return (
    <AdminProtected>
      <AdminShell title="Refund Detail">
        <AdminRefundDetailWorkspace refundId={refundId} />
      </AdminShell>
    </AdminProtected>
  );
}
