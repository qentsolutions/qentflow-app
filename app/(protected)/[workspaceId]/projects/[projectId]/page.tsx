"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { BoardList } from "../../boards/components/board-list";
import { DocumentList } from "../../documents/page";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.projectId],
    queryFn: () => fetcher(`/api/projects/${params.projectId}`),
    enabled: !!params.projectId,
  });

  const getFeatureComponent = (feature: any) => {
    switch (feature.type) {
      case "boards":
        return <BoardList boardId={feature.entityId} />;
      case "documents":
        return <DocumentList documentId={feature.entityId} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Lock className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">You don't have access to this project</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddFeatureDialogOpen} onOpenChange={setIsAddFeatureDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Feature to Project</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {["boards", "documents"].map((featureType) => (
                    <Card
                      key={featureType}
                      className="p-4 cursor-pointer hover:border-primary"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/projects/${params.projectId}/features`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ type: featureType }),
                          });

                          if (!response.ok) throw new Error();
                          router.refresh();
                          setIsAddFeatureDialogOpen(false);
                        } catch (error) {
                          console.error("Failed to add feature:", error);
                        }
                      }}
                    >
                      <h3 className="font-semibold capitalize">{featureType}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add {featureType} to your project
                      </p>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => router.push(`${params.projectId}/settings`)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {project.features.map((feature: any) => (
                <TabsTrigger key={feature.id} value={feature.type}>
                  {feature.type}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Project Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.features.map((feature: any) => (
                    <Card key={feature.id} className="p-4">
                      <h4 className="font-medium capitalize">{feature.type}</h4>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab(feature.type)}
                        className="mt-2 p-0"
                      >
                        View {feature.type}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {project.features.map((feature: any) => (
              <TabsContent key={feature.id} value={feature.type} className="mt-4">
                {getFeatureComponent(feature)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}