"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import { Separator } from "../ui/separator";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] bg-transparent shadow-none border-none">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent className="px-0">
        {children}
      </CardContent>
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <Separator className="w-3/4 text-[#C7C7C7]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#272727] px-2 text-[#C7C7C7]">
            Or continue with
          </span>
        </div>
      </div>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter className="mt-4">
        <BackButton
          label={backButtonLabel}
          href={backButtonHref}
        />
      </CardFooter>
    </Card>
  );
};
