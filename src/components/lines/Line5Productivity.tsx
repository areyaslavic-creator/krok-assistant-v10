/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  duration: string;
  status: 'todo' | 'inprogress' | 'done';
  completionCriteria: string;
  dependencies?: string[];
}

interface Line5ProductivityProps {
  language: 'ua' | 'en';
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Аналіз ринку відновлюваної енергетики та збір відкритих даних',
    duration: '2 дні',
    status: 'done',
    completionCriteria: 'Сформовано датасет у форматі CSV з щонайменше 20 джерелами.',
    dependencies: [],
  },
  {
    id: 't-2',
    title: 'Розробка калькулятора окупності сонячних батарей (Line 1)',
    duration: '3 дні',
    status: 'inprogress',
    completionCriteria: 'Створено SPA з тестами QA та пройдено перевірку L5 Security Gate.',
    dependencies: ['t-1'],
  },
  {
    id: 't-3',
    title: 'Складання рецептури біозахисного розчину для очищення панелей (Line 7)',
    duration: '1 день',
    status: 'todo',
    completionCriteria: 'Визначено точні пропорції в грамах без кислотних компонентів.',
    dependencies: ['t-2'],
  },
  {
    id: 't-4',
    title: 'Підготовка та аудит сценарію автоматизації n8n (Line 6)',
    duration: '1 день',
    status: 'todo',
    completionCriteria: 'Перевірено роботу вебхука в Telegram з надсиланням сповіщень.',
    dependencies: ['t-3'],
  },
];

export const Line5Productivity: React.FC<Line5ProductivityProps> = ({ language }) => {
  const [goalInput, setGoalInput] = useState('Запустити дослідницький портал та еко-лінійку засобів');
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecompose = () => {
    setIsDecomposing(true);
    setTimeout(() => {
      const generated: TaskItem[] = [
        {
          id: 'gen-1',
          title: `Крок 1: Дослідження вимог та аудиторії для "${goalInput}"`,
          duration: '1 день',
          status: 'inprogress',
          completionCriteria: 'Оформлено короткий бриф у RAG базі знань з перевіркою достовірності фактів.',
        },
        {
          id: 'gen-2',
          title: 'Крок 2: Генерація структури веб-сайту та прототипу в Line 1',
          duration: '2 дні',
          status: 'todo',
          completionCriteria: 'Створено адаптивний HTML5 сайт з дотриманням протоколу L5 Security.',
        },
        {
          id: 'gen-3',
          title: 'Крок 3: Налаштування автоматичного сповіщення через Telegram бота (Line 6)',
          duration: '1 день',
          status: 'todo',
          completionCriteria: 'Імпортовано блюпринт n8n та протестовано прийом тестового вебхука.',
        },
        {
          id: 'gen-4',
          title: 'Крок 4: Фінальна рефлексія через Critique Agent та запуск',
          duration: '4 години',
          status: 'todo',
          completionCriteria: 'Оцінка Critique Agent >= 85%, відсутність вразливостей або витоків.',
        },
      ];
      setTasks(generated);
      setIsDecomposing(false);
    }, 450);
  };

  const updateTaskStatus = (id: string, newStatus: 'todo' | 'inprogress' | 'done') => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const handleCopyMarkdown = () => {
    const md = tasks
      .map(
        t =>
          `- [${t.status === 'done' ? 'x' : ' '}] **${t.title}** (${t.duration})\n  *Критерій готовності:* ${t.completionCriteria}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                LINE 5
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                SMART Decomposer • Interactive Kanban
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Особиста продуктивність та асистент' : 'Personal Productivity & Assistant'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Декомпозиція комплексних цілей на покрокові задачі з часовими оцінками, залежностями та чіткими критеріями готовності.'
                : 'SMART goal decomposition into actionable task lists with timelines, dependencies, and unambiguous criteria.'}
            </p>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition border border-slate-700 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопійовано Markdown' : 'Експорт в Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Goal Decomposer Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'ua' ? 'Введіть мету або проект для декомпозиції:' : 'Enter high-level goal or project to decompose:'}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            placeholder="Наприклад: Підготувати відкриту наукову публікацію про відновлювані джерела..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            onKeyDown={e => e.key === 'Enter' && handleDecompose()}
          />
          <button
            onClick={handleDecompose}
            disabled={isDecomposing || !goalInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ua' ? 'Декомпозувати мету' : 'Decompose Goal'}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* To Do Column */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Circle className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {language === 'ua' ? 'До виконання' : 'To Do'}
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">
              {tasks.filter(t => t.status === 'todo').length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks
              .filter(t => t.status === 'todo')
              .map(t => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition"
                >
                  <h4 className="text-xs font-semibold text-white leading-snug">{t.title}</h4>
                  <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-500 font-mono block mb-0.5">Критерій готовності:</span>
                    {t.completionCriteria}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" /> {t.duration}
                    </span>
                    <button
                      onClick={() => updateTaskStatus(t.id, 'inprogress')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
                    >
                      Взяти в роботу →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {language === 'ua' ? 'В процесі' : 'In Progress'}
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
              {tasks.filter(t => t.status === 'inprogress').length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks
              .filter(t => t.status === 'inprogress')
              .map(t => (
                <div
                  key={t.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-xl p-3.5 space-y-2 shadow-lg shadow-amber-950/20"
                >
                  <h4 className="text-xs font-semibold text-white leading-snug">{t.title}</h4>
                  <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-500 font-mono block mb-0.5">Критерій готовності:</span>
                    {t.completionCriteria}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="flex items-center gap-1 text-amber-300 font-mono">
                      <Clock className="w-3 h-3" /> {t.duration}
                    </span>
                    <button
                      onClick={() => updateTaskStatus(t.id, 'done')}
                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-[11px] transition"
                    >
                      Завершити ✓
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {language === 'ua' ? 'Виконано' : 'Done'}
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              {tasks.filter(t => t.status === 'done').length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks
              .filter(t => t.status === 'done')
              .map(t => (
                <div
                  key={t.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 opacity-80"
                >
                  <h4 className="text-xs font-semibold text-slate-300 line-through leading-snug">{t.title}</h4>
                  <div className="text-[11px] text-slate-500 bg-slate-950/40 p-2 rounded-lg">
                    {t.completionCriteria}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-emerald-400 font-mono">✓ Завершено</span>
                    <button
                      onClick={() => updateTaskStatus(t.id, 'todo')}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Повернути
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
