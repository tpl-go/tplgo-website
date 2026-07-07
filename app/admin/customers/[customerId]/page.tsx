import AdminProtected from "../../_components/AdminProtected";
import { AdminCustomerWorkspace } from "../../_components/AdminCustomerCrm";
import AdminShell from "../../_components/AdminShell";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return (
    <AdminProtected>
      <AdminShell title="Customer Workspace">
        <AdminCustomerWorkspace customerId={customerId} />
      </AdminShell>
    </AdminProtected>
  );
}
