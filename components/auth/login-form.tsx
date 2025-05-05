"use client"

import type * as z from "zod"
import { useForm } from "react-hook-form"
import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { LoginSchema } from "@/schemas"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { login } from "@/actions/login"
import { useRouter } from "next/navigation"

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already in use with different provider!" : ""

  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset()
            setError(data.error)
          }

          if (data?.success) {
            form.reset()
            setSuccess(data.success)
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true)
          }

          // Si pas d'erreur et pas de 2FA, on force le rafraîchissement
          if (!data?.error && !data?.twoFactor) {
            router.refresh();
            window.location.reload();
          }
        })
        .catch(() => setError("Something went wrong"))
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <CardWrapper
      headerLabel=""
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="123456" className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="john.doe@example.com"
                          type="email"
                          className="h-11  text-black focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-black">Password</FormLabel>
                        <Button size="sm" variant="link" asChild className="px-0 font-normal text-xs">
                          <Link href="/auth/reset" className="text-gray-600">Forgot password?</Link>
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="******"
                            type={showPassword ? "text" : "password"}
                            className="h-11 pr-10  text-black focus:border-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent absolute right-0 top-0 h-11 w-11"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full h-11 text-base font-medium">
            {isPending ? "Signing in..." : showTwoFactor ? "Confirm" : "Sign in"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
