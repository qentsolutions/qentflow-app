import { RegisterForm } from "@/components/auth/register-form"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full h-full overflow-hidden bg-[#272727]">
  
      {/* Logo */}
      <Link href="https://qentflow.com" className="absolute left-8 top-8 z-50 hover:opacity-80 focus:opacity-80">
        <Image src="/logo_only_icon.svg" alt="Qentflow Logo" height={60} width={60} priority />
      </Link>

      {/* Form */}
      <div className="relative z-50 flex w-full flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md ">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl">Create an account</h1>
          <p className="text-[#BDBDBD]">Join Qentflow to streamline your workflow</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

