import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TableViewHeaderProps {
    sortField: "title" | "createdAt" | "tags" | "list"
    sortOrder: "asc" | "desc"
    onSort: (field: "title" | "createdAt" | "tags" | "list") => void
}

export const TableViewHeader = ({ sortField, sortOrder, onSort }: TableViewHeaderProps) => {
    return (
        <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
                <TableHead
                    className="cursor-pointer font-semibold text-sm hover:text-black transition-colors py-3 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
                    onClick={() => onSort("title")}
                >
                    <div className="flex items-center space-x-2">
                        <span>Title</span>
                        {sortField === "title" &&
                            (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer font-semibold text-sm hover:text-black transition-colors py-3 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
                    onClick={() => onSort("list")}
                >
                    <div className="flex items-center space-x-2">
                        <span>List</span>
                        {sortField === "list" &&
                            (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer font-semibold text-sm hover:text-black transition-colors py-3 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
                    onClick={() => onSort("tags")}
                >
                    <div className="flex items-center space-x-2">
                        <span>Tags</span>
                        {sortField === "tags" &&
                            (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                </TableHead>
                <TableHead
                    className="cursor-pointer font-semibold text-sm hover:text-black transition-colors py-3 px-6 border-r border-gray-100 last:border-r-0 w-[180px]"
                    onClick={() => onSort("createdAt")}
                >
                    <div className="flex items-center space-x-2">
                        <span>Created</span>
                        {sortField === "createdAt" &&
                            (sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                </TableHead>
                <TableHead className="py-3 px-6 w-[80px]"></TableHead>
            </TableRow>
        </TableHeader>
    )
}

