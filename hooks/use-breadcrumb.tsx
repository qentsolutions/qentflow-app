import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

type Breadcrumb = {
  label: string;
  href?: string;
};

type BreadcrumbContextType = {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const params = useParams();
  const pathname = usePathname();

  // Fetch project details if we're in a board or document that belongs to a project
  const { data: projectData } = useQuery({
    queryKey: ["project-resource", params.boardId || params.documentId],
    queryFn: async () => {
      if (!params.workspaceId || (!params.boardId && !params.documentId)) return null;

      const resourceId = params.boardId || params.documentId;
      const response = await fetch(`/api/resources/${resourceId}/project`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!(params.workspaceId && (params.boardId || params.documentId)),
  });

  useEffect(() => {
    if (projectData && (pathname.includes("/boards/") || pathname.includes("/documents/"))) {
      setBreadcrumbs(prev => {
        const newBreadcrumbs = [...prev];
        // Insert project link before the current page
        newBreadcrumbs.splice(-1, 0, {
          label: projectData.name,
          href: `/${params.workspaceId}/projects/${projectData.id}`,
        });
        return newBreadcrumbs;
      });
    }
  }, [projectData, pathname, params.workspaceId]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
};