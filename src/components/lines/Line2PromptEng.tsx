/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ShieldCheck,
  FileText,
  Sliders,
  Send,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { PROMPT_TEMPLATES } from '../../data/templates';
import { PromptTemplate } from '../../types/krok';

interface Line2PromptEngProps {
  language: 'ua' | 'en';
  engineMode: 'ollama' | 'gemini' | 'offline';
}

export const Line2PromptEng: React.FC<Line2PromptEngProps> = ({ language, engineMode }) => {
  const [activeTab, setActiveTab] = useState<'archetypes' | 'master_prompt' | 'validator'>('master_prompt');

  // Archetypes tab state
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(PROMPT_TEMPLATES[0]);
  const [systemPrompt, setSystemPrompt] = useState(PROMPT_TEMPLATES[0].systemPrompt);
  const [userPrompt, setUserPrompt] = useState('Оптимізуй статтю про екологічне фермерство в Карпатах для молоді');
  const [testOutput, setTestOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Master Prompt State
  const [masterPrompt, setMasterPrompt] = useState<string>('');
  const [copiedMaster, setCopiedMaster] = useState(false);

  // Validator State
  const [promptToValidate, setPromptToValidate] = useState(PROMPT_TEMPLATES[0].systemPrompt);
  const [validationResult, setValidationResult] = useState<{
    score: number;
    passed: boolean;
    checks: Array<{ name: string; passed: boolean; note: string }>;
    recommendation: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetch('/api/prompts/master')
      .then(r => r.json())
      .then(d => {
        if (d.masterPrompt) setMasterPrompt(d.masterPrompt);
      })
      .catch(() => {});
  }, []);

  const handleSelect = (tpl: PromptTemplate) => {
    setSelectedTemplate(tpl);
    setSystemPrompt(tpl.systemPrompt);
    setPromptToValidate(tpl.systemPrompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMaster = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2000);
  };

  const handleTestPrompt = async () => {
    if (!userPrompt.trim()) return;
    setIsRunning(true);
    try {
      const resp = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentLine: `Line 2 (Prompt Architect: ${selectedTemplate.archetype})`,
          prompt: userPrompt,
          systemInstruction: systemPrompt,
          modelPreference: engineMode,
        }),
      });
      const data = await resp.json();
      setTestOutput(data.output || 'Не вдалося отримати відповідь.');
    } catch (e) {
      setTestOutput('Помилка виконання тесту промпта: ' + String(e));
    } finally {
      setIsRunning(false);
    }
  };

  const handleValidatePrompt = async () => {
    if (!promptToValidate.trim()) return;
    setIsValidating(true);
    try {
      const resp = await fetch('/api/prompts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToValidate,
          archetype: selectedTemplate.archetype,
        }),
      });
      const data = await resp.json();
      setValidationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
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
                LINE 2
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                System Prompt Core • 5 Archetypes • L5 Gate Validator
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Інженерія системних промптів та ядра агентів' : 'Agent & Master Prompt Engineering'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Перевірка правильності взаємодії агентів, генеральний системний промпт KROK v10 та конструювання вузькоспеціалізованих архетипів.'
                : 'Verification of agent interactions, master system prompt of KROK v10, and archetype prompt engineering.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('master_prompt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'master_prompt'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'ua' ? 'Генеральний системний промпт KROK v10' : 'Master System Prompt'}</span>
        </button>

        <button
          onClick={() => setActiveTab('validator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'validator'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ua' ? 'Валідатор взаємодії та промптів' : 'Prompt & Interaction Validator'}</span>
        </button>

        <button
          onClick={() => setActiveTab('archetypes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'archetypes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{language === 'ua' ? 'Суб-агенти та архетипи' : 'Sub-Agent Archetypes'}</span>
        </button>
      </div>

      {/* TAB 1: Master System Prompt */}
      {activeTab === 'master_prompt' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                {language === 'ua' ? 'Офіційний системний промпт рушія KROK Assistant v10.0' : 'Official KROK v10 Master Prompt'}
              </h3>
            </div>

            <button
              onClick={handleCopyMaster}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs transition border border-slate-800"
            >
              {copiedMaster ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMaster ? 'Скопійовано' : 'Копіювати промпт'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Архітектура:</span>
              <strong className="text-emerald-400 font-mono">Offline-First Swarm</strong>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Захист L5:</span>
              <strong className="text-emerald-400 font-mono">0 витоків / CSP Safe</strong>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Поріг надійності:</span>
              <strong className="text-amber-400 font-mono">25% + Фольклор</strong>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-mono">Контур рефлексії:</span>
              <strong className="text-indigo-400 font-mono">Critique Agent (≥90)</strong>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 font-mono text-xs text-indigo-200 rounded-xl overflow-x-auto whitespace-pre-wrap border border-slate-800 leading-relaxed max-h-[500px]">
            {masterPrompt || 'Завантаження генерального промпта...'}
          </pre>
        </div>
      )}

      {/* TAB 2: Prompt & Interaction Validator */}
      {activeTab === 'validator' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                {language === 'ua' ? 'Перевірка правильності промптів та безпеки' : 'Prompt & Interaction Linter'}
              </h3>
            </div>
            <button
              onClick={handleValidatePrompt}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              {isValidating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{language === 'ua' ? 'Перевірити промпт' : 'Validate Prompt'}</span>
            </button>
          </div>

          <textarea
            rows={7}
            value={promptToValidate}
            onChange={e => setPromptToValidate(e.target.value)}
            placeholder="Введіть або відредагуйте промпт для перевірки відповідності стандартам KROK..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />

          {validationResult && (
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Оцінка сумісності та безпеки:
                </span>
                <span className={`text-base font-bold font-mono ${validationResult.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {validationResult.score} / 100
                </span>
              </div>

              <div className="space-y-2">
                {validationResult.checks.map((chk, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2 text-xs">
                    {chk.passed ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className={chk.passed ? 'text-white' : 'text-amber-300'}>{chk.name}</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">{chk.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-indigo-300 pt-1 font-mono">
                💡 {validationResult.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Archetypes & Testing */}
      {activeTab === 'archetypes' && (
        <div className="space-y-6">
          {/* Archetype Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PROMPT_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                    : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 text-slate-400'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-semibold text-indigo-400 uppercase">
                    {tpl.archetype}
                  </span>
                  <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-1">
                    {tpl.name}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-2">
                  {tpl.description}
                </p>
              </button>
            ))}
          </div>

          {/* Prompt Builder & Live Sandbox */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">
                    {language === 'ua' ? 'Системна інструкція (System Prompt)' : 'System Instruction'}
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition border border-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
              </div>

              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={11}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>{language === 'ua' ? 'Тестове повідомлення користувача:' : 'Test User Query:'}</span>
                  <span className="text-[10px] font-mono text-slate-500">Engine: {engineMode}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="Введіть запит для перевірки поведінки суб-агента..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    onKeyDown={e => e.key === 'Enter' && handleTestPrompt()}
                  />
                  <button
                    onClick={handleTestPrompt}
                    disabled={isRunning || !userPrompt.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shrink-0"
                  >
                    {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{language === 'ua' ? 'Тест' : 'Run Test'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Response Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">
                      {language === 'ua' ? 'Результат генерації суб-агента' : 'Sub-Agent Response'}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                    Live Response
                  </span>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 min-h-[260px] font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-y-auto max-h-[380px]">
                  {testOutput || (
                    <span className="text-slate-500 italic">
                      {language === 'ua'
                        ? 'Введіть запит зліва та натисніть "Тест", щоб перевірити, як агент реагує на промпт...'
                        : 'Enter a query on the left and click "Run Test" to test agent response...'}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>L5 Protocol Compliant</span>
                <span className="text-emerald-400">● Zero-Cost Local Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
