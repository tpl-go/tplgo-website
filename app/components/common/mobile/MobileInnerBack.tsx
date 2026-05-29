"use client";

import { useRouter } from "next/navigation";

type Props = {
  title?: string;
};

export default function MobileInnerBack({ title }: Props) {
  const router = useRouter();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-10 items-center gap-2 rounded-full border border-[#d9e2ef] bg-white px-4 text-[13px] font-bold text-[#111827] shadow-sm"
      >
        <span className="text-[16px] leading-none">←</span>

        {title ? <span>{title}</span> : <span>Back</span>}
      </button>
    </div>
  );
}