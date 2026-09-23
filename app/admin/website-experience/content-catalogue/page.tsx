import AdminProtected from "../../_components/AdminProtected";
import AdminShell from "../../_components/AdminShell";
import {ContentGovernanceCatalogue} from "../../_components/ContentGovernanceCatalogue";

export default function ContentAttributeCataloguePage(){return <AdminProtected requiredPermissions={["website_experience.catalogue.read"]}><AdminShell title="Website Experience"><ContentGovernanceCatalogue/></AdminShell></AdminProtected>}
