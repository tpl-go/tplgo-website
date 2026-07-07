import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TPL Admin",
  description: "TPL backend administration panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
