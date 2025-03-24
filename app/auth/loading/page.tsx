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
                    setTimeout(() => {
                        router.push("/workspace/select");
                    }, 2000); // Attendre 2 secondes avant de rediriger
                    return;
                }

                if (!workspaces || workspaces.length === 0) {
                    setTimeout(() => {
                        router.push("/workspace/select");
                    }, 2000); // Attendre 2 secondes avant de rediriger
                } else {
                    setTimeout(() => {
                        router.push(`/${workspaces[0].id}/home`);
                    }, 2000); // Attendre 2 secondes avant de rediriger
                }
            } catch (error) {
                console.error("Error in checkWorkspaces:", error);
                setTimeout(() => {
                    router.push("/workspace/select");
                }, 2000); // Attendre 2 secondes avant de rediriger
            }
        };

        checkWorkspaces();
    }, [router]);

    return <LoadingPage />;
}
