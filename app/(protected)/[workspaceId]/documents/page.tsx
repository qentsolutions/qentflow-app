"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { createDocument } from "@/actions/documents/create-document";

export default function DocsPage() {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("Untitled Document"); // État pour le titre
  const { setBreadcrumbs } = useBreadcrumbs();
  const workspaceId = currentWorkspace?.id;

  useEffect(() => {
    setBreadcrumbs([{ label: "Documents" }]);
  }, [setBreadcrumbs]);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: () => workspaceId ? fetcher(`/api/documents?workspaceId=${workspaceId}`) : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  const filteredDocs = documents?.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = async () => {
    if (!workspaceId) {
      toast.error("Workspace not found");
      return;
    }

    try {
      const result = await createDocument({
        title, // Utilisation du titre dynamique
        workspaceId
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        router.push(`/${workspaceId}/documents/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            All Documents {documents && (<span>({documents.length})</span>)}
          </CardTitle>
          <Dialog>
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Input
                placeholder="Document title"
                value={title} // Lier l'input à l'état `title`
                onChange={(e) => setTitle(e.target.value)} // Mettre à jour l'état lorsque l'utilisateur tape
              />
              <Button onClick={handleCreateDocument}>
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p>Loading documents...</p>
            ) : filteredDocs?.length > 0 ? (
              filteredDocs.map((doc: any) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/${workspaceId}/documents/${doc.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="text-lg font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        Last edited {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost">Open</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No documents found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}