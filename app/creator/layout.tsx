import CreatorWorkspaceAuthGuard from "@/app/components/creators/workspace/CreatorWorkspaceAuthGuard";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <CreatorWorkspaceAuthGuard>{children}</CreatorWorkspaceAuthGuard>;
}
