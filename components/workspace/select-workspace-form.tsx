"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CreditCard, Building2, Coins, Lock } from "lucide-react";

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
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

export const SelectWorkspaceForm = () => {
    const router = useRouter();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([{ label: "Buy Workspace" }]);
    }, [setBreadcrumbs]);

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
            setError("Something went wrong!");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto grid md:grid-cols-2 gap-8 p-8">
                {/* Left Column - Payment Form */}
                <div>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <h1 className="text-2xl font-semibold">Buy Workspace</h1>
                            <p className="text-muted-foreground">
                                Get started with your new workspace today
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
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div>
                                        <Label>Payment Method</Label>
                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                            <Button variant="outline" className="flex items-center gap-2 justify-center h-11">
                                                <CreditCard className="h-4 w-4" />
                                                Credit Card
                                            </Button>
                                            <Button variant="outline" className="flex items-center gap-2 justify-center h-11">
                                                <Building2 className="h-4 w-4" />
                                                Bank Transfer
                                            </Button>
                                            <Button variant="outline" className="flex items-center gap-2 justify-center h-11">
                                                <Coins className="h-4 w-4" />
                                                Cosmic Points
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input placeholder="Card Number" className="h-11" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input placeholder="MM/YY" className="h-11" />
                                            <Input placeholder="CVC" className="h-11" />
                                        </div>
                                    </div>

                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                    
                                    <Button
                                        type="submit"
                                        className="w-full bg-purple-600 hover:bg-purple-700 h-11"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Complete Purchase
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Plan Details */}
                <div className="bg-slate-50 rounded-lg p-8">
                    <h2 className="text-lg font-medium mb-6">Starter Plan</h2>

                    <RadioGroup defaultValue="monthly" className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly">Pay Monthly</Label>
                            </div>
                            <span>$20 / Month / Member</span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border bg-purple-50">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="annual" id="annual" />
                                <Label htmlFor="annual">Pay Annual</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>$16 / Month / Member</span>
                                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Save 15%</span>
                            </div>
                        </div>
                    </RadioGroup>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Total</span>
                            <span className="text-xl font-semibold">$16 / Month</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Guaranteed to be safe & secure, ensuring that all transactions are protected with the highest level of security.
                        </p>
                    </div>

                    <div className="mt-8">
                        <img
                            src="/lovable-uploads/6a1049e4-50e6-418f-b8e0-86146ac8e9a1.png"
                            alt="Plan illustration"
                            className="w-full max-w-[200px] mx-auto opacity-80"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectWorkspaceForm;