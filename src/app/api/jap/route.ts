import { NextRequest, NextResponse } from "next/server";
import { jap } from "@/lib/jap";
import { categorizeServices } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "services": {
        const raw = await jap.services();
        const categorized = categorizeServices(Array.isArray(raw) ? raw : []);
        return NextResponse.json(categorized);
      }

      case "balance": {
        const data = await jap.balance();
        return NextResponse.json(data);
      }

      case "add": {
        const data = await jap.addOrder(params);
        return NextResponse.json(data);
      }

      case "status": {
        if (params.orders) {
          const ids = String(params.orders).split(",").map(Number);
          const data = await jap.multiStatus(ids);
          return NextResponse.json(data);
        }
        const data = await jap.status(Number(params.order));
        return NextResponse.json(data);
      }

      case "cancel": {
        const ids = String(params.orders).split(",").map(Number);
        const data = await jap.cancel(ids);
        return NextResponse.json(data);
      }

      case "refill": {
        const data = await jap.refill(Number(params.order));
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
