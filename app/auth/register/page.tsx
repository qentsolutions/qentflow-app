import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";

const RegisterPage = () => {
  return (
    <div className="w-screen flex min-h-screen">
      <div className="flex-1 flex-col flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="QentSolutions logo" width={200} height={200} />
        </div>
        <RegisterForm />
      </div>
      <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
        <div className="relative flex flex-col justify-center items-center h-full text-white p-12">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to QentSolutions</h2>
            <p className="text-lg opacity-90">
              Streamline your workflow and boost productivity with our comprehensive project management solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;