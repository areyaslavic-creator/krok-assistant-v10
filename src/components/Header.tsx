/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Cpu,
  Shield,
  Zap,
  Globe,
  Lock,
  Settings,
  Server,
  Cloud,
  CheckCircle2,
  Sparkles,
  FolderUp,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  language: 'ua' | 'en';
  setLanguage: (lang: 'ua' | 'en') => void;
  engineMode: 'ollama' | 'gemini' | 'offline';
  setEngineMode: (mode: 'ollama' | 'gemini' | 'offline') => void;
  onOpenSettings: () => void;
  onOpenVault: () => void;
  onOpenFaq: () => void;
  onOpenFiles?: () => void;
  onOpenSwarmMonitor?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  engineMode,
  setEngineMode,
  onOpenSettings,
  onOpenVault,
  onOpenFaq,
  onOpenFiles,
  onOpenSwarmMonitor,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-slate-950">
            <Cpu className="w-5 h-5 font-bold" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                KROK<span className="text-emerald-400">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                v10.0 SWARM
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Shield className="w-3 h-3 text-emerald-400" /> L5 Security
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {language === 'ua'
                ? 'Автономна мультиагентна система з 7 лініями та локальним RAG'
                : 'Autonomous multi-agent swarm engine with 7 lines & local RAG'}
            </p>
          </div>
        </div>

        {/* Center / Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* LLM Engine Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setEngineMode('ollama')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                engineMode === 'ollama'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Local Ollama instance on localhost:11434"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ollama (Local)</span>
            </button>

            <button
              onClick={() => setEngineMode('gemini')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                engineMode === 'gemini'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gemini 3.8 Flash Cloud Node"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini Cloud</span>
            </button>

            <button
              onClick={() => setEngineMode('offline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                engineMode === 'offline'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Autonomous Offline Zero-Cost Engine"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Zero-Cost</span>
            </button>
          </div>

          {/* Quick Tools */}
          {onOpenSwarmMonitor && (
            <button
              onClick={onOpenSwarmMonitor}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-semibold rounded-lg transition shadow-sm"
              title="Вікно активності агентів (Live Swarm Monitor)"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{language === 'ua' ? 'Агенти в роботі' : 'Live Agents'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping hidden md:inline" />
            </button>
          )}

          {onOpenFiles && (
            <button
              onClick={onOpenFiles}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-950/60 hover:bg-sky-900/70 border border-sky-800/80 text-sky-300 rounded-lg transition"
              title="Додати файл / Менеджер файлів"
            >
              <FolderUp className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">{language === 'ua' ? 'Файли' : 'Files'}</span>
            </button>
          )}

          <button
            onClick={onOpenFaq}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition"
            title="Швидкий кеш FAQ (>88% схожості)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">FAQ Кеш</span>
          </button>

          <button
            onClick={onOpenVault}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition"
            title="Privacy Vault & Скан витоків"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Vault</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('ua')}
              className={`px-2 py-1 rounded font-mono font-semibold transition ${
                language === 'ua'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              UA
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-mono font-semibold transition ${
                language === 'en'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Налаштування системи"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
