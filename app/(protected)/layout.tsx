"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BreadcrumbProvider, useBreadcrumbs } from "@/hooks/use-breadcrumb";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const BreadcrumbHeader = () => {
  const { breadcrumbs } = useBreadcrumbs();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem key={index}>
            {breadcrumb.href ? (
              <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
            )}
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

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
