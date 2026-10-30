/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  Star,
  Brain,
  CheckCircle2,
  Sparkles,
  Send,
  MessageSquare,
  Award,
} from 'lucide-react';
import { FeedbackItem } from '../../types/krok';

interface FeedbackLoopViewProps {
  language: 'ua' | 'en';
}

export const FeedbackLoopView: React.FC<FeedbackLoopViewProps> = ({ language }) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [rating, setRating] = useState(5);
  const [agentLine, setAgentLine] = useState('Line 1 (Web Development)');
  const [pattern, setPattern] = useState('Створення адаптивного SPA для наукового хабу');
  const [comment, setComment] = useState('Чудовий чистий код без зайвих бібліотек та з перевіркою L5 Security.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const resp = await fetch('/api/learn/feedback/list');
      const data = await resp.json();
      if (data.items) setFeedbackList(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/learn/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentLine,
          rating,
          comment,
          promptPattern: pattern,
        }),
      });
      const data = await resp.json();
      setSubmitMessage(data.message || 'Відгук збережено!');
      setComment('');
      loadFeedback();
      setTimeout(() => setSubmitMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                /learn/feedback • Reinforcement Learning Pool (Поживні патерни &ge; 4★)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Петля зворотного зв’язку та самонавчання' : 'Feedback Learning Loop'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Фіксація оцінок користувача. Відповіді з рейтингом ≥ 4 автоматично закріплюються як успішні поведінкові патерни для всіх 46 суб-агентів.'
                : 'User evaluation loop. Responses rated ≥ 4 are committed into the system reinforcement pool.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs font-mono font-semibold">
              ● Self-Learning Active
            </span>
          </div>
        </div>
      </div>

      {/* Submit Feedback Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Brain className="w-4 h-4 text-rose-400" />
          {language === 'ua' ? 'Оцінити роботу лінії та навчити рой' : 'Evaluate Line & Reinforce Pattern'}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Спеціалізована лінія:</label>
            <select
              value={agentLine}
              onChange={e => setAgentLine(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
            >
              <option value="Line 1 (Web Development)">Line 1 (Web Development & GitHub)</option>
              <option value="Line 2 (Prompt Engineering)">Line 2 (Agent & Prompt Engineering)</option>
              <option value="Line 3 (Smart Scraping)">Line 3 (Smart Scraping)</option>
              <option value="Line 4 (Fact Checking)">Line 4 (Credibility Assessor)</option>
              <option value="Line 5 (Productivity)">Line 5 (Personal Productivity)</option>
              <option value="Line 6 (AI Automation)">Line 6 (AI Automation & n8n)</option>
              <option value="Line 7 (Product Recipes)">Line 7 (Product Recipes & Eco Chemistry)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Оцінка якості (1 - 5 зірок):</label>
            <div className="flex items-center gap-2 h-10">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">
                {rating >= 4 ? 'Закріпити патерн (Reinforce)' : 'Зауваження (Tuning)'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1">Патерн або задача:</label>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1">Коментар або інструкція на майбутнє:</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Що саме агенту слід повторювати чи покращити наступного разу..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          />
        </div>

        {submitMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 font-mono">
            ✓ {submitMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-rose-950/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Надіслати відгук та навчити систему</span>
          </button>
        </div>
      </div>

      {/* Reinforced Memory Pool List */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Пул закріплених стратегій та правил ({feedbackList.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {feedbackList.filter(f => f.reinforced).length} позитивно підкріплених
          </span>
        </div>

        <div className="space-y-3">
          {feedbackList.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition space-y-2 ${
                item.reinforced
                  ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.agentLine}</span>
                  <div className="flex items-center">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    item.reinforced
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.reinforced ? 'Reinforced Pattern' : 'Feedback Log'}
                </span>
              </div>

              {item.promptPattern && (
                <div className="text-[11px] font-mono text-indigo-300 bg-slate-950/60 p-2 rounded border border-slate-850">
                  Правило: {item.promptPattern}
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">{item.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
