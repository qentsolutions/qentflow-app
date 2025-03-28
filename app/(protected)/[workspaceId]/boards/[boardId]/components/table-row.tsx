import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { Clock, MoreHorizontal, Trash } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface TableRowProps {
  item: any
  lists: any[]
  onListChange: (cardId: string, newListId: string) => void
  onRowClick: (id: string) => void
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
    ]
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  function onDelete(id: any) {
    throw new Error("Function not implemented.")
  }

  return (
    <TableRow
      key={item.id}
      className="group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <TableCell
        className="font-medium cursor-pointer py-4 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex items-center space-x-2">
          <span className="group-hover:text-blue-600 transition-colors">{item.title}</span>
        </div>
      </TableCell>
      <TableCell
        className="py-4 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Select defaultValue={item.listId} onValueChange={(value) => onListChange(item.id, value)}>
          <SelectTrigger className="w-full">
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
        className="cursor-pointer py-4 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex gap-1.5 flex-wrap">
          {item.tags?.map((tag: any) => (
            <Badge key={tag.id} className={`${getRandomColor(tag.id)} text-white px-2 py-0.5 text-xs font-medium`}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell
        className="text-muted-foreground cursor-pointer py-4 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
        onClick={() => onRowClick(item.id)}
      >
        <div className="flex items-center space-x-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
        </div>
      </TableCell>
      <TableCell
        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-[80px]"
        onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => {
                onDelete(item.id)
              }}
            >
              Delete
              <Trash size={16} className=" text-red-500" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

