import { QueryProvider } from "@/providers/query-provider";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: string;
  };
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  return (
    <QueryProvider>
      <div className="h-full w-full bg-gray-50">
        {children}
      </div>
    </QueryProvider>

  );
};

export default WorkspaceLayout;