"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createTplRequestId, getStoredAuthToken, getTplApiBaseUrl, tplApiRequest } from "@/app/lib/api/tplApiClient";

export type ProfilePhoto = { version:number;thumbnailUrl:string;displayUrl:string;updatedAt:string;expiresAt:string };

export const PROFILE_PHOTO_UPDATED_EVENT="tpl-profile-photo-updated";
export const PROFILE_PHOTO_ACCEPTED_TYPES=["image/jpeg","image/png","image/webp"] as const;
export const PROFILE_PHOTO_MAX_BYTES=5_000_000;

export function useCanonicalProfilePhoto(){
  const [photo,setPhoto]=useState<ProfilePhoto|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const request=useRef(0);
  const load=useCallback(async()=>{
    const current=++request.current;
    try{
      const response=await tplApiRequest<{photo:ProfilePhoto|null}>("/api/v1/me/profile/photo",{authToken:getStoredAuthToken(),fallbackOnError:false});
      if(current!==request.current)return;
      if(response.ok){setPhoto(response.data.photo);setStatus("ready");}
      else{setPhoto(null);setStatus("error");}
    }catch{
      if(current===request.current){setPhoto(null);setStatus("error");}
    }
  },[]);
  const reload=useCallback(async()=>{setStatus("loading");await load();},[load]);
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),0);const changed=()=>void reload();window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT,changed);return()=>{request.current+=1;window.clearTimeout(timer);window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT,changed);};},[load,reload]);
  return{photo,status,reload};
}

export async function uploadProfilePhoto(file:File,onProgress:(value:number)=>void){
  if(!PROFILE_PHOTO_ACCEPTED_TYPES.includes(file.type as typeof PROFILE_PHOTO_ACCEPTED_TYPES[number]))throw new Error("Choose a JPEG, PNG or WebP image.");
  if(file.size<1||file.size>PROFILE_PHOTO_MAX_BYTES)throw new Error("Choose an image smaller than 5 MB.");
  const baseUrl=getTplApiBaseUrl();
  if(!baseUrl)throw new Error("Photo updates are temporarily unavailable. Please try again later.");
  const photo=await new Promise<ProfilePhoto>((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open("PUT",`${baseUrl}/api/v1/me/profile/photo`);
    xhr.withCredentials=true;
    xhr.setRequestHeader("Accept","application/json");
    xhr.setRequestHeader("Content-Type",file.type);
    xhr.setRequestHeader("X-Request-Id",createTplRequestId("profile_photo"));
    const token=getStoredAuthToken();if(token)xhr.setRequestHeader("Authorization",`Bearer ${token}`);
    xhr.upload.onprogress=event=>event.lengthComputable&&onProgress(Math.round(event.loaded/event.total*100));
    xhr.onload=()=>{try{const payload=JSON.parse(xhr.responseText) as {ok?:boolean;data?:{photo?:ProfilePhoto};error?:{message?:string}};if(xhr.status>=200&&xhr.status<300&&payload.ok===true&&payload.data?.photo)return resolve(payload.data.photo);reject(new Error(payload.error?.message||"Your photo could not be uploaded. Please try again."));}catch{reject(new Error("Your photo could not be uploaded. Please try again."));}};
    xhr.onerror=()=>reject(new Error("Your photo could not be uploaded. Please try again."));
    xhr.send(file);
  });
  window.dispatchEvent(new Event(PROFILE_PHOTO_UPDATED_EVENT));
  return photo;
}

export async function removeProfilePhoto(){
  const response=await tplApiRequest<{removed:boolean}>("/api/v1/me/profile/photo",{method:"DELETE",authToken:getStoredAuthToken(),fallbackOnError:false});
  if(!response.ok)throw new Error(response.error.message);
  window.dispatchEvent(new Event(PROFILE_PHOTO_UPDATED_EVENT));
}
