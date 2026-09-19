import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import { PartnerAvailability } from "../_components/PartnerOverview";

export default function ActivePartnersPage() {
  return <AdminProtected requiredPermissions={["partner_verification.read"]}><AdminShell title="Active Partners"><PartnerAvailability activeOnly /></AdminShell></AdminProtected>;
}
