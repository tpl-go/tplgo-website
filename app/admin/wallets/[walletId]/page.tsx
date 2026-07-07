import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { AdminWalletDetailWorkspace } from "../../_components/AdminFinanceOperations";

export default async function AdminWalletDetailPage({
  params,
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  return (
    <AdminProtected>
      <AdminShell title="Wallet Detail">
        <AdminWalletDetailWorkspace walletId={walletId} />
      </AdminShell>
    </AdminProtected>
  );
}
