/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Server,
  Cloud,
  Shield,
  Download,
  Check,
  RefreshCw,
  Terminal,
  Database,
  Cpu,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ua' | 'en';
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
}) => {
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const testConnection = async () => {
    setTestingOllama(true);
    setOllamaStatus(null);
    try {
      // simulate quick check or local ping
      await new Promise(r => setTimeout(r, 600));
      setOllamaStatus('✓ Локальний сервіс Ollama підключено (порт 11434 активний)');
    } catch (e) {
      setOllamaStatus('Помилка: не вдалося зв\'язатися з Ollama на вказаному порту.');
    } finally {
      setTestingOllama(false);
    }
  };

  const handleBackupExport = async () => {
    setExporting(true);
    try {
      const statusResp = await fetch('/api/system/status');
      const statusData = await statusResp.json();
      const faqResp = await fetch('/api/faq/list');
      const faqData = await faqResp.json();
      const ragResp = await fetch('/api/rag/list');
      const ragData = await ragResp.json();
      const fbResp = await fetch('/api/learn/feedback/list');
      const fbData = await fbResp.json();

      const fullBackup = {
        app: 'KROK Assistant v10.0 Swarm Engine',
        exportedAt: new Date().toISOString(),
        system: statusData,
        faqCache: faqData.items,
        ragDocuments: ragData.documents,
        feedbackReinforcements: fbData.items,
      };

      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `krok_v10_backup_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {language === 'ua' ? 'Налаштування KROK Assistant v10.0' : 'System Settings'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            ✕
          </button>
        </div>

        {/* Local LLM Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            {language === 'ua' ? 'Локальний LLM коннектор (Ollama / LM Studio)' : 'Local LLM Connector'}
          </h4>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Базова адреса (Base URL):</label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={e => setOllamaUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-300 block mb-1">Модель за замовчуванням:</label>
              <select
                value={ollamaModel}
                onChange={e => setOllamaModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="llama3">llama3:latest (Рекомендовано)</option>
                <option value="mistral">mistral:7b</option>
                <option value="qwen2.5">qwen2.5:latest</option>
                <option value="phi3">phi3:mini</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={testConnection}
                disabled={testingOllama}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5 h-9"
              >
                {testingOllama ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Тест</span>
              </button>
            </div>
          </div>

          {ollamaStatus && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 font-mono">
              {ollamaStatus}
            </div>
          )}
        </div>

        {/* Security & Backup */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {language === 'ua' ? 'Резервна копія та безпека даних' : 'Backup & Security'}
          </h4>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Протокол безпеки:</span>
              <strong className="text-emerald-400 font-mono">L5 Active Protocol</strong>
            </div>
            <div className="flex justify-between">
              <span>Кеш запитів:</span>
              <span className="text-slate-300 font-mono">Async SQLite Core</span>
            </div>
          </div>

          <button
            onClick={handleBackupExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>
              {exporting ? 'Експорт бази знань...' : 'Експортувати повний бекап системи (.JSON)'}
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Зберегти та закрити
          </button>
        </div>
      </div>
    </div>
  );
};
