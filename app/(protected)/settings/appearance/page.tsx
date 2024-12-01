import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AppearanceSettings() {
  return (
    <div className="w-full max-w-3xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day and night themes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Font</h2>
          <Select defaultValue="inter">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="helvetica">Helvetica</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Set the font you want to use in the dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Theme</h2>
          <p className="text-sm text-muted-foreground">
            Select the theme for the dashboard.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Card className="border-2 p-4 hover:border-primary cursor-pointer">
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
              <Card className="border-2 bg-slate-950 p-4 hover:border-primary cursor-pointer">
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
              <p className="text-sm text-center font-medium">Dark</p>
            </div>
          </div>
        </div>
      </div>

      <Button size="lg" className="mt-6">
        Update preferences
      </Button>
    </div>
  )
}

