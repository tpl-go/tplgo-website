import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { PartnerAdminReadModel } from "../_components/PartnerAdminReadModel";

export default function AdminPartnerServicesPage() {
  return (
    <AdminProtected>
      <AdminShell title="Partner Services">
        <PartnerAdminReadModel mode="services" />
      </AdminShell>
    </AdminProtected>
  );
}
