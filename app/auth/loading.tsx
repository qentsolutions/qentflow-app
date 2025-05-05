"use client";

import { BeatLoader } from "react-spinners";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo_only_icon.svg"
          alt="Logo"
          width={60}
          height={60}
          className="mb-4"
        />
        <BeatLoader color="#2563eb" />
      </div>
    </div>
  );
}