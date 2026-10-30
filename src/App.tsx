/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GeminiStudio } from './components/GeminiStudio';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [language, setLanguage] = useState<'ua' | 'en'>('ua');
  const [engineMode, setEngineMode] = useState<'ollama' | 'gemini' | 'offline'>('ollama');

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Gemini AI-style Web Studio */}
      <GeminiStudio
        language={language}
        setLanguage={setLanguage}
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Global Configuration / Engine Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        language={language}
        ollamaUrl={ollamaUrl}
        setOllamaUrl={setOllamaUrl}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
      />
    </div>
  );
}
