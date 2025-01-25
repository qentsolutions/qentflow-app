"use client";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "@/actions/workspace";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import ButtonCheckout from "@/app/(protected)/workspace/components/button-checkout";
import { useRouter } from "next/navigation";

const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

const plans = {
    monthly: [
        {
            name: "Free",
            members: "up to 5 members",
            price: 0,
            priceId: "1",
            description: "Perfect for beginning"
        },
        {
            name: "Starter",
            members: "1 member",
            price: 4.99,
            priceId: "price_1QSQ4lJCavvHusTltoAiG987",
            description: "Perfect for small team"
        },
        {
            name: "Team",
            members: "2-5 members",
            price: 19.99,
            priceId: "price_1QSQ8bJCavvHusTlIKvid0Aj",
            description: "Great for large team"
        },
        {
            name: "Business",
            members: "6-10 members",
            price: 49.00,
            priceId: "price_1QSQA0JCavvHusTlpzbpAlNa",
            description: "Ideal for growing businesses"
        }
    ],
    annual: [
        {
            name: "Free",
            members: "up to 5 members",
            price: 0,
            priceId: "1",
            description: "Perfect for beginning"
        },
        {
            name: "Starter",
            members: "1 member",
            price: 50.00,
            priceId: "price_1QSQ5pJCavvHusTlfwBZcvid",
            description: "Perfect for small team"
        },
        {
            name: "Team",
            members: "2-5 members",
            price: 200.00,
            priceId: "price_1QSQ94JCavvHusTls0RQSyG1",
            description: "Great for large team"
        },
        {
            name: "Business",
            members: "6-10 members",
            price: 500.00,
            priceId: "price_1QSQAMJCavvHusTl5aOPiBAY",
            description: "Ideal for growing businesses"
        }
    ]
};

export const SelectWorkspaceForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [billingType, setBillingType] = useState<"monthly" | "annual">("monthly");
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const { setBreadcrumbs } = useBreadcrumbs();
    const router = useRouter();

    useEffect(() => {
        setBreadcrumbs([{ label: "Create Workspace" }]);
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
                return { error: result.error };
            }

            if (result.workspaceId) {
                router.push(`/${result.workspaceId}/home`);
                return { workspaceId: result.workspaceId };
            }

            return { error: "No workspace ID returned" };
        } catch (error) {
            setError("Something went wrong!");
            return { error: "Something went wrong!" };
        }
    };

    const isFormValid = form.formState.isValid && selectedPlan;

    const getCurrentPriceId = () => {
        const currentPlans = plans[billingType];
        const plan = currentPlans.find(p => p.priceId === selectedPlan);
        return plan?.priceId || "";
    };


    return (
        <div className="bg-background">
            <div className="mx-auto grid md:grid-cols-2 gap-4 p-4">
                <div>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <h1 className="text-2xl font-semibold">Create Workspace</h1>
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

                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-slate-50 rounded-lg px-8 py-4 border">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">Choose Your Plan</h2>
                        {billingType === "annual" && (
                            <div className="p-4 rounded-lg">
                                <p className="text-green-700 text-sm flex items-center gap-2">
                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Save 15%</span>
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-4 bg-white rounded-lg p-2">
                            <button
                                onClick={() => setBillingType("monthly")}
                                className={`px-4 py-2 rounded-md transition-all ${billingType === "monthly"
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingType("annual")}
                                className={`px-4 py-2 rounded-md transition-all ${billingType === "annual"
                                    ? "bg-blue-500 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Annual
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {plans[billingType].map((plan) => (
                            <div
                                key={plan.priceId}
                                onClick={() => setSelectedPlan(plan.priceId)}
                                className={`py-4 px-6 rounded-lg border transition-all cursor-pointer ${selectedPlan === plan.priceId
                                    ? "border-blue-500 bg-blue-50"
                                    : "bg-white hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                                        <p className="text-sm text-gray-600">{plan.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">${plan.price}</div>
                                        <div className="text-sm text-gray-600">per member/month</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    {plan.members}
                                </div>
                            </div>
                        ))}
                    </div>


                    <div className="flex items-center justify-center my-4">
                        <ButtonCheckout
                            mode="subscription"
                            priceId={getCurrentPriceId()}
                            disabled={!isFormValid}
                            workspaceName={form.getValues("name")}
                            onSubmit={() => onSubmit(form.getValues())}
                        />
                    </div>
                    <div className="my-2 text-center">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            Guaranteed to be safe & secure, ensuring that all transactions are protected with the highest level of security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectWorkspaceForm;