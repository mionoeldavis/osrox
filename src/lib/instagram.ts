import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createGateway } from "@ai-sdk/gateway";
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

  try {
    const page = stagehand.context.pages()[0];
    await page.goto(`https://www.instagram.com/${cleanUsername}/`, {
      waitUntil: "domcontentloaded",
      timeoutMs: 30000,
    });

    await page.waitForTimeout(3000);

    const profileData = await stagehand.extract(
      "Extract the profile information from this Instagram profile page including: full name, bio/description, profile picture URL, whether the account is verified, whether the account is private, number of followers, number of following, and number of posts",
      profileSchema,
    );

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

    const [postsData, highlightsData] = await Promise.all([
      stagehand.extract(
        "Extract the last 6 post links from the profile grid. For each post, get the full URL (like https://www.instagram.com/p/...) and the thumbnail image URL. Only include actual post links, not story circles.",
        postSchema,
      ),
      stagehand.extract(
        "Extract story highlight circles visible on the profile. For each highlight, get its title/label and a link to it (https://www.instagram.com/stories/highlights/...).",
        highlightSchema,
      ),
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
    await stagehand.close();
  }
}
