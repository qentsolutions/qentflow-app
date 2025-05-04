"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { BreadcrumbProvider } from "@/hooks/use-breadcrumb";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}


const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {

  return (
    <SidebarProvider>
      <BreadcrumbProvider>
        <AppSidebar />
        <main className="w-full">
          <div>
            {children}
          </div>
        </main>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
