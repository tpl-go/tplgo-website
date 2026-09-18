"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { loadProfileLocations, type ProfileLocationOption } from "@/app/lib/account/profileLocations";

type LoadState = "idle" | "loading" | "ready" | "error";
type LocationSet = { key: string; options: ProfileLocationOption[]; status: LoadState };

export function ProfileLocationFields({ country, region, city, disabled, onCountry, onRegion, onCity }: { country:string;region:string;city:string;disabled?:boolean;onCountry:(v:string)=>void;onRegion:(v:string)=>void;onCity:(v:string)=>void }) {
  const [countrySet,setCountrySet]=useState<LocationSet>({key:"countries",options:[],status:"loading"});
  const [regionSet,setRegionSet]=useState<LocationSet>({key:"",options:[],status:"idle"});
  const [citySet,setCitySet]=useState<LocationSet>({key:"",options:[],status:"idle"});
  const [countryRetry,setCountryRetry]=useState(0),[regionRetry,setRegionRetry]=useState(0),[cityRetry,setCityRetry]=useState(0);

  useEffect(()=>{let active=true;loadProfileLocations("countries").then(result=>{if(active)setCountrySet({key:"countries",options:result.options,status:"ready"});}).catch(()=>{if(active)setCountrySet(previous=>({...previous,status:"error"}));});return()=>{active=false;};},[countryRetry]);
  useEffect(()=>{let active=true;if(!country)return()=>{active=false;};loadProfileLocations("regions",country).then(result=>{if(active)setRegionSet({key:country,options:result.options,status:"ready"});}).catch(()=>{if(active)setRegionSet({key:country,options:[],status:"error"});});return()=>{active=false;};},[country,regionRetry]);
  useEffect(()=>{let active=true;const key=`${country}\u0000${region}`;if(!country||!region)return()=>{active=false;};loadProfileLocations("cities",country,region).then(result=>{if(active)setCitySet({key,options:result.options,status:"ready"});}).catch(()=>{if(active)setCitySet({key,options:[],status:"error"});});return()=>{active=false;};},[country,region,cityRetry]);

  const regionOptions=regionSet.key===country?regionSet.options:[];
  const cityKey=`${country}\u0000${region}`;
  const cityOptions=citySet.key===cityKey?citySet.options:[];
  const chooseRegion=async(next:string)=>{if(next===region)return;onRegion(next);if(!next||!city)return;try{const result=await loadProfileLocations("cities",country,next);if(result.options.length&&!result.options.some(option=>option.value.localeCompare(city,undefined,{sensitivity:"accent"})===0))onCity("");}catch{/* Keep a readable saved city when compatibility cannot be established. */}};

  return <>
    <SearchableLocation label="COUNTRY" value={country} options={countrySet.options} status={countrySet.status} disabled={disabled} allowManual pattern={/^[A-Z]{2}$/} manualTransform={value=>value.trim().toUpperCase()} empty="Country not listed? Enter its two-letter country code." loading="Loading countries…" error="Countries are temporarily unavailable." onRetry={()=>{setCountrySet(previous=>({...previous,status:"loading"}));setCountryRetry(value=>value+1);}} onChange={next=>{if(next!==country)onCountry(next);}} />
    <SearchableLocation label="STATE / REGION" value={region} options={regionOptions} status={!country?"idle":regionSet.key===country?regionSet.status:"loading"} disabled={disabled||!country} allowManual empty={country?"Not listed? Enter the state or region name.":"Choose a country first."} loading="Loading states and regions…" error="States and regions are temporarily unavailable." onRetry={()=>{setRegionSet({key:country,options:[],status:"loading"});setRegionRetry(value=>value+1);}} onChange={next=>{void chooseRegion(next);}} />
    <SearchableLocation label="CITY" value={city} options={cityOptions} status={!country||!region?"idle":citySet.key===cityKey?citySet.status:"loading"} disabled={disabled||!country||!region} allowManual empty={region?"Not listed? Enter the city name.":"Choose a state or region first."} loading="Loading cities…" error="Cities are temporarily unavailable." onRetry={()=>{setCitySet({key:cityKey,options:[],status:"loading"});setCityRetry(value=>value+1);}} onChange={onCity} />
  </>;
}

function SearchableLocation({label,value,options,status,onChange,onRetry,disabled,allowManual=false,empty,loading,error,pattern,manualTransform}: {label:string;value:string;options:ProfileLocationOption[];status:LoadState;onChange:(v:string)=>void;onRetry:()=>void;disabled?:boolean;allowManual?:boolean;empty:string;loading:string;error:string;pattern?:RegExp;manualTransform?:(v:string)=>string}) {
  const [open,setOpen]=useState(false),[query,setQuery]=useState(""),[activeIndex,setActiveIndex]=useState(-1);
  const [position,setPosition]=useState({left:0,top:0,width:0,maxHeight:288});
  const trigger=useRef<HTMLButtonElement>(null),input=useRef<HTMLInputElement>(null),popup=useRef<HTMLDivElement>(null);
  const uid=useId(),optionId=`profile-location-${uid}-options`,labelId=`profile-location-${uid}-label`;
  const selected=options.find(option=>option.value===value);
  const filtered=useMemo(()=>{const normalized=query.trim().toLocaleLowerCase();return normalized?options.filter(option=>`${option.label} ${option.value} ${option.detail??""}`.toLocaleLowerCase().includes(normalized)):options;},[options,query]);
  const manual=(manualTransform??((next:string)=>next.trim()))(query);
  const canManual=allowManual&&!!manual&&(!pattern||pattern.test(manual))&&!options.some(option=>option.value.toLocaleLowerCase()===manual.toLocaleLowerCase());
  const availableValues=useMemo(()=>[...(canManual?[manual]:[]),...filtered.map(option=>option.value)],[canManual,manual,filtered]);
  const close=useCallback((restore=true)=>{setOpen(false);setQuery("");setActiveIndex(-1);if(restore)queueMicrotask(()=>trigger.current?.focus());},[]);
  const choose=useCallback((next:string)=>{onChange(next);close();},[close,onChange]);
  const updatePosition=useCallback(()=>{const rect=trigger.current?.getBoundingClientRect();if(!rect)return;const gutter=12;const width=Math.min(rect.width,window.innerWidth-gutter*2);const left=Math.max(gutter,Math.min(rect.left,window.innerWidth-width-gutter));const top=rect.bottom+6;setPosition({left,top,width,maxHeight:Math.max(144,Math.min(320,window.innerHeight-top-gutter))});},[]);

  useEffect(()=>{if(!open)return;const frame=window.requestAnimationFrame(()=>{updatePosition();input.current?.focus();});const pointer=(event:PointerEvent)=>{const node=event.target as Node;if(!popup.current?.contains(node)&&!trigger.current?.contains(node))close(false);};const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();close();}};window.addEventListener("resize",updatePosition);window.addEventListener("scroll",updatePosition,true);document.addEventListener("pointerdown",pointer);document.addEventListener("keydown",key);return()=>{window.cancelAnimationFrame(frame);window.removeEventListener("resize",updatePosition);window.removeEventListener("scroll",updatePosition,true);document.removeEventListener("pointerdown",pointer);document.removeEventListener("keydown",key);};},[close,open,updatePosition]);

  const handleSearchKey=(event:React.KeyboardEvent<HTMLInputElement>)=>{if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();setActiveIndex(current=>{if(!availableValues.length)return -1;if(current<0)return event.key==="ArrowDown"?0:availableValues.length-1;const delta=event.key==="ArrowDown"?1:-1;return (current+delta+availableValues.length)%availableValues.length;});}else if(event.key==="Enter"&&activeIndex>=0){event.preventDefault();choose(availableValues[activeIndex]!);}};
  const popupNode=open&&typeof document!=="undefined"?createPortal(<div ref={popup} role="dialog" aria-label={`${label} options`} className="fixed z-[120] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" style={{left:position.left,top:position.top,width:position.width,maxHeight:position.maxHeight}}>
    <div className="border-b border-slate-100 p-2"><input ref={input} value={query} onChange={event=>{setQuery(event.target.value);setActiveIndex(-1);}} onKeyDown={handleSearchKey} placeholder={`Search ${label.toLocaleLowerCase()}`} aria-label={`Search ${label}`} aria-controls={optionId} aria-activedescendant={activeIndex>=0?`${optionId}-${activeIndex}`:undefined} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
    <div id={optionId} role="listbox" aria-labelledby={labelId} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
      {status==="loading"?<p role="status" className="px-3 py-4 text-sm text-slate-600">{loading}</p>:null}
      {status==="error"?<div className="px-3 py-4 text-sm text-amber-800"><p>{error}</p><button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-amber-300 px-3 py-2 font-semibold hover:bg-amber-50">Retry</button></div>:null}
      {status!=="loading"&&status!=="error"&&canManual?<button id={`${optionId}-0`} role="option" aria-selected={manual===value} type="button" onMouseEnter={()=>setActiveIndex(0)} onClick={()=>choose(manual)} className={`block min-h-11 w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-blue-700 ${activeIndex===0?"bg-blue-50":""}`}>Use “{manual}” <span className="text-xs font-normal text-slate-500">· Not listed</span></button>:null}
      {status!=="loading"&&status!=="error"&&filtered.map((option,index)=>{const rowIndex=index+(canManual?1:0);return <button id={`${optionId}-${rowIndex}`} role="option" aria-selected={option.value===value} key={`${option.value}-${option.label}`} type="button" onMouseEnter={()=>setActiveIndex(rowIndex)} onClick={()=>choose(option.value)} className={`flex min-h-11 w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-blue-50 ${activeIndex===rowIndex?"bg-blue-50":""}`}><span className="min-w-0 truncate font-medium text-slate-900">{option.label}</span><span className="shrink-0 text-xs text-slate-500">{option.detail??(option.value!==option.label?option.value:"")}</span></button>;})}
      {status!=="loading"&&status!=="error"&&!filtered.length&&!canManual?<p className="px-3 py-4 text-sm text-slate-600">{empty}</p>:null}
    </div>
    {value?<button type="button" onClick={()=>choose("")} className="min-h-11 border-t border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear selection</button>:null}
  </div>,document.body):null;

  return <div className="min-w-0"><span id={labelId} className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span><button ref={trigger} type="button" disabled={disabled} aria-labelledby={labelId} aria-haspopup="dialog" aria-expanded={open} aria-controls={optionId} onClick={()=>setOpen(current=>!current)} onKeyDown={event=>{if(event.key==="ArrowDown"||event.key==="Enter"||event.key===" "){event.preventDefault();setOpen(true);}}} className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-4 text-left text-sm font-medium text-slate-900 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"><span className="min-w-0 truncate">{(selected?.label??value)||"Select"}</span><span aria-hidden className="shrink-0">⌄</span></button>{popupNode}</div>;
}
