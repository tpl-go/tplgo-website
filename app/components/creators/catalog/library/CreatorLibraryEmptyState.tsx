import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { libraryEmptyStates, type LibraryTab } from "@/app/lib/creators/creatorLibraryData";

export default function CreatorLibraryEmptyState({ tab }: { tab: Exclude<LibraryTab, "overview"> }) {
  const state = libraryEmptyStates[tab];
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-white to-blue-50 px-6 py-14 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-700"><FolderSearch className="h-7 w-7" /></span><h2 className="mt-5">{state.title}</h2><p className="mx-auto mt-3 max-w-lg font-medium text-slate-600">{state.copy}</p><Link href={state.href} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500">{state.cta}</Link></div>;
}
