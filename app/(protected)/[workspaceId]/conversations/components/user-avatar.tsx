import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
};

export const UserAvatar = ({
  src,
  name,
  className
}: UserAvatarProps) => {
  return (
    <Avatar className={cn(
      "h-7 w-7 md:h-10 md:w-10",
      className
    )}>
      {src ? (
        <AvatarImage src={src} />
      ) : (
        <AvatarFallback className="border-2">{name?.charAt(0).toUpperCase()}</AvatarFallback>
      )}
    </Avatar>
  )
}
