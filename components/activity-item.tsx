import { format, formatDistanceToNow } from "date-fns";
import { AuditLog } from "@prisma/client";
import { generateLogMessage } from "@/lib/generate-log-message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from 'lucide-react';

interface ActivityItemProps {
  data: AuditLog;
  isLast?: boolean;
};

export const ActivityItem = ({ data, isLast }: ActivityItemProps) => {
  const logMessage = generateLogMessage(data);
  const actionType = data.action.toLowerCase();

  const getBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const relativeTime = formatDistanceToNow(new Date(data.createdAt), { addSuffix: true });

  return (
    <li className="relative ml-12 mt-8 pb-0 last:pb-0">
      {!isLast && (
        <div className="absolute left-7 top-5 -bottom-5 w-px bg-border" aria-hidden="true" />
      )}
      <Card className="ml-11 border-none shadow-none">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10 -ml-[52px] ring-4 ring-background relative z-10">
              <AvatarImage src={data.userImage} alt={data.userName} />
              <AvatarFallback>{data.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{data.userName}</p>
                <Badge variant={getBadgeVariant(actionType)}>
                  {actionType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{logMessage}</p>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{relativeTime}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <time dateTime={new Date(data.createdAt).toISOString()}>
                    {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </time>
                </TooltipContent>
              </Tooltip>

            </div>
          </div>
        </CardContent>
      </Card>
    </li>
  );
};





