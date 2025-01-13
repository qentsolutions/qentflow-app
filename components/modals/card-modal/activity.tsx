"use client";

import { AuditLog } from "@prisma/client";

import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/components/activity-item";

interface ActivityProps {
  items: AuditLog[];
};

export const Activity = ({
  items,
}: ActivityProps) => {
  return (
    <div className="w-full">
      <ol className="relative space-y-1">
        {items.map((item, index) => (
          <ActivityItem
            key={item.id}
            data={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ol>
    </div>
  );
};

Activity.Skeleton = function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-10 bg-neutral-200" />
      </div>
    </div>
  );
};

