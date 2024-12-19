import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EventDetailsProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetails = ({ event, isOpen, onClose }: EventDetailsProps) => {
  if (!event) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(event.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                </span>
              </div>

              {event.cardId && (
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/boards/${event.cardId}`}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      View linked card
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};