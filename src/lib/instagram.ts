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

const brightDataPostSchema = z.object({
  url: z.string(),
  image_url: z.string().nullable().optional(),
});

const brightDataHighlightSchema = z.object({
  highlight_url: z.string(),
  title: z.string(),
});

const brightDataProfileSchema = z.object({
  full_name: z.string().nullable().optional(),
  profile_name: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  profile_image_link: z.string().nullable().optional(),
  is_verified: z.boolean().optional(),
  is_private: z.boolean().optional(),
  followers: z.number().nullable().optional(),
  following: z.number().nullable().optional(),
  posts_count: z.number().nullable().optional(),
  posts: z.array(brightDataPostSchema).optional(),
  highlights: z.array(brightDataHighlightSchema).optional(),
});

type BrightDataProfile = z.infer<typeof brightDataProfileSchema>;

const BRIGHTDATA_API = "https://api.brightdata.com/datasets/v3";
const DATASET_ID = "gd_lk5ns7kz21pck8jpis";
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 120_000;

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function pollSnapshot(snapshotId: string): Promise<BrightDataProfile[]> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${BRIGHTDATA_API}/progress/${snapshotId}`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Bright Data progress check failed: ${res.status}`);
    }

    const { status } = (await res.json()) as { status: string };

    if (status === "ready") {
      const dataRes = await fetch(
        `${BRIGHTDATA_API}/snapshot/${snapshotId}?format=json`,
        { headers: authHeaders() },
      );
      if (!dataRes.ok) {
        throw new Error(`Bright Data snapshot download failed: ${dataRes.status}`);
      }
      const raw = await dataRes.json();
      return z.array(brightDataProfileSchema).parse(raw);
    }

    if (status === "failed") {
      throw new Error(`Bright Data snapshot ${snapshotId} failed`);
    }
  }

  throw new Error("Bright Data polling timed out after 2 minutes");
}

function mapProfile(username: string, p: BrightDataProfile): InstagramProfile {
  return {
    username,
    fullName: p.full_name ?? p.profile_name ?? null,
    bio: p.biography ?? null,
    profilePicUrl: p.profile_image_link ?? null,
    isVerified: p.is_verified ?? false,
    isPrivate: p.is_private ?? false,
    followersCount: p.followers != null ? String(p.followers) : null,
    followingCount: p.following != null ? String(p.following) : null,
    postsCount: p.posts_count != null ? String(p.posts_count) : null,
    posts: (p.posts ?? [])
      .slice(0, 6)
      .map((post) => ({ url: post.url, thumbnail: post.image_url ?? null })),
    storyHighlights: (p.highlights ?? []).map((h) => ({
      title: h.title,
      url: h.highlight_url,
    })),
  };
}

export async function scrapeInstagramProfile(
  username: string,
): Promise<InstagramProfile> {
  const cleanUsername = username.replace(/^@/, "").trim();

  const res = await fetch(
    `${BRIGHTDATA_API}/scrape?dataset_id=${DATASET_ID}&format=json`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        input: [{ url: `https://www.instagram.com/${cleanUsername}/` }],
      }),
    },
  );

  let profiles: BrightDataProfile[];

  if (res.status === 200) {
    const raw = await res.json();
    profiles = z.array(brightDataProfileSchema).parse(raw);
  } else if (res.status === 202) {
    const { snapshot_id } = (await res.json()) as { snapshot_id: string };
    profiles = await pollSnapshot(snapshot_id);
  } else {
    const body = await res.text();
    throw new Error(`Bright Data error ${res.status}: ${body}`);
  }

  const profile = profiles[0];
  if (!profile) {
    throw new Error(`Instagram profile not found: ${cleanUsername}`);
  }

  return mapProfile(cleanUsername, profile);
}
