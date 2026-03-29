import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
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
        <button className="px-4 py-2 rounded-lg border border-pj-slate text-pj-silver text-sm font-medium hover:border-pj-steel hover:text-pj-cream transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="animate-fade-up stagger-1 rounded-xl border border-dashed border-pj-slate p-16 text-center">
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
    </div>
  );
}
