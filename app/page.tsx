'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ScraperInput } from '@/components/ScraperInput';
import { ScrapeResultCard } from '@/components/ScrapeResultCard';
import { DatabaseExplorer } from '@/components/DatabaseExplorer';
import { VideoLibrary } from '@/components/VideoLibrary';
import { AnalyticsOverview } from '@/components/AnalyticsOverview';
import { ArchitectureRecipe } from '@/components/ArchitectureRecipe';
import { RecipeHub } from '@/components/RecipeHub';
import { VideoMetadata } from '@/lib/types';
import {
  Sparkles,
  Layers,
  Database,
  BarChart3,
  BookOpen,
  X,
  RefreshCw,
  Zap,
  ChefHat,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scraper' | 'recipes' | 'library' | 'sql' | 'analytics' | 'recipe'>('scraper');
  const [videos, setVideos] = useState<any[]>([]);
  const [recipeCount, setRecipeCount] = useState<number>(0);
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);
  const [inspectVideo, setInspectVideo] = useState<VideoMetadata | null>(null);
  const [recipeToAnalyze, setRecipeToAnalyze] = useState<VideoMetadata | null>(null);
  const [sqlInitialQuery, setSqlInitialQuery] = useState<string | undefined>(undefined);
  const [isScraping, setIsScraping] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Load videos from SQLike database
  const loadVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await fetch('/api/db/videos?limit=100&sort=scraped_at&order=DESC');
      const data = await res.json();
      if (data.success && data.videos) {
        setVideos(data.videos);
        // Default current video to first video in DB if not set
        if (!currentVideo && data.videos.length > 0) {
          const first = data.videos[0];
          setCurrentVideo(mapRowToMetadata(first));
        }
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoadingVideos(false);
    }

    try {
      const recRes = await fetch('/api/recipe');
      const recData = await recRes.json();
      if (recData.success && recData.recipes) {
        setRecipeCount(recData.recipes.length);
      }
    } catch {}
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const mapRowToMetadata = (row: any): VideoMetadata => {
    let parsedHashtags = [];
    let parsedMentions = [];
    try {
      if (row.hashtags) parsedHashtags = JSON.parse(row.hashtags);
      if (row.mentions) parsedMentions = JSON.parse(row.mentions);
    } catch {
      // fallback
    }

    return {
      id: row.id,
      platform: row.platform,
      url: row.url,
      canonicalUrl: row.canonical_url || row.url,
      title: row.title || 'Vídeo sem título',
      caption: row.caption || '',
      author: {
        username: row.author_username || 'creator',
        name: row.author_name || row.author_username || 'Creator',
        avatarUrl: row.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        profileUrl: `https://${row.platform}.com/@${row.author_username}`,
        verified: Boolean(row.author_verified),
      },
      metrics: {
        views: Number(row.views) || 0,
        likes: Number(row.likes) || 0,
        comments: Number(row.comments) || 0,
        shares: Number(row.shares) || 0,
        saves: Number(row.saves) || 0,
      },
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      durationSeconds: row.duration_seconds,
      aspectRatio: row.aspect_ratio,
      musicTitle: row.music_title,
      musicAuthor: row.music_author,
      hashtags: parsedHashtags,
      mentions: parsedMentions,
      uploadDate: row.upload_date || row.scraped_at,
      scrapedAt: row.scraped_at,
      extractionStrategy: row.extraction_strategy || 'SQLike Stored Record',
      antiBlockStatus: {
        stealthMode: true,
        userAgent: 'Chrome 124 Desktop (Stored)',
        responseTimeMs: row.latency_ms || 280,
        proxyUsed: 'Residential Proxy (BR/US)',
      },
    };
  };

  const handleScrapeSuccess = (newVideo: VideoMetadata) => {
    setCurrentVideo(newVideo);
    loadVideos();
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Deseja excluir este vídeo do banco SQLike?')) return;
    try {
      const res = await fetch(`/api/db/videos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (currentVideo?.id === id) {
          setCurrentVideo(null);
        }
        if (inspectVideo?.id === id) {
          setInspectVideo(null);
        }
        loadVideos();
      }
    } catch (err) {
      console.error('Delete video failed:', err);
    }
  };

  const handleSelectSQL = (query: string) => {
    setSqlInitialQuery(query);
    setActiveTab('sql');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setInspectVideo(null);
        }}
        videoCount={videos.length}
        recipeCount={recipeCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: Scraper & Extraction */}
        {activeTab === 'scraper' && (
          <div className="space-y-8">
            {/* Input & Anti-ban controls */}
            <ScraperInput
              onScrapeSuccess={handleScrapeSuccess}
              isScraping={isScraping}
              setIsScraping={setIsScraping}
            />

            {/* Scraped Video Card (Result) */}
            {currentVideo ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Último Vídeo Extraído e Persistido no SQLike</span>
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    Gravado na tabela: <span className="text-emerald-400">videos</span>
                  </span>
                </div>

                <ScrapeResultCard
                  video={currentVideo}
                  onSelectSQL={handleSelectSQL}
                  onDelete={handleDeleteVideo}
                  onAnalyzeRecipe={(v) => {
                    setRecipeToAnalyze(v);
                    setActiveTab('recipes');
                  }}
                />
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhum vídeo selecionado. Insira um link acima ou clique em um dos exemplos rápidos para extrair metadados e vídeo.
                </p>
              </div>
            )}

            {/* Quick Recent Videos Bar */}
            {videos.length > 0 && (
              <div className="pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Vídeos Recentes no Banco ({videos.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Ver todos na Biblioteca →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {videos.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setCurrentVideo(mapRowToMetadata(v))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                        currentVideo?.id === v.id
                          ? 'bg-purple-950/40 border-purple-600/60 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={v.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                        alt={v.title}
                        className="w-12 h-14 rounded-lg object-cover bg-zinc-950 shrink-0"
                      />
                      <div className="truncate">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {v.platform}
                        </span>
                        <p className="text-xs font-medium text-white truncate mt-1">
                          {v.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          @{v.author_username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Gemini Culinary Recipes */}
        {activeTab === 'recipes' && (
          <RecipeHub
            videos={videos}
            onSelectSQL={handleSelectSQL}
            selectedRecipeVideo={recipeToAnalyze}
          />
        )}

        {/* TAB 3: Library */}
        {activeTab === 'library' && (
          <VideoLibrary
            videos={videos}
            onSelectVideo={(video) => setInspectVideo(video)}
            onSelectSQL={handleSelectSQL}
            onDeleteVideo={handleDeleteVideo}
            onAnalyzeRecipe={(v) => {
              setRecipeToAnalyze(v);
              setActiveTab('recipes');
            }}
          />
        )}

        {/* TAB 4: SQL Console */}
        {activeTab === 'sql' && (
          <DatabaseExplorer
            initialQuery={sqlInitialQuery}
            onRefreshVideos={loadVideos}
          />
        )}

        {/* TAB 5: Analytics */}
        {activeTab === 'analytics' && <AnalyticsOverview videos={videos} />}

        {/* TAB 6: Recipe & Architecture */}
        {activeTab === 'recipe' && <ArchitectureRecipe />}
      </main>

      {/* Video Detail Modal (Inspector) */}
      {inspectVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setInspectVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <ScrapeResultCard
              video={inspectVideo}
              onSelectSQL={(q) => {
                setInspectVideo(null);
                handleSelectSQL(q);
              }}
              onDelete={(id) => {
                handleDeleteVideo(id);
                setInspectVideo(null);
              }}
              onAnalyzeRecipe={(v) => {
                setRecipeToAnalyze(v);
                setActiveTab('recipes');
                setInspectVideo(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>
          SocialScraper Pro • Instagram & TikTok Anti-Ban Extractor com Banco SQLike Integrado
        </p>
      </footer>
    </div>
  );
}
