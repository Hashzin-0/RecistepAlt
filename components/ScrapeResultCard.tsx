'use client';

import React, { useState } from 'react';
import { VideoMetadata } from '@/lib/types';
import {
  Play,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Instagram,
  Terminal,
  Trash2,
  ChefHat,
  Loader2,
} from 'lucide-react';

interface ScrapeResultCardProps {
  video: VideoMetadata;
  onSelectSQL?: (sqlQuery: string) => void;
  onDelete?: (id: string) => void;
  onAnalyzeRecipe?: (video: VideoMetadata) => void;
  isAnalyzingRecipe?: boolean;
}

export function ScrapeResultCard({
  video,
  onSelectSQL,
  onDelete,
  onAnalyzeRecipe,
  isAnalyzingRecipe,
}: ScrapeResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(video, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInstagram = video.platform === 'instagram';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Top Banner with Platform & Anti-Ban Strategy */}
      <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isInstagram ? (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white flex items-center gap-1.5 shadow-sm">
              <Instagram className="w-3.5 h-3.5" />
              Instagram Reel
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              TikTok Video
            </span>
          )}

          <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            ID: {video.id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-300 font-mono">{video.antiBlockStatus.responseTimeMs}ms</span>
          </span>

          <span className="text-zinc-400 hidden sm:flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-300 truncate max-w-[180px]">{video.extractionStrategy}</span>
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Responsive Video Player or Cover Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[280px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
            {video.videoUrl ? (
              <video
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="relative w-full h-full">
                {/* Fallback image */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Video spec badge overlay */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] text-zinc-300 font-mono border border-white/10 pointer-events-none">
              {video.aspectRatio || '9:16'} • {video.durationSeconds ? `${Math.round(video.durationSeconds)}s` : 'HD'}
            </div>
          </div>

          {/* Quick link below video */}
          <div className="mt-3 flex items-center gap-2">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 underline transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir URL original</span>
            </a>
          </div>
        </div>

        {/* Right Column: Author Info, Metrics, Caption, Technical Specs */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Author Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <img
                src={video.author.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={video.author.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-zinc-700"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    {video.author.name}
                  </h3>
                  {video.author.verified && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <a
                  href={video.author.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-purple-400 transition-colors"
                >
                  @{video.author.username}
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {onAnalyzeRecipe && (
                <button
                  type="button"
                  onClick={() => onAnalyzeRecipe(video)}
                  disabled={isAnalyzingRecipe}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                  title="Analisar áudio e vídeo com Gemini para extrair a receita com ingredientes separados por componente, utensílios e etapas"
                >
                  {isAnalyzingRecipe ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChefHat className="w-3.5 h-3.5" />
                  )}
                  <span>{isAnalyzingRecipe ? 'Extraindo IA...' : 'Extrair Receita (Gemini)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyJson}
                title="Copiar JSON com todos os metadados"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'JSON'}</span>
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(video.id)}
                  title="Excluir este vídeo do banco SQLike"
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-all text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Engagement Metrics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-cyan-400 mb-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Views</span>
              </div>
              <span className="font-bold text-white text-base font-mono">
                {formatNumber(video.metrics.views)}
              </span>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-rose-400 mb-1">
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Likes</span>
              </div>
              <span className="font-bold text-white text-base font-mono">
                {formatNumber(video.metrics.likes)}
              </span>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-indigo-400 mb-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Comments</span>
              </div>
              <span className="font-bold text-white text-base font-mono">
                {formatNumber(video.metrics.comments)}
              </span>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Shares</span>
              </div>
              <span className="font-bold text-white text-base font-mono">
                {formatNumber(video.metrics.shares)}
              </span>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Saves</span>
              </div>
              <span className="font-bold text-white text-base font-mono">
                {formatNumber(video.metrics.saves || 0)}
              </span>
            </div>
          </div>

          {/* Caption & Title */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/70">
            <h4 className="font-semibold text-zinc-200 text-sm mb-1.5 line-clamp-1">{video.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
              {video.caption}
            </p>

            {/* Hashtags */}
            {video.hashtags && video.hashtags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {video.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-800/30 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Music & Audio Track */}
          {video.musicTitle && (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 rounded-xl border border-zinc-800/70 text-xs">
              <div className="w-6 h-6 rounded-md bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
              <div className="truncate flex-1">
                <span className="text-zinc-300 font-medium truncate">{video.musicTitle}</span>
                {video.musicAuthor && (
                  <span className="text-zinc-500 ml-1.5">• {video.musicAuthor}</span>
                )}
              </div>
            </div>
          )}

          {/* Anti-Ban & SQL Diagnostic Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Raspado em: {new Date(video.scrapedAt).toLocaleTimeString()}</span>
              </span>
              <span>•</span>
              <span className="text-zinc-500 truncate max-w-[200px]">
                {video.antiBlockStatus.proxyUsed}
              </span>
            </div>

            {onSelectSQL && (
              <button
                type="button"
                onClick={() =>
                  onSelectSQL(`SELECT * FROM videos WHERE id = '${video.id}';`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-mono text-xs border border-cyan-500/30 transition-all"
              >
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Ver no SQLike</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
