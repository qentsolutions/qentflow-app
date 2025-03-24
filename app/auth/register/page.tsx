import { RegisterForm } from "@/components/auth/register-form"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Background Design Elements */}
      <div className="absolute inset-0 z-0">
        {/* Glass morphism elements */}
        <div className="absolute left-1/4 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/10 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-400/10 to-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-gradient-to-r from-blue-300/15 to-indigo-400/10 blur-3xl"></div>

        {/* Modern 3D shapes */}
        <div className="absolute right-10 top-20 h-40 w-40 rounded-2xl bg-white/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/30 transform rotate-12"></div>
        <div className="absolute left-20 bottom-20 h-32 w-32 rounded-2xl bg-white/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 transform -rotate-12"></div>

        {/* Floating elements */}
        <div className="absolute left-1/2 top-1/4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-400/20 to-blue-500/30 backdrop-blur-sm shadow-lg"></div>
        <div className="absolute right-1/3 bottom-1/3 h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-400/20 to-blue-500/10 backdrop-blur-sm shadow-lg transform rotate-45"></div>

        {/* Minimal lines */}
        <div className="absolute left-0 top-1/2 h-[1px] w-1/3 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        <div className="absolute right-0 top-2/3 h-[1px] w-1/3 bg-gradient-to-l from-transparent via-blue-400/30 to-transparent"></div>

        {/* Accent dots */}
        <div className="absolute left-1/4 bottom-1/4 flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-500/40"></div>
          <div className="h-2 w-2 rounded-full bg-indigo-500/40"></div>
          <div className="h-2 w-2 rounded-full bg-sky-500/40"></div>
        </div>
      </div>

      {/* Logo */}
      <Link href="https://qentflow.com" className="absolute left-2 top-2 z-50 hover:opacity-80 focus:opacity-80">
        <Image src="/logo.svg" alt="Qentflow Logo" height={200} width={200} priority />
      </Link>

      {/* Form */}
      <div className="relative z-50 flex w-full flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md ">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Create an account</h1>
          <p className="mb-8 text-gray-500">Join Qentflow to streamline your workflow</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

