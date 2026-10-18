'use client';

import React, { useState, useEffect } from 'react';
import { ExtractedRecipe, VideoMetadata } from '@/lib/types';
import { RecipeViewer } from './RecipeViewer';
import {
  ChefHat,
  Sparkles,
  Utensils,
  Clock,
  Users,
  Search,
  Plus,
  Play,
  ArrowRight,
  Flame,
  CheckCircle2,
  Terminal,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface RecipeHubProps {
  videos: any[];
  onSelectSQL?: (query: string) => void;
  selectedRecipeVideo?: VideoMetadata | null;
}

export function RecipeHub({ videos, onSelectSQL, selectedRecipeVideo }: RecipeHubProps) {
  const [recipes, setRecipes] = useState<ExtractedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<ExtractedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideoToAnalyze, setSelectedVideoToAnalyze] = useState<string>('');

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recipe');
      const data = await res.json();
      if (data.success && data.recipes) {
        setRecipes(data.recipes);
        if (!selectedRecipe && data.recipes.length > 0) {
          setSelectedRecipe(data.recipes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // When a video is passed to analyze from other tabs
  useEffect(() => {
    if (selectedRecipeVideo) {
      handleAnalyzeVideo(selectedRecipeVideo);
    }
  }, [selectedRecipeVideo]);

  const handleAnalyzeVideo = async (video: VideoMetadata, force = false) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/recipe/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video, forceRegenerate: force }),
      });

      const data = await res.json();
      if (data.success && data.recipe) {
        setSelectedRecipe(data.recipe);
        loadRecipes();
      } else {
        alert(data.error || 'Falha ao analisar a receita.');
      }
    } catch (err) {
      console.error('Recipe analyze error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerAnalysisByVideoId = () => {
    if (!selectedVideoToAnalyze) return;
    const target = videos.find((v) => v.id === selectedVideoToAnalyze);
    if (target) {
      let parsedHashtags = [];
      try {
        if (target.hashtags) parsedHashtags = JSON.parse(target.hashtags);
      } catch {}

      const meta: VideoMetadata = {
        id: target.id,
        platform: target.platform,
        url: target.url,
        canonicalUrl: target.canonical_url || target.url,
        title: target.title,
        caption: target.caption,
        author: {
          username: target.author_username,
          name: target.author_name || target.author_username,
          avatarUrl: target.author_avatar,
          profileUrl: target.url,
          verified: Boolean(target.author_verified),
        },
        metrics: {
          views: target.views,
          likes: target.likes,
          comments: target.comments,
          shares: target.shares,
        },
        videoUrl: target.video_url,
        thumbnailUrl: target.thumbnail_url,
        durationSeconds: target.duration_seconds,
        musicTitle: target.music_title,
        musicAuthor: target.music_author,
        hashtags: parsedHashtags,
        mentions: [],
        uploadDate: target.upload_date,
        scrapedAt: target.scraped_at,
        extractionStrategy: target.extraction_strategy,
        antiBlockStatus: {
          stealthMode: true,
          userAgent: 'Chrome 124',
          responseTimeMs: target.latency_ms || 250,
        },
      };

      handleAnalyzeVideo(meta, true);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.recipeTitle.toLowerCase().includes(s) ||
      r.recipeDescription.toLowerCase().includes(s) ||
      r.ingredientSections.some((sec) =>
        sec.items.some((item) => item.name.toLowerCase().includes(s))
      )
    );
  });

  const categories = ['all', ...Array.from(new Set(recipes.map((r) => r.category).filter(Boolean)))];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Trigger */}
      <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-orange-950/70 border border-amber-800/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Análise Culinária com Gemini AI
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              O Gemini analisa o áudio e os frames do vídeo raspado, identificando ingredientes separados por seção (massa, calda, recheio), utensílios necessários para o Mise en Place e modo de preparo passo a passo.
            </p>
          </div>

          {/* Quick Select & Analyze from Scraped Videos */}
          <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5 shrink-0 min-w-[280px]">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Analisar Vídeo do Banco com IA:</span>
            </label>

            <select
              value={selectedVideoToAnalyze}
              onChange={(e) => setSelectedVideoToAnalyze(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">Selecione um vídeo...</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.platform.toUpperCase()}] {v.title.slice(0, 45)}...
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTriggerAnalysisByVideoId}
              disabled={isAnalyzing || !selectedVideoToAnalyze}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analisando Vídeo & Áudio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extrair Receita Completa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Recipe Viewer (if a recipe is selected) */}
      {selectedRecipe ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Receita Selecionada</span>
            </h3>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-mono">Tabela SQL: <span className="text-emerald-400">recipes</span></span>
            </div>
          </div>

          <RecipeViewer
            recipe={selectedRecipe}
            onSelectSQL={onSelectSQL}
            onReanalyze={() => {
              const matchedVideo = videos.find((v) => v.id === selectedRecipe.videoId);
              if (matchedVideo) {
                let parsedHashtags = [];
                try {
                  if (matchedVideo.hashtags) parsedHashtags = JSON.parse(matchedVideo.hashtags);
                } catch {}
                handleAnalyzeVideo(
                  {
                    id: matchedVideo.id,
                    platform: matchedVideo.platform,
                    url: matchedVideo.url,
                    canonicalUrl: matchedVideo.canonical_url,
                    title: matchedVideo.title,
                    caption: matchedVideo.caption,
                    author: {
                      username: matchedVideo.author_username,
                      name: matchedVideo.author_name,
                      avatarUrl: matchedVideo.author_avatar,
                      profileUrl: matchedVideo.url,
                      verified: Boolean(matchedVideo.author_verified),
                    },
                    metrics: {
                      views: matchedVideo.views,
                      likes: matchedVideo.likes,
                      comments: matchedVideo.comments,
                      shares: matchedVideo.shares,
                    },
                    videoUrl: matchedVideo.video_url,
                    thumbnailUrl: matchedVideo.thumbnail_url,
                    hashtags: parsedHashtags,
                    mentions: [],
                    uploadDate: matchedVideo.upload_date,
                    scrapedAt: matchedVideo.scraped_at,
                    extractionStrategy: matchedVideo.extraction_strategy,
                    antiBlockStatus: { stealthMode: true, userAgent: 'Chrome', responseTimeMs: 250 },
                  },
                  true
                );
              }
            }}
            isReanalyzing={isAnalyzing}
          />
        </div>
      ) : null}

      {/* Stored Recipes Catalog */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-purple-400" />
              <span>Catálogo de Receitas Armazenadas ({recipes.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Clique em qualquer receita para visualizar o Mise en Place, ingredientes separados e etapas.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receita ou ingrediente..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((r) => {
            const isCurrent = selectedRecipe?.id === r.id;
            const totalIngredients = r.ingredientSections.reduce((acc, s) => acc + s.items.length, 0);

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {r.category}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {r.prepTime} • {r.cookTime}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-100 line-clamp-1 mb-1">
                    {r.recipeTitle}
                  </h4>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {r.recipeDescription}
                  </p>

                  {/* Section badges preview */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {r.ingredientSections.map((sec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-zinc-950 text-[10px] text-zinc-300 border border-zinc-800 font-medium"
                      >
                        {sec.sectionName} ({sec.items.length})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{r.preparationSteps.length} passos</span>
                  </span>

                  <span className="text-amber-400 font-medium text-xs flex items-center gap-1">
                    <span>Ver Receita</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
