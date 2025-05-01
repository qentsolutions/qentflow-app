"use client";

import { AuditLog } from "@prisma/client";
import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityProps {
  items: AuditLog[];
}

export const Activity = ({ items }: ActivityProps) => {
  return (
    <div className="w-full space-y-6">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
      ) : (
        <ol className="space-y-8 pl-4">
          {items.map((item) => (
            <ActivityItem
              key={item.id}
              data={item}
            />
          ))}
        </ol>
      )}
    </div>
  );
};

interface ActivityItemProps {
  data: AuditLog;
}

const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <li className="flex items-start gap-x-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={data.userImage || ""} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {data.userName?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="text-sm font-medium">{data.userName}</p>
          <time className="text-xs text-muted-foreground">
            {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.action}
        </p>
      </div>
    </li>
  );
};

Activity.Skeleton = function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-x-4 w-full">
      <Skeleton className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-gray-700" />
      <div className="w-full space-y-2">
        <div className="flex items-center gap-x-2">
          <Skeleton className="w-24 h-4 bg-neutral-200 dark:bg-gray-700" />
          <Skeleton className="w-12 h-3 bg-neutral-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="w-full h-10 bg-neutral-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};
