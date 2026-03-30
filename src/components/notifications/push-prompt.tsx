"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";

export function PushPrompt() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(isSupported);

    if (isSupported) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  if (!supported) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await fetch("/api/push/unsubscribe", { method: "POST" });
      setSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-pj-cyan/10 flex items-center justify-center">
          <Bell className="h-4 w-4 text-pj-cyan" />
        </div>
        <div>
          <p className="text-sm font-medium text-pj-cream">Push Notifications</p>
          <p className="text-xs text-pj-silver">
            {subscribed ? "Enabled — you'll get browser notifications" : "Get browser alerts for deals"}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          subscribed
            ? "border border-pj-slate text-pj-silver hover:border-pj-steel"
            : "bg-pj-cyan/10 text-pj-cyan border border-pj-cyan/20 hover:bg-pj-cyan/20"
        }`}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : subscribed ? (
          "Disable"
        ) : (
          "Enable"
        )}
      </button>
    </div>
  );
}
