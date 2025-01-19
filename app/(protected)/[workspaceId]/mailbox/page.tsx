"use client";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { TaskList } from "./components/task-list";
import { TaskDetail } from "./components/task-detail";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Archive, Mail } from "lucide-react";


const SAMPLE_TASKS = [
    { id: "1", title: "Tâche 1", date: "15 jan" },
    { id: "2", title: "Tâche 2", date: "16 jan" },
    { id: "3", title: "Tâche 3", date: "17 jan" },
]


export default function Mailbox() {
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        document.title = "Mailbox - QentFlow";
    }, []);

    useEffect(() => {
        setBreadcrumbs([{ label: "Mailbox" }]);
    }, [setBreadcrumbs]);

    return (
        <div className="h-screen bg-background">
            <header className="border-b border-border bg-background">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-semibold">Boîte de réception</h1>
                </div>
                <Tabs defaultValue="activite" className="px-4">
                    <TabsList>
                        <TabsTrigger value="activite">
                            <Activity className="h-4 w-4 mr-2" />
                            Activity
                        </TabsTrigger>
                        <TabsTrigger value="archives">
                            <Archive className="h-4 w-4 mr-2" />
                            Archives
                        </TabsTrigger>
                        <TabsTrigger value="messages">
                            <Mail className="h-4 w-4 mr-2" />
                            Messages envoyés
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>
            <div className="grid grid-cols-[1fr,400px]">
                <TaskList tasks={SAMPLE_TASKS} onTaskSelect={() => { }} />
                <TaskDetail />
            </div>
        </div>
    )
}