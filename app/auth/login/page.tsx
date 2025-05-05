import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full h-full overflow-hidden bg-background">
      {/* Logo */}
      <Link href="https://qentflow.com" className="absolute left-8 top-8 z-50 hover:opacity-80 focus:opacity-80">
        <Image src="/logo_only_icon.svg" alt="Qentflow Logo" height={60} width={60} priority />
      </Link>

      {/* Form */}
      <div className="relative z-10 flex w-full h-full flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md pb-14">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-black md:text-4xl">Welcome back!</h1>
          <p className="text-gray-700">Sign in to your account to continue</p>
          <LoginForm />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full">
            <path
              fill="#3b82f6"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,90,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
          <div className="h-4 w-full bg-blue-700" />
        </div>
      </div>
    </div>
  )
}

