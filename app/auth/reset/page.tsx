import { ResetForm } from "@/components/auth/reset-form";

const ResetPage = () => {
  return (
    <div className="bg-background">
      <ResetForm />
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
  );
}

export default ResetPage;