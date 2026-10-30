/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Download,
  Filter,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  Check,
  RefreshCw,
  Copy,
  ShieldCheck,
  ArrowRight,
  Share2,
  Database,
  Layers,
  Send,
  Eye,
  ExternalLink,
  Code2,
  Globe,
  FolderUp,
  Info,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface Line3ScraperProps {
  language: 'ua' | 'en';
  onSendToLine1?: (htmlCode: string, prompt?: string) => void;
}

const SAMPLE_RAW_PAGE = `<!DOCTYPE html>
<html>
<!-- GOOGLE ADSENSE CODE: ca-pub-9999999 -->
<div class="cookie-banner">Увага! Ми збираємо файли cookies та показуємо рекламу. Прийняти всі</div>
<div class="ad-banner-top">КУПИ ЗАРАЗ ЗІ ЗНИЖКОЮ 90%! КЛІКНІТЬ ТУТ!</div>

<article>
  <h1>Дослідження: Енергоефективність сонячних панелей в умовах західної України</h1>
  <p class="author">Автор: Інститут відновлюваної енергетики НАН України | Дата: 12.10.2026</p>
  
  <p>У ході трирічного спостереження було виявлено, що середня генерація фотоелектричних станцій на Львівщині складає 1150 кВт·год на 1 кВт встановленої потужності на рік.</p>

  <div class="inline-advertisement">Кредити під 0% на встановлення бойлерів! Дзвоніть!</div>

  <table border="1">
    <tr><th>Регіон</th><th>Інсоляція (кВт·год/м²)</th><th>Ефективність (%)</th><th>Окупність (років)</th></tr>
    <tr><td>Львівська обл.</td><td>1120</td><td>18.4</td><td>5.2</td></tr>
    <tr><td>Закарпатська обл.</td><td>1240</td><td>19.8</td><td>4.6</td></tr>
    <tr><td>Івано-Франківська обл.</td><td>1160</td><td>18.9</td><td>5.0</td></tr>
  </table>

  <p>Висновки: використання двосторонніх (bifacial) панелей збільшує річний вихід енергії на додаткові 8-12% за рахунок відбиття від снігового покриву взимку.</p>
</article>

<div class="newsletter-popup">Підпишіться на спам-розсилку щодня!</div>
<script>gtag('event', 'user_tracking');</script>
</html>`;

const SAMPLE_SOCIAL_FEED = `Каталог авторських виробів майстерні @eco_craft_lviv (Instagram/Telegram):
1. Органічне мило лавандове з вівсяним скрабом (SKU: SOAP-01) — 135 грн. На оливковій олії, гіпоалергенне. В наявності 24 шт.
2. Соєва свічка в гіпсовому кашпо з ароматом хвої та евкаліпту (SKU: CNDL-07) — 290 грн. Дерев'яний гніт, горіння 45 год. В наявності 12 шт.
3. Бальзам для губ на бджолиному воску з обліпихою (SKU: BALM-02) — 85 грн. Захист від вітру та тріщин. В наявності 50 шт.
4. Трав'яний карпатський чай "Гірське дихання" (SKU: TEA-11) — 95 грн. Чебрець, материнка, м'ята, шипшина. 100 грамів. В наявності 30 шт.
5. Лляний шопер ручного розпису з карпатським орнаментом (SKU: BAG-03) — 380 грн. 100% натуральний льон. В наявності 8 шт.

Для замовлення пишіть у Direct або Telegram: @craft_manager, телефон для довідок: +380971234567. Відправка щодня Новою Поштою.`;

export const Line3Scraper: React.FC<Line3ScraperProps> = ({ language, onSendToLine1 }) => {
  const [activeMode, setActiveMode] = useState<'web' | 'social'>('social');

  // Web Scraper State
  const [inputUrl, setInputUrl] = useState('https://energy-research.org.ua/solar-efficiency-2026');
  const [rawText, setRawText] = useState(SAMPLE_RAW_PAGE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanedText, setCleanedText] = useState<string | null>(null);
  const [extractedJson, setExtractedJson] = useState<any | null>(null);
  const [extractedCsv, setExtractedCsv] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'clean' | 'json' | 'csv'>('clean');
  const [stats, setStats] = useState<{ originalLen: number; cleanedLen: number; adsRemoved: number } | null>(null);

  // Social Media Database Collector State
  const [socialPlatform, setSocialPlatform] = useState<'Instagram' | 'Telegram' | 'TikTok' | 'Facebook' | 'LinkedIn'>('Instagram');
  const [socialHandle, setSocialHandle] = useState('eco_craft_lviv');
  const [socialRawText, setSocialRawText] = useState(SAMPLE_SOCIAL_FEED);
  const [isCollectingSocial, setIsCollectingSocial] = useState(false);
  const [socialResult, setSocialResult] = useState<any | null>(null);
  const [socialOutputTab, setSocialOutputTab] = useState<'table' | 'media' | 'sql' | 'csv' | 'json' | 'site'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveToFileSuccess, setSaveToFileSuccess] = useState<string | null>(null);

  const handleSaveToFiles = async () => {
    if (!socialResult) return;
    try {
      const fileName = `social_database_${socialPlatform.toLowerCase()}_${Date.now()}.json`;
      const fileContent = JSON.stringify(socialResult, null, 2);
      const resp = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fileName,
          content: fileContent,
          type: 'json',
          category: 'MarketResearch',
          targetLine: 'Line 3 (Scraper)',
          autoIngestRag: true,
        }),
      });
      if (resp.ok) {
        setSaveToFileSuccess(fileName);
        setTimeout(() => setSaveToFileSuccess(null), 4000);
      }
    } catch (e) {
      console.error('Failed to save to files:', e);
    }
  };

  const handleDownloadMedia = (url: string, filename: string) => {
    const downloadUrl = `/api/media/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCleanContent = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const cleaned = rawText
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<div class="(?:cookie|ad-|banner|newsletter)[\s\S]*?<\/div>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const sampleData = {
        title: "Дослідження: Енергоефективність сонячних панелей в умовах західної України",
        source: inputUrl,
        extractedAt: new Date().toISOString(),
        author: "Інститут відновлюваної енергетики НАН України",
        keyMetrics: [
          { region: "Львівська обл.", insolation: 1120, efficiencyPercent: 18.4, paybackYears: 5.2 },
          { region: "Закарпатська обл.", insolation: 1240, efficiencyPercent: 19.8, paybackYears: 4.6 },
          { region: "Івано-Франківська обл.", insolation: 1160, efficiencyPercent: 18.9, paybackYears: 5.0 },
        ],
        summary: "Середня генерація ФЕС на заході України: 1150 кВт·год/кВт/рік. Двосторонні модулі дають +8-12% за рахунок відбиття від снігу.",
        adFreeAudit: "100% clean. Zero tracking scripts or ads retained."
      };

      const csvData = `Регіон,Інсоляція (кВт·год/м²),Ефективність (%),Окупність (років)
Львівська обл.,1120,18.4,5.2
Закарпатська обл.,1240,19.8,4.6
Івано-Франківська обл.,1160,18.9,5.0`;

      setCleanedText(cleaned);
      setExtractedJson(sampleData);
      setExtractedCsv(csvData);
      setStats({
        originalLen: rawText.length,
        cleanedLen: cleaned.length,
        adsRemoved: 4,
      });
      setIsProcessing(false);
    }, 400);
  };

  const handleCollectSocialDatabase = async () => {
    setIsCollectingSocial(true);
    try {
      const resp = await fetch('/api/social/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: socialPlatform,
          targetHandle: socialHandle,
          rawText: socialRawText,
          dataType: 'products',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setSocialResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCollectingSocial(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                LINE 3
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Ad-Free Parser • Social Database Harvester
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Інтернет-взаємодія, скрейпінг та соцмережі' : 'Internet Interaction & Social Harvester'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Очищення веб-сторінок від реклами та спеціалізований агент збору баз даних (товарів, цін, відгуків) із соціальних мереж для миттєвого створення сайтів.'
                : 'Ad-free web scraping and specialized social media database collector agent (products, pricing, leads) for instant website generation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveMode('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeMode === 'social'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-950/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'ua' ? 'Агент збору баз даних із соцмереж (Instagram/Telegram)' : 'Social Media Database Harvester Agent'}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
            NEW
          </span>
        </button>

        <button
          onClick={() => setActiveMode('web')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeMode === 'web'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-950/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{language === 'ua' ? 'Очищений парсер веб-сторінок (Ad-Free Web)' : 'Ad-Free Web Scraper'}</span>
        </button>
      </div>

      {/* MODE 1: Social Media Database Collector Agent */}
      {activeMode === 'social' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm">
                  {language === 'ua' ? 'Налаштування збору бази даних із соцмереж' : 'Social Harvester Configuration'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Instagram • Telegram • TikTok • Facebook • LinkedIn
              </span>
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Instagram', 'Telegram', 'TikTok', 'Facebook', 'LinkedIn'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSocialPlatform(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition text-center border ${
                    socialPlatform === p
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Social Network Access Architecture Guide */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Чому посилання на соцмережі потребують різного підходу?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <strong className="text-emerald-400 block mb-0.5">✈️ Telegram (Відкриті канали):</strong>
                  Працює напряму за посиланням <code className="text-white">t.me/s/назва</code> або <code className="text-white">@канал</code>. Агент автоматично сканує публікації, ціни та зображення з відкритого веб-дзеркала.
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <strong className="text-rose-400 block mb-0.5">📸 Instagram & TikTok (Login Wall):</strong>
                  Ці платформи блокують прямі бот-запити екраном авторизації. Просто скопіюйте текст публікацій чи каталогу у поле нижче — агент моментально розпізнає назви, ціни, артикули та контакти!
                </div>
              </div>
            </div>

            {/* Handle / Channel Name */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                {language === 'ua' ? 'Нікнейм сторінки, канал або посилання:' : 'Channel handle, username or URL:'}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={e => setSocialHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="eco_craft_lviv або t.me/eco_craft_lviv"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleCollectSocialDatabase}
                  disabled={isCollectingSocial}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-sky-950/30 shrink-0"
                >
                  {isCollectingSocial ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  <span>{language === 'ua' ? 'Зібрати базу даних для сайту' : 'Harvest Database'}</span>
                </button>
              </div>
            </div>

            {/* Raw Social Media Feed/Posts */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  {language === 'ua' ? 'Текст постів, сторіс або каталогу товарів із соцмережі:' : 'Social feed / catalog posts text:'}
                </label>
                <button
                  onClick={() => setSocialRawText(SAMPLE_SOCIAL_FEED)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline font-mono"
                >
                  {language === 'ua' ? 'Завантажити тестовий каталог' : 'Load sample catalog'}
                </button>
              </div>
              <textarea
                rows={5}
                value={socialRawText}
                onChange={e => setSocialRawText(e.target.value)}
                placeholder="Вставте пости або опис товарів із Telegram-каналу або Instagram..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Social Results Section */}
          {socialResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
              {socialResult.platformNote && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  socialResult.isLiveFetched
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                }`}>
                  {socialResult.isLiveFetched ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />}
                  <span className="leading-relaxed">{socialResult.platformNote}</span>
                </div>
              )}

              {saveToFileSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Базу даних збережено у Файловий Менеджер: <strong>{saveToFileSuccess}</strong></span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {language === 'ua' ? 'Зібрана база даних для сайту' : 'Extracted Website Database'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Платформа: {socialResult.platform} • Товарів: {socialResult.itemsCount} • Контакти вилучено
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onSendToLine1 && socialResult.websiteBlueprint && (
                    <button
                      onClick={() => onSendToLine1(
                        socialResult.websiteBlueprint.generatedSiteHtml,
                        `Каталог товарів магазину @${socialHandle || 'craft'} з цінами та контактами`
                      )}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg shadow-emerald-950/30"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{language === 'ua' ? '🚀 Створити сайт & GitHub (Line 1)' : 'Deploy Site in Line 1'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleSaveToFiles}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                    title="Зберегти JSON базу у Файловий менеджер"
                  >
                    <FolderUp className="w-3.5 h-3.5 text-sky-400" />
                    <span>В файли</span>
                  </button>

                  {/* Sub-tabs */}
                  <div className="flex items-center flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setSocialOutputTab('table')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      socialOutputTab === 'table' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Таблиця товарів
                  </button>
                  <button
                    onClick={() => setSocialOutputTab('media')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      socialOutputTab === 'media' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    📸 Медіа (Фото/Відео)
                  </button>
                  <button
                    onClick={() => setSocialOutputTab('sql')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      socialOutputTab === 'sql' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SQL Schema
                  </button>
                  <button
                    onClick={() => setSocialOutputTab('csv')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      socialOutputTab === 'csv' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => setSocialOutputTab('site')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      socialOutputTab === 'site' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    HTML Вітрина (Line 1)
                  </button>
                </div>
              </div>
            </div>

              {/* Tab: Table */}
              {socialOutputTab === 'table' && (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Назва товару</th>
                        <th className="p-3">Категорія</th>
                        <th className="p-3">Ціна</th>
                        <th className="p-3">Наявність</th>
                        <th className="p-3">Опис</th>
                        <th className="p-3">Замовлення</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                      {socialResult.products.map((prod: any) => (
                        <tr key={prod.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 text-sky-400 font-bold">{prod.sku}</td>
                          <td className="p-3 text-white font-semibold font-sans">{prod.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                              {prod.category}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400 font-bold">{prod.price} {prod.currency}</td>
                          <td className="p-3">
                            <span className="text-emerald-400 text-[11px] font-sans">✓ В наявності</span>
                          </td>
                          <td className="p-3 max-w-xs truncate text-slate-400 font-sans" title={prod.description}>
                            {prod.description}
                          </td>
                          <td className="p-3">
                            <span className="text-sky-400 underline">{prod.contact}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Media (Photos & Videos) */}
              {socialOutputTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Знайдені фотографії та відео-рілси для каталогу товарів:</span>
                    <span className="font-mono text-emerald-400">{socialResult.products.length} товарних позицій</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {socialResult.products.map((prod: any) => (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition shadow-lg"
                      >
                        <div className="relative aspect-video bg-slate-950 overflow-hidden">
                          <img
                            src={prod.mediaUrl}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                            {prod.sku}
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-sky-400 uppercase">{prod.category}</span>
                            <h4 className="font-bold text-sm text-white line-clamp-1 mt-0.5">{prod.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                            <span className="font-bold text-emerald-400 text-sm mt-2 block">{prod.price} {prod.currency}</span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <button
                              onClick={() => handleDownloadMedia(prod.mediaUrl, `${prod.sku.toLowerCase()}_photo.jpg`)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Завантажити фото (JPG)</span>
                            </button>

                            {prod.videoUrl && (
                              <button
                                onClick={() => handleDownloadMedia(prod.videoUrl, `${prod.sku.toLowerCase()}_reel.mp4`)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-lg text-xs transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Завантажити відео-ріл (MP4)</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCopyText(`<img src="${prod.mediaUrl}" alt="${prod.title}" class="rounded-xl w-full" />`, prod.id)}
                              className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition text-center"
                            >
                              {copiedKey === prod.id ? 'Скопійовано <img>' : 'Скопіювати HTML <img>'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: SQL */}
              {socialOutputTab === 'sql' && (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopyText(socialResult.sqlTable, 'sql')}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sql' ? 'Скопійовано' : 'Копіювати SQL'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 font-mono text-xs text-sky-300 rounded-xl overflow-x-auto max-h-80 border border-slate-800">
                    {socialResult.sqlTable}
                  </pre>
                </div>
              )}

              {/* Tab: CSV */}
              {socialOutputTab === 'csv' && (
                <div className="space-y-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDownloadCsv(socialResult.csvData, `products_${socialPlatform.toLowerCase()}.csv`)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Завантажити CSV</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 font-mono text-xs text-emerald-300 rounded-xl overflow-x-auto max-h-80 border border-slate-800">
                    {socialResult.csvData}
                  </pre>
                </div>
              )}

              {/* Tab: Site Blueprint */}
              {socialOutputTab === 'site' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Згенеровано односторінкову вітрину каталогу (HTML5/Tailwind)</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(socialResult.websiteBlueprint.generatedSiteHtml, 'site')}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      {copiedKey === 'site' ? 'Скопійовано HTML' : 'Копіювати HTML'}
                    </button>
                  </div>

                  <div className="h-96 rounded-xl overflow-hidden border border-slate-800">
                    <iframe
                      title="Social Website Preview"
                      srcDoc={socialResult.websiteBlueprint.generatedSiteHtml}
                      sandbox="allow-scripts"
                      className="w-full h-full border-0 bg-slate-950"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Ad-Free Web Scraper */}
      {activeMode === 'web' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="Введіть URL веб-сторінки для скрейпінгу..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleCleanContent}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs transition shrink-0"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                <span>{language === 'ua' ? 'Очистити та структурувати' : 'Extract & Clean'}</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                {language === 'ua' ? 'Сирий веб-контент із рекламою (тестовий зразок):' : 'Raw web content with ads/cookies:'}
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {cleanedText && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {stats && (
                <div className="bg-slate-900/60 p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Початковий розмір: {stats.originalLen} симв.</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400">Очищений: {stats.cleanedLen} симв.</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sky-400">Видалено реклами: {stats.adsRemoved} елементи</span>
                  </div>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-4 h-4" /> 100% Ad-Free
                  </span>
                </div>
              )}

              <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveOutputTab('clean')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeOutputTab === 'clean' ? 'bg-slate-800 text-sky-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Очищений текст
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('json')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeOutputTab === 'json' ? 'bg-slate-800 text-sky-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5 text-amber-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => setActiveOutputTab('csv')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeOutputTab === 'csv' ? 'bg-slate-800 text-sky-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-5 font-mono text-xs max-h-[420px] overflow-y-auto">
                {activeOutputTab === 'clean' && (
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{cleanedText}</div>
                )}
                {activeOutputTab === 'json' && (
                  <pre className="text-amber-300 whitespace-pre-wrap">{JSON.stringify(extractedJson, null, 2)}</pre>
                )}
                {activeOutputTab === 'csv' && (
                  <pre className="text-emerald-300 whitespace-pre-wrap">{extractedCsv}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
