"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ListViewProps {
  boardId: string;
}

export const ListView = ({ boardId }: ListViewProps) => {
  return (
    <div className="w-full p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Example Task 1</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status: In Progress</span>
            <span className="text-muted-foreground">Due: 2024-03-20</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Example Task 2</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status: To Do</span>
            <span className="text-muted-foreground">Due: 2024-03-25</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};