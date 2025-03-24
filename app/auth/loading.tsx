"use client";

import { BeatLoader } from "react-spinners";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 to-blue-50">
      <Card className="w-[400px] shadow-md p-8">
        <div className="flex flex-col items-center gap-4">
          <Image 
            src="/logo.svg" 
            alt="Logo" 
            width={200} 
            height={100} 
            className="mb-4"
          />
          <BeatLoader color="#2563eb" />
          <p className="text-muted-foreground text-sm">Loading your workspace...</p>
        </div>
      </Card>
    </div>
  );
}