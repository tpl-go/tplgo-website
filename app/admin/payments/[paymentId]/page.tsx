import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminPaymentDetailWorkspace } from "../../_components/AdminFinanceOperations";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  return (
    <AdminProtected>
      <AdminShell title="Payment Detail">
        <AdminPaymentDetailWorkspace paymentId={paymentId} />
      </AdminShell>
    </AdminProtected>
  );
}
