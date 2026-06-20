// src/api/notifications.ts
import { BASE } from "./base";
import { adminHeaders } from "./admin";

const NOTIFICATIONS = `${BASE}/notifications`;

export async function getVapidPublicKey(token: string): Promise<string> {
  const res = await fetch(`${NOTIFICATIONS}/vapid-public-key/`, {
    headers: adminHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch VAPID public key");
  const data = await res.json();
  return data.public_key as string;
}

export async function subscribePush(
  token: string,
  subscription: PushSubscriptionJSON,
): Promise<void> {
  const res = await fetch(`${NOTIFICATIONS}/subscribe/`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify(subscription),
  });
  if (!res.ok) throw new Error("Failed to save push subscription");
}

export async function unsubscribePush(
  token: string,
  endpoint: string,
): Promise<void> {
  const res = await fetch(`${NOTIFICATIONS}/unsubscribe/`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error("Failed to remove push subscription");
}