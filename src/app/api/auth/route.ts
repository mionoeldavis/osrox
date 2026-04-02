import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = password === process.env.OSROX_PASSWORD;
  return NextResponse.json({ ok: correct });
}
