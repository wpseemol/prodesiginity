import {
  BanIcon,
  CircleCheckIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import type { AccountRef } from "@/components/accounts/useAccountMutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountActionsMenuProps = {
  account: AccountRef;
  working: boolean;
  /** Verb for blocking sign-in, e.g. "Disable" or "Block". */
  disableLabel: string;
  enableLabel: string;
  onEdit?: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onDelete: () => void;
};

export function AccountActionsMenu({
  account,
  working,
  disableLabel,
  enableLabel,
  onEdit,
  onDisable,
  onEnable,
  onDelete,
}: AccountActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${account.fullName}`}
            disabled={working}
          />
        }
      >
        {working ? <Loader2Icon className="animate-spin" /> : <MoreHorizontalIcon />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onEdit ? (
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
        ) : null}
        {account.disabledAt ? (
          <DropdownMenuItem onClick={onEnable}>
            <CircleCheckIcon />
            {enableLabel}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onDisable}>
            <BanIcon />
            {disableLabel}…
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon />
          Delete…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountStatusBadge({
  disabledAt,
  disabledLabel,
}: {
  disabledAt: string | null;
  disabledLabel: string;
}) {
  return disabledAt ? (
    <Badge variant="destructive" title={`Since ${new Date(disabledAt).toLocaleString()}`}>
      {disabledLabel}
    </Badge>
  ) : (
    <Badge variant="outline">Active</Badge>
  );
}
