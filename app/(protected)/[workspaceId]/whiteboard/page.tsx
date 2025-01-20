"use client";

import { useEffect } from "react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { WhiteboardList } from "./components/whiteboard-list";

export default function WhiteboardPage() {
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([{ label: "Whiteboards" }]);
    }, [setBreadcrumbs]);

    return (
        <div className="p-6">
            <WhiteboardList />
        </div>
    );
}