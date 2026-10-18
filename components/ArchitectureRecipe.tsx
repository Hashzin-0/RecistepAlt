'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Shield,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Database,
  Server,
  Zap,
  Cpu,
  Workflow,
} from 'lucide-react';

export function ArchitectureRecipe() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const PYTHON_CODE = `"""
ROTEIRO: Scraper Resiliente de Instagram & TikTok com Playwright Stealth & Proxies
Instalação de Dependências:
pip install playwright playwright-stealth requests fake-useragent sqlalchemy
playwright install chromium
"""

import time
import random
import json
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

def scrape_instagram_reel(reel_url: str, proxy_url: str = None):
    with sync_playwright() as p:
        browser_args = [
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--no-sandbox"
        ]
        
        launch_options = {
            "headless": True,
            "args": browser_args
        }
        if proxy_url:
            launch_options["proxy"] = {"server": proxy_url}
            
        browser = p.chromium.launch(**launch_options)
        
        # Emula um iPhone ou Desktop legítimo
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            locale="pt-BR"
        )
        page = context.new_page()
        stealth_sync(page)  # Remove navigator.webdriver e mascara impressões digitais

        # Adiciona delay jitter para evitar heurísticas de bot
        time.sleep(random.uniform(0.8, 1.8))
        
        # Intercepta requisições de API GraphQL / JSON de fundo
        captured_data = {}
        def handle_response(response):
            if "graphql/query" in response.url or "api/v1/media" in response.url:
                try:
                    captured_data["payload"] = response.json()
                except Exception:
                    pass

        page.on("response", handle_response)
        
        # Carrega a página do reel
        page.goto(reel_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        
        # Extrai metadados da tag OpenGraph / JSON-LD
        og_data = page.evaluate("""() => {
            return {
                title: document.querySelector('meta[property="og:title"]')?.content || document.title,
                description: document.querySelector('meta[property="og:description"]')?.content || '',
                video_url: document.querySelector('meta[property="og:video"]')?.content || '',
                image: document.querySelector('meta[property="og:image"]')?.content || ''
            };
        }""")
        
        browser.close()
        return {"og": og_data, "captured_api": captured_data}
`;

  const NODE_CODE = `/**
 * ROTEIRO: Scraper TikTok & Instagram em Node.js com Puppeteer-Stealth
 * npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth better-sqlite3
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Database from 'better-sqlite3';

puppeteer.use(StealthPlugin());

const db = new Database('scraped_videos.db');
db.exec(\`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    platform TEXT,
    url TEXT,
    title TEXT,
    views INTEGER,
    likes INTEGER,
    scraped_at DATETIME
  );
\`);

async function scrapeTikTokVideo(tiktokUrl, proxy) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      proxy ? \`--proxy-server=\${proxy}\` : ''
    ].filter(Boolean)
  });

  const page = await browser.newPage();
  
  // Mascara cabeçalhos Client Hints
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
    'Sec-Ch-Ua': '"Google Chrome";v="124", "Chromium";v="124"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"'
  });

  // Intercepta script SIGI_STATE ou __UNIVERSAL_DATA_FOR_REHYDRATION__
  let videoData = null;
  page.on('response', async (response) => {
    if (response.url().includes('/api/item/detail/')) {
      try {
        videoData = await response.json();
      } catch (e) {}
    }
  });

  await page.goto(tiktokUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Salva no banco SQL
  if (videoData?.itemInfo?.itemStruct) {
    const item = videoData.itemInfo.itemStruct;
    const stmt = db.prepare(\`
      INSERT OR REPLACE INTO videos (id, platform, url, title, views, likes, scraped_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    \`);
    stmt.run(item.id, 'tiktok', tiktokUrl, item.desc, item.stats.playCount, item.stats.diggCount);
  }

  await browser.close();
  return videoData;
}
`;

  const SQL_DDL = `-- ====================================================
-- MODELAGEM DE BANCO SQLIKE / POSTGRESQL / SQLITE
-- ====================================================

CREATE TABLE videos (
  id VARCHAR(64) PRIMARY KEY,
  platform VARCHAR(20) NOT NULL,            -- 'instagram' | 'tiktok'
  url TEXT NOT NULL,
  canonical_url TEXT,
  title TEXT,
  caption TEXT,
  author_username VARCHAR(100) NOT NULL,
  author_name VARCHAR(150),
  author_avatar TEXT,
  author_verified BOOLEAN DEFAULT FALSE,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds NUMERIC(6, 2),
  width INT,
  height INT,
  aspect_ratio VARCHAR(10),
  music_title TEXT,
  music_author TEXT,
  hashtags TEXT,                            -- JSON array de tags
  mentions TEXT,                            -- JSON array de @mentions
  upload_date TIMESTAMP,
  scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  extraction_strategy VARCHAR(100),
  latency_ms INT
);

CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_author ON videos(author_username);
CREATE INDEX idx_videos_views ON videos(views DESC);

CREATE TABLE authors (
  username VARCHAR(100) PRIMARY KEY,
  platform VARCHAR(20) NOT NULL,
  name VARCHAR(150),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_scraped_videos INT DEFAULT 1,
  total_likes BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  last_scraped_at TIMESTAMP
);

CREATE TABLE scrape_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  platform VARCHAR(20) NOT NULL,
  target_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,              -- 'success' | 'warning' | 'error'
  strategy VARCHAR(100),
  latency_ms INT,
  extracted_title TEXT,
  error_message TEXT
);
`;

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-purple-950/80 border border-indigo-800/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Roteiro & Documentação Completa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Receita & Estrutura de Desenvolvimento: Scraper Instagram & TikTok
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Guia completo de engenharia para construir, escalar e proteger scrapers de redes sociais contra bloqueios (Cloudflare, Akamai, PerimeterX e heurísticas de IP).
          </p>
        </div>
      </div>

      {/* 5-Step Anti-Ban Recipe Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>A "Receita" Anti-Bloqueio (Passo a Passo)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Ingrediente 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Rotação de Proxies Residenciais & 4G/5G
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              IPs de data centers (AWS, DigitalOcean, GCP) são marcados em listas negras imediatamente pelo Instagram e TikTok. Utilize pools residenciais (ex: Bright Data, Oxylabs, Smartproxy) com rotação por sessão para simular conexões de usuários domésticos reais.
            </p>
          </div>

          {/* Ingrediente 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Impersonação de TLS JA3 & HTTP/2
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scrapers em Python puro com <code className="text-cyan-300 font-mono">requests</code> têm assinaturas TLS Cipher Suites facilmente detectadas. Utilize bibliotecas que implementam <code className="text-cyan-300 font-mono">curl-impersonate</code> ou headless browsers com Playwright Stealth para simular o handshake SSL exato do Chrome 124+.
            </p>
          </div>

          {/* Ingrediente 3 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Cabeçalhos Client Hints (Sec-Ch-Ua)
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Não altere apenas o <code className="text-emerald-300 font-mono">User-Agent</code>. É imperativo enviar os cabeçalhos modernos: <code className="text-emerald-300 font-mono">sec-ch-ua</code>, <code className="text-emerald-300 font-mono">sec-ch-ua-mobile</code>, <code className="text-emerald-300 font-mono">sec-ch-ua-platform</code>, <code className="text-emerald-300 font-mono">Accept-Language</code> e referers válidos.
            </p>
          </div>

          {/* Ingrediente 4 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Delay Jitter & Token Bucket
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nunca execute requisições com intervalos regulares (ex: a cada 2.0s fixos). Adicione jitter aleatório (distribuição normal ou exponencial de 0.8s a 2.5s) e controle a vazão com algoritmo Token Bucket para nunca estourar a taxa máxima por subnet.
            </p>
          </div>

          {/* Ingrediente 5 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-3">
              5
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Camada Fallback Multi-Tier
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Se o endpoint GraphQL retornar 302 Login Wall ou 429 Too Many Requests, faça fallback imediato para o endpoint de Embed HTML ou oEmbed oficial, extraindo título, autor e cover sem quebrar o fluxo do usuário.
            </p>
          </div>

          {/* Ingrediente 6 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              6
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">
              Persistência SQLike Transacional
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Salve metadados e métricas estruturadas com chave primária (ID do vídeo), relacionando automaticamente à tabela de autores e gerando snapshots temporais para análise de crescimento de views e likes.
            </p>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <span>Implementações de Referência em Produção</span>
        </h3>

        {/* Python Snippet */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
              <span className="text-xs font-mono font-semibold text-zinc-200">
                scraper_instagram_stealth.py
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(PYTHON_CODE, 1)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 1 ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-zinc-300 bg-zinc-950 overflow-x-auto leading-relaxed max-h-96">
            {PYTHON_CODE}
          </pre>
        </div>

        {/* Node.js Snippet */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono font-semibold text-zinc-200">
                scraper_tiktok_sqlite.ts
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(NODE_CODE, 2)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 2 ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-zinc-300 bg-zinc-950 overflow-x-auto leading-relaxed max-h-96">
            {NODE_CODE}
          </pre>
        </div>

        {/* SQL Schema Snippet */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-zinc-200">
                schema_modelagem_sqllike.sql
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(SQL_DDL, 3)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
            >
              {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 3 ? 'Copiado!' : 'Copiar DDL'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-400/90 bg-zinc-950 overflow-x-auto leading-relaxed max-h-96">
            {SQL_DDL}
          </pre>
        </div>
      </div>
    </div>
  );
}
