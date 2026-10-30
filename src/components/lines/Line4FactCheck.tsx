/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Scale,
  Sparkles,
} from 'lucide-react';
import { CredibilityCheckResult } from '../../types/krok';

interface Line4FactCheckProps {
  language: 'ua' | 'en';
}

const PRESET_STATEMENTS = [
  {
    title: 'Звичайний факт (Наука)',
    statement: 'Встановлення теплового насосу зменшує витрати на опалення на 40-60% порівняно з електрокотлом.',
    source: 'Звіт Державного агентства з енергоефективності',
  },
  {
    title: 'Український фольклор (Folklore Rule)',
    statement: 'Народна приказка та повір\'я: Якщо лелеки прилетіли рано — весна буде теплою, а літо щедрим на врожай.',
    source: 'Етнографічний збірник фольклору Полісся',
  },
  {
    title: 'Маніпуляція / Клікбейт (< 25%)',
    statement: 'Секретний метод: вчені шоковані, ця одна трава дає 100% гарантію одужання від усіх хвороб без зусиль!',
    source: 'Сумнівний телеграм-канал без джерел',
  },
];

export const Line4FactCheck: React.FC<Line4FactCheckProps> = ({ language }) => {
  const [statement, setStatement] = useState(PRESET_STATEMENTS[1].statement);
  const [source, setSource] = useState(PRESET_STATEMENTS[1].source);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CredibilityCheckResult | null>(null);

  const handleRunCheck = async (stmt?: string, src?: string) => {
    const targetStatement = stmt || statement;
    const targetSource = src || source;
    if (!targetStatement.trim()) return;

    setIsChecking(true);
    try {
      const resp = await fetch('/api/credibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement: targetStatement, source: targetSource }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LINE 4
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                credibility_engine.py • Поріг 25% + Захист фольклору
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Аналітика ринку та фактчекінг' : 'Market Analytics & Fact Checking'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Оцінка достовірності тверджень алгоритмом Credibility Engine: відсікання маніпуляцій з надійністю < 25% та збереження усної народної творчості й традицій.'
                : 'Claim credibility assessment via Credibility Engine: filtering low-credibility data (< 25%) while preserving folklore and oral traditions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_STATEMENTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setStatement(item.statement);
              setSource(item.source);
              handleRunCheck(item.statement, item.source);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'ua' ? 'Твердження або теза для перевірки надійності:' : 'Statement or claim to verify:'}
          </label>
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            rows={3}
            placeholder="Введіть твердження, новину, народне повір'я або факт..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Джерело інформації (посилання або автор)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleRunCheck()}
            disabled={isChecking || !statement.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs transition shrink-0"
          >
            {isChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{language === 'ua' ? 'Оцінити достовірність' : 'Evaluate Claim'}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div
          className={`border rounded-2xl p-6 shadow-xl transition relative overflow-hidden ${
            result.status === 'folklore_preserved'
              ? 'bg-indigo-950/20 border-indigo-500/40'
              : result.status === 'verified'
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-rose-950/20 border-rose-500/40'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.status === 'folklore_preserved' ? (
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
              ) : result.status === 'verified' ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {result.status === 'folklore_preserved'
                      ? 'Збережено: Нематеріальна культурна спадщина'
                      : result.status === 'verified'
                      ? 'Підтверджений факт / Достовірне джерело'
                      : 'Відхилено: Недостовірна інформація'}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Оцінка: {result.credibilityScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{result.reason}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-slate-500 block">Поріг відсікання</span>
              <span className="text-xs font-mono font-bold text-amber-400">25.0%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              <span className="text-slate-500">Рекомендація системи:</span>{' '}
              <strong className="text-white">{result.recommendation}</strong>
            </div>
            {result.isFolklore && (
              <span className="px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 text-[11px] font-mono">
                ✓ Folklore Preservation Rule Active
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
