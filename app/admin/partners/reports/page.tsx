import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import PartnerModuleSection from "../_components/PartnerModuleSection";

export default function PartnerReportsPage() {
  return <AdminProtected><AdminShell title="Partners"><PartnerModuleSection section="reports" /></AdminShell></AdminProtected>;
}
