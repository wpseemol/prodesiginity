import {
  accountImageUrl,
  initials,
  type AccountImages,
} from "@/lib/accountImage";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  account: AccountImages;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  account,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const src = accountImageUrl(account);
  return (
    <Avatar className={cn("size-8", className)}>
      {src ? <AvatarImage src={src} alt={account.fullName} /> : null}
      <AvatarFallback className={cn("text-xs", fallbackClassName)}>
        {initials(account.fullName)}
      </AvatarFallback>
    </Avatar>
  );
}
