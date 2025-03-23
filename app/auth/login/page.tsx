import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Logo */}
      <Link
        href="https://qentflow.com"
        className="absolute left-2 top-2 z-10 transition-opacity hover:opacity-80 focus:opacity-80"
      >
        <Image src="/logo.svg" alt="Qentflow Logo" height={200} width={200} priority />
      </Link>

      {/* Left side - Form */}
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10 md:px-16 lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Welcome back</h1>
          <p className="mb-8 text-gray-500">Sign in to your account to continue</p>
          <LoginForm />
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:relative lg:block lg:flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-foreground/90 opacity-90 mix-blend-multiply" />
        <Image
          src="/hero-logo.png"
          alt="Hero Image"
          fill
          sizes="50vw"
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  )
}

