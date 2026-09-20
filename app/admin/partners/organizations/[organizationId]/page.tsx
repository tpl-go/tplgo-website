import AdminProtected from "../../../_components/AdminProtected";
import AdminShell from "../../../_components/AdminShell";
import PartnerDetail from "./PartnerDetail";
export default async function Page({params}:{params:Promise<{organizationId:string}>}){const {organizationId}=await params;return <AdminProtected requiredPermissions={["partner_verification.read"]}><AdminShell title="Partners"><PartnerDetail organizationId={organizationId}/></AdminShell></AdminProtected>;}
