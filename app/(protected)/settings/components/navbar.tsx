"use client";
import { Palette, Search, Settings2, Shield, User, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SettingsNavbar = () => {

    const pathname = usePathname();

    return (
        <div className="w-64 border-r p-4">
            <div className="flex items-center justify-between mb-6 mt-8">
                <h1 className="text-xl font-semibold">Settings</h1>
                <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <nav className="space-y-2">
                {[
                    { icon: User, label: "Profile", href: "/settings/profile" },
                    { icon: Settings2, label: "Account", href: "/settings/account" },
                    { icon: Shield, label: "Security", href: "/settings/security" },
                    { icon: Video, label: "Voice & video", href: "/settings/voice-video" },
                    { icon: Palette, label: "Appearance", href: "/settings/appearance" },
                ].map((item) => {
                    // Vérifier si le chemin de l'élément correspond à l'URL actuelle
                    const isActive = pathname === item.href;

                    return (
                        <Link href={item.href} key={item.label}>
                            <p className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm ${isActive
                                ? "bg-primary/10 text-primary"
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