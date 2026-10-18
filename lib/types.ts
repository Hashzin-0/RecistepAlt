export const PLATFORMS = ['instagram', 'tiktok', 'unknown'] as const;
export type Platform = 'instagram' | 'tiktok' | 'unknown';

export interface AuthorInfo {
  username: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  verified: boolean;
  followers?: number;
}

export interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
}

export interface VideoMetadata {
  id: string;
  platform: Platform;
  url: string;
  canonicalUrl: string;
  title: string;
  caption: string;
  author: AuthorInfo;
  metrics: VideoMetrics;
  videoUrl?: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  musicTitle?: string;
  musicAuthor?: string;
  musicUrl?: string;
  hashtags: string[];
  mentions: string[];
  uploadDate: string;
  scrapedAt: string;
  extractionStrategy: string;
  antiBlockStatus: {
    stealthMode: boolean;
    userAgent: string;
    responseTimeMs: number;
    proxyUsed?: string;
    rateLimitRemaining?: number;
  };
}

export interface ScrapeRequestOptions {
  url: string;
  stealthMode?: boolean;
  userAgentPreset?: 'chrome_desktop' | 'safari_ios' | 'android_mobile' | 'random';
  simulateProxy?: boolean;
  delayJitterMs?: number;
  customHeaders?: Record<string, string>;
}

export interface ScrapeLog {
  id: string;
  timestamp: string;
  platform: Platform;
  targetUrl: string;
  status: 'success' | 'warning' | 'error';
  strategy: string;
  latencyMs: number;
  extractedTitle?: string;
  errorMessage?: string;
}

export interface SQLTableColumn {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BOOLEAN' | 'DATETIME';
  primaryKey?: boolean;
  notNull?: boolean;
}

export interface SQLQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  query: string;
  error?: string;
}

export type IngredientIconType =
  | 'egg'
  | 'milk'
  | 'wheat'
  | 'flame'
  | 'candy'
  | 'droplet'
  | 'cheese'
  | 'apple'
  | 'carrot'
  | 'meat'
  | 'fish'
  | 'sparkles'
  | 'coffee'
  | 'lemon'
  | 'cookie'
  | 'default';

export interface IngredientItem {
  name: string;
  quantity: string;
  notes?: string;
  icon: IngredientIconType;
}

export interface IngredientSection {
  sectionName: string;
  items: IngredientItem[];
}

export type UtensilIconType =
  | 'blender'
  | 'pot'
  | 'whisk'
  | 'pan'
  | 'bowl'
  | 'spatula'
  | 'oven'
  | 'sieve'
  | 'knife'
  | 'scale'
  | 'timer'
  | 'sparkles'
  | 'default';

export interface UtensilItem {
  name: string;
  purpose: string;
  icon: UtensilIconType;
}

export interface PreparationStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  timeEstimate?: string;
}

export interface ExtractedRecipe {
  id: string;
  videoId: string;
  recipeTitle: string;
  recipeDescription: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  ingredientSections: IngredientSection[];
  utensils: UtensilItem[];
  preparationSteps: PreparationStep[];
  chefTips: string[];
  analyzedAt: string;
  sourceVideo: {
    id: string;
    platform: Platform;
    title: string;
    authorUsername: string;
  };
}
