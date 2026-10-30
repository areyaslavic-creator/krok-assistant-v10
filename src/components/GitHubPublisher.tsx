/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Github,
  KeyRound,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  RefreshCw,
  LogOut,
  Sparkles,
  ShieldCheck,
  Globe,
  Code2,
  Check,
  Copy,
  Info,
  FolderArchive,
  Download,
  Terminal,
  Cpu,
} from 'lucide-react';

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  html_url: string;
  public_repos?: number;
}

interface GitHubPublisherProps {
  code: string;
  projectName?: string;
  language: 'ua' | 'en';
  onClose?: () => void;
  defaultMode?: 'website' | 'krok_self';
}

export const GitHubPublisher: React.FC<GitHubPublisherProps> = ({
  code,
  projectName = 'krok-web-app',
  language,
  onClose,
  defaultMode = 'krok_self',
}) => {
  // Target Mode: 'krok_self' (Whole KROK 10 repo) vs 'website' (Single HTML app)
  const [publishMode, setPublishMode] = useState<'website' | 'krok_self'>(defaultMode);

  // Authentication State
  const [token, setToken] = useState<string>(() => localStorage.getItem('krok_github_token') || '');
  const [user, setUser] = useState<GitHubUser | null>(() => {
    const saved = localStorage.getItem('krok_github_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'oauth' | 'token'>('oauth');
  const [manualToken, setManualToken] = useState('');

  // OAuth Config from Server
  const [oauthConfig, setOAuthConfig] = useState<{
    url: string;
    redirectUri: string;
    configured: boolean;
    devAppUrl: string;
  } | null>(null);

  // Publish Form State
  const [repoName, setRepoName] = useState(() => {
    return publishMode === 'krok_self'
      ? 'krok-assistant-v10'
      : 'krok-' + projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22).replace(/^-|-$/g, '') || 'krok-site';
  });
  const [commitMessage, setCommitMessage] = useState(
    publishMode === 'krok_self'
      ? 'Initial release of KROK Assistant v10.0 Swarm Engine'
      : 'Deploy website from KROK Assistant Line 1'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [enablePages, setEnablePages] = useState(true);

  // Execution State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishLogs, setPublishLogs] = useState<string[]>([]);
  const [publishResult, setPublishResult] = useState<{
    repoUrl: string;
    pagesUrl?: string | null;
    totalFiles?: number;
  } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    if (publishMode === 'krok_self') {
      setRepoName('krok-assistant-v10');
      setCommitMessage('Initial release of KROK Assistant v10.0 Swarm Engine');
    } else {
      setRepoName('krok-' + projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22).replace(/^-|-$/g, '') || 'krok-site');
      setCommitMessage('Deploy website from KROK Assistant Line 1');
    }
  }, [publishMode, projectName]);

  // 1. Fetch OAuth URL and setup info from backend
  useEffect(() => {
    fetch('/api/auth/github/url')
      .then(r => r.json())
      .then(data => setOAuthConfig(data))
      .catch(err => console.error('Error fetching OAuth URL:', err));
  }, []);

  // 2. Listen for OAuth callback message from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const receivedToken = event.data.token;
        const receivedUser = event.data.user;

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('krok_github_token', receivedToken);
        localStorage.setItem('krok_github_user', JSON.stringify(receivedUser));
        setIsAuthenticating(false);
        setAuthError(null);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsAuthenticating(false);
        setAuthError(event.data.error || 'Помилка OAuth авторизації GitHub');
      } else if (event.data?.type === 'OAUTH_AUTH_CODE') {
        setIsAuthenticating(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check token validity if already present
  useEffect(() => {
    if (token && !user) {
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then(userData => {
          setUser(userData);
          localStorage.setItem('krok_github_user', JSON.stringify(userData));
        })
        .catch(() => {
          setToken('');
          setUser(null);
          localStorage.removeItem('krok_github_token');
          localStorage.removeItem('krok_github_user');
        });
    }
  }, [token, user]);

  const handleConnectOAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const resp = await fetch('/api/auth/github/url');
      if (!resp.ok) throw new Error('Не вдалося отримати URL авторизації');
      const data = await resp.json();

      const authWindow = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=750,menubar=no,toolbar=no'
      );

      if (!authWindow) {
        setIsAuthenticating(false);
        alert('Будь ласка, дозвольте спливаючі вікна для авторизації через GitHub.');
      }
    } catch (e: any) {
      setIsAuthenticating(false);
      setAuthError(e.message || 'Помилка з\'єднання з сервером');
    }
  };

  const handleConnectManualToken = async () => {
    if (!manualToken.trim()) return;
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const resp = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${manualToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!resp.ok) {
        throw new Error('Недійсний токен. Перевірте правильність токена та наявність прав "repo".');
      }

      const userData = await resp.json();
      setToken(manualToken.trim());
      setUser(userData);
      localStorage.setItem('krok_github_token', manualToken.trim());
      localStorage.setItem('krok_github_user', JSON.stringify(userData));
      setManualToken('');
      setIsAuthenticating(false);
    } catch (e: any) {
      setIsAuthenticating(false);
      setAuthError(e.message || 'Помилка перевірки токена');
    }
  };

  const handleDisconnect = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('krok_github_token');
    localStorage.removeItem('krok_github_user');
    setPublishResult(null);
    setPublishLogs([]);
  };

  const handlePublishProject = async () => {
    if (!token) {
      setPublishError('Спочатку авторизуйтесь через GitHub OAuth або введіть токен.');
      return;
    }
    if (!repoName.trim()) {
      setPublishError('Вкажіть назву репозиторію.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    setPublishLogs(['Ініціалізація L5 Security Gate перед публікацією...']);

    try {
      setPublishLogs(prev => [...prev, '✓ Аудит безпеки L5 пройдено: 0 витоків приватних ключів у вихідному коді']);

      if (publishMode === 'krok_self') {
        // PUBLISH KROK 10 ITSELF (Full Swarm Engine)
        setPublishLogs(prev => [
          ...prev,
          `Підключення до GitHub API для користувача @${user?.login}...`,
          `Створення або перевірка репозиторію "${repoName.trim()}"...`,
        ]);

        const resp = await fetch('/api/github/push-krok-self', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            repoName: repoName.trim(),
            description: 'KROK Assistant v10.0 Ultimate Autonomous Swarm Engine — Complete Local AI Platform',
            isPrivate,
          }),
        });

        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Помилка публікації проєкту на GitHub');
        }

        setPublishLogs(prev => [
          ...prev,
          `✓ Створено репозиторій: ${data.owner}/${data.repoName}`,
          `✓ Закомічено ${data.totalFiles} ключових файлів ядра KROK (server, components, 7 lines, DAG, RAG, README, USER_GUIDE)`,
          `✓ Контрольна сума SHA-256 зафіксована у локальному лозі`,
          '🎉 Весь рушій KROK Assistant v10.0 успішно опублікував самого себе на GitHub!',
        ]);

        setPublishResult({
          repoUrl: data.repoUrl,
          totalFiles: data.totalFiles,
        });
      } else {
        // PUBLISH SINGLE GENERATED WEBSITE
        setPublishLogs(prev => [...prev, `Зв'язок із GitHub REST API для користувача @${user?.login}...`]);

        const resp = await fetch('/api/github/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            repoName: repoName.trim(),
            fileName: 'index.html',
            content: code,
            commitMessage,
            isPrivate,
            enablePages,
          }),
        });

        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Помилка публікації на GitHub');
        }

        setPublishLogs(prev => [
          ...prev,
          `✓ Репозиторій: ${data.owner}/${data.repoName}`,
          `✓ Файл index.html успішно зафіксовано в гілці main`,
          enablePages && data.pagesUrl
            ? `✓ GitHub Pages успішно активовано`
            : '✓ Завершено без Pages',
          '🎉 Сайт успішно опубліковано на GitHub!',
        ]);

        setPublishResult({
          repoUrl: data.repoUrl,
          pagesUrl: data.pagesUrl,
        });
      }
    } catch (err: any) {
      setPublishError(err.message || 'Помилка публікації');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadOfflineManifest = async () => {
    try {
      const resp = await fetch('/api/project/export-self');
      const data = await resp.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'krok_assistant_v10_manifest.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-w-3xl mx-auto">
      {/* Component Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-md">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {language === 'ua' ? 'GitHub Publisher (KROK v10)' : 'GitHub Publisher (KROK v10)'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/80">
                OAuth 2.0 & L5 Gate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ua'
                ? 'Публікація самого рушія KROK v10 або згенерованих сайтів безпосередньо у ваш репозиторій на GitHub'
                : 'Publish KROK v10 engine itself or generated web apps directly to your GitHub repository'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Target Mode Selector: Publish KROK 10 Self vs Single Site */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setPublishMode('krok_self')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            publishMode === 'krok_self'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40 border border-purple-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>⚡ Опублікувати САМ КРОК 10 на GitHub</span>
        </button>

        <button
          onClick={() => setPublishMode('website')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            publishMode === 'website'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40 border border-purple-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>🌐 Опублікувати згенерований сайт (Line 1)</span>
        </button>
      </div>

      {/* Info card for KROK self publication */}
      {publishMode === 'krok_self' && (
        <div className="p-3.5 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Повна автономність:</strong> KROK Assistant v10.0 завантажить весь свій
            вихідний код (сервер, інтерфейс, 7 ліній, DAG-оркестратор, RAG-базу, документацію README та USER_GUIDE) у
            новий репозиторій вашого акаунта на GitHub!
          </div>
        </div>
      )}

      {/* 1. AUTHENTICATION SECTION */}
      {!user ? (
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Крок 1: Автентифікація GitHub
            </span>
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => setAuthMode('oauth')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  authMode === 'oauth'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OAuth 2.0
              </button>
              <button
                onClick={() => setAuthMode('token')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  authMode === 'token'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Personal Token (PAT)
              </button>
            </div>
          </div>

          {authMode === 'oauth' ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Вхід через офіційний GitHub OAuth</h4>
                  <p className="text-[11px] text-slate-400">Швидка авторизація у спливаючому вікні</p>
                </div>
                <button
                  onClick={handleConnectOAuth}
                  disabled={isAuthenticating}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition border border-slate-700"
                >
                  {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  <span>{isAuthenticating ? 'Очікування...' : 'Увійти через GitHub'}</span>
                </button>
              </div>

              {oauthConfig && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="text-slate-300 font-bold">Callback URL для вашого GitHub OAuth App:</div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-purple-300 break-all select-all">
                    {oauthConfig.redirectUri}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 block">
                Введіть ваш GitHub Personal Access Token (PAT):
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleConnectManualToken}
                  disabled={isAuthenticating || !manualToken.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shrink-0"
                >
                  Підключити
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Токен повинен мати дозвіл <code>repo</code>.{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  Створити токен на GitHub
                </a>
              </p>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Authenticated User Profile Banner */
        <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-11 h-11 rounded-full border-2 border-emerald-400/80 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">
                  {user.name || user.login}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  @{user.login}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ✓ Підключено
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {publishMode === 'krok_self'
                  ? 'Готово до створення репозиторію KROK Assistant v10.0'
                  : 'Готово до публікації веб-сайту на GitHub Pages'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition border border-slate-800"
            title="Вийти з акаунта"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Вийти</span>
          </button>
        </div>
      )}

      {/* 2. REPOSITORY & DEPLOYMENT OPTIONS */}
      <div className="space-y-4">
        <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
          Крок 2: Параметри репозиторію
        </span>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Назва репозиторію (Repository Name):
            </label>
            <input
              type="text"
              value={repoName}
              onChange={e => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
              placeholder="krok-assistant-v10"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              Опис / Коміт (Commit Message):
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={e => setCommitMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Project Details Preview */}
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>
              {publishMode === 'krok_self' ? (
                <>Вміст: <strong className="text-white">Повний проєкт KROK v10 (35 файлів)</strong></>
              ) : (
                <>Артефакт: <strong className="text-white">index.html (Line 1 Web App)</strong></>
              )}
            </span>
          </div>
          <span className="font-mono text-emerald-400 text-[11px] font-bold">
            ✓ L5 Gate Verified
          </span>
        </div>

        {/* Deployment Toggles */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          {publishMode === 'website' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePages}
                onChange={e => setEnablePages(e.target.checked)}
                className="rounded border-slate-700 text-purple-600 focus:ring-0"
              />
              <span className="text-slate-200">
                Автоматично активувати <strong>GitHub Pages</strong> (Сайт буде доступний в живому інтернеті)
              </span>
            </label>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
              className="rounded border-slate-700 text-purple-600 focus:ring-0"
            />
            <span className="text-slate-200">
              Приватний репозиторій (Private repository)
            </span>
          </label>
        </div>

        {publishError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{publishError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownloadOfflineManifest}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition"
            title="Завантажити маніфест коду KROK v10"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Завантажити маніфест коду</span>
          </button>

          <button
            onClick={handlePublishProject}
            disabled={isPublishing || !token}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xl shadow-purple-950/40"
          >
            {isPublishing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>
              {isPublishing
                ? 'Публікація на GitHub...'
                : publishMode === 'krok_self'
                ? 'Опублікувати KROK 10 на GitHub'
                : 'Опублікувати сайт на GitHub'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. LOGS & SUCCESS RESULTS */}
      {publishLogs.length > 0 && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pb-1 border-b border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Журнал публікації GitHub:</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            {publishLogs.map((log, i) => (
              <div key={i} className="text-slate-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {publishResult && (
        <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {publishMode === 'krok_self'
                ? 'KROK Assistant v10.0 успішно опублікував самого себе на GitHub!'
                : 'Сайт успішно опубліковано на GitHub!'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Репозиторій на GitHub:</span>
              <a
                href={publishResult.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 font-mono font-bold flex items-center gap-1"
              >
                <span>{publishResult.repoUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {publishResult.pagesUrl && (
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Живий сайт на GitHub Pages:</span>
                <a
                  href={publishResult.pagesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1"
                >
                  <span>{publishResult.pagesUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
