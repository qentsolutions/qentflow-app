"use client";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { Palette, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SettingsNavbar = () => {

    const pathname = usePathname();
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([
            { label: "Settings" },
            { label: "Account" }
        ]);
    }, [setBreadcrumbs]);

    return (
        <div className="w-64 bg-background h-full  fixed border-r p-4">
            <div className="flex items-center justify-between mb-6 mt-4">
                <h1 className="text-xl font-semibold">Settings</h1>
            </div>
            <nav className="space-y-2">
                {[
                    { icon: Settings2, label: "Account", href: "/settings/account" },
                    { icon: Palette, label: "Appearance", href: "/settings/appearance" },
                ].map((item) => {

                    const isActive = pathname === item.href;

                    return (
                        <Link href={item.href} key={item.label}>
                            <p className={`flex items-center my-2 w-full gap-3 px-3 py-2 rounded-lg text-sm ${isActive
                                ? "bg-blue-100 text-blue-700 dark:bg-gray-800"
                                : "text-muted-foreground hover:bg-muted"
                                }`}>
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default SettingsNavbar;