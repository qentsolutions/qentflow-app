"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createDocument } from "@/actions/documents/create-document";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentCard } from "./components/document-card";

export default function DocsPage() {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("Untitled Document");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const { setBreadcrumbs } = useBreadcrumbs();
  const workspaceId = currentWorkspace?.id;

  useEffect(() => {
    document.title = "Documents - QentFlow";
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: "Documents" }]);
  }, [setBreadcrumbs]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: () => workspaceId ? fetcher(`/api/documents?workspaceId=${workspaceId}`) : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  const sortDocuments = (docs: any[]) => {
    if (!docs) return [];
    const sorted = [...docs];
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const filteredDocs = documents ? sortDocuments(
    documents.filter((doc: any) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const handleCreateDocument = async () => {
    if (!workspaceId) {
      toast.error("Workspace not found");
      return;
    }

    try {
      const result = await createDocument({
        title,
        workspaceId
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        toast.success("Document created successfully!");
        router.push(`/${workspaceId}/documents/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  const getDocumentPreview = (content: string) => {
    if (!content) return "No content";
    // Nettoyer le contenu HTML et limiter la longueur
    const cleanContent = content.replace(/<[^>]*>/g, '');
    return cleanContent.length > 100 ? cleanContent.substring(0, 100) + "..." : cleanContent;
  };

  return (
    <div className="py-8 px-4 h-screen">
      <Card className="shadow-sm rounded-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-x-2">
                  <h1 className="text-2xl font-bold">All Documents</h1>
                  {documents && (
                    <span>
                      ({documents?.length > 0 ? <>{documents.length}</> : <>0</>})
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground">
                  Manage and organize your workspace documents
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Title</label>
                      <Input
                        placeholder="Enter document title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateDocument} className="w-full">
                      Create Document
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.map((doc: any) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onClick={() => router.push(`/${workspaceId}/documents/${doc.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocs.map((doc: any) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => router.push(`/${workspaceId}/documents/${doc.id}`)}
                  >
                    <CardContent className="flex items-center p-4">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.title}</h3>

                      </div>
                      <div className="text-sm text-muted-foreground">
                        Updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredDocs.length === 0 && (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new document.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}