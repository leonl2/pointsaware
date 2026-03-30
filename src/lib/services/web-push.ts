import webpush from "web-push";

let _initialized = false;

function initWebPush() {
  if (_initialized) return;
  webpush.setVapidDetails(
    "mailto:alerts@pointsaware.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  _initialized = true;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  initWebPush();
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
