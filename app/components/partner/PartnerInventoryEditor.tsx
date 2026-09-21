"use client";
import {useEffect,useMemo,useState} from 'react';
import {emptyPartnerInventoryDraft,validatePartnerInventoryDraft,type PartnerInventoryDraft} from '@/app/lib/partner/partnerInventoryDraft';
import type {PartnerSupply} from '@/app/lib/partner/partnerSupply';
import styles from './PartnerCommandCenter.module.css';

type Props={data:PartnerSupply;admin:boolean;busy:boolean;save:(body:Record<string,unknown>)=>Promise<void>;refresh:()=>Promise<void>;onDirtyChange?:(dirty:boolean)=>void};

export default function PartnerInventoryEditor({data,admin,busy,save,refresh,onDirtyChange}:Props){
 const scopes=useMemo(()=>data.serviceScopes.filter(s=>s.supplyApplicable&&s.ready),[data.serviceScopes]);
 const blank=()=>({...emptyPartnerInventoryDraft(),serviceScopeId:scopes[0]?.id??''});
 const [draft,setDraft]=useState<PartnerInventoryDraft>(blank),[editing,setEditing]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const dirty=editing&&(Boolean(draft.label)||Boolean(draft.capacityTotal)||Boolean(draft.id));
 useEffect(()=>onDirtyChange?.(dirty),[dirty,onDirtyChange]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>()=>onDirtyChange?.(false),[onDirtyChange]);
 const change=(next:Partial<PartnerInventoryDraft>)=>{setDraft(current=>({...current,...next}));setError('');setNotice('');};
 const beginCreate=()=>{setDraft(blank());setEditing(true);setError('');setNotice('');};
 const beginEdit=(item:PartnerSupply['items'][number])=>{setDraft({id:item.id,version:item.version,serviceScopeId:item.serviceScopeId,stableKey:item.stableKey,label:item.label,inventoryType:item.inventoryType,capacityUnit:item.capacityUnit,capacityTotal:String(item.capacityTotal),status:item.status as PartnerInventoryDraft['status']});setEditing(true);setError('');setNotice('');};
 const cancel=()=>{setEditing(false);setDraft(blank());setError('');};
 async function submit(){const checked=validatePartnerInventoryDraft(draft);if(!checked.ok){setError(checked.message);return;}try{await save(checked.body);setNotice(draft.id?'Inventory capacity updated.':'Inventory item added.');setEditing(false);setDraft(blank());}catch(e){setError(e instanceof Error?e.message:'The inventory change could not be saved. Your entries are still here.');}}
 const writable=data.canWriteSupply&&!admin&&scopes.length>0;
 return <section className={styles.panel} aria-labelledby="partner-inventory-title"><div className={styles.panelHead}><div><h2 id="partner-inventory-title">Inventory & capacity</h2><span className={styles.muted}>Manage the named inventory units and their total capacity.</span></div>{writable&&!editing?<button className={styles.primaryAction} type="button" onClick={beginCreate}>Add inventory</button>:null}</div>
  {notice?<p role="status" className={styles.readyNote}>{notice}</p>:null}
  {data.items.map(item=><div key={item.id} className={styles.record}><strong>{item.label}</strong><span>{item.capacityTotal} {item.capacityUnit}</span><span>{item.status}</span><small>{data.serviceScopes.find(s=>s.id===item.serviceScopeId)?.label} · version {item.version}</small>{writable?<button type="button" onClick={()=>beginEdit(item)} disabled={busy||editing}>Edit</button>:null}</div>)}
  {!data.items.length&&!editing?<div className={styles.empty}>No inventory records yet. Add the first inventory item and its total capacity.</div>:null}
  {editing?<form className={styles.editor} onSubmit={event=>{event.preventDefault();void submit();}}><h3>{draft.id?'Edit inventory capacity':'Add inventory'}</h3><label><span>Service <b>Required</b></span><select aria-label="Service" required value={draft.serviceScopeId} onChange={event=>change({serviceScopeId:event.target.value})}>{scopes.map(scope=><option key={scope.id} value={scope.id}>{scope.label}</option>)}</select></label><label><span>Inventory item name <b>Required</b></span><input aria-label="Inventory item name" required maxLength={120} autoFocus value={draft.label} onChange={event=>change({label:event.target.value})} placeholder="For example, Deluxe Room"/></label><label><span>Total capacity <b>Required</b></span><input aria-label="Total capacity" required inputMode="numeric" pattern="[0-9]+" min="0" max="1000000" step="1" value={draft.capacityTotal} onChange={event=>change({capacityTotal:event.target.value})} placeholder="Enter a whole number"/></label>{error?<p role="alert" className={styles.empty}>{error}{error.includes('changed')?<button type="button" onClick={()=>void refresh()}>Refresh records</button>:null}</p>:null}<div className={styles.tools}><button className={styles.primaryAction} type="submit" disabled={busy}>{busy?'Saving…':draft.id?'Save capacity':'Add inventory'}</button><button type="button" disabled={busy} onClick={cancel}>Cancel</button></div></form>:null}
  {!writable?<div className={styles.empty}>{data.canWriteSupply?'Supply setup is not ready for an applicable active service.':'Inventory is read-only for this account.'}</div>:null}
 </section>;
}
