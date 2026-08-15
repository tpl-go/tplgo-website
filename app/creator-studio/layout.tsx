import CreatorStudioShell from "@/app/components/creators/studio/CreatorStudioShell";
import CreatorStudioAccessGuard from "@/app/components/creators/studio/CreatorStudioAccessGuard";

export default function CreatorStudioLayout({ children }: { children: React.ReactNode }) {
  return <CreatorStudioAccessGuard><CreatorStudioShell>{children}</CreatorStudioShell></CreatorStudioAccessGuard>;
}
