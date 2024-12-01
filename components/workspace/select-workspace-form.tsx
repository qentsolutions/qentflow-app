"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "@/actions/workspace";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

export const SelectWorkspaceForm = () => {
    const router = useRouter();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
        resolver: zodResolver(CreateWorkspaceSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof CreateWorkspaceSchema>) => {
        setError(undefined);
        setSuccess(undefined);

        try {
            const result = await createWorkspace(values);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.workspaceId) {
                router.push(`/${result.workspaceId}`);
            }
        } catch (error) {
            // Assurez-vous que l'erreur est gérée correctement
            setError("Something went wrong!");
        }
    };


    return (
        <Card className="w-[600px]">
            <CardHeader>
                <h1 className="text-2xl font-semibold text-center">
                    Create a Workspace
                </h1>
                <p className="text-muted-foreground text-center">
                    Create a workspace to get started
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="My Workspace"
                                            disabled={form.formState.isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                        >
                            Create Workspace
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};