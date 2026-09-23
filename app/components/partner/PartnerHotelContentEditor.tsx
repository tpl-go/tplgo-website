"use client";

import {useMemo, useState, type FormEvent} from "react";
import type {PartnerSupply} from "@/app/lib/partner/partnerSupply";
import styles from "./PartnerCommandCenter.module.css";

type Draft = {id?: string; version?: number; serviceScopeId: string; supplyItemId?: string; scope: "PROPERTY" | "ROOM"; shortDescription: string; detailedDescription: string; amenityCodes: string[]; structuredValues: Record<string, string>};
const blank = (scope: "PROPERTY" | "ROOM", serviceScopeId: string, supplyItemId?: string): Draft => ({scope, serviceScopeId, supplyItemId, shortDescription: "", detailedDescription: "", amenityCodes: [], structuredValues: {}});

export default function PartnerHotelContentEditor({data, admin, busy, save, review, refresh, onDirtyChange}: {data: PartnerSupply; admin: boolean; busy: boolean; save: (value: Record<string, unknown>) => Promise<void>; review: (id: string, version: number, decision: "approve" | "reject", reason: string) => Promise<void>; refresh: () => Promise<void>; onDirtyChange?: (dirty: boolean) => void}) {
  const hotel = data.profiles.find((profile) => profile.profileCode === "HOTEL_CONTENT_PROFILE_V1");
  const serviceScope = data.serviceScopes.find((value) => value.serviceCode === hotel?.serviceCode);
  const [selected, setSelected] = useState<"PROPERTY" | string>("PROPERTY");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const record = useMemo(() => data.contentRecords.find((value) => selected === "PROPERTY" ? value.scope === "PROPERTY" && value.serviceScopeId === serviceScope?.id : value.supplyItemId === selected), [data.contentRecords, serviceScope?.id, selected]);
  const item = selected === "PROPERTY" ? null : data.items.find((value) => value.id === selected);
  const targetScope = selected === "PROPERTY" ? "PROPERTY" : "ROOM";
  const catalogue = data.amenityCatalogue.filter((value) => value.profileCode === hotel?.profileCode && value.profileVersion === hotel?.profileVersion && value.scope === targetScope);
  const groups = Array.from(new Set(catalogue.map((value) => value.category)));

  if (!hotel || !serviceScope) return <section className={styles.panel}><h2>Hotel content &amp; amenities</h2><div className={styles.empty}>Content and amenities are not configured for this service.</div></section>;

  const start = () => {
    const next = record ? {id: record.id, version: record.version, serviceScopeId: record.serviceScopeId, supplyItemId: record.supplyItemId ?? undefined, scope: record.scope, shortDescription: record.shortDescription, detailedDescription: record.detailedDescription ?? "", amenityCodes: record.amenities.map((value) => value.code), structuredValues: {...record.structuredValues}} : blank(targetScope, serviceScope.id, item?.id);
    setDraft(next); setMessage("");
  };
  const change = (next: Draft) => {setDraft(next); onDirtyChange?.(true);};
  const choose = (value: "PROPERTY" | string) => {setSelected(value); setDraft(null); setMessage(""); onDirtyChange?.(false);};
  const toggle = (code: string, valueKind: "BOOLEAN" | "ENUM", allowedValues: string[]) => {
    if (!draft) return;
    const chosen = draft.amenityCodes.includes(code);
    const amenityCodes = chosen ? draft.amenityCodes.filter((value) => value !== code) : [...draft.amenityCodes, code];
    const structuredValues = {...draft.structuredValues};
    if (chosen) delete structuredValues[code]; else if (valueKind === "ENUM") structuredValues[code] = allowedValues[0] ?? "";
    change({...draft, amenityCodes, structuredValues});
  };
  async function submit(event?: FormEvent) {
    event?.preventDefault(); if (!draft) return;
    if (draft.shortDescription.trim().length < 10) {setMessage("Enter at least 10 characters for the customer-facing description."); return;}
    setMessage("");
    try {await save({...draft, shortDescription: draft.shortDescription.trim(), detailedDescription: draft.detailedDescription.trim() || undefined}); setDraft(null); onDirtyChange?.(false); setMessage("Saved and sent for TPL content review.");}
    catch (error) {setMessage(error instanceof Error ? error.message : "The content could not be saved. Your entries are still here.");}
  }
  async function decide(decision: "approve" | "reject") {
    if (!record) return;
    const reason = prompt(decision === "approve" ? "Enter a short approval reason." : "Explain what needs to change.");
    if (!reason) return;
    try {await review(record.id, record.version, decision, reason); setMessage(decision === "approve" ? "Content approved for the staging Hotel detail." : "Content returned for changes.");}
    catch (error) {setMessage(error instanceof Error ? error.message : "The review decision could not be saved.");}
  }

  return <section className={`${styles.panel} ${styles.contentPanel}`} aria-label="Hotel content and amenities">
    <div className={styles.panelHead}><div><h2>Hotel content &amp; amenities</h2><p className={styles.muted}>Add clear Hotel and room details using the approved amenity list.</p></div><button type="button" onClick={() => void refresh()} disabled={busy}>Refresh</button></div>
    <nav className={styles.contentScopeNav} aria-label="Hotel content scope">
      <button type="button" aria-current={selected === "PROPERTY" ? "page" : undefined} onClick={() => choose("PROPERTY")}><span>Property details</span><small>Hotel description and shared amenities</small></button>
      {data.items.filter((value) => value.serviceScopeId === serviceScope.id).map((value) => <button type="button" key={value.id} aria-current={selected === value.id ? "page" : undefined} onClick={() => choose(value.id)}><span>Room details · {value.label}</span><small>Room description and room amenities</small></button>)}
    </nav>
    <section className={styles.contentSummary} aria-label={targetScope === "PROPERTY" ? "Property content status" : "Room content status"}>
      <div><span className={styles.contentEyebrow}>{targetScope === "PROPERTY" ? "PROPERTY" : "ROOM"}</span><h3>{targetScope === "PROPERTY" ? "Property details" : item?.label ?? "Selected room"}</h3>{record ? <p>{record.shortDescription}</p> : <p>No content has been saved for this section.</p>}</div>
      <div className={styles.contentStatus}>{record ? <><strong>{record.reviewStatus.replaceAll("_", " ")}</strong><span>{record.amenities.length} amenities · version {record.version}</span></> : <strong>Not started</strong>}</div>
      {!admin && data.canWriteContent && !draft ? <button type="button" className={styles.primaryAction} onClick={start}>{record ? "Edit details" : "Add details"}</button> : null}
      {admin && record?.reviewStatus === "pending_review" && data.canReviewContent ? <div className={styles.contentReviewActions}><button type="button" disabled={busy} onClick={() => void decide("approve")}>Approve</button><button type="button" disabled={busy} onClick={() => void decide("reject")}>Needs changes</button></div> : null}
      {record?.reviewReason ? <p className={styles.contentReviewNote}>Review note: {record.reviewReason}</p> : null}
    </section>
    {draft ? <form className={styles.contentEditor} onSubmit={(event) => void submit(event)}>
      <div className={styles.contentEditorHeading}><div><span className={styles.contentEyebrow}>EDITING</span><h3>{targetScope === "PROPERTY" ? "Property details" : item?.label}</h3></div><span>{draft.amenityCodes.length} selected</span></div>
      <label className={styles.contentField}><span>Customer-facing {targetScope === "PROPERTY" ? "Hotel" : "room"} description <b>Required</b></span><textarea value={draft.shortDescription} maxLength={500} rows={4} onChange={(event) => change({...draft, shortDescription: event.target.value})}/><small>{draft.shortDescription.length}/500 characters</small></label>
      <label className={styles.contentField}><span>Additional description <em>Optional</em></span><textarea value={draft.detailedDescription} maxLength={2000} rows={5} onChange={(event) => change({...draft, detailedDescription: event.target.value})}/><small>{draft.detailedDescription.length}/2000 characters</small></label>
      <div className={styles.amenityHeading}><div><h3>Standard amenities</h3><p>Select only what applies to this {targetScope === "PROPERTY" ? "property" : "room"}.</p></div></div>
      <div className={styles.amenityGroups}>{groups.map((group) => <details key={group} className={styles.amenityGroup}><summary><span>{group.replaceAll("_", " ").toLowerCase()}</span><small>{catalogue.filter((value) => value.category === group && draft.amenityCodes.includes(value.code)).length} selected</small></summary><div className={styles.amenityOptions}>{catalogue.filter((value) => value.category === group).map((amenity) => {const checked = draft.amenityCodes.includes(amenity.code); return <div className={`${styles.amenityOption} ${checked ? styles.amenityOptionSelected : ""}`} key={amenity.code}><label><input type="checkbox" checked={checked} onChange={() => toggle(amenity.code, amenity.valueKind, amenity.allowedValues)}/><span>{amenity.label}</span></label>{amenity.valueKind === "ENUM" && checked ? <select aria-label={`${amenity.label} value`} value={draft.structuredValues[amenity.code] ?? amenity.allowedValues[0]} onChange={(event) => change({...draft, structuredValues: {...draft.structuredValues, [amenity.code]: event.target.value}})}>{amenity.allowedValues.map((value) => <option key={value} value={value}>{value}</option>)}</select> : null}</div>;})}</div></details>)}</div>
      {message ? <p className={styles.contentMessage} role="alert">{message}</p> : null}
      <div className={styles.contentSubmitBar}><div><strong>Ready to submit?</strong><span>TPL will review descriptions before they appear to customers.</span></div><button type="button" disabled={busy} onClick={() => {setDraft(null); onDirtyChange?.(false);}}>Cancel</button><button type="submit" className={styles.primaryAction} disabled={busy}>{busy ? "Saving…" : "Save and send for review"}</button></div>
    </form> : message ? <p className={styles.readyNote} role="status">{message}</p> : null}
  </section>;
}
