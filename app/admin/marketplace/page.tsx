import AdminProtected from "../_components/AdminProtected";
import { AdminTplMarketplaceCenter } from "../_components/AdminTplMarketplaceCenter";
import AdminShell from "../_components/AdminShell";

export default function AdminTplMarketplacePage() {
  return (
    <AdminProtected>
      <AdminShell title="TPL Marketplace">
        <AdminTplMarketplaceCenter />
      </AdminShell>
    </AdminProtected>
  );
}
