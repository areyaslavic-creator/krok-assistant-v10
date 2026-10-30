/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Globe,
  Terminal,
  Compass,
  ShieldCheck,
  CheckSquare,
  Cpu,
  FlaskConical,
  GitBranch,
  Search,
  Database,
  Zap,
  Lock,
  ThumbsUp,
  Clock,
  Layers,
  FolderUp,
  Activity,
} from 'lucide-react';
import { AGENT_LINES } from '../data/templates';
import { AgentLineId } from '../types/krok';

export type ActiveView =
  | AgentLineId
  | 'research_scraper'
  | 'dag_orchestrator'
  | 'critique_agent'
  | 'rag_knowledge'
  | 'faq_cache'
  | 'privacy_vault'
  | 'feedback_loop'
  | 'scheduler'
  | 'file_manager'
  | 'agent_monitor';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  language: 'ua' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  language,
}) => {
  return (
    <aside className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Sidebar Header with Swarm Status */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
              {language === 'ua' ? 'НАВІГАЦІЯ КРОК 10' : 'KROK 10 SWARM'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
            v10 Active
          </span>
        </div>
      </div>

      <div className="p-2 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* SECTION 1: PRIMARY TOOLS */}
        <div>
          <div className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>{language === 'ua' ? '🔥 Головні інструменти' : '🔥 Primary Tools'}</span>
            <span className="text-[10px] text-slate-500 font-normal">Часті дії</span>
          </div>
          <div className="mt-1 space-y-1">
            {/* 1. Web Dev & GitHub (Line 1) */}
            <button
              onClick={() => setActiveView('line1_web')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'line1_web'
                  ? 'bg-slate-900 border border-emerald-500/50 text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'line1_web'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 border border-slate-800'
                }`}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    {language === 'ua' ? 'Створити сайт & GitHub' : 'Build Web App & GitHub'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    L1
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Генерація веб-додатків, прев\'ю, пуш' : 'App generator, live preview & GitHub push'}
                </p>
              </div>
            </button>

            {/* 2. Web Search & Scrape Agent (NEW) */}
            <button
              onClick={() => setActiveView('research_scraper')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'research_scraper'
                  ? 'bg-indigo-950/40 border border-indigo-500/50 text-white shadow-md shadow-indigo-950/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'research_scraper'
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 group-hover:text-indigo-400 border border-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    {language === 'ua' ? 'Пошук & Скрапінг вебу' : 'Web Search & Scrape'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 animate-pulse">
                    NEW
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Шукати в інтернеті, очистити, в RAG' : 'Search web, clean text & auto-ingest'}
                </p>
              </div>
            </button>

            {/* 3. Social Media DB Collector (Line 3) */}
            <button
              onClick={() => setActiveView('line3_scraping')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'line3_scraping'
                  ? 'bg-slate-900 border border-sky-500/50 text-white shadow-md shadow-sky-950/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'line3_scraping'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 group-hover:text-sky-400 border border-slate-800'
                }`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    {language === 'ua' ? 'Бази даних із соцмереж' : 'Social Media Harvester'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
                    L3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Instagram/Telegram пости у таблиці й сайти' : 'Extract posts/shops to SQL & Catalog'}
                </p>
              </div>
            </button>

            {/* 4. Eco-Recipes Line 7 */}
            <button
              onClick={() => setActiveView('line7_recipes')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'line7_recipes'
                  ? 'bg-slate-900 border border-emerald-500/50 text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'line7_recipes'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 border border-slate-800'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    {language === 'ua' ? 'Еко-рецептури & Крафт' : 'Eco-Recipes & Craft'}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    L7
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Карпатські трави, миловарня, безпека' : 'Herbal teas, soaps & chemical safety'}
                </p>
              </div>
            </button>

            {/* 5. Live Swarm Monitor */}
            <button
              onClick={() => setActiveView('agent_monitor')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'agent_monitor'
                  ? 'bg-emerald-500/20 border border-emerald-500/60 text-white shadow-md shadow-emerald-950/30'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 bg-slate-900/30 border border-emerald-500/20'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'agent_monitor'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300">
                    {language === 'ua' ? 'Вікно агентів (Live)' : 'Live Agent Swarm'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Як думають та працюють агенти' : 'Watch thoughts, actions & steps in real-time'}
                </p>
              </div>
            </button>

            {/* 6. File Manager */}
            <button
              onClick={() => setActiveView('file_manager')}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
                activeView === 'file_manager'
                  ? 'bg-slate-900 border border-sky-500/50 text-sky-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  activeView === 'file_manager'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 group-hover:text-sky-400 border border-slate-800'
                }`}
              >
                <FolderUp className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">
                    {language === 'ua' ? 'Менеджер файлів & Ingest' : 'File Manager & Ingest'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {language === 'ua' ? 'Завантажити PDF, аудіо, код для рою' : 'Upload PDF, audio, code for swarm'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: ADVANCED ENGINEERING */}
        <div className="pt-2 border-t border-slate-900">
          <div className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{language === 'ua' ? '⚙️ Розширена інженерія' : '⚙️ Advanced Engineering'}</span>
          </div>
          <div className="mt-1 space-y-1">
            {/* Master Prompts Line 2 */}
            <button
              onClick={() => setActiveView('line2_prompts')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'line2_prompts'
                  ? 'bg-slate-900 border border-amber-500/40 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Майстер-промпт & Валідатор' : 'Master Prompt & Validator'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">L2</span>
            </button>

            {/* Fact Check Line 4 */}
            <button
              onClick={() => setActiveView('line4_factcheck')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'line4_factcheck'
                  ? 'bg-slate-900 border border-emerald-500/40 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Фактчекінг & Достовірність (>25%)' : 'Fact Check & Verification'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">L4</span>
            </button>

            {/* Productivity Line 5 */}
            <button
              onClick={() => setActiveView('line5_productivity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'line5_productivity'
                  ? 'bg-slate-900 border border-purple-500/40 text-purple-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'SMART Задачі & Декомпозиція' : 'SMART Tasks & Decomposition'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">L5</span>
            </button>

            {/* Automation Line 6 */}
            <button
              onClick={() => setActiveView('line6_automation')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'line6_automation'
                  ? 'bg-slate-900 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Автоматизація n8n & Make' : 'Automation n8n & Make'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">L6</span>
            </button>

            {/* DAG Orchestrator */}
            <button
              onClick={() => setActiveView('dag_orchestrator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'dag_orchestrator'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'DAG Граф оркестратора' : 'DAG Pipeline Graph'}
                </span>
              </div>
            </button>

            {/* Critique Agent */}
            <button
              onClick={() => setActiveView('critique_agent')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'critique_agent'
                  ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Search className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Critique Agent (Рефлексія)' : 'Critique Agent (Reflection)'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 3: CORE, SECURITY & MEMORY */}
        <div className="pt-2 border-t border-slate-900">
          <div className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{language === 'ua' ? '🔒 Безпека та Пам\'ять' : '🔒 Security & Memory'}</span>
          </div>
          <div className="mt-1 space-y-1">
            {/* Local RAG */}
            <button
              onClick={() => setActiveView('rag_knowledge')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'rag_knowledge'
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Database className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Локальний RAG та База знань' : 'Local RAG & Knowledge'}
                </span>
              </div>
            </button>

            {/* Privacy Vault */}
            <button
              onClick={() => setActiveView('privacy_vault')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'privacy_vault'
                  ? 'bg-teal-500/15 border border-teal-500/40 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Lock className="w-4 h-4 text-teal-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Privacy Vault & Скан L5' : 'Privacy Vault & L5 Scan'}
                </span>
              </div>
            </button>

            {/* FAQ Fast Cache */}
            <button
              onClick={() => setActiveView('faq_cache')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'faq_cache'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'FAQ Швидкий кеш (>88%)' : 'FAQ Fast Cache (>88%)'}
                </span>
              </div>
            </button>

            {/* Feedback Loop */}
            <button
              onClick={() => setActiveView('feedback_loop')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'feedback_loop'
                  ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ThumbsUp className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Петля зворотного зв’язку' : 'Feedback Learning Loop'}
                </span>
              </div>
            </button>

            {/* Background Scheduler */}
            <button
              onClick={() => setActiveView('scheduler')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                activeView === 'scheduler'
                  ? 'bg-purple-500/15 border border-purple-500/40 text-purple-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {language === 'ua' ? 'Планувальник фонових дій' : 'Background Scheduler'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span className="text-slate-400">Offline-First Engine</span>
        <span className="text-emerald-400 font-bold">● 100% Local</span>
      </div>
    </aside>
  );
};
