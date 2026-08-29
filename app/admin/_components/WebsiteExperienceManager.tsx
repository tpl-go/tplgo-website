"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Globe2, Image as ImageIcon, Save, Send, ShieldCheck } from "lucide-react";
import {
  getAdminWebsiteExperienceLoginSignup,
  publishAdminWebsiteExperienceContext,
  saveAdminWebsiteExperienceDraft,
  uploadAdminWebsiteExperienceMedia,
  type AdminApiError,
  type PartnerRegistrationIntakeView,
  type WebsiteExperienceAdminResponse,
  type WebsiteExperienceBenefit,
  type WebsiteExperienceContent,
  type WebsiteExperienceContext,
} from "../../lib/admin/adminApiClient";

type LoadState =
  | { status: "loading"; data: WebsiteExperienceAdminResponse | null; error: null }
  | { status: "ready"; data: WebsiteExperienceAdminResponse; error: null }
  | { status: "error"; data: WebsiteExperienceAdminResponse | null; error: AdminApiError };

const mediaSlots = [
  { key: "auth_promo_brand_image", label: "Brand image" },
  { key: "auth_promo_desktop_hero", label: "Desktop hero" },
  { key: "auth_promo_mobile_hero", label: "Mobile hero" },
];

export function WebsiteExperienceManager() {
  const [state, setState] = useState<LoadState>({ status: "loading", data: null, error: null });
  const [activeContext, setActiveContext] = useState<WebsiteExperienceContext>("user_login");
  const [drafts, setDrafts] = useState<Partial<Record<WebsiteExperienceContext, WebsiteExperienceContent>>>({});
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const load = useCallback(async () => {
    const result = await getAdminWebsiteExperienceLoginSignup();
    if (!result.ok) {
      setState({ status: "error", data: null, error: result.error });
      return;
    }
    setState({ status: "ready", data: result.data, error: null });
    setDrafts(Object.fromEntries(result.data.contexts.map((item) => [item.context, item.draftContent])));
  }, []);

  useEffect(() => {
    let active = true;
    void getAdminWebsiteExperienceLoginSignup().then((result) => {
      if (!active) return;
      if (!result.ok) {
        setState({ status: "error", data: null, error: result.error });
        return;
      }
      setState({ status: "ready", data: result.data, error: null });
      setDrafts(Object.fromEntries(result.data.contexts.map((item) => [item.context, item.draftContent])));
    });
    return () => {
      active = false;
    };
  }, []);

  const activeDraft = drafts[activeContext];
  const permissions = state.data?.permissions;
  const canWrite = Boolean(permissions?.canWrite);
  const canPublish = Boolean(permissions?.canPublish);

  const updateDraft = (patch: Partial<WebsiteExperienceContent>) => {
    if (!activeDraft) return;
    setDrafts((current) => ({
      ...current,
      [activeContext]: { ...activeDraft, ...patch },
    }));
  };

  const updateBenefit = (index: number, patch: Partial<WebsiteExperienceBenefit>) => {
    if (!activeDraft) return;
    const benefits = [...activeDraft.benefits];
    benefits[index] = { ...benefits[index], ...patch };
    updateDraft({ benefits });
  };

  const applyUploadedMedia = (media: { slot: string; url: string; altText?: string }) => {
    if (!activeDraft) return;
    if (media.slot === "auth_promo_brand_image") {
      updateDraft({ brandLogoImage: media.url, brandLogoAlt: media.altText || activeDraft.brandLogoAlt });
      return;
    }
    if (media.slot === "auth_promo_desktop_hero") {
      updateDraft({ desktopImage: media.url, desktopImageAlt: media.altText || activeDraft.desktopImageAlt });
      return;
    }
    if (media.slot === "auth_promo_mobile_hero") {
      updateDraft({ mobileImage: media.url, mobileImageAlt: media.altText || activeDraft.mobileImageAlt });
    }
  };

  const saveDraft = async () => {
    if (!activeDraft) return;
    setBusyAction("save");
    setMessage("");
    const result = await saveAdminWebsiteExperienceDraft(activeContext, activeDraft);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Draft saved. Published login content is unchanged until Publish.");
    load();
  };

  const publish = async () => {
    setBusyAction("publish");
    setMessage("");
    const result = await publishAdminWebsiteExperienceContext(activeContext);
    setBusyAction("");
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage("Published. Staging login/signup reads this content without frontend redeploy.");
    load();
  };

  if (state.status === "loading" && !state.data) return <PanelNotice text="Loading Website Experience..." />;
  if (state.status === "error") return <PanelNotice tone="danger" text={state.error.message} />;
  if (!state.data || !activeDraft) return null;

  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700">Content / Website Experience</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">Login & Signup</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Manage presentation-only promotional content for the approved User Login, Partner Login, and Partner Registration modal surfaces.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Auth and security config locked
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            {state.data.contexts.map((item) => (
              <button
                key={item.context}
                type="button"
                onClick={() => setActiveContext(item.context)}
                className={`rounded border px-4 py-3 text-left text-sm font-semibold ${
                  item.context === activeContext
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item.label}
                <span className="mt-1 block text-xs font-medium text-slate-500">
                  Draft v{item.draftVersion} / Published v{item.publishedVersion}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Brand image alt text" value={activeDraft.brandLogoAlt || ""} maxLength={120} onChange={(value) => updateDraft({ brandLogoAlt: value })} />
            <Field label="Desktop image alt text" value={activeDraft.desktopImageAlt || ""} maxLength={120} onChange={(value) => updateDraft({ desktopImageAlt: value })} />
            <Field label="Mobile image alt text" value={activeDraft.mobileImageAlt || ""} maxLength={120} onChange={(value) => updateDraft({ mobileImageAlt: value })} />
            <Field label="Eyebrow" value={activeDraft.eyebrow} maxLength={64} onChange={(value) => updateDraft({ eyebrow: value })} />
            <Field label="Brand label fallback" value={activeDraft.brandLabel} maxLength={40} onChange={(value) => updateDraft({ brandLabel: value })} />
            <Field label="Headline" value={activeDraft.headline} maxLength={80} onChange={(value) => updateDraft({ headline: value })} />
            <Field label="Highlighted text" value={activeDraft.highlightedText} maxLength={40} onChange={(value) => updateDraft({ highlightedText: value })} />
            <Field label="Subtitle" value={activeDraft.subtitle} maxLength={180} onChange={(value) => updateDraft({ subtitle: value })} />
            <Field label="Footer / trust line" value={activeDraft.footerTrustLine} maxLength={140} onChange={(value) => updateDraft({ footerTrustLine: value })} />
          </div>

          <details className="rounded border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-500">Advanced media references</summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <Field label="Brand image URL" value={activeDraft.brandLogoImage || ""} maxLength={500} onChange={(value) => updateDraft({ brandLogoImage: value })} />
              <Field label="Desktop hero image URL" value={activeDraft.desktopImage} maxLength={500} onChange={(value) => updateDraft({ desktopImage: value })} />
              <Field label="Mobile hero image URL" value={activeDraft.mobileImage || ""} maxLength={500} onChange={(value) => updateDraft({ mobileImage: value })} />
            </div>
          </details>

          <div className="rounded border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-950">Benefits</h4>
              <span className="text-xs font-semibold text-slate-500">Max 4</span>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {activeDraft.benefits.map((benefit, index) => (
                <div key={index} className="rounded border border-slate-100 bg-slate-50 p-3">
                  <div className="grid gap-2">
                    <Field label={`Benefit ${index + 1} title`} value={benefit.title} maxLength={50} onChange={(value) => updateBenefit(index, { title: value })} />
                    <Field label="Supporting text" value={benefit.description} maxLength={90} onChange={(value) => updateBenefit(index, { description: value })} />
                    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
                      <span>Tone</span>
                      <select value={benefit.tone} onChange={(event) => updateBenefit(index, { tone: event.target.value as WebsiteExperienceBenefit["tone"] })} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm normal-case text-slate-900">
                        <option value="sky">Sky</option>
                        <option value="emerald">Emerald</option>
                        <option value="amber">Amber</option>
                        <option value="violet">Violet</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={activeDraft.active} onChange={(event) => updateDraft({ active: event.target.checked })} />
              Active
            </label>
            <button type="button" disabled={!canWrite || busyAction === "save"} onClick={saveDraft} className="inline-flex h-10 items-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button type="button" disabled={!canPublish || busyAction === "publish"} onClick={publish} className="inline-flex h-10 items-center gap-2 rounded bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-200">
              <Send className="h-4 w-4" />
              Publish
            </button>
            {message ? <p className="text-sm font-semibold text-slate-600">{message}</p> : null}
          </div>

          <MediaUpload activeContext={activeContext} canWrite={canWrite} onUploaded={applyUploadedMedia} />
          <PartnerRegistrationIntakes rows={state.data.partnerRegistrationIntakes} />
        </div>

        <div className="space-y-4">
          <PreviewCard content={activeDraft} />
          <LockedSecurity fields={state.data.schema.lockedSecurityFields} />
          <AuditList rows={state.data.recentAudit} />
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
      <span>{label}</span>
      <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value.replace(/[<>]/g, ""))} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm font-medium normal-case text-slate-900 outline-none focus:border-blue-500" />
    </label>
  );
}

function MediaUpload({
  activeContext,
  canWrite,
  onUploaded,
}: {
  activeContext: WebsiteExperienceContext;
  canWrite: boolean;
  onUploaded: (media: { slot: string; url: string; altText?: string }) => void;
}) {
  const [slot, setSlot] = useState(mediaSlots[0].key);
  const [altText, setAltText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<WebsiteExperienceAdminResponse["recentMedia"][number] | null>(null);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) return;
    const result = await uploadAdminWebsiteExperienceMedia({
      context: activeContext,
      slot,
      file,
      altText,
    });
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setUploaded(result.data);
    onUploaded({ slot: result.data.slot, url: result.data.url, altText: result.data.altText });
    setMessage("Image uploaded into the draft. Save Draft keeps it private to the editor until Publish.");
  };

  const clear = () => {
    setFile(null);
    setUploaded(null);
    setAltText("");
    setMessage("");
  };

  return (
    <section className="rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-950">Presentation Media</h4>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[0.8fr_1fr_1fr]">
        <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
          <span>Slot</span>
          <select value={slot} onChange={(event) => setSlot(event.target.value)} className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm normal-case text-slate-900">
            {mediaSlots.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
        <Field label="Alt text" value={altText} maxLength={120} onChange={setAltText} />
        <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
          <span>Upload image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={!canWrite}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block h-10 w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs normal-case text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-slate-700"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canWrite || !file} onClick={upload} className="h-9 rounded border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          Upload Image
        </button>
        {uploaded ? (
          <button type="button" onClick={clear} className="h-9 rounded border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
            Replace / Remove
          </button>
        ) : null}
        <p className="text-xs leading-5 text-slate-500">
          PNG, JPG/JPEG, or WebP only. Public presentation media stays separate from private Partner KYC storage.
        </p>
        {message ? <p className="text-xs font-semibold text-slate-700">{message}</p> : null}
      </div>
      {uploaded ? (
        <div className="mt-3 flex items-center gap-3 rounded border border-slate-100 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uploaded.url} alt={uploaded.altText || "Uploaded presentation media"} className="h-14 w-20 rounded bg-white object-cover" />
          <div className="min-w-0 text-xs text-slate-600">
            <p className="truncate font-semibold text-slate-900">{uploaded.originalFilename || "Uploaded image"}</p>
            <p>{uploaded.width && uploaded.height ? `${uploaded.width} x ${uploaded.height}px` : "Dimensions unavailable"} · {(uploaded.sizeBytes / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PreviewCard({ content }: { content: WebsiteExperienceContent }) {
  const firstImage = content.desktopImage || content.mobileImage;
  return (
    <section className="overflow-hidden rounded border border-slate-200">
      <div className="flex min-h-11 items-center gap-2 border-b border-slate-100 px-4">
        <Eye className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-950">Preview</h4>
      </div>
      <div className="relative min-h-80 bg-slate-900 p-4 text-white">
            {firstImage ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url('${firstImage}')` }} /> : null}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-blue-950/65 to-slate-950/80" />
        <div className="relative flex h-full min-h-72 flex-col justify-between gap-5">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {content.brandLogoImage ? <img src={content.brandLogoImage} alt={content.brandLogoAlt || content.brandLabel} className="h-8 w-8 rounded bg-white object-contain p-1" /> : null}
            <span className="text-sm font-black">{content.brandLabel}</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-blue-200">{content.eyebrow}</p>
            <h5 className="mt-2 text-3xl font-black leading-9">{content.headline} <span className="text-sky-300">{content.highlightedText}</span></h5>
            <p className="mt-2 text-sm leading-6 text-blue-100">{content.subtitle}</p>
          </div>
          <div className="space-y-2">
            {content.benefits.slice(0, 4).map((benefit) => (
              <div key={`${benefit.title}:${benefit.tone}`} className="flex items-center gap-2 rounded border border-white/15 bg-white/10 p-2">
                <span className="h-7 w-7 rounded bg-sky-500" />
                <span><b className="block text-xs">{benefit.title}</b><span className="text-[11px] text-blue-100">{benefit.description}</span></span>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-blue-100">{content.footerTrustLine}</p>
        </div>
      </div>
    </section>
  );
}

function LockedSecurity({ fields }: { fields: string[] }) {
  return (
    <section className="rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <h4 className="text-sm font-semibold text-slate-950">Locked Security Fields</h4>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {fields.map((field) => <span key={field} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{field}</span>)}
      </div>
    </section>
  );
}

function AuditList({ rows }: { rows: WebsiteExperienceAdminResponse["recentAudit"] }) {
  return (
    <section className="rounded border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-950">Recent Website Experience Audit</h4>
      <div className="mt-3 space-y-2">
        {rows.length ? rows.map((row) => (
          <div key={row.id} className="rounded bg-slate-50 p-2 text-xs text-slate-600">
            <b className="text-slate-900">{row.action}</b>
            <span className="block">{row.changeSummary || row.context || row.entityId}</span>
          </div>
        )) : <p className="text-xs text-slate-500">No content actions recorded yet.</p>}
      </div>
    </section>
  );
}

function PartnerRegistrationIntakes({ rows }: { rows: PartnerRegistrationIntakeView[] }) {
  const others = useMemo(() => rows.filter((row) => row.primaryCategory === "OTHER"), [rows]);
  return (
    <section className="rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-950">Partner Registration Intakes</h4>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">Shows recent basic Partner registration entries, including Others service suggestions for later taxonomy mapping.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>{["Legal name", "Primary category", "Requested service", "Email", "Status"].map((header) => <th key={header} className="border-b border-slate-100 px-2 py-2 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {(others.length ? others : rows.slice(0, 5)).map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-2 py-2 font-semibold text-slate-900">{row.legalName}</td>
                <td className="px-2 py-2 text-slate-600">{row.primaryCategory === "OTHER" ? "Others" : row.primaryCategory}</td>
                <td className="px-2 py-2 text-slate-600">{row.requestedServiceName || "-"}</td>
                <td className="px-2 py-2 text-slate-600">{row.businessEmail}</td>
                <td className="px-2 py-2 text-slate-600">{row.status}</td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={5} className="px-2 py-5 text-center text-slate-500">No registration intakes yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PanelNotice({ text, tone = "default" }: { text: string; tone?: "default" | "danger" }) {
  return <section className={`rounded border p-4 text-sm ${tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600"}`}>{text}</section>;
}
