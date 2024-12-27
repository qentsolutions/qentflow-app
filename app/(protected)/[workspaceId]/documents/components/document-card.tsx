import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";

interface DocumentCardProps {
  document: any;
  onClick: () => void;
}

export const DocumentCard = ({ document, onClick }: DocumentCardProps) => {
  const getDocumentPreview = (content: string) => {
    if (!content) return "No content";
    const cleanContent = content.replace(/<[^>]*>/g, '');
    return cleanContent.length > 100 ? cleanContent.substring(0, 100) + "..." : cleanContent;
  };

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className=" h-52 relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 group-hover:shadow-lg">
        {/* A4 effect */}
        <div className="absolute mx-12 inset-2 bg-white shadow-md rounded-lg overflow-hidden">
          {/* Content container */}
          <div className="relative h-full p-4 flex flex-col">
            <div className="flex-1 overflow-hidden">
              {/* Miniature content preview */}
              <div className="transform scale-[0.7] origin-top-left">
                <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight">
                  {getDocumentPreview(document.content)}
                </p>
              </div>
            </div>

            {/* Document info */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t pt-2">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(document.updatedAt), "MMM d")}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(document.createdAt), "MMM d")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-medium text-sm truncate group-hover:text-blue-600">
          {document.title}
        </h3>
      </div>
    </div>
  );
};