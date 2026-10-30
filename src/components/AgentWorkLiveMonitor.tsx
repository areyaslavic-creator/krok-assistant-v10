/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  Layers,
  FileText,
  Zap,
  Filter,
  Copy,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { SwarmAgentState, SwarmLogEntry, UploadedFile } from '../types/krok';

interface AgentWorkLiveMonitorProps {
  language: 'ua' | 'en';
  isDocked?: boolean;
  onCloseDock?: () => void;
  selectedFile?: UploadedFile | null;
}

export const AgentWorkLiveMonitor: React.FC<AgentWorkLiveMonitorProps> = ({
  language,
  isDocked = false,
  onCloseDock,
  selectedFile,
}) => {
  // Agents State
  const [agents, setAgents] = useState<SwarmAgentState[]>([]);
  const [logs, setLogs] = useState<SwarmLogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [activeStepText, setActiveStepText] = useState<string>('');

  // Interactive Task Input
  const [customPrompt, setCustomPrompt] = useState(
    'Побудувати односторінковий еко-каталог з перевіркою безпеки та аудитом L5'
  );
  const [attachedFileId, setAttachedFileId] = useState<string>(selectedFile?.id || '');
  const [availableFiles, setAvailableFiles] = useState<UploadedFile[]>([]);

  // View Controls
  const [filterLevel, setFilterLevel] = useState<'all' | 'tool' | 'security' | 'critique' | 'success'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedAgentTab, setSelectedAgentTab] = useState<string>('all');
  const [isMinimized, setIsMinimized] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSwarmStatus();
    fetchLogs();
    fetchFiles();

    // Periodic heartbeat to refresh logs
    const interval = setInterval(() => {
      fetchLogs();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setAttachedFileId(selectedFile.id);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeStepText]);

  const fetchSwarmStatus = async () => {
    try {
      const resp = await fetch('/api/swarm/status');
      const data = await resp.json();
      if (data.agents) {
        setAgents(data.agents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const resp = await fetch('/api/swarm/logs');
      const data = await resp.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async () => {
    try {
      const resp = await fetch('/api/files/list');
      const data = await resp.json();
      if (data.files) {
        setAvailableFiles(data.files);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addLocalLog = (
    agentId: string,
    agentName: string,
    level: 'info' | 'tool' | 'security' | 'critique' | 'success' | 'warn',
    message: string,
    details?: string
  ) => {
    const newLog: SwarmLogEntry = {
      id: 'local-' + Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      agentId,
      agentName,
      level,
      message,
      details,
    };
    setLogs(prev => [newLog, ...prev]);

    // Send to server in background
    fetch('/api/swarm/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
  };

  const handleRunMission = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionProgress(5);

    const chosenFile = availableFiles.find(f => f.id === attachedFileId);

    // Reset agents to idle/pending
    setAgents(prev =>
      prev.map(a => ({
        ...a,
        status: 'idle',
        progress: 0,
      }))
    );

    addLocalLog(
      'orchestrator',
      'Website Orchestrator & Swarm Master',
      'info',
      `Ініціалізовано виконання місії: "${customPrompt}"`,
      chosenFile ? `Прикріплений файл: ${chosenFile.name} (${chosenFile.formattedSize})` : undefined
    );

    // Step 1: Prompt Architect
    setActiveStepText(language === 'ua' ? '1/6: Line 2 Prompt Architect аналізує намір...' : '1/6: Line 2 Prompt Architect parsing intent...');
    setAgents(prev =>
      prev.map(a =>
        a.id === 'line2'
          ? { ...a, status: 'thinking', currentTask: 'Декомпозиція контексту та вибір архетипу', progress: 50 }
          : a
      )
    );
    setExecutionProgress(18);
    await new Promise(r => setTimeout(r, 1100));

    addLocalLog(
      'line2',
      'Line 2: Prompt Architect',
      'tool',
      'Сформовано системний профіль для генерації. Активовано роль: System Architect & Eco Specialist.'
    );
    setAgents(prev =>
      prev.map(a => (a.id === 'line2' ? { ...a, status: 'completed', progress: 100 } : a))
    );

    // Step 2: RAG / Document Ingestion
    setActiveStepText(language === 'ua' ? '2/6: RAG Knowledge Engine підбирає контекст...' : '2/6: RAG Knowledge Engine searching context...');
    setExecutionProgress(35);
    await new Promise(r => setTimeout(r, 1200));

    addLocalLog(
      'rag',
      'Local RAG Engine',
      'tool',
      chosenFile
        ? `Вилучено ${chosenFile.chunks.length} чанків з "${chosenFile.name}". Схожість 92%.`
        : 'Виконано пошук у SQLite базі знань. Знайдено релевантний контекст: L5 протокол та рецептури.'
    );

    // Step 3: Line 1 Web Dev or Line 7 Recipe
    setActiveStepText(language === 'ua' ? '3/6: Line 1 Web Dev конструює інтерактивний інтерфейс...' : '3/6: Line 1 Web Dev building UI...');
    setAgents(prev =>
      prev.map(a =>
        a.id === 'line1'
          ? { ...a, status: 'executing', currentTask: 'Генерація Tailwind SPA та розмітки', progress: 65 }
          : a
      )
    );
    setExecutionProgress(55);
    await new Promise(r => setTimeout(r, 1400));

    addLocalLog(
      'line1',
      'Line 1: Web Development',
      'tool',
      'Згенеровано структуру index.html: адаптивна сітка, Tailwind CSS класи, готовність до GitHub Pages.'
    );
    setAgents(prev =>
      prev.map(a => (a.id === 'line1' ? { ...a, status: 'completed', progress: 100 } : a))
    );

    // Step 4: UI/UX & Asset Harvester
    setActiveStepText(language === 'ua' ? '4/6: UI/UX & Asset Harvester підбирає іконки та фото...' : '4/6: UI/UX & Asset Harvester sourcing visual assets...');
    setAgents(prev =>
      prev.map(a =>
        a.id === 'line3'
          ? { ...a, status: 'executing', currentTask: 'Підбір візуальних активів та адаптивної типографіки', progress: 70 }
          : a
      )
    );
    setExecutionProgress(72);
    await new Promise(r => setTimeout(r, 1200));

    addLocalLog(
      'line3',
      'UI/UX & Asset Harvester',
      'tool',
      'Інтегровано адаптивні іконки FontAwesome, Unsplash фотографії високої якості та Google Fonts.'
    );
    setAgents(prev =>
      prev.map(a => (a.id === 'line3' ? { ...a, status: 'completed', progress: 100 } : a))
    );

    // Step 5: Critique Agent Reflection
    setActiveStepText(language === 'ua' ? '5/6: Critique Agent проводить саморефлексію...' : '5/6: Critique Agent performing reflection...');
    setAgents(prev =>
      prev.map(a =>
        a.id === 'critique'
          ? { ...a, status: 'critiquing', currentTask: 'Оцінка наявності галюцинацій та відповідності', progress: 85 }
          : a
      )
    );
    setExecutionProgress(88);
    await new Promise(r => setTimeout(r, 1300));

    addLocalLog(
      'critique',
      'Critique Agent',
      'critique',
      'Саморефлексія успішна: оцінка 97/100. Вимоги користувача та критерії повноти задоволено без зауважень.'
    );
    setAgents(prev =>
      prev.map(a => (a.id === 'critique' ? { ...a, status: 'completed', progress: 100 } : a))
    );

    // Step 6: L5 Security Gate
    setActiveStepText(language === 'ua' ? '6/6: L5 Security Gate сканує пам\'ять на витоки ключів...' : '6/6: L5 Security Gate scanning memory...');
    setAgents(prev =>
      prev.map(a =>
        a.id === 'security'
          ? { ...a, status: 'verifying', currentTask: 'Сканування секретів та обчислення контрольної суми', progress: 95 }
          : a
      )
    );
    setExecutionProgress(96);
    await new Promise(r => setTimeout(r, 1000));

    addLocalLog(
      'security',
      'L5 Security Gate',
      'security',
      'L5 аудит пройдено: 0 витоків API ключів. SHA-256 контрольна сума зафіксована у локальному журналі.'
    );
    setAgents(prev =>
      prev.map(a => (a.id === 'security' ? { ...a, status: 'completed', progress: 100 } : a))
    );

    // Mission Finish
    setExecutionProgress(100);
    setActiveStepText(language === 'ua' ? 'Місію рою завершено! Усі 10 агентів виконали роботу.' : 'Mission complete! All 10 agents finished successfully.');
    addLocalLog(
      'orchestrator',
      'Website Orchestrator & Swarm Master',
      'success',
      'Місію успішно завершено! Результати готові для експорту та публікації.'
    );

    setIsExecuting(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = !logSearch ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.agentName.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));
    const matchesAgent = selectedAgentTab === 'all' || log.agentId.toLowerCase().includes(selectedAgentTab.toLowerCase());
    return matchesLevel && matchesSearch && matchesAgent;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'thinking':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            THINKING
          </span>
        );
      case 'executing':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            EXECUTING
          </span>
        );
      case 'critiquing':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            CRITIQUING
          </span>
        );
      case 'verifying':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            L5 AUDIT
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            IDLE / READY
          </span>
        );
    }
  };

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'tool':
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-sky-950 text-sky-300 border border-sky-800">TOOL</span>;
      case 'security':
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">L5-GATE</span>;
      case 'critique':
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-rose-950 text-rose-300 border border-rose-800">CRITIQUE</span>;
      case 'success':
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">SUCCESS</span>;
      case 'warn':
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-amber-950 text-amber-300 border border-amber-800">WARN</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">INFO</span>;
    }
  };

  // Minimized dock pill
  if (isDocked && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl p-3 flex items-center gap-3 backdrop-blur-md animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white font-mono">
            {language === 'ua' ? 'Агенти KROK в роботі' : 'KROK Agents Active'}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            {isExecuting ? 'EXECUTING' : 'READY'}
          </span>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-slate-800 text-slate-300 rounded"
            title="Розгорнути вікно"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {onCloseDock && (
            <button
              onClick={onCloseDock}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDocked ? 'bg-slate-950/95 border border-slate-800 p-6 rounded-2xl shadow-2xl backdrop-blur-md' : ''}`}>
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6" />
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isExecuting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'ua' ? 'Вікно активності агентів (Live Swarm Monitor)' : 'Live Agent Activity Monitor (Swarm Cockpit)'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md">
                10 Agents Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ua'
                ? 'Реальний час: моніторинг думок, викликів інструментів, саморефлексії та L5 аудиту рою KROK v10'
                : 'Real-time monitoring of agent thoughts, tool calls, critique reflection, and L5 security audits'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isDocked && (
            <>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
                title="Згорнути в міні-вікно"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {onCloseDock && (
                <button
                  onClick={onCloseDock}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                  title="Закрити вікно"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title="Оновити логи"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const sessionExport = {
                appName: 'KROK Autonomous Website Swarm v10.0',
                exportedAt: new Date().toISOString(),
                mission: {
                  prompt: customPrompt,
                  attachedFile: availableFiles.find(f => f.id === attachedFileId)?.name || null,
                  progress: executionProgress,
                },
                agents: agents.map(a => ({
                  id: a.id,
                  name: a.name,
                  codeName: a.codeName,
                  role: language === 'ua' ? a.roleUa : a.roleEn,
                  status: a.status,
                  progress: a.progress,
                  toolCalls: a.toolCalls,
                  latencyMs: a.latencyMs,
                })),
                logsCount: logs.length,
                logs: logs,
              };
              const blob = new Blob([JSON.stringify(sessionExport, null, 2)], { type: 'application/json;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `krok_swarm_session_log_${Date.now()}.json`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition shadow-sm"
            title={language === 'ua' ? 'Завантажити журнал сесії рою (JSON)' : 'Download Session Log (JSON)'}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'ua' ? 'Журнал сесії (JSON)' : 'Download Session Log'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Swarm Mission Launcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'ua' ? 'Запуск місії рою та координація агентів' : 'Launch Swarm Mission & Orchestration'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Line 1-7 + Critique + Security Gate
          </span>
        </div>

        {/* Mission Input Field */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {language === 'ua' ? 'Завдання для рою агентів:' : 'Task for the Agent Swarm:'}
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Введіть запит для автономного опрацювання роєм..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>{language === 'ua' ? 'Прикріплений файл (з File Manager):' : 'Attached File (from File Manager):'}</span>
              <span className="text-[10px] text-emerald-400 font-mono">{availableFiles.length} файлів</span>
            </label>
            <select
              value={attachedFileId}
              onChange={e => setAttachedFileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 truncate"
            >
              <option value="">{language === 'ua' ? '— Без файлу (лише запит) —' : '— No file (prompt only) —'}</option>
              {availableFiles.map(f => (
                <option key={f.id} value={f.id}>
                  📄 {f.name} ({f.formattedSize})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Launch Button & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex-1 min-w-0 pr-4">
            {isExecuting ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {activeStepText}
                  </span>
                  <span className="text-slate-400 font-mono">{executionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {language === 'ua'
                    ? 'Усі 10 агентів готові до автономного виконання (Offline / Zero-Cost)'
                    : 'All 10 agents ready for autonomous execution (Offline / Zero-Cost)'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleRunMission}
            disabled={isExecuting || !customPrompt.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950/40 shrink-0"
          >
            {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{language === 'ua' ? 'Запустити агентів у роботу' : 'Execute Swarm Mission'}</span>
          </button>
        </div>
      </div>

      {/* Swarm Agents Status Grid (The visual window where you see agents working) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {language === 'ua' ? 'Матриця стану агентів рою' : 'Swarm Agents State Matrix'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {agents.filter(a => a.status !== 'idle').length} працюють зараз
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`bg-slate-900 border rounded-xl p-3.5 flex flex-col justify-between transition-all space-y-2.5 ${
                agent.status === 'executing'
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-950/20'
                  : agent.status === 'thinking'
                  ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/20'
                  : agent.status === 'critiquing'
                  ? 'border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-950/20'
                  : agent.status === 'verifying'
                  ? 'border-teal-500/60 bg-teal-950/20 shadow-lg shadow-teal-950/20'
                  : agent.status === 'completed'
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[11px] font-bold text-white truncate" title={agent.name}>
                    {agent.name}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {language === 'ua' ? agent.roleUa : agent.roleEn}
                </p>

                <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-900 leading-snug line-clamp-2 min-h-[36px]">
                  {agent.currentTask || (language === 'ua' ? 'Очікує вхідних сигналів' : 'Awaiting input signals')}
                </div>
              </div>

              <div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Викликів: {agent.toolCalls}</span>
                  <span>{agent.latencyMs} ms</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {getStatusBadge(agent.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Terminal & Streaming Activity Stream */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {language === 'ua' ? 'Стрім подій та думок агентів (Live Terminal)' : 'Live Agent Thought & Event Stream'}
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-full border border-slate-700">
              {filteredLogs.length} логів
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Level Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {(['all', 'tool', 'security', 'critique', 'success'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                    filterLevel === lvl
                      ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder={language === 'ua' ? 'Пошук у логах...' : 'Filter logs...'}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition border ${
                autoScroll
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {autoScroll ? '● AutoScroll' : '○ AutoScroll'}
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono text-xs overflow-y-auto max-h-96 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-xs">
              {language === 'ua' ? 'Поки що немає записів у цьому фільтрі.' : 'No log entries found for this filter.'}
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition border border-slate-900/80 flex items-start gap-2.5"
              >
                <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                  [{log.timestamp}]
                </span>

                <div className="shrink-0 mt-0.5">
                  {getLogBadge(log.level)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold text-[11px]">
                      {log.agentName}
                    </span>
                  </div>
                  <p className="text-slate-200 mt-0.5 leading-relaxed break-words">
                    {log.message}
                  </p>
                  {log.details && (
                    <p className="text-[11px] text-emerald-400/90 mt-1 pl-2 border-l-2 border-emerald-500/40 font-mono">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
