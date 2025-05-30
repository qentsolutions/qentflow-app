"use client";


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// @ts-ignore
import { useFormStatus } from "react-dom";

interface FormSubmitProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "outline";
};

export const FormSubmit = ({
  children,
  disabled,
  className,
  variant = "outline"
}: FormSubmitProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending || disabled}
      type="submit"
      variant="outline"
      size="sm"
      className={cn(className)}
    >
      {children}
    </Button>
  );
};
