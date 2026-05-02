"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import {
  models,
  sortModels,
  totalScore,
  getCompanyStats,
  getBadges,
  SCORE_WEIGHTS,
  SCORE_LABELS_EN,
  SCORE_LABELS_ZH,
  type SortKey,
  type ScoreKey,
  type AIModel,
} from "@/data/models";
import { translations, type Lang } from "@/data/i18n";

type Tab = "rankings" | "companies" | "compare";
type Theme = "light" | "dark";

const SCORE_KEYS: ScoreKey[] = ["tech", "commercial", "safety", "scalability", "data"];

function scoreColor(s: number): string {
  if (s >= 95) return "text-emerald-500 dark:text-emerald-400";
  if (s >= 88) return "text-sky-500 dark:text-sky-400";
  if (s >= 80) return "text-amber-500 dark:text-amber-400";
  if (s >= 70) return "text-orange-500 dark:text-orange-400";
  return "text-zinc-400 dark:text-zinc-500";
}

function scoreBg(s: number): string {
  if (s >= 95) return "bg-emerald-500";
  if (s >= 88) return "bg-sky-500";
  if (s >= 80) return "bg-amber-500";
  if (s >= 70) return "bg-orange-500";
  return "bg-zinc-400";
}

function rankMedal(r: number) {
  if (r === 1) return "🥇";
  if (r === 2) return "🥈";
  if (r === 3) return "🥉";
  return null;
}

function Sparkline({ data, color = "currentColor" }: { data: { date: string; total: number }[]; color?: string }) {
  if (!data || data.length === 0) return null;
  const w = 80, h = 24;
  const min = Math.min(...data.map((d) => d.total));
  const max = Math.max(...data.map((d) => d.total));
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.total - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="inline-block" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendChart({ data, lang }: { data: { date: string; total: number }[]; lang: Lang }) {
  if (!data) return null;
  const w = 360, h = 140, padL = 32, padR = 8, padT = 12, padB = 24;
  const min = Math.floor(Math.min(...data.map((d) => d.total)) - 2);
  const max = Math.ceil(Math.max(...data.map((d) => d.total)) + 2);
  const range = max - min || 1;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const points = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * innerW;
    const y = padT + innerH - ((d.total - min) / range) * innerH;
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md">
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={padL} y1={padT + innerH * f} x2={w - padR} y2={padT + innerH * f}
          stroke="currentColor" strokeOpacity="0.08" />
      ))}
      {/* y-axis labels */}
      {[max, Math.round((max + min) / 2), min].map((v, i) => (
        <text key={i} x={padL - 4} y={padT + (innerH * i) / 2 + 4} fontSize="9" textAnchor="end" fill="currentColor" opacity="0.5">{v}</text>
      ))}
      {/* line */}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" />
      {/* dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
      ))}
      {/* x-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={h - 8} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.5">{p.date.slice(2)}</text>
      ))}
      <text x={padL} y={padT - 2} fontSize="9" fill="currentColor" opacity="0.5">{lang === "en" ? "Total Score" : "综合分"}</text>
    </svg>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [tab, setTab] = useState<Tab>("rankings");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const t = translations[lang];
  const labels = lang === "en" ? SCORE_LABELS_EN : SCORE_LABELS_ZH;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const allCompanies = useMemo(() => {
    const set = new Set(models.map((m) => m.company));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const sorted = sortModels(models, sortKey);
    return sorted.filter((m) => {
      const q = search.toLowerCase();
      const hit = !q ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.company_zh.includes(q) ||
        m.tags.some((tg) => tg.toLowerCase().includes(q));
      const compMatch = companyFilter === "all" || m.company === companyFilter;
      return hit && compMatch;
    });
  }, [sortKey, search, companyFilter]);

  const badges = useMemo(() => getBadges(models), []);
  const stats = useMemo(() => getCompanyStats(models), []);
  const compareModels = compareIds.map((id) => models.find((m) => m.id === id)).filter(Boolean) as AIModel[];

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">⚔</div>
            <div className="font-semibold text-sm sm:text-base tracking-tight truncate">{t.title}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {lang === "en" ? "中文" : "EN"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <section className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl text-sm sm:text-base leading-relaxed">{t.subtitle}</p>

          {/* Weights bar */}
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="text-zinc-500">{t.weights}:</span>
            {SCORE_KEYS.map((k) => (
              <span key={k} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                {labels[k]} <span className="text-zinc-400">{Math.round(SCORE_WEIGHTS[k] * 100)}%</span>
              </span>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
          {(["rankings", "companies", "compare"] as Tab[]).map((tk) => (
            <button
              key={tk}
              onClick={() => setTab(tk)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === tk
                  ? "border-violet-500 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {tk === "rankings" ? t.tab_rankings : tk === "companies" ? t.tab_companies : `${t.tab_compare} (${compareIds.length})`}
            </button>
          ))}
        </div>

        {tab === "rankings" && (
          <>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-violet-500"
              />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-violet-500"
              >
                <option value="total">{t.sort_by}: {t.total_score}</option>
                {SCORE_KEYS.map((k) => (
                  <option key={k} value={k}>{t.sort_by}: {labels[k]}</option>
                ))}
                <option value="release">{t.sort_by}: {t.release}</option>
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-violet-500"
              >
                {allCompanies.map((c) => (
                  <option key={c} value={c}>{c === "all" ? t.all_companies : c}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-zinc-500 mb-3 font-mono">
              {filtered.length} {t.total} · {t.badges}
            </div>

            {/* Rankings table */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">{t.none_found}</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-12">#</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t.name}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">{t.company}</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">{t.total_score}</th>
                      {SCORE_KEYS.map((k) => (
                        <th key={k} className="px-2 py-2.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">{labels[k]}</th>
                      ))}
                      <th className="px-2 py-2.5 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider w-20 hidden md:table-cell">{t.trend}</th>
                      <th className="px-2 py-2.5 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider w-20">{t.compare}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {filtered.map((m, i) => {
                      const total = totalScore(m.scores);
                      const myBadges = badges.get(m.id) || [];
                      const isExpanded = expanded === m.id;
                      const inCompare = compareIds.includes(m.id);
                      return (
                        <Fragment key={m.id}>
                          <tr
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer ${inCompare ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                            onClick={() => setExpanded(isExpanded ? null : m.id)}
                          >
                            <td className="px-3 py-3 text-zinc-400 font-mono">
                              {rankMedal(i + 1) || (i + 1)}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">{m.name}</span>
                                <span className="text-xs">{m.flag}</span>
                                {myBadges.slice(0, 2).map((b) => (
                                  <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium whitespace-nowrap">{b}</span>
                                ))}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5 md:hidden">{lang === "en" ? m.company : m.company_zh} · {m.releaseDate}</div>
                            </td>
                            <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                              <div>{lang === "en" ? m.company : m.company_zh}</div>
                              <div className="text-[11px] text-zinc-500">{m.releaseDate}</div>
                            </td>
                            <td className={`px-3 py-3 text-right font-mono font-bold text-base ${scoreColor(total)}`}>{total.toFixed(1)}</td>
                            {SCORE_KEYS.map((k) => (
                              <td key={k} className={`px-2 py-3 text-right font-mono text-xs hidden lg:table-cell ${scoreColor(m.scores[k])}`}>{m.scores[k]}</td>
                            ))}
                            <td className="px-2 py-3 text-center hidden md:table-cell text-zinc-500">
                              <Sparkline data={m.history!} />
                            </td>
                            <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => toggleCompare(m.id)}
                                disabled={!inCompare && compareIds.length >= 5}
                                className={`text-xs px-2 py-1 rounded font-medium ${
                                  inCompare
                                    ? "bg-violet-500 text-white hover:bg-violet-600"
                                    : "border border-zinc-300 dark:border-zinc-700 hover:border-violet-500"
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                              >
                                {inCompare ? "✓" : "+"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-zinc-50/60 dark:bg-zinc-900/30">
                              <td colSpan={20} className="px-6 py-5">
                                <div className="grid md:grid-cols-3 gap-6">
                                  <div className="md:col-span-2">
                                    <div className="text-sm leading-relaxed mb-3">{lang === "en" ? m.description : m.description_zh}</div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                      {m.tags.map((tg) => (
                                        <span key={tg} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">{tg}</span>
                                      ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                      <div><span className="text-zinc-500">{t.context}:</span> <span className="font-mono">{m.contextWindow}</span></div>
                                      <div><span className="text-zinc-500">{t.pricing}:</span> <span className="font-mono">{m.pricing}</span></div>
                                      <div><span className="text-zinc-500">{t.release}:</span> <span className="font-mono">{m.releaseDate}</span></div>
                                      {m.homepage && <div><a href={m.homepage} target="_blank" rel="noopener" className="text-violet-500 hover:underline">→ {new URL(m.homepage).hostname}</a></div>}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {SCORE_KEYS.map((k) => (
                                      <div key={k} className="flex items-center gap-2 text-xs">
                                        <div className="w-20 text-zinc-500">{labels[k]}</div>
                                        <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                          <div className={`h-full ${scoreBg(m.scores[k])}`} style={{ width: `${m.scores[k]}%` }} />
                                        </div>
                                        <div className={`w-8 text-right font-mono ${scoreColor(m.scores[k])}`}>{m.scores[k]}</div>
                                      </div>
                                    ))}
                                    <div className="pt-3">
                                      <div className="text-xs text-zinc-500 mb-1">{t.trend}</div>
                                      <TrendChart data={m.history!} lang={lang} />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "companies" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.company} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900/30">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold text-base flex items-center gap-2">{s.flag} {lang === "en" ? s.company : s.company_zh}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{s.count} {t.company_count.toLowerCase()}</div>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${scoreColor(s.avg)}`}>{s.avg}</div>
                </div>
                <div className="text-xs text-zinc-500 mb-2">{t.company_avg}</div>
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-2">
                  <div className="text-xs text-zinc-500 mb-1.5">{t.company_best}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.best.name}</span>
                    <span className={`font-mono text-sm ${scoreColor(totalScore(s.best.scores))}`}>{totalScore(s.best.scores).toFixed(1)}</span>
                  </div>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-3 space-y-1">
                  {s.models.slice(1, 4).map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 truncate">{m.name}</span>
                      <span className={`font-mono ${scoreColor(totalScore(m.scores))}`}>{totalScore(m.scores).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "compare" && (
          <div>
            {compareModels.length < 2 ? (
              <div className="text-center py-16 text-zinc-500">
                <div className="text-5xl mb-4 opacity-30">⚖</div>
                <div className="text-sm">{t.compare_select}</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{t.compare_title}</h2>
                  <button onClick={() => setCompareIds([])} className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900">{t.compare_clear}</button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase">{t.name}</th>
                        {compareModels.map((m) => (
                          <th key={m.id} className="px-3 py-2.5 text-center min-w-[140px]">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold">{m.name}</span>
                              <button onClick={() => toggleCompare(m.id)} className="text-zinc-400 hover:text-red-500" title="Remove">×</button>
                            </div>
                            <div className="text-xs text-zinc-500 font-normal mt-0.5">{lang === "en" ? m.company : m.company_zh}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      <tr className="bg-violet-50/40 dark:bg-violet-900/10">
                        <td className="px-3 py-2.5 font-medium">{t.total_score}</td>
                        {compareModels.map((m) => {
                          const tot = totalScore(m.scores);
                          const max = Math.max(...compareModels.map((x) => totalScore(x.scores)));
                          return (
                            <td key={m.id} className={`px-3 py-2.5 text-center font-mono font-bold ${scoreColor(tot)} ${tot === max ? "underline" : ""}`}>{tot.toFixed(1)}</td>
                          );
                        })}
                      </tr>
                      {SCORE_KEYS.map((k) => (
                        <tr key={k}>
                          <td className="px-3 py-2.5 text-zinc-500">{labels[k]}</td>
                          {compareModels.map((m) => {
                            const max = Math.max(...compareModels.map((x) => x.scores[k]));
                            return (
                              <td key={m.id} className={`px-3 py-2.5 text-center font-mono ${scoreColor(m.scores[k])} ${m.scores[k] === max ? "underline" : ""}`}>{m.scores[k]}</td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td className="px-3 py-2.5 text-zinc-500">{t.context}</td>
                        {compareModels.map((m) => (
                          <td key={m.id} className="px-3 py-2.5 text-center font-mono text-xs">{m.contextWindow}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-zinc-500">{t.pricing}</td>
                        {compareModels.map((m) => (
                          <td key={m.id} className="px-3 py-2.5 text-center font-mono text-xs">{m.pricing}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-zinc-500">{t.release}</td>
                        {compareModels.map((m) => (
                          <td key={m.id} className="px-3 py-2.5 text-center font-mono text-xs">{m.releaseDate}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-zinc-500 align-top">{t.description}</td>
                        {compareModels.map((m) => (
                          <td key={m.id} className="px-3 py-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 align-top">{lang === "en" ? m.description : m.description_zh}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Floating compare bar */}
        {compareIds.length > 0 && tab !== "compare" && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-zinc-900 dark:bg-violet-600 text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3 text-sm font-medium">
            <span>{t.in_compare}: {compareIds.length}/5</span>
            <button onClick={() => setTab("compare")} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs">{t.compare}</button>
            <button onClick={() => setCompareIds([])} className="text-white/70 hover:text-white text-xs">×</button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 leading-relaxed">
          <p>{t.disclaimer}</p>
          <p className="mt-3">
            Part of the <a href="https://psyverse.fun" className="text-violet-500 hover:underline">Psyverse</a> portfolio.
          </p>
        </footer>
      </main>
    </div>
  );
}
