"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@prisma/client";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";

const SecuritySchema = z.object({
  password: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  role : z.enum([UserRole.ADMIN, UserRole.USER]),
});

const SecurityPage = () => {
  const user = useCurrentUser();
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings" },
      { label: "Security" },
    ]);
  }, [setBreadcrumbs]);

  const form = useForm<z.infer<typeof SecuritySchema>>({
    resolver: zodResolver(SecuritySchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    }
  });

  const onSubmit = (values: z.infer<typeof SecuritySchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }

          if (data.success) {
            update();
            setSuccess(data.success);
            setShowPasswordFields(false);
            form.reset({ password: undefined, newPassword: undefined });
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <h1 className="text-2xl font-semibold text-center">
          🔒 Security Settings
        </h1>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              {user?.isOAuth === false && (
                <>
                  {!showPasswordFields && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordFields(true)}
                    >
                      Change Password
                    </Button>
                  )}
                  {showPasswordFields && (
                    <>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="******"
                                type="password"
                                disabled={isPending}
                              />
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
                              <Input
                                {...field}
                                placeholder="******"
                                type="password"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
              {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Two Factor Authentication</FormLabel>
                        <FormDescription>
                          Enable two factor authentication for your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              disabled={isPending}
              type="submit"
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default SecurityPage;

