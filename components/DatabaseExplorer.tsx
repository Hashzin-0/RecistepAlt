'use client';

import React, { useState, useEffect } from 'react';
import { SQLQueryResult } from '@/lib/types';
import {
  Database,
  Play,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Table as TableIcon,
  Check,
  Search,
} from 'lucide-react';

interface DatabaseExplorerProps {
  initialQuery?: string;
  onRefreshVideos?: () => void;
}

const SAMPLE_QUERIES = [
  {
    label: 'Top Vídeos por Visualizações',
    query: 'SELECT id, platform, author_username, views, likes, comments FROM videos ORDER BY views DESC LIMIT 10;',
  },
  {
    label: 'Métricas Agregadas por Plataforma',
    query: 'SELECT COUNT(*) as total_videos, SUM(views) as total_views, AVG(views) as media_views, AVG(likes) as media_likes FROM videos;',
  },
  {
    label: 'Apenas Vídeos do TikTok',
    query: "SELECT id, author_username, title, views, likes FROM videos WHERE platform = 'tiktok' ORDER BY views DESC;",
  },
  {
    label: 'Apenas Reels do Instagram',
    query: "SELECT id, author_username, title, views, likes FROM videos WHERE platform = 'instagram' ORDER BY views DESC;",
  },
  {
    label: 'Logs de Auditoria do Scraper',
    query: 'SELECT id, timestamp, platform, status, latency_ms, extracted_title FROM scrape_logs ORDER BY timestamp DESC LIMIT 20;',
  },
  {
    label: 'Criadores e Engajamento Acumulado',
    query: 'SELECT username, platform, total_scraped_videos, total_likes, total_views FROM authors ORDER BY total_views DESC;',
  },
  {
    label: '🍲 Receitas Extraídas pelo Gemini (IA)',
    query: 'SELECT id, recipe_title, category, prep_time, cook_time, servings, difficulty FROM recipes;',
  },
];

export function DatabaseExplorer({ initialQuery, onRefreshVideos }: DatabaseExplorerProps) {
  const [query, setQuery] = useState(
    initialQuery || 'SELECT id, platform, author_username, title, views, likes, comments FROM videos ORDER BY views DESC;'
  );
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [copiedDump, setCopiedDump] = useState(false);

  // Load available tables
  const loadTables = async () => {
    try {
      const res = await fetch('/api/db');
      const data = await res.json();
      if (data.success && data.tables) {
        setAvailableTables(data.tables);
      }
    } catch (err) {
      console.warn('Could not load tables list:', err);
    }
  };

  useEffect(() => {
    loadTables();
    handleExecute(query);
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      handleExecute(initialQuery);
    }
  }, [initialQuery]);

  const handleExecute = async (sqlToRun?: string) => {
    const q = sqlToRun || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setQueryResult(data.result);
        if (data.result.error) {
          setError(data.result.error);
        }
      } else {
        setError(data.error || 'Erro ao executar instrução SQL.');
      }
    } catch (err: any) {
      setError(err.message || 'Falha de comunicação com o banco.');
    } finally {
      setLoading(false);
    }
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (!queryResult || !queryResult.rows.length) return;
    const cols = queryResult.columns;
    const csvRows = [cols.join(',')];

    for (const r of queryResult.rows) {
      const rowVals = cols.map((c) => {
        const val = r[c] === null || r[c] === undefined ? '' : String(r[c]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(rowVals.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sqllike_query_${Date.now()}.csv`;
    link.click();
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (!queryResult || !queryResult.rows) return;
    const blob = new Blob([JSON.stringify(queryResult.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sqllike_query_${Date.now()}.json`;
    link.click();
  };

  // Download raw .sql dump file
  const handleDownloadSQLDump = async () => {
    try {
      const res = await fetch('/api/db', { method: 'PUT' });
      const dumpText = await res.text();
      const blob = new Blob([dumpText], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `social_scraper_dump_${Date.now()}.sql`;
      link.click();
    } catch (err) {
      console.error('Failed to download SQL dump:', err);
    }
  };

  // Reset initial seeds
  const handleResetSeed = async () => {
    if (!confirm('Deseja restaurar as tabelas e dados de exemplo padrão no banco SQLike?')) return;
    try {
      const res = await fetch('/api/db/videos', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        handleExecute();
        loadTables();
        if (onRefreshVideos) onRefreshVideos();
      }
    } catch (err) {
      console.error('Reset seed failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Console Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Console SQLike Interativo</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded-md">
                  SQL ENGINE
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Execute queries reais de SELECT, WHERE, ORDER BY, LIMIT, AGGREGATES e inspeção no banco.
              </p>
            </div>
          </div>

          {/* Quick Database Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadSQLDump}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dump .SQL</span>
            </button>

            <button
              type="button"
              onClick={handleResetSeed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar Seeds</span>
            </button>
          </div>
        </div>

        {/* Sample Queries Shortcuts */}
        <div className="mb-3">
          <span className="text-xs text-zinc-500 font-medium block mb-2">Queries Rápidas:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {SAMPLE_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sq.query);
                  handleExecute(sq.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 text-xs transition-all"
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Input Area */}
        <div className="relative font-mono">
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 rounded-t-xl border border-b-0 border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-zinc-500 font-sans">editor.sql</span>
            </div>
            <span className="text-[11px] text-zinc-500">Pressione Executar ou use Ctrl+Enter</span>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleExecute();
              }
            }}
            rows={3}
            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-b-xl text-emerald-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
            placeholder="SELECT * FROM videos WHERE views > 100000 ORDER BY views DESC;"
          />
        </div>

        {/* Execute button bar */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {queryResult && !error && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>
                  {queryResult.rowCount} {queryResult.rowCount === 1 ? 'registro' : 'registros'} retornado(s)
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400 font-mono">{queryResult.executionTimeMs}ms</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleExecute()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? 'Executando...' : 'Executar Query'}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Erro SQL:</p>
              <p className="font-mono text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* SQL Results Table */}
      {queryResult && queryResult.columns.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <TableIcon className="w-4 h-4 text-emerald-400" />
              <span>Resultados da Query</span>
              <span className="text-xs text-zinc-500 font-mono font-normal">
                ({queryResult.rowCount} linhas)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-950/80 sticky top-0 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-zinc-600">#</th>
                  {queryResult.columns.map((col, idx) => (
                    <th key={idx} className="p-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {queryResult.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-mono text-zinc-600 text-[11px]">{rIdx + 1}</td>
                    {queryResult.columns.map((col, cIdx) => {
                      const val = row[col];
                      const isNumber = typeof val === 'number';
                      const isString = typeof val === 'string';

                      return (
                        <td
                          key={cIdx}
                          className={`p-3 max-w-[260px] truncate ${
                            isNumber ? 'font-mono text-cyan-300' : 'text-zinc-300'
                          }`}
                          title={String(val)}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-zinc-600 font-mono italic">NULL</span>
                          ) : col === 'platform' ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                val === 'instagram'
                                  ? 'bg-pink-950 text-pink-300 border border-pink-800/60'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                              }`}
                            >
                              {val}
                            </span>
                          ) : isNumber ? (
                            val.toLocaleString()
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Database Schema Viewer */}
      {availableTables.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Esquema das Tabelas do Banco SQLike</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableTables.map((tbl, idx) => (
              <div
                key={idx}
                className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {tbl.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {tbl.rowCount} linhas
                  </span>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto text-[11px] font-mono text-zinc-400 divide-y divide-zinc-900">
                  {tbl.schema?.columns?.map((c: any, cIdx: number) => (
                    <div key={cIdx} className="pt-1 flex items-center justify-between">
                      <span className="text-zinc-300 flex items-center gap-1">
                        {c.name}
                        {c.primaryKey && (
                          <span className="text-[9px] text-amber-400 uppercase font-bold">
                            (PK)
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-500">{c.type}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const q = `SELECT * FROM ${tbl.name} LIMIT 20;`;
                    setQuery(q);
                    handleExecute(q);
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-800 transition-all"
                >
                  SELECT * FROM {tbl.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
