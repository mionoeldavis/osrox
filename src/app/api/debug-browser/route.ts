import { NextRequest, NextResponse } from "next/server";
import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";

export interface DebugBrowserResult {
  url: string;
  finalUrl: string;
  title: string;
  screenshot: string; // base64 data URI
  html: string;
  extract: Record<string, unknown>;
  sessionId: string | null;
  durationMs: number;
}

const extractSchema = z.object({
  pageTitle: z.string().nullable(),
  mainHeading: z.string().nullable(),
  visibleText: z.string().nullable(),
  links: z.array(z.string()).nullable(),
  images: z.array(z.string()).nullable(),
  metaDescription: z.string().nullable(),
});

export async function POST(req: NextRequest) {
  const start = Date.now();

  const missingVars = ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"].filter(
    (v) => !process.env[v],
  );
  if (missingVars.length > 0) {
    return NextResponse.json(
      { error: `Missing env vars: ${missingVars.join(", ")}` },
      { status: 500 },
    );
  }

  let body: { url?: string; extractPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const targetUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  const gateway = createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY });

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    llmClient: new AISdkClient({
      model: gateway("google/gemini-2.5-flash"),
    }),
    verbose: 0,
  });

  await stagehand.init();

  // Grab the session ID from the underlying BrowserBase session if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionId: string | null = (stagehand as unknown as Record<string, any>)
    ?.browserbaseSessionID ?? null;

  try {
    const page = stagehand.context.pages()[0];

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeoutMs: 30000,
    });
    await page.waitForTimeout(2500);

    const [screenshotBuffer, title, finalUrl, html] = await Promise.all([
      page.screenshot({ fullPage: false }),
      page.title(),
      page.url(),
      page.content(),
    ]);

    const screenshot = `data:image/png;base64,${Buffer.from(screenshotBuffer).toString("base64")}`;

    let extract: Record<string, unknown> = {};
    if (process.env.AI_GATEWAY_API_KEY) {
      const prompt =
        body.extractPrompt?.trim() ||
        "Extract: page title, main heading, a short summary of visible text (max 300 chars), up to 10 important links, up to 5 image URLs, and the meta description.";
      try {
        const raw = await stagehand.extract(prompt, extractSchema);
        extract = raw as Record<string, unknown>;
      } catch {
        extract = { error: "AI extract failed" };
      }
    }

    const result: DebugBrowserResult = {
      url: targetUrl,
      finalUrl,
      title,
      screenshot,
      html,
      extract,
      sessionId,
      durationMs: Date.now() - start,
    };

    return NextResponse.json(result);
  } finally {
    await stagehand.close();
  }
}
