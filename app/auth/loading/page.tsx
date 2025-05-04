"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserWorkspaces } from "@/actions/workspace";
import LoadingPage from "../loading";

export default function LoadingRedirect() {
    const router = useRouter();

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                // Vérifie si l'utilisateur a complété l'onboarding
                const user = await fetch('/api/user/me').then(res => res.json());

                if (!user.hasCompletedOnboarding) {
                    router.push("/onboarding");
                    return;
                }

                // Si onboarding terminé, charge les workspaces
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
                console.error("Error in checkUserStatus:", error);
                router.push("/workspace/select");
            }
        };

        checkUserStatus();
    }, [router]);

    return <LoadingPage />;
}
