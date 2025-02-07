import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Clock, LayoutList } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableRowProps {
  item: any;
  lists: any[];
  onListChange: (cardId: string, newListId: string) => void;
  onRowClick: (id: string) => void;
}

export const TableViewRow = ({ item, lists, onListChange, onRowClick }: TableRowProps) => {
  const getRandomColor = (id: string): string => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <TableRow
      key={item.id}
      className="group hover:bg-gray-50 transition-colors"
    >
      <TableCell 
        className="font-medium cursor-pointer"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex items-center space-x-2">
          <span className="group-hover:text-blue-600 transition-colors">{item.title}</span>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select
          defaultValue={item.listId}
          onValueChange={(value) => onListChange(item.id, value)}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center space-x-2">
              <SelectValue placeholder={item.listTitle} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell 
        className="cursor-pointer"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex gap-1.5 flex-wrap">
          {item.tags?.map((tag: any) => (
            <Badge
              key={tag.id}
              className={`${getRandomColor(tag.id)} text-white px-2 py-0.5 text-xs font-medium`}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell 
        className="text-muted-foreground cursor-pointer"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex items-center space-x-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};