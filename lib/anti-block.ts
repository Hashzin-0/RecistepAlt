export const USER_AGENTS = {
  chrome_desktop: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.129 Safari/537.36',
  ],
  safari_ios: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.6312.52 Mobile/15E148 Safari/604.1',
  ],
  android_mobile: [
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36',
  ],
};

export const RESIDENTIAL_PROXIES = [
  { ip: '185.199.108.153', country: 'US (Residential - AT&T)', latencyMs: 42 },
  { ip: '198.51.100.44', country: 'BR (Residential - Claro)', latencyMs: 38 },
  { ip: '203.0.113.195', country: 'DE (Residential - Deutsche Telekom)', latencyMs: 65 },
  { ip: '172.56.21.89', country: 'US (Mobile 5G - T-Mobile)', latencyMs: 51 },
  { ip: '189.40.72.10', country: 'BR (Residential - Vivo Fibra)', latencyMs: 29 },
];

export function getRandomUserAgent(preset?: 'chrome_desktop' | 'safari_ios' | 'android_mobile' | 'random'): string {
  const chosenPreset = !preset || preset === 'random'
    ? (['chrome_desktop', 'safari_ios', 'android_mobile'] as const)[Math.floor(Math.random() * 3)]
    : preset;

  const list = USER_AGENTS[chosenPreset] || USER_AGENTS.chrome_desktop;
  return list[Math.floor(Math.random() * list.length)];
}

export function generateAntiBlockHeaders(platform: 'instagram' | 'tiktok' | 'unknown', userAgent?: string): Record<string, string> {
  const ua = userAgent || getRandomUserAgent('chrome_desktop');
  const isMobile = ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android');

  const headers: Record<string, string> = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'DNT': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };

  if (!isMobile) {
    headers['Sec-Ch-Ua'] = '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"';
    headers['Sec-Ch-Ua-Mobile'] = '?0';
    headers['Sec-Ch-Ua-Platform'] = ua.includes('Mac') ? '"macOS"' : '"Windows"';
  } else {
    headers['Sec-Ch-Ua-Mobile'] = '?1';
    headers['Sec-Ch-Ua-Platform'] = ua.includes('iPhone') ? '"iOS"' : '"Android"';
  }

  if (platform === 'instagram') {
    headers['Referer'] = 'https://www.google.com/search?q=instagram+video';
    headers['X-Requested-With'] = 'XMLHttpRequest';
  } else if (platform === 'tiktok') {
    headers['Referer'] = 'https://www.tiktok.com/';
  }

  return headers;
}

export function calculateDelayJitter(baseMs = 800, maxJitterMs = 1200): number {
  return baseMs + Math.floor(Math.random() * maxJitterMs);
}

export function getRandomProxy() {
  const idx = Math.floor(Math.random() * RESIDENTIAL_PROXIES.length);
  return RESIDENTIAL_PROXIES[idx];
}
