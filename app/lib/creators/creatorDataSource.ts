export type CreatorDataSource="fixture"|"testing_api"|"fallback_fixture"|"unavailable"|"stale";
export type CreatorSourceMeta={source:CreatorDataSource;requestId?:string;message:string};
export function creatorSourceMeta(source:CreatorDataSource,requestId?:string):CreatorSourceMeta{return {source,requestId,message:source==="testing_api"?"Testing API":source==="fallback_fixture"?"API unavailable — showing preview data":source==="unavailable"?"Creator data is temporarily unavailable":source==="stale"?"Cached testing data":"Fixture Preview"};}
export function defaultCreatorReadSource():CreatorDataSource{return process.env.NEXT_PUBLIC_TPL_CREATOR_TEST_API_ENABLED==="true"&&process.env.NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG_API_ENABLED==="true"?"testing_api":"fixture";}
