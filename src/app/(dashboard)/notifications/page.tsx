"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications").then((r) => r.json()).catch(() => ({ data: [] }));
    setNotifications(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
            Notifications
          </h1>
          <p className="text-pj-silver mt-1">
            Your alert history and deal notifications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-lg border border-pj-slate text-pj-silver text-sm font-medium hover:border-pj-steel hover:text-pj-cream transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="animate-fade-up stagger-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-pj-silver" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`group rounded-xl border p-4 transition-colors ${
                  notif.isRead
                    ? "border-pj-slate/30 bg-pj-navy/50"
                    : "border-pj-slate/60 bg-pj-navy"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      notif.isRead ? "bg-transparent" : "bg-pj-gold"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        notif.isRead ? "text-pj-silver" : "text-pj-cream"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-pj-silver/70 mt-0.5">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-pj-silver/40">
                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="text-[10px] text-pj-gold hover:text-pj-gold-light flex items-center gap-0.5"
                        >
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="h-7 w-7 rounded-md text-pj-silver hover:text-pj-cream hover:bg-pj-slate/50 flex items-center justify-center"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="h-7 w-7 rounded-md text-pj-silver hover:text-pj-rose hover:bg-pj-rose/10 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-pj-slate p-16 text-center">
            <div className="relative inline-block mb-4">
              <Bell className="h-10 w-10 text-pj-silver/30" />
              <div className="absolute -inset-2 bg-pj-gold/5 rounded-full blur-lg" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-pj-cream">
              No notifications yet
            </h3>
            <p className="text-pj-silver mt-2 text-sm">
              Set up alerts to start receiving notifications about award flight deals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
