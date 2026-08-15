import CreatorUploadWizard from "@/app/components/creators/studio/uploads/CreatorUploadWizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Upload Content | Creator Studio", description: "Build a moderation-ready Creator asset listing through the TPL publishing pipeline preview." };
export default function CreatorStudioUploadsPage() { return <CreatorUploadWizard />; }
