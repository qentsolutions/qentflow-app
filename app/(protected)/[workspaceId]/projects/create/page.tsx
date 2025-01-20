"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const formSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    features: z.array(z.string()),
    visibility: z.enum(["public", "private"]),
    invitedUsers: z.array(z.string()).optional(),
});

const availableFeatures = [
    {
        id: "boards",
        label: "Boards",
        description: "Create and manage tasks with Kanban boards",
        image: "/features/boards.png"
    },
    {
        id: "documents",
        label: "Documents",
        description: "Create and collaborate on documents",
        image: "/features/documents.png"
    }
];

export default function CreateProjectPage() {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            features: [],
            visibility: "public",
            invitedUsers: [],
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!currentWorkspace?.id) {
            toast.error("Workspace not found");
            return;
        }

        setIsLoading(true);
        try {
            const features = values.features.map(featureId => ({
                type: featureId,
                entityId: `temp-${featureId}-${Date.now()}`, // ID temporaire qui sera remplacé lors de la création de l'entité
            }));

            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    workspaceId: currentWorkspace.id,
                    features,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create project");
            }

            const project = await response.json();
            toast.success("Project created successfully!");
            router.push(`/${currentWorkspace.id}/projects/${project.id}`);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex h-screen w-screen bg-gray-50">
            {/* Left Side - Form */}
            <div className="w-1/2 p-8 overflow-y-auto">
                <Button onClick={() => router.back()}>
                    Back
                </Button>
                <p className="text-3xl font-bold mb-8 mt-8">Create New Project</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter project name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Enter project description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormLabel>Features</FormLabel>
                            <div className="grid grid-cols-2 gap-4">
                                {availableFeatures.map((feature) => (
                                    <Card
                                        key={feature.id}
                                        className={`p-4 cursor-pointer transition-all ${form.getValues("features").includes(feature.id)
                                            ? "border-blue-500 bg-blue-50"
                                            : "hover:border-gray-300"
                                            }`}
                                        onClick={() => {
                                            const currentFeatures = form.getValues("features");
                                            if (currentFeatures.includes(feature.id)) {
                                                form.setValue(
                                                    "features",
                                                    currentFeatures.filter((id) => id !== feature.id)
                                                );
                                                if (selectedFeature === feature.id) {
                                                    setSelectedFeature(null);
                                                }
                                            } else {
                                                form.setValue("features", [...currentFeatures, feature.id]);
                                                setSelectedFeature(feature.id);
                                            }
                                        }}
                                    >
                                        <h3 className="font-semibold">{feature.label}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Visibility</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="public" id="public" />
                                                <label htmlFor="public" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    For my workspace
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="private" />
                                                <label htmlFor="private" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Confidential
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Creating..." : "Create Project"}
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Right Side - Feature Preview */}
            <div className="w-1/2 bg-white p-8 flex items-center justify-center">
                {selectedFeature ? (
                    <div className="text-center">
                        <div className="relative w-[500px] h-[300px] rounded-lg overflow-hidden">
                            <Image
                                src={availableFeatures.find(f => f.id === selectedFeature)?.image || ""}
                                alt="Feature preview"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-4">
                            {availableFeatures.find(f => f.id === selectedFeature)?.label}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {availableFeatures.find(f => f.id === selectedFeature)?.description}
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <p className="text-lg">Select a feature to see preview</p>
                    </div>
                )}
            </div>
        </div>
    );
}
