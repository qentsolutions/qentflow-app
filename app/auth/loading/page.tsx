"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserWorkspaces } from "@/actions/workspace";
import LoadingPage from "../loading";

export default function LoadingRedirect() {
    const router = useRouter();

    useEffect(() => {
        const checkWorkspaces = async () => {
            try {
                const { workspaces, error } = await getUserWorkspaces();

                if (error) {
                    console.error("Error fetching workspaces:", error);
                    router.push("/workspace/select");
                    return;
                }

                if (!workspaces || workspaces.length === 0) {
                    router.push("/workspace/select");
                } else {
                    router.push(`/${workspaces[0].id}/home`);
                }
            } catch (error) {
                console.error("Error in checkWorkspaces:", error);
                router.push("/workspace/select");
            }
        };

        checkWorkspaces();
    }, [router]);

    return <LoadingPage />;
}