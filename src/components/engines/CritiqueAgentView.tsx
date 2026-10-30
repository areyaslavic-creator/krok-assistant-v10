/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Copy,
  Check,
  FileCheck,
} from 'lucide-react';
import { CritiqueResult } from '../../types/krok';

interface CritiqueAgentViewProps {
  language: 'ua' | 'en';
}

const SAMPLE_DRAFT = `// Функція збереження користувача
function saveUser(user) {
  const apiKey = "sk-proj-9999999999999999"; // TODO: прибрати перед релізом
  const query = "INSERT INTO users VALUES ('" + user.name + "', '" + user.pass + "')";
  db.execute(query);
  return { status: "ok" };
}`;

export const CritiqueAgentView: React.FC<CritiqueAgentViewProps> = ({ language }) => {
  const [content, setContent] = useState(SAMPLE_DRAFT);
  const [taskType, setTaskType] = useState('code');
  const [iteration, setIteration] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEvaluate = async (iter = 1, textToEval?: string) => {
    const text = textToEval || content;
    if (!text.trim()) return;

    setIsEvaluating(true);
    setIteration(iter);
    try {
      const resp = await fetch('/api/critique/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          content: text,
          iteration: iter,
        }),
      });
      const data = await resp.json();
      if (data.critique) {
        setResult(data.critique);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApplyImprovementAndRefine = () => {
    if (!result?.improvedContent) return;
    const nextIter = Math.min(3, iteration + 1);
    setContent(result.improvedContent);
    handleEvaluate(nextIter, result.improvedContent);
  };

  const handleCopyImproved = () => {
    if (!result?.improvedContent) return;
    navigator.clipboard.writeText(result.improvedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                core/critique_agent.py • Цикл самовиправлення (до 3 ітерацій)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Critique Agent: Модуль саморефлексії та контролю якості' : 'Critique Agent: Self-Reflection Loop'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Аудит коду, рецептів та промптів на повноту, безпеку і точність. Якщо оцінка нижче 85%, система автоматично формує зауваження та виправляє помилки.'
                : 'Audits code, recipes, and prompts for completeness, safety, and accuracy. If score < 85%, automatically initiates refinement loop.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
              Ітерація {iteration} / 3
            </span>
          </div>
        </div>
      </div>

      {/* Input Draft Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'ua' ? 'Введіть код, рецепт або текст для аудиту:' : 'Draft content for critique audit:'}
          </label>
          <div className="flex items-center gap-2">
            <select
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="code">Код / Веб-скрипт (Line 1)</option>
              <option value="recipe">Рецептура / Хімія (Line 7)</option>
              <option value="prompt">Системний промпт (Line 2)</option>
              <option value="fact">Аналітична теза (Line 4)</option>
            </select>
          </div>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={7}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleEvaluate(1)}
            disabled={isEvaluating || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-950/30"
          >
            {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{language === 'ua' ? 'Провести аудит Critique Agent' : 'Run Critique Audit'}</span>
          </button>
        </div>
      </div>

      {/* Critique Results & Auto-Improvement */}
      {result && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Score Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg shrink-0 ${
                  result.passed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {result.score}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {result.passed ? 'Аудит пройдено успішно' : 'Потрібна оптимізація перед випуском'}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      result.passed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {result.passed ? 'Ready' : 'Needs Polish'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{result.summary}</p>
              </div>
            </div>

            {iteration < 3 && !result.passed && (
              <button
                onClick={handleApplyImprovementAndRefine}
                disabled={isEvaluating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Запустити самовиправлення (Ітерація {iteration + 1})</span>
              </button>
            )}
          </div>

          {/* Strengths & Flaws */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Сильні сторони
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {result.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Зауваження та ризики
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {result.flaws.length > 0 ? (
                  result.flaws.map((f, idx) => <li key={idx}>{f}</li>)
                ) : (
                  <li>Суттєвих дефектів не виявлено.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Improved Revision Code */}
          {result.improvedContent && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Відкоригована версія від Critique Agent:
                </h4>
                <button
                  onClick={handleCopyImproved}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition border border-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопійовано' : 'Копіювати результат'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {result.improvedContent}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
