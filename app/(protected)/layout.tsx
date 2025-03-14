"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BreadcrumbProvider, useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { FeedbackButton } from "@/components/feedback-button";

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
          <header className="flex z-50 bg-background w-full fixed h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbHeader />
            <FeedbackButton />
          </header>
          <div className="mt-16">
            {children}
          </div>
        </main>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
