import { notFound } from "next/navigation";
import CreatorStudioPlaceholder from "@/app/components/creators/studio/CreatorStudioPlaceholder";
import { studioPlaceholderMeta } from "@/app/lib/creators/creatorStudioData";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; const meta = studioPlaceholderMeta[section]; return { title: meta ? `${meta.title} | Creator Studio` : "Creator Studio", description: meta?.description }; }
export default async function CreatorStudioSectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; if (!studioPlaceholderMeta[section]) notFound(); return <CreatorStudioPlaceholder section={section} />; }
