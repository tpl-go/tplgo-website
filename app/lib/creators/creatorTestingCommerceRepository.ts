import { existsSync,mkdirSync,readFileSync,renameSync,writeFileSync } from "node:fs";
import { dirname,join } from "node:path";
import type { CreatorTestingCommerceRecord,CreatorTestingStoreData } from "./creatorEntitlementV1Types";
const path=process.env.TPL_CREATOR_TEST_STORE_PATH||join(process.cwd(),".tmp","creator-commerce-b21-store.json");
const empty=():CreatorTestingStoreData=>({version:"creator-testing-store.v1",records:[],updatedAt:new Date(0).toISOString()});
let memory=empty();
function read(){try{if(!existsSync(path))return memory;const data=JSON.parse(readFileSync(path,"utf8")) as CreatorTestingStoreData;if(data.version!=="creator-testing-store.v1"||!Array.isArray(data.records))throw new Error("INCOMPATIBLE_DTO");memory=data;return data;}catch{return memory;}}
function write(data:CreatorTestingStoreData){memory=data;try{mkdirSync(dirname(path),{recursive:true});const temp=`${path}.tmp`;writeFileSync(temp,JSON.stringify(data,null,2),{encoding:"utf8",mode:0o600});renameSync(temp,path);return "file_testing" as const;}catch{return "memory_fallback" as const;}}
export function readCreatorTestingStore(){return read();}
export function writeCreatorTestingStore(data:CreatorTestingStoreData){return write(data);}
export const creatorTestingCommerceRepository={
  save(record:CreatorTestingCommerceRecord){const data=read();const index=data.records.findIndex(item=>item.order.orderId===record.order.orderId);const records=[...data.records];if(index>=0)records[index]=record;else records.push(record);return {record,persistence:write({...data,records,updatedAt:new Date().toISOString()})};},
  list(buyerId:string){return read().records.filter(item=>item.order.buyerId===buyerId);},
  order(orderId:string,buyerId:string){return read().records.find(item=>item.order.orderId===orderId&&item.order.buyerId===buyerId)??null;},
  entitlement(entitlementId:string,buyerId:string){return read().records.find(item=>item.entitlement.entitlementId===entitlementId&&item.entitlement.buyerId===buyerId)??null;},
  byOrder(orderId:string){return read().records.find(item=>item.order.orderId===orderId)??null;},
};

