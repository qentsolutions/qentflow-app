"use client";


import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { BoardList } from "./components/board-list";

interface DashboardPageProps {
    searchParams: {
        search?: string;
        favorites?: string;
    };
};

const DashboardPage = ({
    searchParams,
}: DashboardPageProps) => {
    const { currentWorkspace } = useCurrentWorkspace();

    if (!currentWorkspace) {
        return ""
    }

    return (
        <div className="flex-1 h-[calc(100%-80px)] p-6">
            <BoardList
                orgId={currentWorkspace.id}
                query={searchParams}
            />
        </div>
    );
};

export default DashboardPage;