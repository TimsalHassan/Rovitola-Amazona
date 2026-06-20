// src/hooks/usePushNotifications.ts
import { useEffect, useRef, useState } from "react";
import { getVapidPublicKey, subscribePush } from "../api/notifications";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

/**
 * Registers the service worker and subscribes the current admin to Web Push
 * so they get a real OS-level notification for new orders even when the
 * dashboard tab isn't open (browser must still be running).
 *
 * Call this once the admin is authenticated, e.g. inside AdminLayout.
 */
export function usePushNotifications(token: string | null) {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const didInit = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (didInit.current) return;
    didInit.current = true;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }

    (async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          setPermission(result as PushPermissionState);
          if (result !== "granted") return;
        } else {
          setPermission(Notification.permission as PushPermissionState);
          if (Notification.permission !== "granted") return;
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const publicKey = await getVapidPublicKey(token);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          });
        }

        await subscribePush(token, subscription.toJSON() as PushSubscriptionJSON);
      } catch (err) {
        // Fails silently (e.g. permission denied, no HTTPS in dev, etc.) —
        // dashboard still works fine without push notifications.
        console.warn("Push notification setup failed:", err);
      }
    })();
  }, [token]);

  return { permission };
}