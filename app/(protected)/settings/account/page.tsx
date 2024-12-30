"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { settings } from "@/actions/settings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsSchema } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { CheckCircle2, KeyRound, Shield, User2, UserCog2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";

const AccountPage = () => {
    const user = useCurrentUser();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const { update } = useSession();
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([
            { label: "Settings" },
            { label: "Account" }
        ]);
    }, [setBreadcrumbs]);

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            name: user?.name || undefined,
            email: user?.email || undefined,
            password: undefined,
            newPassword: undefined,
            role: user?.role || undefined,
            isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
        }
    });

    const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
        try {
            setIsPending(true);
            setError(undefined);
            setSuccess(undefined);

            const result = await settings(values);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.success) {
                await update();
                setSuccess(result.success);
                setIsPasswordDialogOpen(false);
                form.reset({ password: undefined, newPassword: undefined });
            }
        } catch (error) {
            setError("Something went wrong!");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Profile Section */}
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User2 className="h-5 w-5" /> Profile Information
                    </CardTitle>
                    <CardDescription>
                        Manage your public profile information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.image || undefined} />
                            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline">Change Avatar</Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, GIF or PNG. Max size of 800K
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Your name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isPending}>
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog2 className="h-5 w-5" /> Account Information
                    </CardTitle>
                    <CardDescription>
                        View your account details and status
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Account ID</p>
                            <p className="text-sm text-muted-foreground">{user?.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Account Type</p>
                            <p className="text-sm text-muted-foreground">
                                {user?.isOAuth ? "OAuth Account" : "Email Account"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Role</p>
                            <Badge variant="secondary">{user?.role}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" /> Security Settings
                    </CardTitle>
                    <CardDescription>
                        Manage your account security and authentication methods
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Password Change */}
                    {!user?.isOAuth && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium flex items-center gap-2">
                                        <KeyRound className="h-4 w-4" /> Password
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Change your account password
                                    </p>
                                </div>
                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Change Password</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your current password and a new password to update your credentials.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...form}>
                                            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Current Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="newPassword"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>New Password</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsPasswordDialogOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={isPending}>
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <Separator />
                        </div>
                    )}

                    {/* Two Factor Authentication */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Switch
                            checked={user?.isTwoFactorEnabled}
                            onCheckedChange={(checked) => {
                                form.setValue("isTwoFactorEnabled", checked);
                                form.handleSubmit(onSubmit)();
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default AccountPage;
