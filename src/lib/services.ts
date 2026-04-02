import { JapService } from "./jap";

export type ServiceCategory = "followers" | "likes" | "comments" | "views";

export interface CategorizedService {
  id: number;
  name: string;
  rate: string;
  min: number;
  max: number;
}

const CATEGORY_KEYWORDS: Record<ServiceCategory, string[]> = {
  followers: ["instagram", "follower"],
  likes: ["instagram", "like"],
  comments: ["instagram", "comment"],
  views: ["instagram", "view"],
};

export function categorizeServices(
  services: JapService[]
): Record<ServiceCategory, CategorizedService[]> {
  const result: Record<ServiceCategory, CategorizedService[]> = {
    followers: [],
    likes: [],
    comments: [],
    views: [],
  };

  for (const svc of services) {
    const nameLower = (svc.name + " " + svc.category).toLowerCase();

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ServiceCategory, string[]][]) {
      if (keywords.every((kw) => nameLower.includes(kw))) {
        result[cat].push({
          id: svc.service,
          name: svc.name,
          rate: svc.rate,
          min: parseInt(svc.min) || 10,
          max: parseInt(svc.max) || 100000,
        });
        break;
      }
    }
  }

  for (const cat of Object.keys(result) as ServiceCategory[]) {
    result[cat].sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  }

  return result;
}
