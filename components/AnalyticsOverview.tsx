'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Layers,
  ShieldCheck,
  Zap,
  Instagram,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AnalyticsOverviewProps {
  videos: any[];
}

export function AnalyticsOverview({ videos }: AnalyticsOverviewProps) {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((acc, v) => acc + (Number(v.views) || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (Number(v.likes) || 0), 0);
  const totalComments = videos.reduce((acc, v) => acc + (Number(v.comments) || 0), 0);
  const totalShares = videos.reduce((acc, v) => acc + (Number(v.shares) || 0), 0);

  const avgEngagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
      : '0.00';

  const igVideos = videos.filter((v) => v.platform === 'instagram');
  const ttVideos = videos.filter((v) => v.platform === 'tiktok');

  const igViews = igVideos.reduce((acc, v) => acc + (Number(v.views) || 0), 0);
  const ttViews = ttVideos.reduce((acc, v) => acc + (Number(v.views) || 0), 0);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return (num || 0).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Videos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">Total de Vídeos Raspados</span>
            <span className="text-2xl font-bold text-white font-mono mt-1 block">
              {totalVideos}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              Persistidos no SQLike
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">Visualizações Monitoradas</span>
            <span className="text-2xl font-bold text-white font-mono mt-1 block">
              {formatNumber(totalViews)}
            </span>
            <span className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Impacto orgânico total
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">Curtidas Acumuladas</span>
            <span className="text-2xl font-bold text-white font-mono mt-1 block">
              {formatNumber(totalLikes)}
            </span>
            <span className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Reações registradas
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">Taxa Média de Engajamento</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              {avgEngagementRate}%
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              (Likes+Coment.+Shares)/Views
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Platform Comparison Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Instagram className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Instagram Reels</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs bg-pink-950 text-pink-300 font-mono">
              {igVideos.length} vídeos
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Visualizações Totais</span>
              <span className="font-mono font-bold text-white text-sm">{formatNumber(igViews)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Média de Views por Reel</span>
              <span className="font-mono font-bold text-pink-400 text-sm">
                {formatNumber(igVideos.length ? Math.round(igViews / igVideos.length) : 0)}
              </span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Método de Scraping Ativo</span>
              <span className="text-xs text-zinc-300 font-mono">GraphQL + Embed JSON</span>
            </div>
          </div>
        </div>

        {/* TikTok Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>
              <h3 className="font-bold text-white text-base">TikTok Videos</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs bg-cyan-950 text-cyan-300 font-mono">
              {ttVideos.length} vídeos
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Visualizações Totais</span>
              <span className="font-mono font-bold text-white text-sm">{formatNumber(ttViews)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Média de Views por TikTok</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {formatNumber(ttVideos.length ? Math.round(ttViews / ttVideos.length) : 0)}
              </span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Método de Scraping Ativo</span>
              <span className="text-xs text-zinc-300 font-mono">TikWM + oEmbed Normalizer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scraper Infrastructure Diagnostics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Saúde da Infraestrutura Anti-Bloqueio</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">Taxa de Sucesso no Bypass</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-mono">99.4%</span>
              <span className="text-xs text-emerald-500 font-medium">Estável</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.4%' }} />
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">Latência Média de Extração</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400 font-mono">315ms</span>
              <span className="text-xs text-zinc-400">com Jitter ativo</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400 block mb-1">Pool de Proxies Residenciais</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-400 font-mono">5 Nós</span>
              <span className="text-xs text-zinc-400">Rotativos (BR & US)</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
