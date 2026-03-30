// PointsAware Service Worker for Web Push Notifications

self.addEventListener("push", function (event) {
  if (!event.data) return;

  var payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "PointsAware", body: event.data.text() };
  }

  var options = {
    body: payload.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { url: payload.url || "/notifications" },
    tag: "pointsaware-alert",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "PointsAware", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var url = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
