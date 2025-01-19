import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Link, Plus, X } from 'lucide-react'

export function TaskDetail() {
  return (
    <div className="p-6 bg-background border-l border-border h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold">Tâche 1</h2>
          <Button variant="secondary">Marquer comme terminée</Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Responsable</span>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>WQ</AvatarFallback>
                </Avatar>
                <span>William Quesnot</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">15 jan</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Projets</label>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à des projets
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dépendances</label>
            <Button variant="outline" className="w-full justify-start">
              <Link className="h-4 w-4 mr-2" />
              Ajouter des dépendances
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <p className="text-sm text-muted-foreground">
              En quoi consiste cette tâche ?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

