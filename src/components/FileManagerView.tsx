/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderUp,
  FileText,
  FileCode,
  FileCheck2,
  Trash2,
  Download,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  RefreshCw,
  Eye,
  Send,
  Database,
  ArrowRight,
  Info,
  Clock,
  HardDrive,
  Cpu,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Table,
  Code2,
  Github,
  GitBranch,
  KeyRound,
  LogOut,
  AlertTriangle,
  CheckSquare,
  Square,
  Globe,
  Terminal,
  UploadCloud,
  Lock,
} from 'lucide-react';
import { UploadedFile, AgentLineId } from '../types/krok';
import { GitHubUser } from './GitHubPublisher';

interface FileManagerViewProps {
  language: 'ua' | 'en';
  onDispatchToAgent?: (file: UploadedFile, targetLine?: string) => void;
  onOpenSwarmMonitor?: () => void;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  language,
  onDispatchToAgent,
  onOpenSwarmMonitor,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Sub-Navigation: 'files' (File Repository & Ingestion) vs 'github_deploy' (GitHub Deployment Panel)
  const [activeViewMode, setActiveViewMode] = useState<'files' | 'github_deploy'>('files');

  // GitHub Account Connection State
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('krok_github_token') || '');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    const saved = localStorage.getItem('krok_github_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenMask, setShowTokenMask] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Batch File Selection State for Deployment
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Repository & Deployment Form State
  const [targetRepoName, setTargetRepoName] = useState('krok-project-files');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [targetBranch, setTargetBranch] = useState('main');
  const [deployCommitMessage, setDeployCommitMessage] = useState('Deploy project files via KROK Assistant v10.0');
  const [autoEnablePages, setAutoEnablePages] = useState(true);

  // Deployment Execution & Logs State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deployResult, setDeployResult] = useState<{
    repoUrl: string;
    pagesUrl?: string | null;
    totalFiles: number;
    committedFiles: string[];
  } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Upload Form State
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileCategory, setFileCategory] = useState('ProductRecipes');
  const [targetLine, setTargetLine] = useState<AgentLineId | 'all'>('all');
  const [autoIngestRag, setAutoIngestRag] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Quick Preview Modal State (Direct User Request)
  const [quickPreviewFile, setQuickPreviewFile] = useState<UploadedFile | null>(null);
  const [previewTab, setPreviewTab] = useState<'snippet' | 'chunks' | 'raw'>('snippet');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/files/list');
      const data = await resp.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (e) {
      console.error('Failed to load files:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isImageFile = (file: UploadedFile | { name: string; type?: string; content?: string }) => {
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    const content = file.content || '';
    return (
      type === 'image' ||
      type.startsWith('image/') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.webp') ||
      name.endsWith('.svg') ||
      name.endsWith('.gif') ||
      content.startsWith('data:image/') ||
      (content.startsWith('http') && (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.webp')))
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFileObject = (file: File) => {
    const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFileName(file.name);
        setFileContent(dataUrl);
        setFileCategory('ProductRecipes');
        setTargetLine('line7_recipes');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileName(file.name);
        setFileContent(text || '');

        // Auto-detect category from file extension or content
        if (file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.js') || file.name.endsWith('.tsx')) {
          setFileCategory('WebDevelopment');
          setTargetLine('line1_web');
        } else if (file.name.endsWith('.json')) {
          setFileCategory('Automation');
          setTargetLine('line6_automation');
        } else if (file.name.endsWith('.md') && (text.includes('рецепт') || text.includes('formula') || text.includes('еко'))) {
          setFileCategory('ProductRecipes');
          setTargetLine('line7_recipes');
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          setFileCategory('MarketResearch');
          setTargetLine('line3_scraping');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileObject(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileObject(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!fileName.trim() || !fileContent.trim()) return;
    setIsUploading(true);
    const isImg = /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(fileName) || fileContent.startsWith('data:image/');

    try {
      const resp = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          content: fileContent,
          type: isImg ? 'image' : fileName.split('.').pop() || 'text',
          category: fileCategory,
          targetLine,
          autoIngestRag,
          thumbnailUrl: isImg ? fileContent : undefined,
          dimensions: isImg ? '1920×1080' : undefined,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setUploadSuccess(
          language === 'ua'
            ? `Файл "${data.file.name}" успішно опрацьовано та збережено! Створено ${data.file.chunks.length} семантичних чанків.`
            : `File "${data.file.name}" successfully parsed and ingested! Created ${data.file.chunks.length} chunks.`
        );
        setFileName('');
        setFileContent('');
        loadFiles();
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const resp = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await resp.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => f.id !== id));
        if (quickPreviewFile?.id === id) setQuickPreviewFile(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    // 1. Data URL image
    if (file.content.startsWith('data:image/')) {
      const a = document.createElement('a');
      a.href = file.content;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Remote image via CORS proxy
    if (file.content.startsWith('http')) {
      const a = document.createElement('a');
      a.href = `/api/media/download?url=${encodeURIComponent(file.content)}&filename=${encodeURIComponent(file.name)}`;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 3. Text or code document blob
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // GitHub Connection & Verification
  const handleVerifyAndSaveToken = async (customToken?: string) => {
    const tokenToTest = (customToken !== undefined ? customToken : tokenInput).trim();
    if (!tokenToTest) {
      setTokenError(
        language === 'ua'
          ? 'Будь ласка, введіть ваш GitHub Personal Access Token (PAT)'
          : 'Please enter your GitHub Personal Access Token (PAT)'
      );
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);

    try {
      const resp = await fetch('/api/github/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToTest }),
      });
      const data = await resp.json();

      if (resp.ok && data.valid && data.user) {
        setGithubToken(tokenToTest);
        setGithubUser(data.user);
        localStorage.setItem('krok_github_token', tokenToTest);
        localStorage.setItem('krok_github_user', JSON.stringify(data.user));
        setTokenInput('');
        setTokenError(null);
      } else {
        setTokenError(
          data.error ||
            (language === 'ua'
              ? 'Недійсний токен GitHub. Перевірте права (скоуп repo) та термін дії.'
              : 'Invalid GitHub token. Please verify permissions (repo scope) and expiration.')
        );
      }
    } catch (err: any) {
      setTokenError(err.message || 'Помилка підключення до сервера');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubToken('');
    setGithubUser(null);
    localStorage.removeItem('krok_github_token');
    localStorage.removeItem('krok_github_user');
  };

  // Batch Selection Helpers
  const handleToggleFileSelection = (id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiles = () => {
    setSelectedFileIds(new Set(files.map(f => f.id)));
  };

  const handleSelectWebFiles = () => {
    const webFiles = files.filter(f => /\.(html|css|js|jsx|tsx|svg)$/i.test(f.name));
    setSelectedFileIds(new Set(webFiles.map(f => f.id)));
  };

  const handleSelectDataFiles = () => {
    const dataFiles = files.filter(f => /\.(json|csv|md|txt)$/i.test(f.name));
    setSelectedFileIds(new Set(dataFiles.map(f => f.id)));
  };

  const handleClearSelection = () => {
    setSelectedFileIds(new Set());
  };

  const handleDeploySingleFile = (file: UploadedFile) => {
    setSelectedFileIds(new Set([file.id]));
    const cleanName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
    setTargetRepoName(`krok-${cleanName || 'project'}`);
    setActiveViewMode('github_deploy');
  };

  // Batch Push Execution
  const handleBatchDeployToGitHub = async () => {
    if (!githubToken) {
      setDeployError(
        language === 'ua'
          ? 'Спочатку підключіть ваш GitHub акаунт за допомогою токена (PAT)'
          : 'Please connect your GitHub account using a personal access token (PAT) first'
      );
      return;
    }

    const selectedFiles = files.filter(f => selectedFileIds.has(f.id));
    if (selectedFiles.length === 0) {
      setDeployError(
        language === 'ua'
          ? 'Оберіть хоча б один файл для деплою'
          : 'Please select at least one file to deploy'
      );
      return;
    }

    const cleanRepo = targetRepoName.trim().replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '');
    if (!cleanRepo) {
      setDeployError(
        language === 'ua'
          ? 'Вкажіть коректну назву репозиторію'
          : 'Please provide a valid repository name'
      );
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployResult(null);
    const logs: string[] = [];

    const addLog = (msg: string) => {
      const time = new Date().toLocaleTimeString();
      logs.push(`[${time}] ${msg}`);
      setDeployLogs([...logs]);
    };

    addLog(`🚀 Ініціалізація деплою ${selectedFiles.length} файлів до репозиторію '${cleanRepo}'...`);
    addLog(`🔑 Авторизація користувача ${githubUser ? '@' + githubUser.login : 'GitHub API'}...`);

    try {
      addLog(`📦 Пакет файлів: ${selectedFiles.map(f => f.name).join(', ')}`);
      addLog(`🌐 Відправка файлів через GitHub Contents API (гілка: ${targetBranch || 'main'})...`);

      const resp = await fetch('/api/github/push-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repoName: cleanRepo,
          files: selectedFiles.map(f => ({ name: f.name, content: f.content })),
          commitMessage: deployCommitMessage || `Deploy files from KROK Assistant File Manager`,
          isPrivate: isPrivateRepo,
          enablePages: autoEnablePages,
          branch: targetBranch || 'main',
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Помилка під час деплою файлів на GitHub');
      }

      addLog(`✅ Успішно закомічено ${data.totalFiles} файлів у репозиторій!`);
      addLog(`🔗 Репозиторій доступний: ${data.repoUrl}`);
      if (data.pagesUrl) {
        addLog(`🌍 GitHub Pages активовано: ${data.pagesUrl}`);
      }

      setDeployResult({
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl,
        totalFiles: data.totalFiles,
        committedFiles: data.committedFiles || [],
      });
    } catch (err: any) {
      addLog(`❌ Помилка деплою: ${err.message}`);
      setDeployError(err.message || 'Не вдалося опублікувати файли');
    } finally {
      setIsDeploying(false);
    }
  };

  const selectedFilesList = files.filter(f => selectedFileIds.has(f.id));
  const selectedTotalBytes = selectedFilesList.reduce((acc, f) => acc + (f.size || f.content?.length || 0), 0);
  const selectedFormattedSize =
    selectedTotalBytes > 1024 * 1024
      ? `${(selectedTotalBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(selectedTotalBytes / 1024).toFixed(1)} KB`;

  const filteredFiles = files.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center text-sky-400 shrink-0">
            <FolderUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'ua' ? 'Менеджер файлів та Ingestion' : 'File Manager & Ingestion'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 rounded-md">
                Quick Preview & RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ua'
                ? 'Завантажуйте документи, код, фото та датасети з інтерактивним швидким переглядом перед скачуванням'
                : 'Upload documents, code, photos and datasets with interactive quick preview before downloading'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSwarmMonitor && (
            <button
              onClick={onOpenSwarmMonitor}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950/30"
            >
              <Cpu className="w-4 h-4" />
              <span>{language === 'ua' ? 'Вікно агентів (Live)' : 'Live Agent Monitor'}</span>
            </button>
          )}

          <button
            onClick={loadFiles}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
            title="Оновити список файлів"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Sub-navigation Tabs: Files Repository vs GitHub Deployment */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <button
          onClick={() => setActiveViewMode('files')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeViewMode === 'files'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FolderUp className="w-4 h-4" />
          <span>{language === 'ua' ? '📁 Сховище файлів та Ingestion' : '📁 File Repository & Ingestion'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeViewMode === 'files' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {files.length}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode('github_deploy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeViewMode === 'github_deploy'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Github className="w-4 h-4 text-purple-300" />
          <span>{language === 'ua' ? '🚀 GitHub Деплой та Репозиторій' : '🚀 GitHub Deployment Panel'}</span>
          {githubUser ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              @{githubUser.login}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-600/40">
              PAT потрібен
            </span>
          )}
          {selectedFileIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900 text-purple-200 border border-purple-500/30">
              {selectedFileIds.size} обр.
            </span>
          )}
        </button>
      </div>

      {activeViewMode === 'files' && (
        <>
          {/* Upload & Drag-Drop Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-sky-400" />
              <span>{language === 'ua' ? 'Завантаження та семантичний розбір' : 'Upload & Semantic Chunking'}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              TXT, MD, JSON, CSV, HTML, JS, JPG, PNG
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              dragActive
                ? 'border-sky-400 bg-sky-950/30'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/50 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md,.json,.csv,.html,.css,.js,.ts,.tsx,.py,.xml,.yaml,.pdf,.jpg,.jpeg,.png,.webp"
            />
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <FolderUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              {language === 'ua'
                ? 'Перетягніть файл сюди або натисніть для вибору'
                : 'Drag and drop your file here, or click to browse'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'ua'
                ? 'Підтримуються текстові документи, код, фотографії та таблиці'
                : 'Supports text documents, source code, photos and datasets'}
            </p>
          </div>

          {/* Manual Input / Preview Before Upload */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {language === 'ua' ? 'Назва файлу:' : 'File name:'}
              </label>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="наприклад: eco-recipe.md або product-photo.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  {language === 'ua' ? 'Категорія вмісту:' : 'Category:'}
                </label>
                <select
                  value={fileCategory}
                  onChange={e => setFileCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="ProductRecipes">ProductRecipes (Лінія 7)</option>
                  <option value="WebDevelopment">WebDevelopment (Лінія 1)</option>
                  <option value="Automation">Automation (Лінія 6)</option>
                  <option value="Architecture">Architecture (Core)</option>
                  <option value="MarketResearch">MarketResearch (Лінія 3/4)</option>
                  <option value="General">General / Custom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  {language === 'ua' ? 'Цільова лінія агентів:' : 'Target Agent Line:'}
                </label>
                <select
                  value={targetLine}
                  onChange={e => setTargetLine(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">Усі агенти рою (Swarm Global)</option>
                  <option value="line1_web">Line 1: Web Development</option>
                  <option value="line3_scraping">Line 3: Internet & Scraping</option>
                  <option value="line6_automation">Line 6: Automation & Webhooks</option>
                  <option value="line7_recipes">Line 7: Eco Recipes & Safety</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {language === 'ua' ? 'Вміст файлу або URL:' : 'Content or URL:'}
              </label>
              <textarea
                rows={4}
                value={fileContent}
                onChange={e => setFileContent(e.target.value)}
                placeholder="Вставте текст документа, код або посилання на фото..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoIngestRag}
                  onChange={e => setAutoIngestRag(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-0"
                />
                <span>{language === 'ua' ? 'Автоматично додати у локальну RAG базу знань' : 'Auto-ingest to local RAG knowledge'}</span>
              </label>

              <button
                onClick={handleUploadSubmit}
                disabled={isUploading || !fileName.trim() || !fileContent.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-sky-950/30"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderUp className="w-4 h-4" />}
                <span>{language === 'ua' ? 'Зберегти файл' : 'Save File'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ingestion & Security Explainer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ua' ? 'Як працює Ingestion та RAG' : 'Ingestion & RAG Pipeline'}</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Семантичний розбір (Chunking):</strong>
                  Текстові файли автоматично розділяються на блоки (~280 символів) для швидкого векторного пошуку локальним RAG-рушієм.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Аудит безпеки L5 (SHA-256):</strong>
                  Кожен файл отримує унікальну контрольну суму SHA-256 та перевіряється на відсутність конфіденційних витоків.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-200 block mb-0.5">Швидкий перегляд перед скачуванням:</strong>
                  Перед завантаженням будь-якого файлу ви можете переглянути мініатюру фотографії чи фрагмент коду та тексту в один клік!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Repository Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-base">
              {language === 'ua' ? 'Сховище завантажених файлів KROK' : 'KROK Ingested Files Repository'}
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-full border border-slate-700">
              {files.length}
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'ua' ? 'Пошук файлів...' : 'Search files...'}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="All">{language === 'ua' ? 'Усі категорії' : 'All Categories'}</option>
              <option value="ProductRecipes">ProductRecipes</option>
              <option value="WebDevelopment">WebDevelopment</option>
              <option value="Automation">Automation</option>
              <option value="Architecture">Architecture</option>
              <option value="MarketResearch">MarketResearch</option>
            </select>
          </div>
        </div>

        {/* Files Grid with Quick Preview integration */}
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {language === 'ua' ? 'Файлів не знайдено. Перетягніть файл вище, щоб додати його.' : 'No files found. Drag and drop a file above to add it.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map(file => {
              const isImg = isImageFile(file);
              const previewImgSrc = file.thumbnailUrl || (isImg ? file.content : null);

              return (
                <div
                  key={file.id}
                  className="bg-slate-950 border border-slate-800 hover:border-sky-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition group shadow-lg"
                >
                  {/* Thumbnail / Snippet Header Banner */}
                  {isImg && previewImgSrc ? (
                    <div
                      onClick={() => setQuickPreviewFile(file)}
                      className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer group-hover:opacity-95 transition"
                    >
                      <img
                        src={previewImgSrc}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>{file.dimensions || 'Image'}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                        <Eye className="w-4 h-4 text-sky-400" />
                        <span>{language === 'ua' ? 'Швидкий перегляд' : 'Quick Preview'}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setQuickPreviewFile(file)}
                      className="p-3 bg-slate-900/60 border-b border-slate-900 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Code2 className="w-3 h-3 text-sky-400" />
                          <span>{file.type.toUpperCase()} SNIPPET</span>
                        </span>
                        <span className="text-slate-500">{file.lineCount} рядків</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/80 p-2 rounded-lg border border-slate-800/60">
                        {file.content.slice(0, 180)}
                      </p>
                    </div>
                  )}

                  {/* File Metadata */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="text-slate-300 font-medium">{file.formattedSize}</span>
                            <span>•</span>
                            <span>{file.lineCount} рядків</span>
                            <span>•</span>
                            <span className="text-sky-400 font-mono">{file.chunks.length} чанків</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                          {file.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          SHA: {file.sha256 ? file.sha256.slice(0, 8) : 'clean'}...
                        </span>
                      </div>
                    </div>

                    {/* Card Actions with Quick Preview Button */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQuickPreviewFile(file)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition"
                          title={language === 'ua' ? 'Швидкий перегляд перед скачуванням' : 'Quick preview before download'}
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[11px] font-semibold">{language === 'ua' ? 'Перегляд' : 'Preview'}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                          title={language === 'ua' ? 'Завантажити файл на диск' : 'Download file to disk'}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeploySingleFile(file)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
                          title={language === 'ua' ? 'Деплой цього файлу на GitHub' : 'Deploy this file to GitHub'}
                        >
                          <Github className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[11px] font-semibold">GitHub</span>
                        </button>

                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title={language === 'ua' ? 'Видалити файл' : 'Delete file'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {onDispatchToAgent && (
                        <button
                          onClick={() => onDispatchToAgent(file, file.targetLine)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-medium transition"
                          title="Відправити файл у роботу рою агентів"
                        >
                          <Send className="w-3 h-3" />
                          <span>{language === 'ua' ? 'В рій' : 'Swarm'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )}

  {/* GITHUB DEPLOYMENT PANEL */}
  {activeViewMode === 'github_deploy' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. GitHub Connection & Authentication Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {language === 'ua' ? 'Підключення GitHub акаунта' : 'GitHub Account Connection'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ua'
                      ? 'Використовуйте Personal Access Token (PAT) для прямого деплою файлів у ваш репозиторій'
                      : 'Use Personal Access Token (PAT) for direct deployment to your repository'}
                  </p>
                </div>
              </div>

              {githubUser && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    API Active
                  </span>
                  <button
                    onClick={handleDisconnectGitHub}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs transition border border-slate-700"
                    title="Відключити збережений токен"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Відключити</span>
                  </button>
                </div>
              )}
            </div>

            {githubUser ? (
              /* Connected User Profile Card */
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={githubUser.avatar_url}
                    alt={githubUser.login}
                    className="w-12 h-12 rounded-full border-2 border-purple-500/40 object-cover shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{githubUser.name || githubUser.login}</span>
                      <span className="text-xs font-mono text-purple-400">@{githubUser.login}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Публічних репозиторіїв: <strong className="text-white">{githubUser.public_repos ?? 0}</strong></span>
                      <span>•</span>
                      <a
                        href={githubUser.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>Профіль</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyAndSaveToken()}
                    disabled={isVerifyingToken}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingToken ? 'animate-spin' : ''}`} />
                    <span>Перевірити зв'язок</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Token Input Form & Step-by-Step Instructions */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    {language === 'ua' ? 'GitHub Personal Access Token (PAT):' : 'GitHub Personal Access Token (PAT):'}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showTokenMask ? 'text' : 'password'}
                        value={tokenInput}
                        onChange={e => setTokenInput(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                        onKeyDown={e => e.key === 'Enter' && handleVerifyAndSaveToken()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTokenMask(!showTokenMask)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-mono"
                      >
                        {showTokenMask ? 'Приховати' : 'Показати'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleVerifyAndSaveToken()}
                      disabled={isVerifyingToken || !tokenInput.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-950/30 shrink-0"
                    >
                      {isVerifyingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>{language === 'ua' ? 'Підключити токен' : 'Connect Token'}</span>
                    </button>
                  </div>
                </div>

                {tokenError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{tokenError}</span>
                  </div>
                )}

                {/* Instructions Helper */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between text-slate-300 font-semibold">
                    <span>Як створити токен на GitHub?</span>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=KROK-Assistant-FileManager"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Створити токен в 1 клік</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-400">
                    <li>Перейдіть за посиланням вище (або Settings → Developer settings → Personal access tokens → Tokens (classic)).</li>
                    <li>Оберіть скоуп <code className="text-emerald-400 font-mono">repo</code> (повний контроль для створення та деплою).</li>
                    <li>Скопіюйте згенерований токен (починається з <code className="text-slate-300 font-mono">ghp_</code>) та вставте у поле вище.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* 2. File Selection Checklist Module */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">
                  {language === 'ua' ? 'Вибір файлів для відправки в репозиторій' : 'Select Files to Deploy'}
                </h3>
              </div>

              {/* Fast selector buttons */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <button
                  onClick={handleSelectAllFiles}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Обрати всі
                </button>
                <button
                  onClick={handleSelectWebFiles}
                  className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/60 rounded-lg transition"
                >
                  Лише веб-додатки (HTML/JS)
                </button>
                <button
                  onClick={handleSelectDataFiles}
                  className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-lg transition"
                >
                  Лише дані (JSON/CSV/MD)
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                >
                  Очистити
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Обрано для коміту: <strong className="text-white">{selectedFilesList.length}</strong> з <strong className="text-white">{files.length}</strong> файлів</span>
              <span className="font-mono text-purple-300">Загальний розмір: {selectedFormattedSize}</span>
            </div>

            {/* Files Checklist */}
            {files.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                У сховищі немає файлів. Перейдіть на вкладку "Сховище файлів" та завантажте файли.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 max-h-96 overflow-y-auto">
                {files.map(file => {
                  const isChecked = selectedFileIds.has(file.id);
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleToggleFileSelection(file.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                        isChecked ? 'bg-purple-950/20' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFileSelection(file.id);
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center transition shrink-0 ${
                            isChecked ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                              {file.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{file.formattedSize}</span>
                            <span>•</span>
                            <span>{file.lineCount} рядків</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickPreviewFile(file);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
                        >
                          Перегляд
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Repository & Deployment Settings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">
                {language === 'ua' ? 'Параметри репозиторію та деплою' : 'Repository & Deployment Settings'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Назва репозиторію (Target Repository)
                </label>
                <input
                  type="text"
                  value={targetRepoName}
                  onChange={e => setTargetRepoName(e.target.value)}
                  placeholder="krok-project-files"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  github.com/{githubUser?.login || 'username'}/{targetRepoName || 'repo'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Цільова гілка (Target Branch)
                </label>
                <input
                  type="text"
                  value={targetBranch}
                  onChange={e => setTargetBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Повідомлення коміту (Commit Message)
                </label>
                <input
                  type="text"
                  value={deployCommitMessage}
                  onChange={e => setDeployCommitMessage(e.target.value)}
                  placeholder="Deploy project files via KROK Assistant v10.0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPrivateRepo}
                    onChange={e => setIsPrivateRepo(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>Приватний репозиторій (Private Repo)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoEnablePages}
                    onChange={e => setAutoEnablePages(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>Увімкнути GitHub Pages для веб-сайту</span>
                </label>
              </div>
            </div>

            {/* Deploy Trigger Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {selectedFilesList.length > 0
                  ? `Готово до відправки: ${selectedFilesList.length} файлів (${selectedFormattedSize})`
                  : 'Оберіть файли у списку вище для запуску деплою'}
              </span>

              <button
                onClick={handleBatchDeployToGitHub}
                disabled={isDeploying || !githubToken || selectedFilesList.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xl shadow-purple-950/40 shrink-0"
              >
                {isDeploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>
                  {isDeploying
                    ? 'Відправка файлів на GitHub...'
                    : `Опублікувати на GitHub (${selectedFilesList.length} файлів)`}
                </span>
              </button>
            </div>
          </div>

          {/* 4. Deployment Logs & Success Banner */}
          {deployError && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <strong className="block text-white mb-0.5">Помилка деплою:</strong>
                <span>{deployError}</span>
              </div>
            </div>
          )}

          {deployResult && (
            <div className="p-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 rounded-2xl space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    🎉 Проєкт успішно опубліковано на GitHub!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Усі {deployResult.totalFiles} вибраних файлів успішно закомічено у репозиторій.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={deployResult.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
                >
                  <Github className="w-4 h-4 text-purple-400" />
                  <span>Відкрити репозиторій</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                {deployResult.pagesUrl && (
                  <a
                    href={deployResult.pagesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Відкрити веб-сайт (GitHub Pages)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Terminal Logs */}
          {deployLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Журнал операцій деплою:</span>
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {deployLogs.map((log, idx) => (
                  <p key={idx} className={log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-rose-400' : ''}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {quickPreviewFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  {isImageFile(quickPreviewFile) ? (
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                  ) : quickPreviewFile.type === 'json' ? (
                    <FileCode className="w-5 h-5 text-purple-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-sky-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold uppercase">
                      Quick Preview
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {quickPreviewFile.formattedSize}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base truncate mt-0.5" title={quickPreviewFile.name}>
                    {quickPreviewFile.name}
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setQuickPreviewFile(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                title="Закрити перегляд"
              >
                ✕
              </button>
            </div>

            {/* Modal View Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPreviewTab('snippet')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  previewTab === 'snippet'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isImageFile(quickPreviewFile) ? '📸 Мініатюра зображення' : '📄 Фрагмент вмісту (Snippet)'}
              </button>

              <button
                onClick={() => setPreviewTab('chunks')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  previewTab === 'chunks'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧠 Семантичні чанки RAG ({quickPreviewFile.chunks.length})
              </button>

              <button
                onClick={() => setPreviewTab('raw')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  previewTab === 'raw'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🧾 Повний вихідний текст
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: SNIPPET / THUMBNAIL */}
              {previewTab === 'snippet' && (
                <div className="space-y-4">
                  {/* Image Preview */}
                  {isImageFile(quickPreviewFile) ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 min-h-[300px] max-h-[460px]">
                        <img
                          src={quickPreviewFile.thumbnailUrl || quickPreviewFile.content}
                          alt={quickPreviewFile.name}
                          className="max-h-[420px] max-w-full rounded-xl object-contain shadow-2xl"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <span>Роздільна здатність: <strong className="text-emerald-400">{quickPreviewFile.dimensions || 'Висока якість'}</strong></span>
                        <span>Розмір: <strong className="text-white">{quickPreviewFile.formattedSize}</strong></span>
                        <span>Формат: <strong className="text-sky-400">{quickPreviewFile.name.split('.').pop()?.toUpperCase()}</strong></span>
                      </div>
                    </div>
                  ) : quickPreviewFile.name.endsWith('.csv') ? (
                    /* CSV Table Snippet */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Табличний перегляд датасету:</span>
                        <span className="font-mono text-sky-400">{quickPreviewFile.lineCount} рядків</span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-xs text-left">
                          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                            {quickPreviewFile.content.split('\n').slice(0, 15).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800/80 font-bold text-white' : 'hover:bg-slate-800/30'}>
                                {row.split(',').map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 whitespace-nowrap border-r border-slate-800/40">
                                    {cell.replace(/"/g, '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Text / Code Snippet Preview */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Фрагмент коду та семантичного вмісту:</span>
                        <span className="font-mono text-emerald-400">
                          {quickPreviewFile.lineCount} рядків • ~{quickPreviewFile.tokenEstimate} токенів
                        </span>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                        <pre className="p-4 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto max-h-[420px] whitespace-pre-wrap">
                          {quickPreviewFile.content.slice(0, 3500)}
                          {quickPreviewFile.content.length > 3500 && '\n\n... [Залишок файлу обрізано для швидкого перегляду] ...'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHUNKS PREVIEW */}
              {previewTab === 'chunks' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Семантичні фрагменти, збережені у векторній пам'яті RAG для автономного пошуку:
                  </div>
                  <div className="space-y-2">
                    {quickPreviewFile.chunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300"
                      >
                        <div className="flex items-center justify-between text-[10px] text-sky-400 font-bold mb-1">
                          <span>Чанк #{idx + 1}</span>
                          <span>{chunk.length} символів</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{chunk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: RAW CONTENT */}
              {previewTab === 'raw' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Повний сирий вміст файлу:</div>
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[420px]">
                    {quickPreviewFile.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer Actions: Download & Copy */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[11px] font-mono">
                SHA-256: {quickPreviewFile.sha256 ? quickPreviewFile.sha256.slice(0, 24) : 'clean'}...
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleCopySnippet(quickPreviewFile.content)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
                  title="Скопіювати весь вміст у буфер обміну"
                >
                  {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                  <span>{copiedSnippet ? 'Скопійовано!' : 'Копіювати вміст'}</span>
                </button>

                {onDispatchToAgent && (
                  <button
                    onClick={() => {
                      onDispatchToAgent(quickPreviewFile, quickPreviewFile.targetLine);
                      setQuickPreviewFile(null);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-medium transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>В роботу рою</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeploySingleFile(quickPreviewFile);
                    setQuickPreviewFile(null);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl font-medium transition"
                  title="Опублікувати цей файл у GitHub репозиторій"
                >
                  <Github className="w-3.5 h-3.5 text-purple-400" />
                  <span>Деплой на GitHub</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(quickPreviewFile)}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-950/40"
                  title="Завантажити цей файл на ваш комп'ютер"
                >
                  <Download className="w-4 h-4" />
                  <span>Завантажити файл ({quickPreviewFile.formattedSize})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
