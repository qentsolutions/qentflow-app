import { format } from "date-fns";
import { AuditLog } from "@prisma/client"
import { generateLogMessage } from "@/lib/generate-log-message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from 'lucide-react';

interface ActivityItemProps {
  data: AuditLog;
};

export const ActivityItem = ({ data }: ActivityItemProps) => {
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

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={data.userImage} alt={data.userName} />
            <AvatarFallback>{data.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{data.userName}</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant={getBadgeVariant(actionType)}>
                      {actionType}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Action type: {actionType}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">{logMessage}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <time dateTime={new Date(data.createdAt).toISOString()}>
                {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </time>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
