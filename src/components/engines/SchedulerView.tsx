/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { INITIAL_SCHEDULED_TASKS } from '../../data/templates';
import { ScheduledTask } from '../../types/krok';

interface SchedulerViewProps {
  language: 'ua' | 'en';
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({ language }) => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(INITIAL_SCHEDULED_TASKS);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t
      )
    );
  };

  const runTaskNow = (id: string) => {
    setRunningTaskId(id);
    setTimeout(() => {
      setTasks(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, lastRun: 'Щойно завершено успішно', nextRun: 'за розкладом' }
            : t
        )
      );
      setRunningTaskId(null);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                core/scheduler_engine.py • APScheduler Integration
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Планувальник фонових завдань' : 'Background Task Scheduler'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Автономне періодичне виконання перевірок цілісності RAG бази, нічного сканування витоків безпеки та оптимізації кешу FAQ.'
                : 'Autonomous background tasks for knowledge verification, nightly privacy scans, and cache indexing.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-xs font-mono font-semibold">
              ● Scheduler Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Активні періодичні сценарії ({tasks.length})</h3>
          <span className="text-xs font-mono text-slate-400">Часовий пояс: Локальний (UTC+2 / UTC+3)</span>
        </div>

        <div className="space-y-3">
          {tasks.map(t => {
            const isRunning = runningTaskId === t.id;
            return (
              <div
                key={t.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-slate-800">
                      {t.schedule}
                    </span>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                    <span>Модуль: {t.line}</span>
                    <span>•</span>
                    <span>Останній запуск: {t.lastRun}</span>
                    <span>•</span>
                    <span>Наступний: {t.nextRun}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => runTaskNow(t.id)}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700"
                  >
                    {isRunning ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    )}
                    <span>Виконати зараз</span>
                  </button>

                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      t.status === 'active'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800 hover:bg-purple-900'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t.status === 'active' ? 'Пауза' : 'Увімкнути'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
