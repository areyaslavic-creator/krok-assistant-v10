/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Search,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { FaqItem } from '../../types/krok';

interface FaqCacheViewProps {
  language: 'ua' | 'en';
}

export const FaqCacheView: React.FC<FaqCacheViewProps> = ({ language }) => {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [query, setQuery] = useState('Як запустити KROK Assistant з Ollama?');
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Add FAQ modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  useEffect(() => {
    loadFaq();
  }, []);

  const loadFaq = async () => {
    try {
      const resp = await fetch('/api/faq/list');
      const data = await resp.json();
      if (data.items) setFaqItems(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuery = async (customQ?: string) => {
    const q = customQ || query;
    if (!q.trim()) return;

    setIsQuerying(true);
    try {
      const resp = await fetch('/api/faq/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await resp.json();
      setQueryResult(data);
      loadFaq();
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAddFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    try {
      const resp = await fetch('/api/faq/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
          category: newCategory,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setShowAddModal(false);
        setNewQuestion('');
        setNewAnswer('');
        loadFaq();
      }
    } catch (e) {
      console.error(e);
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
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                core/faq_engine.py • Поріг схожості &gt; 88%
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Швидкий кеш FAQ (>88% схожості)' : 'Instant FAQ Cache (>88%)'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Миттєва видача відповідей на часті запитання без виклику LLM моделей за 0.4 мс. Нуль витрат, нуль токенів, 100% автономність.'
                : 'Instant response matcher (>88% threshold) answering repeated questions in 0.4ms without invoking LLMs.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ua' ? 'Додати запитання до кешу' : 'Add FAQ Item'}</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'ua' ? 'Перевірити запит у швидкому кеші:' : 'Test query against instant cache:'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Введіть запитання..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
          />
          <button
            onClick={() => handleQuery()}
            disabled={isQuerying || !query.trim()}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Швидкий запит</span>
          </button>
        </div>
      </div>

      {/* Query Hit/Miss Result Banner */}
      {queryResult && (
        <div
          className={`border rounded-2xl p-6 shadow-xl transition ${
            queryResult.matched
              ? 'bg-amber-950/20 border-amber-500/50'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  queryResult.matched
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Zap className="w-6 h-6 fill-current" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {queryResult.matched
                      ? '⚡ Миттєвий збіг у кеші (>88%)'
                      : 'Поріг >88% не досягнуто'}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                    Схожість: {queryResult.similarity}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {queryResult.matched
                    ? `Час виконання: ${queryResult.executionTimeMs} мс • Виклик LLM оминуто (Zero Cost)`
                    : queryResult.message}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-slate-500 block">Порядок обробки</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {queryResult.matched ? 'FAQ Hit' : 'Route to Swarm'}
              </span>
            </div>
          </div>

          {queryResult.matched && queryResult.faq && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-slate-400">
                Знайдене запитання в базі: <strong className="text-slate-200">"{queryResult.faq.question}"</strong>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 leading-relaxed font-mono">
                {queryResult.faq.answer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cache Items Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Закешовані часті питання ({faqItems.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Поріг спрацьовування: 88%</span>
        </div>

        <div className="space-y-3">
          {faqItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleQuery(item.question)}
              className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl hover:border-amber-500/40 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-white hover:text-amber-300 transition">
                    {item.question}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 max-w-3xl">
                  {item.answer}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-500">
                <span>{item.hits} викликів</span>
                <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]">
                  Перевірити ⚡
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Додати питання до швидкого кешу</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Запитання (Шаблон):</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Наприклад: 'Як перевірити безпеку перед деплоєм?'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Категорія:</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Security / Setup / Line 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Вичерпна відповідь:</label>
                <textarea
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  rows={4}
                  placeholder="Введіть готову відповідь, яка буде надана за 0.4 мс без виклику LLM..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={handleAddFaq}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                Зберегти в кеш
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
