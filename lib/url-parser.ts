import type { Platform } from './types.ts';

export interface ParsedUrlInfo {
  platform: Platform;
  cleanUrl: string;
  originalUrl: string;
  id?: string;
  authorUsername?: string;
  isValid: boolean;
  type?: 'reel' | 'post' | 'video' | 'short_link';
}

export function parseSocialUrl(rawUrl: string): ParsedUrlInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      platform: 'unknown',
      cleanUrl: '',
      originalUrl: rawUrl || '',
      isValid: false,
    };
  }

  const trimmed = rawUrl.trim();
  let urlObj: URL;
  try {
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return {
      platform: 'unknown',
      cleanUrl: trimmed,
      originalUrl: trimmed,
      isValid: false,
    };
  }

  const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = urlObj.pathname;

  // Instagram Detection
  if (
    hostname.includes('instagram.com') ||
    hostname === 'instagr.am' ||
    hostname.endsWith('.instagram.com')
  ) {
    // Matches /reel/ID, /reels/ID, /p/ID, /tv/ID
    const reelMatch = pathname.match(/\/(?:reel|reels)\/([A-Za-z0-9_-]+)/i);
    const postMatch = pathname.match(/\/p\/([A-Za-z0-9_-]+)/i);
    const tvMatch = pathname.match(/\/tv\/([A-Za-z0-9_-]+)/i);

    const id = (reelMatch && reelMatch[1]) || (postMatch && postMatch[1]) || (tvMatch && tvMatch[1]) || undefined;
    const type = reelMatch ? 'reel' : postMatch ? 'post' : tvMatch ? 'reel' : 'post';

    // Build canonical clean URL
    const cleanUrl = id
      ? `https://www.instagram.com/${type === 'reel' ? 'reel' : 'p'}/${id}/`
      : `https://www.instagram.com${pathname}`;

    return {
      platform: 'instagram',
      cleanUrl,
      originalUrl: trimmed,
      id,
      isValid: Boolean(id || pathname.length > 3),
      type,
    };
  }

  // TikTok Detection
  if (
    hostname.includes('tiktok.com') ||
    hostname === 'vm.tiktok.com' ||
    hostname === 'vt.tiktok.com'
  ) {
    // Shortened TikTok URLs: vm.tiktok.com/XYZ or vt.tiktok.com/XYZ
    if (hostname.startsWith('vm.') || hostname.startsWith('vt.')) {
      const shortId = pathname.replace(/^\//, '').split('/')[0];
      return {
        platform: 'tiktok',
        cleanUrl: `https://${hostname}/${shortId}`,
        originalUrl: trimmed,
        id: shortId,
        isValid: Boolean(shortId),
        type: 'short_link',
      };
    }

    // Direct video URL: /@username/video/1234567890123456789
    const videoMatch = pathname.match(/\/@([^/]+)\/video\/(\d+)/i);
    if (videoMatch) {
      return {
        platform: 'tiktok',
        cleanUrl: `https://www.tiktok.com/@${videoMatch[1]}/video/${videoMatch[2]}`,
        originalUrl: trimmed,
        id: videoMatch[2],
        authorUsername: videoMatch[1],
        isValid: true,
        type: 'video',
      };
    }

    // Alternative formats: /v/123456789 or /embed/v2/123456789
    const altMatch = pathname.match(/\/(?:v|embed\/v2)\/(\d+)/i);
    if (altMatch) {
      return {
        platform: 'tiktok',
        cleanUrl: `https://www.tiktok.com/video/${altMatch[1]}`,
        originalUrl: trimmed,
        id: altMatch[1],
        isValid: true,
        type: 'video',
      };
    }

    return {
      platform: 'tiktok',
      cleanUrl: `https://www.tiktok.com${pathname}`,
      originalUrl: trimmed,
      isValid: pathname.length > 2,
      type: 'video',
    };
  }

  return {
    platform: 'unknown',
    cleanUrl: trimmed,
    originalUrl: trimmed,
    isValid: false,
  };
}
