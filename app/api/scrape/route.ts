import { NextRequest, NextResponse } from 'next/server';
import { scrapeSocialVideo } from '@/lib/scraper-engine';
import { db } from '@/lib/sqllike-db';
import { parseSocialUrl } from '@/lib/url-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, stealthMode, userAgentPreset, simulateProxy, delayJitterMs } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL é obrigatória e deve ser uma string válida.' },
        { status: 400 }
      );
    }

    const parsed = parseSocialUrl(url);
    if (!parsed.isValid || parsed.platform === 'unknown') {
      return NextResponse.json(
        {
          success: false,
          error: 'URL não reconhecida. Forneça um link válido do Instagram (ex: instagram.com/reel/...) ou TikTok (ex: tiktok.com/@user/video/... ou vm.tiktok.com/...).',
        },
        { status: 400 }
      );
    }

    // Execute resilient multi-tier scraper
    const video = await scrapeSocialVideo({
      url,
      stealthMode: stealthMode !== false,
      userAgentPreset,
      simulateProxy: simulateProxy !== false,
      delayJitterMs,
    });

    // Automatically persist in SQLike database
    db.saveVideo(video);

    // Log the successful scrape operation
    db.logScrape({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      platform: video.platform,
      targetUrl: url,
      status: 'success',
      strategy: video.extractionStrategy,
      latencyMs: video.antiBlockStatus.responseTimeMs,
      extractedTitle: video.title,
    });

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Vídeo extraído e salvo com sucesso no banco SQLike!',
    });
  } catch (err: any) {
    console.error('Error in /api/scrape:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erro ao processar a extração do vídeo.',
      },
      { status: 500 }
    );
  }
}
