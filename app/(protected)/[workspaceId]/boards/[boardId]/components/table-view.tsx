"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableViewProps {
  boardId: string;
}

export const TableView = ({ boardId }: TableViewProps) => {
  return (
    <div className="w-full p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Example Task</TableCell>
            <TableCell>In Progress</TableCell>
            <TableCell>High</TableCell>
            <TableCell>2024-03-20</TableCell>
            <TableCell>John Doe</TableCell>
          </TableRow>
          {/* Add more rows as needed */}
        </TableBody>
      </Table>
    </div>
  );
};