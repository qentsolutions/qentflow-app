"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    document.title = "Appearance - QentFlow";
  }, []);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Settings" },
      { label: "Appearance" }
    ]);
  }, [setBreadcrumbs]);

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  return (
    <Card className="rounded-none shadow-none">
      <CardContent>
        <div className="w-full max-w-3xl p-6 space-y-8">
          <div className="space-y-2">
            <p className="text-3xl font-semibold tracking-tight">Appearance</p>
            <p className="text-muted-foreground">
              Customize the appearance of the app. Automatically switch between day and night themes.
            </p>
          </div>

          <div className="space-y-4">


            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Theme</h2>
                  <p className="text-sm text-muted-foreground">
                    Select the theme for the dashboard.
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Card
                    className={`border-2 p-4 cursor-pointer ${theme === "light" ? "border-primary" : "hover:border-primary"
                      }`}
                    onClick={() => handleThemeChange("light")}
                  >
                    <div className="space-y-2">
                      <div className="bg-gray-100 h-2 w-3/4 rounded" />
                      <div className="bg-gray-100 h-2 w-1/2 rounded" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-200" />
                        <div className="bg-gray-100 h-2 w-1/2 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-200" />
                        <div className="bg-gray-100 h-2 w-3/4 rounded" />
                      </div>
                    </div>
                  </Card>
                  <p className="text-sm text-center font-medium">Light</p>
                </div>

                <div className="space-y-2">
                  <Card
                    className={`border-2 bg-slate-950 p-4 cursor-pointer ${theme === "dark" ? "border-primary" : "hover:border-primary"
                      }`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    <div className="space-y-2">
                      <div className="bg-slate-800 h-2 w-3/4 rounded" />
                      <div className="bg-slate-800 h-2 w-1/2 rounded" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-800" />
                        <div className="bg-slate-800 h-2 w-1/2 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-800" />
                        <div className="bg-slate-800 h-2 w-3/4 rounded" />
                      </div>
                    </div>
                  </Card>
                  <p className="text-sm text-center font-medium dark:text-white">Dark</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

    </Card>

  );
}