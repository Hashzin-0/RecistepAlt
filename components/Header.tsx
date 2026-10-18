'use client';

import React from 'react';
import { Database, ShieldCheck, Zap, BookOpen, Layers, PlayCircle, BarChart3, ChefHat } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scraper' | 'recipes' | 'library' | 'sql' | 'analytics' | 'recipe';
  onTabChange: (tab: 'scraper' | 'recipes' | 'library' | 'sql' | 'analytics' | 'recipe') => void;
  videoCount: number;
  recipeCount?: number;
}

export function Header({ activeTab, onTabChange, videoCount, recipeCount }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SocialScraper</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  SQLIKE PRO
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Instagram & TikTok Scraper + Receitas com Gemini AI
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => onTabChange('scraper')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'scraper'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Scraper</span>
            </button>

            <button
              onClick={() => onTabChange('recipes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'recipes'
                  ? 'bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Receitas (IA)</span>
              {recipeCount !== undefined && recipeCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-amber-950/80 text-amber-300 rounded-full border border-amber-700/60 font-mono">
                  {recipeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'library'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Biblioteca</span>
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">
                {videoCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('sql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console SQL</span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => onTabChange('recipe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'recipe'
                  ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-indigo-200 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Roteiro & Receita</span>
            </button>
          </nav>

          {/* Engine Status Indicators */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/90 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bypass Ativo</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/90 px-2.5 py-1.5 rounded-md border border-zinc-800">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>SQLike Pronto</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
