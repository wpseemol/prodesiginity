import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  BriefcaseIcon,
  CheckCheckIcon,
  InfoIcon,
  MailWarningIcon,
  XIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

const POLL_MS = 30_000;

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function iconFor(type: string) {
  if (type.startsWith("career")) return BriefcaseIcon;
  if (type.startsWith("mail")) return MailWarningIcon;
  return InfoIcon;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const lastUnread = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications?limit=15");
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      setItems(data.notifications);
      setUnread(data.unreadCount);
      if (lastUnread.current !== null && data.unreadCount > lastUnread.current) {
        document.dispatchEvent(new CustomEvent("dashboard:notifications"));
      }
      lastUnread.current = data.unreadCount;
    } catch {
      // offline or API restarting; try again on the next tick
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const markRead = async (item: NotificationItem) => {
    if (item.readAt) return;
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnread((n) => Math.max(0, n - 1));
    await apiFetch(`/notifications/${item.id}/read`, { method: "POST" }).catch(() => null);
  };

  const markAll = async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    setUnread(0);
    lastUnread.current = 0;
    await apiFetch("/notifications/read-all", { method: "POST" }).catch(() => null);
  };

  const remove = async (item: NotificationItem) => {
    setItems((prev) => prev.filter((n) => n.id !== item.id));
    if (!item.readAt) setUnread((n) => Math.max(0, n - 1));
    await apiFetch(`/notifications/${item.id}`, { method: "DELETE" }).catch(() => null);
  };

  const openItem = (item: NotificationItem) => {
    void markRead(item);
    if (item.link?.startsWith("/")) navigate(item.link);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          />
        }
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1.5rem)] p-0">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unread ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          {unread > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => void markAll()}>
              <CheckCheckIcon />
              Mark all read
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-muted-foreground">
            <BellIcon className="size-6 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[26rem] overflow-y-auto p-1">
            {items.map((item) => {
              const Icon = iconFor(item.type);
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="group/notification items-start gap-3 rounded-md px-2.5 py-2.5"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      item.readAt ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span
                        className={cn(
                          "line-clamp-2 flex-1 text-sm",
                          item.readAt ? "text-muted-foreground" : "font-medium text-foreground",
                        )}
                      >
                        {item.title}
                      </span>
                      {!item.readAt ? (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                      ) : null}
                    </span>
                    {item.body ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {item.body}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-[11px] text-muted-foreground/80">
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover/notification:opacity-100 group-focus/notification:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      void remove(item);
                    }}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
