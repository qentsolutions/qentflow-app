import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";

const RegisterPage = () => {
  return (
    <div className="w-screen flex min-h-screen">
      {/* Conteneur principal */}
      <div className="absolute top-4 left-4 flex items-center gap-x-2">
        <Image
          src="/logo.png"
          alt="QentFlow Logo"
          height={30}
          width={30}
          className="rounded-lg"
        />
        <div className="relative font-black inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500">
            <span className="z-40 text-xl">QentFlow</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex-col flex items-center justify-center p-8 bg-[#F8FAFC]">
        <RegisterForm />
      </div>
      <div className="hidden lg:block flex-1 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
        <div className="relative flex flex-col justify-center items-center h-full text-white p-12">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to QentFlow</h2>
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