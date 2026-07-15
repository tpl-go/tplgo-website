const creatorSlugAliases:Record<string,string>={"aira":"aira-studio","aira-visuals":"aira-studio","aira_studio":"aira-studio","northlight":"northlight-motion","northlight-studio":"northlight-motion","noor":"noor-visuals","noor_visuals":"noor-visuals","routecraft":"routecraft-labs","route-craft-labs":"routecraft-labs"};
export function normalizeCreatorSlug(value:string){return decodeURIComponent(value).trim().toLowerCase().replace(/^@/,"").replace(/[\s_]+/g,"-").replace(/[^a-z0-9-]/g,"").replace(/-+/g,"-").replace(/^-|-$/g,"");}
export function canonicalCreatorSlug(value:string){const normalized=normalizeCreatorSlug(value);return creatorSlugAliases[normalized]??normalized;}
export function creatorProfileAliases(){return {...creatorSlugAliases};}
export function resolveKnownCreatorSlug(value:string,known:ReadonlySet<string>){const canonical=canonicalCreatorSlug(value);return known.has(canonical)?canonical:null;}
