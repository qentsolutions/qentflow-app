"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateWorkspace } from "@/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { PlusCircle, Settings, Users } from "lucide-react";

const UpdateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

const ManageWorkspacesPage = () => {
    const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspace();
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
        resolver: zodResolver(UpdateWorkspaceSchema),
        defaultValues: {
            name: currentWorkspace?.name || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof UpdateWorkspaceSchema>) => {
        setError(undefined);
        setSuccess(undefined);

        if (!currentWorkspace) return;

        const result = await updateWorkspace({
            ...values,
            workspaceId: currentWorkspace.id,
        });

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.workspace) {
            setCurrentWorkspace({
                ...result.workspace,
                members: currentWorkspace.members,
                createdAt: result.workspace.createdAt.toISOString(),
            });
            setSuccess("Workspace updated successfully!");
        }
    };

    const filteredMembers = currentWorkspace?.members.filter((member) =>
        member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-10">
            
        </div>
    );
};

export default ManageWorkspacesPage;
