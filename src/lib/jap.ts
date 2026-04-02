const API_URL = "https://justanotherpanel.com/api/v2";

function getApiKey(): string {
  const key = process.env.JAP_API_KEY;
  if (!key) throw new Error("JAP_API_KEY is not set");
  return key;
}

async function post(params: Record<string, string | number>): Promise<unknown> {
  const body = new URLSearchParams();
  body.set("key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    body.set(k, String(v));
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export interface JapService {
  service: number;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
}

export interface JapOrderResult {
  order: number;
}

export interface JapOrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

export interface JapBalance {
  balance: string;
  currency: string;
}

export const jap = {
  services: () => post({ action: "services" }) as Promise<JapService[]>,

  balance: () => post({ action: "balance" }) as Promise<JapBalance>,

  addOrder: (data: Record<string, string | number>) =>
    post({ action: "add", ...data }) as Promise<JapOrderResult>,

  status: (orderId: number) =>
    post({ action: "status", order: orderId }) as Promise<JapOrderStatus>,

  multiStatus: (orderIds: number[]) =>
    post({ action: "status", orders: orderIds.join(",") }) as Promise<Record<string, JapOrderStatus>>,

  cancel: (orderIds: number[]) =>
    post({ action: "cancel", orders: orderIds.join(",") }),

  refill: (orderId: number) =>
    post({ action: "refill", order: orderId }),
};
