import { chromium } from "playwright-core";
import { createGateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { z } from "zod";

export interface InstagramPost {
  url: string;
  thumbnail: string | null;
}

export interface InstagramHighlight {
  title: string;
  url: string;
}

export interface InstagramProfile {
  username: string;
  fullName: string | null;
  bio: string | null;
  profilePicUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: string | null;
  followingCount: string | null;
  postsCount: string | null;
  posts: InstagramPost[];
  storyHighlights: InstagramHighlight[];
}

const postSchema = z.object({
  posts: z.array(
    z.object({
      url: z.string(),
      thumbnail: z.string().nullable(),
    }),
  ),
});

const highlightSchema = z.object({
  highlights: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
});

const profileSchema = z.object({
  fullName: z.string().nullable(),
  bio: z.string().nullable(),
  profilePicUrl: z.string().nullable(),
  isVerified: z.boolean(),
  isPrivate: z.boolean(),
  followersCount: z.string().nullable(),
  followingCount: z.string().nullable(),
  postsCount: z.string().nullable(),
});

export async function scrapeInstagramProfile(
  username: string,
): Promise<InstagramProfile> {
  const cleanUsername = username.replace(/^@/, "").trim();

  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });

  const model = gateway("google/gemini-2.5-flash");

  const browser = await chromium.connectOverCDP(
    `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
  );

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await page.goto(`https://www.instagram.com/${cleanUsername}/`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    const html = await page.content();

    const { object: profileData } = await generateObject({
      model,
      schema: profileSchema,
      prompt: `Extract the profile information from this Instagram profile page HTML. Look for: full name, bio/description, profile picture URL, whether the account is verified (blue checkmark), whether the account is private, number of followers, number of following, and number of posts.\n\nHTML:\n${html}`,
    });

    if (profileData.isPrivate) {
      return {
        username: cleanUsername,
        fullName: profileData.fullName,
        bio: profileData.bio,
        profilePicUrl: profileData.profilePicUrl,
        isVerified: profileData.isVerified,
        isPrivate: true,
        followersCount: profileData.followersCount,
        followingCount: profileData.followingCount,
        postsCount: profileData.postsCount,
        posts: [],
        storyHighlights: [],
      };
    }

    const [{ object: postsData }, { object: highlightsData }] =
      await Promise.all([
        generateObject({
          model,
          schema: postSchema,
          prompt: `Extract the last 6 post links from this Instagram profile page HTML. For each post, get the full URL (like https://www.instagram.com/p/...) and the thumbnail image URL. Only include actual post links, not story circles.\n\nHTML:\n${html}`,
        }),
        generateObject({
          model,
          schema: highlightSchema,
          prompt: `Extract story highlight circles visible on this Instagram profile page HTML. For each highlight, get its title/label and a link to it (https://www.instagram.com/stories/highlights/...).\n\nHTML:\n${html}`,
        }),
      ]);

    return {
      username: cleanUsername,
      fullName: profileData.fullName,
      bio: profileData.bio,
      profilePicUrl: profileData.profilePicUrl,
      isVerified: profileData.isVerified,
      isPrivate: false,
      followersCount: profileData.followersCount,
      followingCount: profileData.followingCount,
      postsCount: profileData.postsCount,
      posts: postsData.posts.slice(0, 6),
      storyHighlights: highlightsData.highlights,
    };
  } finally {
    await browser.close();
  }
}
