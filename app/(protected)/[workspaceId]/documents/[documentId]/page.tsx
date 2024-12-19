"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { DocumentHeader } from "./document-header";
import { Editor } from "./editor";

export default function DocumentPage() {
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const documentId = params.documentId as string;

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetcher(`/api/documents/${documentId}`),
    enabled: !!documentId,
  });

  useEffect(() => {
    if (document) {
      setBreadcrumbs([
        { label: "Documents", href: `/${currentWorkspace?.id}/documents` },
        { label: document.title },
      ]);
    }
  }, [document, setBreadcrumbs, currentWorkspace?.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <DocumentHeader document={document} />
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto py-8">
          <Editor document={document} />
        </div>
      </div>
    </div>
  );
}