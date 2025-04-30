"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserWorkspaces } from "@/actions/workspace";
import LoadingPage from "../loading";
import { currentUser } from "@/lib/auth";

export default function LoadingRedirect() {
    const router = useRouter();

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                // Check if user has completed onboarding
                const user = await fetch('/api/user/me').then(res => res.json());
                
                if (!user.hasCompletedOnboarding) {
                    setTimeout(() => {
                        router.push("/onboarding");
                    }, 1000);
                    return;
                }
                
                // If onboarding is complete, proceed with normal flow
                const { workspaces, error } = await getUserWorkspaces();

                if (error) {
                    console.error("Error fetching workspaces:", error);
                    setTimeout(() => {
                        router.push("/workspace/select");
                    }, 1000);
                    return;
                }

                if (!workspaces || workspaces.length === 0) {
                    setTimeout(() => {
                        router.push("/workspace/select");
                    }, 1000);
                } else {
                    setTimeout(() => {
                        router.push(`/${workspaces[0].id}/home`);
                    }, 1000);
                }
            } catch (error) {
                console.error("Error in checkUserStatus:", error);
                setTimeout(() => {
                    router.push("/workspace/select");
                }, 1000);
            }
        };

        checkUserStatus();
    }, [router]);

    return <LoadingPage />;
}