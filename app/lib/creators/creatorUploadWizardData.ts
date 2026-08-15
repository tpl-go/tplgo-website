import type { LucideIcon } from "lucide-react";
import { AudioLines, BookOpenText, Camera, Clapperboard, FileImage, FileText, Film, LayoutTemplate, Map, Palette, Plane, ShieldCheck } from "lucide-react";

export type UploadStepKey = "type" | "files" | "details" | "keywords" | "license" | "pricing" | "releases" | "preview" | "submit";
export type UploadTypeKey = "photos" | "videos" | "reels" | "drone" | "templates" | "graphics" | "guides" | "audio";
export type UploadLicenseKey = "standard" | "extended" | "editorial" | "commercial" | "enterprise";

export interface UploadWizardDraft {
  type: UploadTypeKey | ""; filesReady: boolean; fileName: string;
  title: string; description: string; destination: string; country: string; state: string; city: string;
  category: string; subcategory: string; language: string; orientation: string; resolution: string; duration: string;
  keywords: string[]; manualKeyword: string; license: UploadLicenseKey | "";
  subscriptionIncluded: boolean; licenseFrom: string; suggestedPrice: string; commercialPrice: string; enterpriseContact: boolean;
  modelRelease: boolean; propertyRelease: boolean; commercialEligibility: boolean; ownershipDeclaration: boolean;
}

export const uploadSteps: { key: UploadStepKey; label: string }[] = [
  { key: "type", label: "Upload Type" }, { key: "files", label: "Files" },
  { key: "details", label: "Details" }, { key: "keywords", label: "Keywords" },
  { key: "license", label: "License" }, { key: "pricing", label: "Pricing" },
  { key: "releases", label: "Releases" }, { key: "preview", label: "Preview" },
  { key: "submit", label: "Submit" },
];

export const uploadTypes: { key: UploadTypeKey; label: string; description: string; formats: string; icon: LucideIcon }[] = [
  { key: "photos", label: "Photos", description: "Editorial and commercial travel photography.", formats: "JPG, PNG, TIFF", icon: Camera },
  { key: "videos", label: "Videos", description: "Cinematic footage and destination stories.", formats: "MP4, MOV", icon: Film },
  { key: "reels", label: "Reels", description: "Vertical short-form social content.", formats: "MP4, MOV · 9:16", icon: Clapperboard },
  { key: "drone", label: "Drone Footage", description: "Licensed aerial destination perspectives.", formats: "MP4, MOV · 4K", icon: Plane },
  { key: "templates", label: "Templates", description: "Editable creative and social templates.", formats: "ZIP, PSD, AI", icon: LayoutTemplate },
  { key: "graphics", label: "Graphics", description: "Illustrations, maps and visual elements.", formats: "AI, SVG, PNG", icon: Palette },
  { key: "guides", label: "Destination Guides", description: "Structured travel guides and itineraries.", formats: "PDF, ZIP", icon: Map },
  { key: "audio", label: "Audio", description: "Ambient recordings and travel soundscapes.", formats: "WAV, MP3", icon: AudioLines },
];

export const uploadLicenseOptions: { key: UploadLicenseKey; title: string; description: string; icon: LucideIcon; tone: string }[] = [
  { key: "standard", title: "Standard", description: "Everyday digital, social and client publishing rights.", icon: FileImage, tone: "border-blue-300 bg-blue-50 text-blue-800" },
  { key: "extended", title: "Extended", description: "Advertising, broadcast, merchandise and packaging rights.", icon: ShieldCheck, tone: "border-amber-300 bg-amber-50 text-amber-900" },
  { key: "editorial", title: "Editorial", description: "Newsworthy and factual use without commercial endorsement.", icon: BookOpenText, tone: "border-slate-300 bg-slate-50 text-slate-800" },
  { key: "commercial", title: "Commercial", description: "Brand and promotional use with required releases.", icon: Clapperboard, tone: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { key: "enterprise", title: "Enterprise Ready", description: "Eligible for custom organization and campaign rights.", icon: FileText, tone: "border-violet-300 bg-violet-50 text-violet-800" },
];

export const suggestedKeywords = ["travel", "india", "cinematic", "destination", "culture", "tourism", "adventure", "landscape", "editorial", "commercial"];
export const popularKeywords = ["4k", "aerial", "luxury", "heritage", "social media", "campaign"];
export const destinationKeywords = ["Ladakh", "Rajasthan", "Himalayas", "Jaipur", "Kerala", "Goa"];

export const uploadGuidelines = ["Use accurate titles and destination metadata.", "Submit only original work you control.", "Include releases when people or private property require them.", "Avoid trademarks, misleading AI claims and duplicate files."];
export const publishingTips = ["Add 8–15 specific keywords.", "Lead titles with the strongest destination or subject.", "Choose the narrowest accurate category.", "Preview the buyer-facing card before submission."];

export const initialUploadDraft: UploadWizardDraft = {
  type: "", filesReady: false, fileName: "", title: "", description: "", destination: "", country: "India", state: "", city: "",
  category: "", subcategory: "", language: "English", orientation: "", resolution: "", duration: "",
  keywords: [], manualKeyword: "", license: "", subscriptionIncluded: true, licenseFrom: "499", suggestedPrice: "999", commercialPrice: "2499", enterpriseContact: true,
  modelRelease: false, propertyRelease: false, commercialEligibility: false, ownershipDeclaration: false,
};

export const uploadReviewTimeline = ["Submitted for moderation", "Technical and metadata review", "Rights and release review", "Publishing decision by email"];
