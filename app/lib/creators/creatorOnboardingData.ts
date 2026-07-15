import type { LucideIcon } from "lucide-react";
import { BadgeDollarSign, BarChart3, CheckCircle2, FileBadge2, Globe2, Handshake, ShieldCheck, Sparkles, Store, UsersRound } from "lucide-react";

export type OnboardingStepKey = "benefits" | "eligibility" | "profile" | "identity" | "tax" | "payout" | "portfolio" | "agreement" | "review" | "submitted";

export interface CreatorOnboardingDraft {
  displayName: string; username: string; bio: string; languages: string; location: string;
  primaryCategory: string; secondaryCategory: string; website: string; socialLinks: string;
  governmentId: string; email: string; phone: string; identityStatus: string;
  taxCountry: string; taxType: "individual" | "business"; pan: string; gstVat: string; tin: string;
  payoutMethod: "bank" | "upi" | "paypal" | "wise"; bankName: string; accountReference: string; upiId: string;
  experience: string; specializations: string; equipment: string; software: string; portfolioLinks: string; destinations: string; exampleWork: string;
  creatorAgreement: boolean; licensingAgreement: boolean; communityGuidelines: boolean;
}

export const onboardingSteps: { key: OnboardingStepKey; label: string }[] = [
  { key: "benefits", label: "Benefits" }, { key: "eligibility", label: "Eligibility" },
  { key: "profile", label: "Profile" }, { key: "identity", label: "Identity" },
  { key: "tax", label: "Tax" }, { key: "payout", label: "Payout" },
  { key: "portfolio", label: "Portfolio" }, { key: "agreement", label: "Agreement" },
  { key: "review", label: "Review" }, { key: "submitted", label: "Submitted" },
];

export const creatorBenefits: { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Worldwide marketplace", description: "Reach travel brands, publishers and creative teams across global markets.", icon: Globe2 },
  { title: "Revenue sharing", description: "Build earnings through eligible subscriptions and individual licensing.", icon: BadgeDollarSign },
  { title: "Creator Studio", description: "Manage your approved portfolio through a dedicated professional workspace.", icon: Store },
  { title: "Analytics", description: "Understand portfolio reach, downloads, licensing and audience interest.", icon: BarChart3 },
  { title: "Licensing", description: "Protect your work with transparent Standard, Extended and Enterprise rights.", icon: FileBadge2 },
  { title: "Community", description: "Join a verified network of travel photographers, filmmakers and designers.", icon: UsersRound },
];

export const eligibilityGuidelines = [
  { title: "Quality guidelines", description: "Submit technically strong, useful and accurately described creative work.", icon: Sparkles },
  { title: "Ownership", description: "You must control the rights required to submit and license every asset.", icon: ShieldCheck },
  { title: "Copyright", description: "Respect third-party copyright, trademarks, releases and protected creative property.", icon: FileBadge2 },
  { title: "Original work", description: "Only submit authentic work you created or are explicitly authorized to represent.", icon: CheckCircle2 },
  { title: "Community rules", description: "Follow safety, integrity, respectful-use and marketplace conduct requirements.", icon: Handshake },
];

export const welcomeEarnings = ["Sell photos", "Sell videos", "Sell drone footage", "Sell templates", "Earn through subscriptions", "Earn through licensing", "Advertising revenue · future"];

export const initialOnboardingDraft: CreatorOnboardingDraft = {
  displayName: "", username: "", bio: "", languages: "", location: "", primaryCategory: "", secondaryCategory: "", website: "", socialLinks: "",
  governmentId: "", email: "", phone: "", identityStatus: "Not started",
  taxCountry: "India", taxType: "individual", pan: "", gstVat: "", tin: "",
  payoutMethod: "bank", bankName: "", accountReference: "", upiId: "",
  experience: "", specializations: "", equipment: "", software: "", portfolioLinks: "", destinations: "", exampleWork: "",
  creatorAgreement: false, licensingAgreement: false, communityGuidelines: false,
};

export const onboardingReviewTimeline = ["Application received instantly", "Portfolio and identity review", "Creator standards assessment", "Email decision and next steps"];
