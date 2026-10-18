'use client';

import React, { useState } from 'react';
import { parseSocialUrl } from '@/lib/url-parser';
import { VideoMetadata, ScrapeRequestOptions } from '@/lib/types';
import {
  Link2,
  Sparkles,
  SlidersHorizontal,
  Shield,
  Radio,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Instagram,
} from 'lucide-react';

interface ScraperInputProps {
  onScrapeSuccess: (video: VideoMetadata) => void;
  isScraping: boolean;
  setIsScraping: (loading: boolean) => void;
}

const PRESET_URLS = [
  {
    label: '🍮 Pudim Lisinho (Instagram)',
    url: 'https://www.instagram.com/reel/C7pudim99/',
    platform: 'instagram' as const,
  },
  {
    label: '🥧 Empadinha de Frango (TikTok)',
    url: 'https://www.tiktok.com/@cozinha_do_marcos/video/739988221100',
    platform: 'tiktok' as const,
  },
  {
    label: '🍰 Bolo de Cenoura & Chocolate',
    url: 'https://www.instagram.com/reel/C45bolo88L/',
    platform: 'instagram' as const,
  },
  {
    label: '⚡️ TikTok Tech & Anti-Ban',
    url: 'https://www.tiktok.com/@techpulse_br/video/7342918829104829',
    platform: 'tiktok' as const,
  },
];

export function ScraperInput({ onScrapeSuccess, isScraping, setIsScraping }: ScraperInputProps) {
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapeStage, setScrapeStage] = useState<string>('');

  // Anti-block options
  const [stealthMode, setStealthMode] = useState(true);
  const [userAgentPreset, setUserAgentPreset] = useState<'chrome_desktop' | 'safari_ios' | 'android_mobile' | 'random'>('chrome_desktop');
  const [simulateProxy, setSimulateProxy] = useState(true);
  const [delayJitterMs, setDelayJitterMs] = useState(300);

  const parsedUrl = parseSocialUrl(url);

  const handleScrape = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) {
      setError('Por favor, insira ou selecione uma URL do Instagram ou TikTok.');
      return;
    }

    const check = parseSocialUrl(finalUrl);
    if (!check.isValid || check.platform === 'unknown') {
      setError('Formato inválido. Insira uma URL de Reel/Post do Instagram ou vídeo do TikTok.');
      return;
    }

    setError(null);
    setIsScraping(true);

    try {
      setScrapeStage('Analisando cabeçalhos e aplicando stealth fingerprint...');
      await new Promise((r) => setTimeout(r, 200));

      setScrapeStage(`Conectando ao gateway com camuflagem de User-Agent (${userAgentPreset})...`);

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl,
          stealthMode,
          userAgentPreset,
          simulateProxy,
          delayJitterMs,
        } as ScrapeRequestOptions),
      });

      setScrapeStage('Extraindo streams de vídeo, engajamento e metadados...');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao raspar metadados do vídeo.');
      }

      setScrapeStage('Persistindo registro automaticamente no banco SQLike...');
      await new Promise((r) => setTimeout(r, 250));

      onScrapeSuccess(json.data);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado na extração.');
    } finally {
      setIsScraping(false);
      setScrapeStage('');
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Extrator de Vídeos Anti-Bloqueio</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Insira o link de um Instagram Reel ou TikTok para extrair vídeo, métricas e persistir no SQLike.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showAdvanced
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurações Anti-Ban</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </div>

        {/* URL Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Link2 className="w-4 h-4" />
            </div>

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole a URL do Instagram (instagram.com/reel/...) ou TikTok (tiktok.com/@.../video/...)"
              disabled={isScraping}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScrape();
                }
              }}
              className="w-full pl-10 pr-28 py-3 bg-zinc-950 border border-zinc-700/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
            />

            {/* Detected Platform Tag */}
            <div className="absolute inset-y-0 right-2 flex items-center">
              {parsedUrl.platform === 'instagram' && (
                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center gap-1 shadow-sm">
                  <Instagram className="w-3 h-3" />
                  Instagram
                </span>
              )}
              {parsedUrl.platform === 'tiktok' && (
                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  TikTok
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleScrape()}
            disabled={isScraping || !url.trim()}
            className="px-5 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Extraindo...</span>
              </>
            ) : (
              <>
                <span>Extrair & Salvar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-zinc-400">
          <span className="text-zinc-500 font-medium">Exemplos rápidos:</span>
          {PRESET_URLS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isScraping}
              onClick={() => {
                setUrl(preset.url);
                handleScrape(preset.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 transition-all flex items-center gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  preset.platform === 'instagram' ? 'bg-pink-400' : 'bg-cyan-400'
                }`}
              />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Scraping Stage Feedback */}
        {isScraping && scrapeStage && (
          <div className="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center gap-3 text-xs text-purple-200 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
            <span>{scrapeStage}</span>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Advanced Anti-Block Settings Drawer */}
        {showAdvanced && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Stealth Mode */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Modo Stealth
                </span>
                <input
                  type="checkbox"
                  checked={stealthMode}
                  onChange={(e) => setStealthMode(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-zinc-800 border-zinc-700"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Injeta cabeçalhos Sec-Ch-Ua, DNT e emula comportamento de navegador legítimo.
              </p>
            </div>

            {/* User-Agent Preset */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
              <label className="font-semibold text-zinc-200 flex items-center gap-1.5 mb-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Rotação de User-Agent
              </label>
              <select
                value={userAgentPreset}
                onChange={(e) => setUserAgentPreset(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="chrome_desktop">Chrome 124 Desktop (Win/Mac)</option>
                <option value="safari_ios">Safari 17 Mobile (iOS / iPhone)</option>
                <option value="android_mobile">Chrome Mobile (Android 14)</option>
                <option value="random">Aleatório a cada requisição</option>
              </select>
            </div>

            {/* Residential Proxy Simulation */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Proxy Residencial
                </span>
                <input
                  type="checkbox"
                  checked={simulateProxy}
                  onChange={(e) => setSimulateProxy(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-zinc-800 border-zinc-700"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Rotaciona IPs residenciais (Vivo, Claro, AT&T) para diluir requisições por subnet.
              </p>
            </div>

            {/* Jitter Delay */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Delay Jitter
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">{delayJitterMs}ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500"
                step="50"
                value={delayJitterMs}
                onChange={(e) => setDelayJitterMs(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Intervalo aleatório para desarmar firewalls de detecção de frequência fixa.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
