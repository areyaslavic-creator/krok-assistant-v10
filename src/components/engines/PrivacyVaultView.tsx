/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check,
  KeyRound,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { VaultScanResult } from '../../types/krok';

interface PrivacyVaultViewProps {
  language: 'ua' | 'en';
}

const SAMPLE_TEXT_WITH_SECRETS = `Конфігурація запуску KROK Swarm:
Адміністратор: ivan.shevchenko@research.org.ua, тел: +380501234567
OPENAI_API_KEY="sk-proj-a1b2c3d4e5f6g7h8i9j0k1l2m3n4"
GITHUB_TOKEN="ghp_1234567890abcdef1234567890abcdef"
Пароль від локальної бази SQLite: "SuperSecretPass2026!"
`;

export const PrivacyVaultView: React.FC<PrivacyVaultViewProps> = ({ language }) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXT_WITH_SECRETS);
  const [scanResult, setScanResult] = useState<VaultScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    try {
      const resp = await fetch('/api/vault/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await resp.json();
      setScanResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyMasked = () => {
    if (!scanResult?.maskedText) return;
    navigator.clipboard.writeText(scanResult.maskedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                core/privacy_vault.py • L5 Security Scanner
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Privacy Vault & Сканер витоків' : 'Privacy Vault & Security Scanner'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Виявлення та маскування токенів, паролів, API-ключів та персональних даних (PII) перед обробкою або публікацією у відкритий веб.'
                : 'Scans for API keys, passwords, and PII with automatic redaction and encrypted vault packaging.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-mono font-semibold">
              ● L5 Shield Active
            </span>
          </div>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'ua' ? 'Текст або конфігурація для перевірки на витоки безпеки:' : 'Text or config to scan for leaks:'}
        </label>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={6}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-teal-200 focus:outline-none focus:border-teal-500 leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={handleScan}
            disabled={isScanning || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ua' ? 'Сканувати на витоки (L5 Protocol)' : 'Run Privacy Scan'}</span>
          </button>
        </div>
      </div>

      {/* Scan Results & Redacted Output */}
      {scanResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  scanResult.clean
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {scanResult.clean ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {scanResult.clean
                    ? 'Контур чистий: Жодних секретних даних не виявлено'
                    : `Увага! Виявлено ${scanResult.findingsCount} потенційних витоків даних`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {scanResult.clean
                    ? 'Текст цілком безпечний для передачі локальним або хмарним моделям.'
                    : 'Чутливі фрагменти автоматично замасковано для вашого захисту.'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 block">Рівень ризику витоку</span>
              <span
                className={`text-xs font-mono font-bold ${
                  scanResult.clean ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {scanResult.leakScore}%
              </span>
            </div>
          </div>

          {/* Findings List */}
          {scanResult.findings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                Деталізація виявлених фрагментів:
              </h4>
              <div className="space-y-2">
                {scanResult.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <span className="text-amber-400 font-bold">{f.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-500">{f.match}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {f.masked}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Masked Text Pane */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-400" />
                Безпечна замаскована версія (Safe for LLM & Public Web):
              </h4>
              <button
                onClick={handleCopyMasked}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition border border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопійовано' : 'Копіювати текст'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-teal-200 leading-relaxed whitespace-pre-wrap">
              {scanResult.maskedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
