"use client"

import type * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { RegisterSchema } from "@/schemas"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { Checkbox } from "@/components/ui/checkbox"
import { register } from "@/actions/register"

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    if (!isTermsAccepted) {
      setError("You must accept the Terms of Use and Privacy Policy.")
      return
    }

    setError("")
    setSuccess("")

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error)
        setSuccess(data.success)
      })
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <CardWrapper
      headerLabel=""
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="John Doe" className="h-11 border-[#3A3A3A] text-white focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                      type="email"
                      className="h-11 border-[#3A3A3A] text-white focus:border-blue-500"
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
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type={showPassword ? "text" : "password"}
                        className="h-11 pr-10 border-[#3A3A3A] text-white focus:border-blue-500"
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
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={isTermsAccepted}
              onCheckedChange={(checked) => setIsTermsAccepted(checked === true)}
              className="mt-1 border-[#3A3A3A]"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm text-white leading-relaxed">
                I agree to the{" "}
                <Link href="https://www.qentflow.com/terms-of-service" target="_blank" className="text-blue-500 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="https://www.qentflow.com/privacy-policy" target="_blank" className="text-blue-500 hover:text-blue-700">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full h-11 text-base font-medium">
            {isPending ? "Signing up..." : "Sign up"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}

