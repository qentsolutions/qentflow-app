"use client";

import { useEffect, useState } from "react";

import { CardModal } from "@/components/modals/card-modal";

export const CardModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CardModal />
    </>
  )
}