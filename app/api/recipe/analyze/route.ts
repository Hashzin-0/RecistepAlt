import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideoWithGemini } from '@/lib/gemini-recipe';
import { db } from '@/lib/sqllike-db';
import { VideoMetadata } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let video: VideoMetadata = body.video;

    // If only videoId is supplied, lookup in DB
    if (!video && body.videoId) {
      const allVideos = db.getAllVideos();
      const match = allVideos.find((v) => v.id === body.videoId);
      if (match) {
        let parsedHashtags = [];
        let parsedMentions = [];
        try {
          if (match.hashtags) parsedHashtags = JSON.parse(match.hashtags);
          if (match.mentions) parsedMentions = JSON.parse(match.mentions);
        } catch {}

        video = {
          id: match.id,
          platform: match.platform,
          url: match.url,
          canonicalUrl: match.canonical_url || match.url,
          title: match.title || 'Vídeo de Culinária',
          caption: match.caption || '',
          author: {
            username: match.author_username || 'chef',
            name: match.author_name || match.author_username || 'Chef',
            avatarUrl: match.author_avatar || '',
            profileUrl: `https://${match.platform}.com/@${match.author_username}`,
            verified: Boolean(match.author_verified),
          },
          metrics: {
            views: Number(match.views) || 0,
            likes: Number(match.likes) || 0,
            comments: Number(match.comments) || 0,
            shares: Number(match.shares) || 0,
            saves: Number(match.saves) || 0,
          },
          videoUrl: match.video_url,
          thumbnailUrl: match.thumbnail_url,
          durationSeconds: match.duration_seconds,
          aspectRatio: match.aspect_ratio,
          musicTitle: match.music_title,
          musicAuthor: match.music_author,
          hashtags: parsedHashtags,
          mentions: parsedMentions,
          uploadDate: match.upload_date || match.scraped_at,
          scrapedAt: match.scraped_at,
          extractionStrategy: match.extraction_strategy || 'Stored Video',
          antiBlockStatus: {
            stealthMode: true,
            userAgent: 'Chrome 124',
            responseTimeMs: 250,
          },
        };
      }
    }

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Dados do vídeo ou videoId não fornecidos.' },
        { status: 400 }
      );
    }

    // Check if recipe is already cached in SQLike DB
    const existingRecipe = db.getRecipeByVideoId(video.id);
    if (existingRecipe && !body.forceRegenerate) {
      return NextResponse.json({
        success: true,
        recipe: existingRecipe,
        fromCache: true,
      });
    }

    // Execute Gemini AI analysis on video & audio
    const recipe = await analyzeVideoWithGemini(video);

    // Persist recipe into SQLike database table `recipes`
    db.saveRecipe(recipe);

    return NextResponse.json({
      success: true,
      recipe,
      message: 'Receita analisada e extraída com sucesso pelo Gemini!',
    });
  } catch (err: any) {
    console.error('Error analyzing recipe with Gemini:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Falha ao analisar a receita com o Gemini.' },
      { status: 500 }
    );
  }
}
