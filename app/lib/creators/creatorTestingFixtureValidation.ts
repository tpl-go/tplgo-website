import { createHash } from "node:crypto";

export type TestingFixtureKind="png"|"mp4"|"zip"|"xmp"|"pdf"|"text";
export type TestingFixturePolicy={kind:TestingFixtureKind;extension:string;contentType:string;maxBytes:number;checksum:string};
export type TestingFixtureValidation={ok:boolean;code?:"FIXTURE_TOO_LARGE"|"CHECKSUM_MISMATCH"|"MIME_MISMATCH"|"UNSAFE_SIGNATURE"|"MALFORMED_ARCHIVE";message:string};

const sha=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const ascii=(bytes:Uint8Array,start:number,length:number)=>Buffer.from(bytes.slice(start,start+length)).toString("ascii");
const unsafeArchiveName=(name:string)=>name.includes("..")||name.startsWith("/")||name.startsWith("\\")||/^[a-zA-Z]:/.test(name)||name.split(/[\\/]/).some(part=>!part||part===".");
const forbiddenArchiveEntry=(name:string)=>/\.(exe|dll|com|bat|cmd|ps1|msi|scr|jar|js|vbs|docm|xlsm|pptm)$/i.test(name)||/\.(zip|rar|7z|tar|gz)$/i.test(name);

export function validateTestingArchive(bytes:Uint8Array):TestingFixtureValidation{
  let offset=0,entries=0,expanded=0,compressed=0;
  while(offset+30<=bytes.length&&bytes[offset]===0x50&&bytes[offset+1]===0x4b&&bytes[offset+2]===0x03&&bytes[offset+3]===0x04){
    const view=new DataView(bytes.buffer,bytes.byteOffset+offset);
    const compressedSize=view.getUint32(18,true),uncompressedSize=view.getUint32(22,true),nameLength=view.getUint16(26,true),extraLength=view.getUint16(28,true);
    const name=Buffer.from(bytes.slice(offset+30,offset+30+nameLength)).toString("utf8");
    entries++;expanded+=uncompressedSize;compressed+=compressedSize;
    if(entries>32||expanded>2_000_000||(compressed>0&&expanded/compressed>50)||unsafeArchiveName(name)||forbiddenArchiveEntry(name))return {ok:false,code:"MALFORMED_ARCHIVE",message:"Testing archive violates the bounded safe-package policy."};
    offset+=30+nameLength+extraLength+compressedSize;
  }
  return entries>0?{ok:true,message:"Safe bounded testing archive."}:{ok:false,code:"MALFORMED_ARCHIVE",message:"Testing archive has no valid local entries."};
}

export function validateTestingFixture(bytes:Uint8Array,fileName:string,contentType:string,policy:TestingFixturePolicy):TestingFixtureValidation{
  if(bytes.byteLength>policy.maxBytes)return {ok:false,code:"FIXTURE_TOO_LARGE",message:"Testing fixture exceeds its allowlisted size."};
  if(!fileName.toLowerCase().endsWith(policy.extension)||contentType!==policy.contentType)return {ok:false,code:"MIME_MISMATCH",message:"Testing fixture extension and MIME do not match the registry."};
  if(sha(bytes)!==policy.checksum)return {ok:false,code:"CHECKSUM_MISMATCH",message:"Testing fixture checksum does not match the registry."};
  const valid=policy.kind==="png"?(bytes[0]===0x89&&ascii(bytes,1,3)==="PNG"):
    policy.kind==="mp4"?(ascii(bytes,4,4)==="ftyp"):
    policy.kind==="pdf"?(ascii(bytes,0,5)==="%PDF-"&&!Buffer.from(bytes).toString("latin1").match(/\/JavaScript|\/JS\b/i)):
    policy.kind==="zip"?(bytes[0]===0x50&&bytes[1]===0x4b):
    policy.kind==="xmp"?(Buffer.from(bytes).toString("utf8").startsWith("<?xpacket")&&!Buffer.from(bytes).toString("utf8").match(/<script|<!ENTITY/i)):
    policy.kind==="text"&&!Buffer.from(bytes).toString("utf8").match(/<script|<html/i);
  if(!valid)return {ok:false,code:"UNSAFE_SIGNATURE",message:"Testing fixture magic bytes or safe-content policy failed."};
  return policy.kind==="zip"?validateTestingArchive(bytes):{ok:true,message:"Testing fixture signature and checksum verified."};
}
