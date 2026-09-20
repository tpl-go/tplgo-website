/** Versioned, allowlisted workspace response. Backend alone decides access. */
export type PartnerWorkspace = {
  contractVersion: 1;
  organization: { id:string; name:string; legalName:string; type:string; status:string; location:string; legacyActive:boolean };
  destination:string;
  application:{id:string;status:string;revision:number;reference:string;snapshotHash:string}|null;
  activation:{evidenceReady:boolean;policyConfigured:boolean;canExecute:false;blockers:Array<{code:string;label:string}>;planHash:string;policyVersion:string|null};
  services:Array<{code:string;label:string;domain:string;status:string;applicationApproved:boolean;published:boolean;capabilities:string[];operational:boolean;setupLabel:string}>;
  catalogue:{version:number|null;available:boolean};
  payout:{eligible:null;state:string};
  activity:Array<{label:string;at:string}>;
};
export function validWorkspace(value:unknown):value is PartnerWorkspace {
  const data=value as PartnerWorkspace|null;
  return !!data&&data.contractVersion===1&&typeof data.organization?.id==='string'&&typeof data.organization.name==='string'&&Array.isArray(data.services)&&Array.isArray(data.activation?.blockers)&&Array.isArray(data.activity);
}
