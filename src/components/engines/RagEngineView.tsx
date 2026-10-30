/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { RagDoc } from '../../types/krok';

interface RagEngineViewProps {
  language: 'ua' | 'en';
}

export const RagEngineView: React.FC<RagEngineViewProps> = ({ language }) => {
  const [documents, setDocuments] = useState<RagDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Ingestion Modal State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture');
  const [newContent, setNewContent] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const resp = await fetch('/api/rag/list');
      const data = await resp.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const resp = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await resp.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngest = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsIngesting(true);
    try {
      const resp = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setShowIngestModal(false);
        setNewTitle('');
        setNewContent('');
        loadDocuments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                database/krok_knowledge.db • Document Ingestion Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Локальний RAG та База знань' : 'Local RAG Knowledge Engine'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Векторний та семантичний контекстний пошук по локальних документах, автоматичне чанкування тексту та збереження без витоку в хмару.'
                : 'Semantic context retrieval across local documents with automatic chunking and offline privacy.'}
            </p>
          </div>

          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl text-xs transition shadow-lg shadow-sky-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ua' ? 'Додати документ / Інджест' : 'Ingest Document'}</span>
          </button>
        </div>
      </div>

      {/* RAG Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'ua' ? 'Семантичний запит до бази знань RAG:' : 'Search knowledge chunks:'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Наприклад: 'L5 security gate' або 'фольклорний виняток'..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shrink-0"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{language === 'ua' ? 'Знайти' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Знайдені релевантні чанки ({searchResults.length}):
          </h3>
          <div className="space-y-3">
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 hover:border-sky-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Схожість: {item.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                  "{item.chunk}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Library */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">
              {language === 'ua' ? 'Індексовані документи в сховищі' : 'Indexed Knowledge Documents'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Всього документів: {documents.length}
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800 uppercase">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {doc.chunks.length} чанків
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{doc.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Ключ: {doc.id}</span>
                <span className="text-emerald-400">● Векторизовано</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                Додати документ до локального RAG
              </h3>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Назва документу:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Наприклад: 'Методика оцінки сонячної інсоляції в Україні'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Категорія:</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Architecture">Architecture (Архітектура)</option>
                  <option value="Research">Research (Наукові дослідження)</option>
                  <option value="FactChecking">FactChecking (Фактчекінг)</option>
                  <option value="Recipes">Recipes (Рецептури)</option>
                  <option value="Security">Security (Безпека L5)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Зміст тексту (буде розбитий на чанки):</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="Введіть повний текст для чанкування..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIngestModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Скасувати
              </button>
              <button
                onClick={handleIngest}
                disabled={isIngesting || !newTitle.trim() || !newContent.trim()}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                {isIngesting ? 'Інджест...' : 'Чанкувати та зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
