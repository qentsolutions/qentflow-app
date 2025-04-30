"use client";

import { BeatLoader } from "react-spinners";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#272727]">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo_only_icon.svg"
          alt="Logo"
          width={60}
          height={60}
          className="mb-4"
        />
        <BeatLoader color="#2563eb" />
        <p className="text-gray-500 text-sm">Loading your workspace...</p>
      </div>
    </div>
  );
}