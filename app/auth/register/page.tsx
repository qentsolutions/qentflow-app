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
      <div className="hidden lg:block flex-1 relative">
        {/* Image en arrière-plan */}
        <Image
          src="/hero-logo.png" // Chemin de votre image
          alt="Hero Image"
          layout="fill" // Permet de remplir tout le conteneur parent
          objectFit="cover" // L'image couvre l'espace tout en respectant son ratio
          objectPosition="center" // Centre l'image dans le conteneur
          priority // Charge l'image en priorité pour améliorer la performance
        />
      </div>
    </div>
  );
}

export default RegisterPage;