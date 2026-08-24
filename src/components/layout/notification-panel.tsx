"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Calendar, ShoppingBag, Package, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/app/actions/notifications";
import type { Notification } from "@/lib/db/schema";

const typeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  low_stock: { icon: AlertTriangle, color: "text-amber-500" },
  new_reservation: { icon: Calendar, color: "text-blue-500" },
  order: { icon: ShoppingBag, color: "text-green-500" },
  purchase: { icon: Package, color: "text-purple-500" },
};

function getNotificationIcon(type: string) {
  return typeIcons[type] || { icon: Bell, color: "text-gray-500" };
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [notifs, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      if (notifs.success) setNotifications(notifs.notifications);
      if (countRes.success) setUnreadCount(countRes.count);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  async function handleClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground" />
        }
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-red-500">
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Loading...
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-30" />
              No notifications yet
            </div>
          )}
          {notifications.map((n) => {
            const { icon: Icon, color } = getNotificationIcon(n.type);
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                  !n.isRead ? "bg-muted/30" : ""
                }`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{n.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
