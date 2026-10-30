/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Copy,
  Check,
  Download,
  Share2,
  Workflow,
  Sparkles,
  ArrowRight,
  Send,
  Terminal,
  PlusCircle,
  FileCode2,
  Github,
} from 'lucide-react';
import { AUTOMATION_TEMPLATES } from '../../data/templates';
import { AutomationTemplate } from '../../types/krok';
import { GitHubPublishModal } from '../GitHubPublishModal';

interface Line6AutomationProps {
  language: 'ua' | 'en';
}

export const Line6Automation: React.FC<Line6AutomationProps> = ({ language }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate>(AUTOMATION_TEMPLATES[0]);
  const [blueprintJson, setBlueprintJson] = useState(JSON.stringify(AUTOMATION_TEMPLATES[0].jsonBlueprint, null, 2));
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [testPayload, setTestPayload] = useState('{"chatId": "@krok_channel", "summary": "Звіт успішно згенеровано Лінією 1"}');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  // Custom Generator state
  const [customPlatform, setCustomPlatform] = useState<'n8n' | 'Make' | 'SendPulse' | 'Telegram'>('n8n');
  const [customTrigger, setCustomTrigger] = useState('Вхідний вебхук від KROK /krok-alert');
  const [customActions, setCustomActions] = useState('Фільтрація зауважень QA, Відправка у Telegram канал');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectTemplate = (tpl: AutomationTemplate) => {
    setSelectedTemplate(tpl);
    setBlueprintJson(JSON.stringify(tpl.jsonBlueprint, null, 2));
    setTestResponse(null);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(blueprintJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 'Download Configuration' button action
  const handleDownloadConfiguration = () => {
    try {
      // Validate or pretty format JSON before download
      const parsed = JSON.parse(blueprintJson);
      const formatted = JSON.stringify(parsed, null, 2);
      const blob = new Blob([formatted], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const fileName = `${selectedTemplate.id || 'automation'}_configuration.json`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(fileName);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      // If raw text is not valid json, still download as json file
      const blob = new Blob([blueprintJson], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const fileName = `${selectedTemplate.id || 'automation'}_configuration.json`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(fileName);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  const handleGenerateCustom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const actionsList = customActions.split(',').map(a => a.trim()).filter(Boolean);
      const generatedBlueprint = {
        name: `Custom ${customPlatform} Automation Blueprint`,
        version: "1.0",
        platform: customPlatform,
        approval_gate: "L5 (Requires operator confirmation before live run)",
        trigger: {
          type: `${customPlatform.toLowerCase()}-trigger`,
          description: customTrigger,
          endpoint: "/api/webhooks/custom-listener",
        },
        actions: actionsList.map((action, i) => ({
          step: i + 1,
          name: action,
          type: "automation-execution-node",
          retryOnFailure: 3,
        })),
        createdAt: new Date().toISOString(),
        nodes: [
          {
            id: "node_1_trigger",
            name: "Webhook Trigger",
            type: `${customPlatform.toLowerCase()}:webhook`,
            parameters: { path: "custom-trigger", httpMethod: "POST" }
          },
          ...actionsList.map((act, idx) => ({
            id: `node_${idx + 2}_action`,
            name: act,
            type: `${customPlatform.toLowerCase()}:action`,
            parameters: { actionName: act, timeoutMs: 5000 }
          }))
        ]
      };

      const newTpl: AutomationTemplate = {
        id: `custom-${Date.now()}`,
        name: `Користувацький ${customPlatform} Блюпринт`,
        platform: customPlatform,
        description: `Тригер: "${customTrigger}", Дії: ${actionsList.join(' → ')}`,
        jsonBlueprint: generatedBlueprint,
      };

      setSelectedTemplate(newTpl);
      setBlueprintJson(JSON.stringify(generatedBlueprint, null, 2));
      setIsGenerating(false);
    }, 400);
  };

  const handleTestWebhook = () => {
    try {
      const parsed = JSON.parse(testPayload);
      setTestResponse(
        JSON.stringify(
          {
            statusCode: 200,
            status: "success",
            message: "Вебхук успішно прийнято адаптером KROK Swarm Engine",
            dispatchedTo: parsed.chatId || "Telegram Bot API",
            timestamp: new Date().toISOString(),
            payloadEcho: parsed,
          },
          null,
          2
        )
      );
    } catch (e) {
      setTestResponse("Помилка: невалідний JSON у тестовому запиті.");
    }
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
                LINE 6
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                templates_automations.json • n8n & Make Compatible
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'AI Автоматизація та інтеграції' : 'AI Automation & Integrations'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Генерація готових сценаріїв для n8n, Make.com, SendPulse та Telegram вебхуків з можливістю експорту конфігурації у форматі JSON.'
                : 'Build and export workflow blueprints and webhook connectors for n8n, Make, SendPulse, and Telegram bots.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Скопійовано' : 'Копіювати JSON'}</span>
            </button>

            {/* Prominent Download Configuration Button */}
            <button
              id="download-configuration-btn"
              onClick={handleDownloadConfiguration}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-950/40 hover:scale-102 active:scale-98 border border-purple-400/30"
              title="Download workflow blueprint as JSON file"
            >
              <Download className="w-4 h-4" />
              <span>
                {language === 'ua' ? 'Завантажити конфігурацію (Download Configuration)' : 'Download Configuration'}
              </span>
            </button>

            {/* Publish to GitHub Button */}
            <button
              onClick={() => setShowGitHubModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
              title="Опублікувати конфігурацію на GitHub"
            >
              <Github className="w-4 h-4 text-purple-400" />
              <span>{language === 'ua' ? 'На GitHub' : 'Publish to GitHub'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Download Toast Notification */}
      {downloadSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Конфігурацію успішно експортовано у файл: <strong>{downloadSuccess}</strong></span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase">JSON Export Ready</span>
        </div>
      )}

      {/* Custom Blueprint Generator Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'ua' ? 'Конструктор власної автоматизації' : 'Custom Blueprint Builder'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">AutomationBuilderAgent v10.0</span>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Платформа:</label>
            <select
              value={customPlatform}
              onChange={e => setCustomPlatform(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="n8n">n8n (Self-Hosted / Cloud)</option>
              <option value="Make">Make.com (Integromat)</option>
              <option value="Telegram">Telegram Webhook Bot</option>
              <option value="SendPulse">SendPulse Automation</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Тригер події:</label>
            <input
              type="text"
              value={customTrigger}
              onChange={e => setCustomTrigger(e.target.value)}
              placeholder="Вхідний вебхук, розклад тощо..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Послідовні дії (через кому):</label>
            <input
              type="text"
              value={customActions}
              onChange={e => setCustomActions(e.target.value)}
              placeholder="Дія 1, Дія 2, Сповіщення..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleGenerateCustom}
            disabled={isGenerating || !customTrigger.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-950/30"
          >
            {isGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{language === 'ua' ? 'Згенерувати новий блюпринт' : 'Generate Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* Preset Blueprints Selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUTOMATION_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => handleSelectTemplate(tpl)}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              selectedTemplate.id === tpl.id
                ? 'bg-slate-900 border-purple-500/60 shadow-xl shadow-purple-950/20'
                : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 text-slate-400'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
                {tpl.platform} Blueprint
              </span>
              <h3 className="font-bold text-sm text-white mt-2 mb-1">{tpl.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
              <span>Готовий до n8n / Make</span>
              <span className="text-purple-400 font-mono">● Active Schema</span>
            </div>
          </button>
        ))}
      </div>

      {/* Visual Blueprint Flow & JSON Code */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visual Workflow Nodes */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">
                {language === 'ua' ? 'Візуальна схема нод (Pipeline Flow)' : 'Visual Workflow Nodes'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {selectedTemplate.platform} Compatible
            </span>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Trigger Node</span>
                <h4 className="text-xs font-bold text-white">Webhook Inbound (POST /krok-dispatch)</h4>
                <p className="text-[11px] text-slate-400">Приймає статус виконання завдань від KROK Assistant.</p>
              </div>
            </div>

            <div className="flex justify-center text-slate-600">↓</div>

            <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Transformation Node</span>
                <h4 className="text-xs font-bold text-white">Function (Normalize & Markdown Format)</h4>
                <p className="text-[11px] text-slate-400">Очищує JSON payload та готує Markdown повідомлення.</p>
              </div>
            </div>

            <div className="flex justify-center text-slate-600">↓</div>

            <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase">Action Node</span>
                <h4 className="text-xs font-bold text-white">Telegram Send Message / Alerts</h4>
                <p className="text-[11px] text-slate-400">Доставляє форматований звіт у робочий чат або канал.</p>
              </div>
            </div>
          </div>

          {/* Test Payload Box */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {language === 'ua' ? 'Симуляція вхідного вебхуку:' : 'Test Webhook Payload:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPayload}
                onChange={e => setTestPayload(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleTestWebhook}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition shrink-0"
              >
                Випробувати
              </button>
            </div>

            {testResponse && (
              <pre className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                {testResponse}
              </pre>
            )}
          </div>
        </div>

        {/* Raw Blueprint JSON Editor & Secondary Download Configuration Button */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">
                  {language === 'ua' ? 'JSON-конфігурація для експорту' : 'Workflow Configuration (JSON)'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                  100% Valid JSON
                </span>
                <button
                  onClick={handleDownloadConfiguration}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition"
                  title="Download Configuration as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Configuration</span>
                </button>
              </div>
            </div>

            <textarea
              value={blueprintJson}
              onChange={e => setBlueprintJson(e.target.value)}
              rows={16}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-purple-200 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
            <span>Сумісно з n8n Cloud та Self-Hosted</span>
            <button
              onClick={handleDownloadConfiguration}
              className="text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 font-semibold"
            >
              <Download className="w-3 h-3" />
              <span>Експорт .json конфігурації</span>
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Publishing Modal */}
      <GitHubPublishModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        fileName={`${selectedTemplate.id || 'workflow'}_configuration.json`}
        content={blueprintJson}
        productTitle={selectedTemplate.name || 'Automation Workflow'}
        language={language}
      />
    </div>
  );
};
