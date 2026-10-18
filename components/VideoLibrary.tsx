'use client';

import React, { useState } from 'react';
import { VideoMetadata } from '@/lib/types';
import {
  Layers,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Trash2,
  Terminal,
  Instagram,
  ArrowUpDown,
  ExternalLink,
  ChefHat,
} from 'lucide-react';

interface VideoLibraryProps {
  videos: any[];
  onSelectVideo: (video: VideoMetadata) => void;
  onSelectSQL: (query: string) => void;
  onDeleteVideo: (id: string) => void;
  onAnalyzeRecipe?: (video: VideoMetadata) => void;
}

export function VideoLibrary({
  videos,
  onSelectVideo,
  onSelectSQL,
  onDeleteVideo,
  onAnalyzeRecipe,
}: VideoLibraryProps) {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'scraped_at' | 'views' | 'likes' | 'comments'>('views');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredVideos = videos
    .filter((v) => {
      if (platformFilter !== 'all' && v.platform !== platformFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (v.title && v.title.toLowerCase().includes(term)) ||
        (v.author_username && v.author_username.toLowerCase().includes(term)) ||
        (v.caption && v.caption.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      const valA = a[sortBy] || 0;
      const valB = b[sortBy] || 0;
      if (sortOrder === 'desc') return valB - valA;
      return valA - valB;
    });

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return (num || 0).toLocaleString();
  };

  // Convert raw DB row to VideoMetadata
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

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, autor (@handle) ou palavra-chave..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  platformFilter === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({videos.length})
              </button>

              <button
                type="button"
                onClick={() => setPlatformFilter('instagram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  platformFilter === 'instagram'
                    ? 'bg-pink-950 text-pink-300 border border-pink-800/60 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Instagram className="w-3 h-3 text-pink-400" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatformFilter('tiktok')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  platformFilter === 'tiktok'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>TikTok</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 ml-1" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-200 text-xs py-1 px-1 focus:outline-none"
              >
                <option value="views" className="bg-zinc-900">Mais Vistos</option>
                <option value="likes" className="bg-zinc-900">Mais Curtidos</option>
                <option value="comments" className="bg-zinc-900">Mais Comentados</option>
                <option value="scraped_at" className="bg-zinc-900">Mais Recentes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center">
          <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Nenhum vídeo encontrado</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros aplicados. Tente buscar outro termo ou raspe uma nova URL.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => {
            const isInstagram = video.platform === 'instagram';
            const meta = mapRowToMetadata(video);

            return (
              <div
                key={video.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col group"
              >
                {/* Thumbnail Preview with Platform Tag */}
                <div
                  className="relative aspect-[9/12] bg-zinc-950 overflow-hidden cursor-pointer"
                  onClick={() => onSelectVideo(meta)}
                >
                  <img
                    src={video.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {isInstagram ? (
                      <span className="px-2 py-0.5 rounded-md bg-pink-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow">
                        <Instagram className="w-3 h-3" />
                        Reel
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900/90 text-cyan-300 border border-cyan-500/50 text-[10px] font-semibold flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        TikTok
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-zinc-300 text-[10px] font-mono">
                      {video.duration_seconds ? `${Math.round(video.duration_seconds)}s` : 'HD'}
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center text-white">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Bottom metrics on thumbnail */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white drop-shadow">
                    <span className="flex items-center gap-1 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      {formatNumber(video.views)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {formatNumber(video.likes)}
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Author line */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={video.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                        alt={video.author_name}
                        className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                      />
                      <span className="text-xs text-zinc-300 font-medium truncate">
                        @{video.author_username}
                      </span>
                    </div>

                    <h4
                      className="text-xs font-semibold text-white line-clamp-2 hover:text-purple-300 cursor-pointer transition-colors"
                      onClick={() => onSelectVideo(meta)}
                    >
                      {video.title}
                    </h4>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectSQL(`SELECT * FROM videos WHERE id = '${video.id}';`)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 transition-all"
                        title="Abrir no console SQLike"
                      >
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        <span>SQL</span>
                      </button>

                      {onAnalyzeRecipe && (
                        <button
                          type="button"
                          onClick={() => onAnalyzeRecipe(meta)}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition-all"
                          title="Analisar receita culinária com Gemini AI"
                        >
                          <ChefHat className="w-3 h-3 text-amber-400" />
                          <span>Receita</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Ver URL original"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onDeleteVideo(video.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remover vídeo do banco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
