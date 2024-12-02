"use client";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";

const SettingsAccountPage = () => {

    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([
            { label: "Settings" },
            { label: "Account" }
        ]);
    }, [setBreadcrumbs]);

    return(
        <div>
            Account page
        </div>
    )
}

export default SettingsAccountPage
