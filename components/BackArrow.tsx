"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackArrow({ fallback = "/home" }: { fallback?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back to the previous page"
      className="group fixed bottom-5 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#ff244f]/70 bg-[#0b0a12] text-[#ff7a96] shadow-[0_0_20px_rgba(255,36,79,0.45)] transition duration-300 hover:bg-[#ff244f]/15 hover:text-white hover:shadow-[0_0_28px_rgba(255,36,79,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9b5cff] md:bottom-auto md:left-3 md:top-1/2 md:-translate-y-1/2"
    >
      <ArrowLeft
        className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}