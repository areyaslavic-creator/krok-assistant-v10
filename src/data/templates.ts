/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AgentLineMeta,
  WebTemplate,
  PromptTemplate,
  AutomationTemplate,
  RecipeTemplate,
  DagPreset,
  ScheduledTask,
} from '../types/krok';
import { KROK_PORTFOLIO_TEMPLATE } from './krokTemplate';

export const AGENT_LINES: AgentLineMeta[] = [
  {
    id: 'line1_web',
    lineNumber: 1,
    titleUa: 'Веб-розробка та GitHub Pages',
    titleEn: 'Web Development & GitHub Publishing',
    subtitleUa: 'Генерація SPA, HTML/CSS блоків та безпечний деплой L5',
    subtitleEn: 'SPA generation, HTML/CSS templates & L5 secure deployment',
    icon: 'Globe',
    accentColor: 'emerald',
    badge: 'L5 Gate Protected',
    descriptionUa: 'Створює повнофункціональні веб-інтерфейси, односторінкові додатки (SPA) та проводить обов’язковий аудит безпеки L5 перед публікацією на GitHub Pages.',
    descriptionEn: 'Generates single-page web apps, clean semantic HTML/CSS, and enforces strict L5 security confirmation gates before GitHub Pages deployment.',
    coreCapabilities: ['HTML5/Tailwind SPA', 'Live Code Sandbox', 'L5 Security Gate', 'SHA-256 Checksum Audit'],
  },
  {
    id: 'line2_prompts',
    lineNumber: 2,
    titleUa: 'Інженерія агентів та промптів',
    titleEn: 'Agent & Prompt Engineering',
    subtitleUa: 'Конструювання системних промптів та суб-агентів',
    subtitleEn: 'Specialized system prompts & sub-agent archetypes',
    icon: 'Terminal',
    accentColor: 'indigo',
    badge: '5 Archetypes',
    descriptionUa: 'Розробляє вузькоспеціалізовані промпти, поведінкові архетипи (SEO, Юридичний, QA, Аналітик, Фольклор) та оптимізує продуктивність локальних моделей.',
    descriptionEn: 'Constructs specialized system prompts, sub-agent archetypes (SEO, Legal, QA, Analyst, Folklore), and optimizes local LLM context windows.',
    coreCapabilities: ['Archetype Constructor', 'Few-Shot Generator', 'Prompt Compression', 'Role Optimizer'],
  },
  {
    id: 'line3_scraping',
    lineNumber: 3,
    titleUa: 'Інтернет-взаємодія та скрейпінг',
    titleEn: 'Internet Interaction & Smart Scraping',
    subtitleUa: 'Очищений від реклами парсинг та структурування в JSON/CSV',
    subtitleEn: 'Ad-free content extraction, data normalization & JSON/CSV',
    icon: 'Compass',
    accentColor: 'sky',
    badge: 'Ad-Free Parser',
    descriptionUa: 'Здійснює безпечне вилучення корисного контенту з веб-сторінок, очищення від рекламного сміття, трекерів та структурування у форматі JSON або CSV.',
    descriptionEn: 'Extracts clean readable content without ads or scripts, normalizes datasets, and structures text into clean JSON and CSV tabular formats.',
    coreCapabilities: ['Boilerplate Removal', 'Table to CSV/JSON', 'Metadata Extractor', 'Ad-Block Filter'],
  },
  {
    id: 'line4_factcheck',
    lineNumber: 4,
    titleUa: 'Аналітика ринку та фактчекінг',
    titleEn: 'Market Analytics & Fact Checking',
    subtitleUa: 'Credibility Engine (поріг 25%) та захист фольклору',
    subtitleEn: 'Credibility Engine (25% threshold) & folklore preservation',
    icon: 'ShieldCheck',
    accentColor: 'amber',
    badge: 'Folklore Safe',
    descriptionUa: 'Перевіряє достовірність фактів через credibility_engine.py. Відсікає маніпуляції з надійністю < 25% та безумовно захищає автентичні знання й фольклор.',
    descriptionEn: 'Evaluates claim credibility with a 25% filtering threshold while preserving oral traditions and ethnographical folklore under special heritage rules.',
    coreCapabilities: ['Credibility Threshold 25%', 'Folklore Protection', 'Competitor Matrix', 'Disinformation Filter'],
  },
  {
    id: 'line5_productivity',
    lineNumber: 5,
    titleUa: 'Особиста продуктивність та асистент',
    titleEn: 'Personal Productivity & Assistant',
    subtitleUa: 'Декомпозиція цілей у SMART кроки та критерії готовності',
    subtitleEn: 'Goal breakdown into actionable steps & completion criteria',
    icon: 'CheckSquare',
    accentColor: 'rose',
    badge: 'SMART Engine',
    descriptionUa: 'Розкладає масштабні проекти на чіткі покрокові плани з часовими оцінками, залежностями між етапами та конкретними критеріями завершення.',
    descriptionEn: 'Decomposes complex goals into sequential step-by-step task lists with estimated durations, dependencies, and unambiguous completion criteria.',
    coreCapabilities: ['SMART Task Decomposer', 'Interactive Kanban', 'Timeline Calculator', 'Dependency Graph'],
  },
  {
    id: 'line6_automation',
    lineNumber: 6,
    titleUa: 'AI Автоматизація та інтеграції',
    titleEn: 'AI Automation & Integrations',
    subtitleUa: 'Блюпринти для Make, n8n, SendPulse та Telegram',
    subtitleEn: 'Workflow blueprints for Make, n8n, SendPulse & Telegram',
    icon: 'Cpu',
    accentColor: 'purple',
    badge: 'n8n / Make Ready',
    descriptionUa: 'Генерує готові JSON-сценарії для сервісів автоматизації n8n, Make.com, SendPulse та вебхуків Telegram без необхідності писати код вручну.',
    descriptionEn: 'Builds ready-to-import workflow blueprints and webhook connectors for n8n, Make, SendPulse, and Telegram bots with 1-click JSON copy.',
    coreCapabilities: ['n8n JSON Generator', 'Telegram Webhook Schema', 'Make.com Blueprints', 'Error Handler Node'],
  },
  {
    id: 'line7_recipes',
    lineNumber: 7,
    titleUa: 'Рецептури та еко-продукти',
    titleEn: 'Product Recipes & Life Reproduction',
    subtitleUa: 'Безпечна хімія, точні пропорції та аудит сумісності',
    subtitleEn: 'Eco-product recipes, safe chemistry & proportion audit',
    icon: 'FlaskConical',
    accentColor: 'teal',
    badge: 'Safe Chemistry',
    descriptionUa: 'Створює рецепти побутових еко-засобів та натуральної косметики з точними грамами/мілілітрами, попередженнями про хімічні ризики та термінами зберігання.',
    descriptionEn: 'Formulates safe household eco-products, natural remedies, and zero-waste solutions with exact metric proportions and chemical hazard screening.',
    coreCapabilities: ['Exact Metric Ratio', 'Chemical Conflict Screening', 'Shelf-Life Estimator', 'Zero-Waste Formula'],
  },
];

export const WEB_TEMPLATES: WebTemplate[] = [
  KROK_PORTFOLIO_TEMPLATE,
  {
    id: 'tpl-research-portal',
    name: 'Науковий дослідницький портал',
    category: 'Research & Science',
    description: 'Адаптивний односторінковий хаб для публікації лабораторних звітів, графіків та відкритих наукових даних.',
    code: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Дослідницький хаб | KROK v10</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
        <span class="font-bold text-lg tracking-tight">KROK Science Hub</span>
      </div>
      <nav class="flex gap-6 text-sm text-slate-400">
        <a href="#papers" class="hover:text-emerald-400 transition">Публікації</a>
        <a href="#metrics" class="hover:text-emerald-400 transition">Метрики</a>
        <a href="#contact" class="hover:text-emerald-400 transition">Зв'язок</a>
      </nav>
    </div>
  </header>
  <main class="max-w-6xl mx-auto px-6 py-12">
    <section class="mb-12">
      <h1 class="text-3xl font-extrabold text-white mb-4">Відкритий реєстр досліджень</h1>
      <p class="text-slate-400 max-w-2xl text-base">Автономна база знань для незалежних вчених: перевірені дані, методології та польові спостереження.</p>
    </section>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition">
        <span class="text-xs font-mono text-emerald-400">#ECOLOGY</span>
        <h3 class="text-lg font-bold text-white mt-2 mb-2">Моніторинг ґрунтів</h3>
        <p class="text-sm text-slate-400 mb-4">Аналіз вмісту мікроелементів після застосування органічних біогумусів.</p>
        <span class="text-xs text-slate-500">Оновлено: Сьогодні • Статус: Підтверджено</span>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition">
        <span class="text-xs font-mono text-emerald-400">#ENERGY</span>
        <h3 class="text-lg font-bold text-white mt-2 mb-2">Мікрогенерація</h3>
        <p class="text-sm text-slate-400 mb-4">Автономні сонячно-вітрові комбінації для віддалених дослідницьких станцій.</p>
        <span class="text-xs text-slate-500">Оновлено: Вчора • Статус: В роботі</span>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition">
        <span class="text-xs font-mono text-emerald-400">#FOLKLORE</span>
        <h3 class="text-lg font-bold text-white mt-2 mb-2">Етноботаніка Полісся</h3>
        <p class="text-sm text-slate-400 mb-4">Каталогізація народних рецептів лікарських рослин з перевіркою безпеки.</p>
        <span class="text-xs text-slate-500">Оновлено: 3 дні тому • Збережено</span>
      </div>
    </div>
  </main>
</body>
</html>`,
  },
  {
    id: 'tpl-eco-store',
    name: 'Вітрина локальних еко-товарів',
    category: 'E-Commerce',
    description: 'Легка та стильна вітрина натуральних засобів, виготовлених за формулами Лінії 7 KROK.',
    code: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>Еко Лабораторія | Чисті рецептури</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-900 text-zinc-100 font-sans p-6">
  <div class="max-w-4xl mx-auto bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-xl">
    <div class="flex justify-between items-center border-b border-zinc-800 pb-6 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-teal-400">ECO-LABORATORY</h1>
        <p class="text-xs text-zinc-400 mt-1">100% біорозкладні формули • Нуль токсинів</p>
      </div>
      <span class="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-800 rounded-full text-xs font-mono">
        Стандарт KROK Line 7
      </span>
    </div>
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="p-5 border border-zinc-800 rounded-xl bg-zinc-900/50">
        <h3 class="font-bold text-white mb-1">Оцтово-лавандовий концентрат</h3>
        <p class="text-xs text-zinc-400 mb-3">Для миття вікон та кераміки без розводів.</p>
        <div class="flex justify-between items-center text-sm">
          <span class="font-mono text-teal-400">500 мл / 45 ₴ собівартість</span>
          <button class="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-black font-semibold rounded text-xs transition">Деталі формули</button>
        </div>
      </div>
      <div class="p-5 border border-zinc-800 rounded-xl bg-zinc-900/50">
        <h3 class="font-bold text-white mb-1">Бальзам на бджолиному воску</h3>
        <p class="text-xs text-zinc-400 mb-3">Захист шкіри рук та дерев'яних виробів.</p>
        <div class="flex justify-between items-center text-sm">
          <span class="font-mono text-teal-400">100 г / 60 ₴ собівартість</span>
          <button class="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-black font-semibold rounded text-xs transition">Деталі формули</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'prompt-seo',
    name: 'SEO & Семантичний оптимізатор знань',
    archetype: 'SEO',
    description: 'Створює структурований контент з урахуванням семантичного ядра, FAQ блоків та розмітки Schema.org.',
    systemPrompt: `Ви — провідний SEO-архітектор KROK Assistant.
Ваше завдання: оптимізувати текст під сучасні пошукові системи без "переспаму".
Правила:
- Виділяйте 3-5 головних LSI-ключів
- Формуйте відповіді за принципом Question-Answer (для швидких відповідей Google)
- Завжди додавати готову JSON-LD розмітку Schema.org (Article або FAQPage)`,
    userPromptTemplate: 'Оптимізуй наступну статтю на тему: {{topic}} для аудиторії: {{audience}}',
  },
  {
    id: 'prompt-qa',
    name: 'Суворий QA Інженер та аудитор коду',
    archetype: 'QA',
    description: 'Аналізує код на граничні випадки, вразливості, витоки пам’яті та дотримання принципів Clean Architecture.',
    systemPrompt: `Ви — провідний QA Lead та аудитор безпеки.
Ваше завдання: знайти приховані дефекти, проблеми асинхронності, блокування потоків та вразливості XSS/CSRF.
Вимоги:
- Надавати список перевірок (Edge cases)
- Вказувати конкретні рядки коду з виправленнями
- Оцінювати тестове покриття`,
    userPromptTemplate: 'Проведи повний аудит наступного коду: \n```\n{{code}}\n```',
  },
  {
    id: 'prompt-folklore',
    name: 'Дослідник фольклору та етнографії',
    archetype: 'Ethnography',
    description: 'Зберігає автентичні народні традиції, прикмети, рецепти та пісні з історичним контекстом.',
    systemPrompt: `Ви — науковий співробітник з української етнографії та народних знань.
Відповідно до правила Folklore Preservation Rule (Line 4), ви фіксуєте народні знання, діалектизми та традиції, відокремлюючи магічні нашарування від практичної народної мудрості.
Формат:
- Регіон походження (Полісся, Поділля, Гуцульщина, Слобожанщина тощо)
- Автентичний текст або приказка
- Сучасне раціональне пояснення явища`,
    userPromptTemplate: 'Досліди народну прикмету або традицію: {{tradition}}',
  },
  {
    id: 'prompt-legal',
    name: 'Юридичний аудитор ліцензій (Open Source)',
    archetype: 'Legal',
    description: 'Перевіряє сумісність ліцензій (MIT, GPL, Apache 2.0) та дотримання авторських прав.',
    systemPrompt: `Ви — юрисконсульт з відкритого програмного забезпечення (FOSS) та захисту авторських прав.
Аналізуйте залежності, ліцензійні обмеження, вимоги щодо розкриття коду (Copyleft) та можливі патентні конфлікти.`,
    userPromptTemplate: 'Оціни ліцензійну сумісність наступного стеку: {{stack}}',
  },
];

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'auto-n8n-telegram',
    name: 'n8n: Telegram сповіщувач результатів KROK',
    platform: 'n8n',
    description: 'Приймає вебхук від KROK Assistant, фільтрує помилки та відправляє форматований звіт у Telegram-канал або чат.',
    jsonBlueprint: {
      name: 'KROK v10 Telegram Dispatcher',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'krok-dispatch',
            responseMode: 'responseNode',
            options: {},
          },
          name: 'Webhook Inbound',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            functionCode: `// Форматування повідомлення KROK Swarm Engine
const data = items[0].json;
const text = \`⚡ *KROK Assistant v10.0 Сповіщення*\\n\\n*Лінія:* \${data.agentLine}\\n*Статус:* \${data.status}\\n\\n\${data.summary}\`;
return [{ json: { formattedText: text, chatId: data.chatId || "@krok_channel" } }];`,
          },
          name: 'Format Payload',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [480, 300],
        },
        {
          parameters: {
            chatId: '={{$node["Format Payload"].json["chatId"]}}',
            text: '={{$node["Format Payload"].json["formattedText"]}}',
            additionalFields: { parse_mode: 'Markdown' },
          },
          name: 'Telegram Send',
          type: 'n8n-nodes-base.telegram',
          typeVersion: 1,
          position: [700, 300],
        },
      ],
      connections: {
        'Webhook Inbound': { main: [[{ node: 'Format Payload', type: 'main', index: 0 }]] },
        'Format Payload': { main: [[{ node: 'Telegram Send', type: 'main', index: 0 }]] },
      },
    },
  },
  {
    id: 'auto-make-sheets',
    name: 'Make.com: Журнал аналітики ринку в Google Sheets',
    platform: 'Make',
    description: 'Автоматичний імпорт результатів роботи Line 4 (конкурентні метрики) у захищену таблицю.',
    jsonBlueprint: {
      scenario: 'KROK Line 4 Competitor Sync',
      trigger: 'Custom Webhook POST',
      steps: [
        { module: 'gateway:CustomWebHook', action: 'Listen' },
        { module: 'json:ParseJSON', action: 'ExtractMetrics' },
        { module: 'google-sheets:AddRow', action: 'AppendRecord', spreadsheetId: 'KROK_Market_DB' },
      ],
    },
  },
];

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'rcp-cleaner',
    title: 'Універсальний оцтово-мильний еко-спрей',
    category: 'Household Cleaning',
    proportions: [
      { ingredient: 'Вода дистильована (або кип’ячена)', amount: '350 мл', percentage: 70 },
      { ingredient: 'Оцет яблучний натуральний 6-9%', amount: '100 мл', percentage: 20 },
      { ingredient: 'Рідке кастильське мило на оливковій олії', amount: '45 мл', percentage: 9 },
      { ingredient: 'Ефірна олія чайного дерева (антисептик)', amount: '15 крапель (1 мл)', percentage: 1 },
    ],
    instructions: [
      'У скляну пляшку з розпилювачем налийте дистильовану воду кімнатної температури.',
      'Додайте яблучний оцет та повільно влийте кастильське мило.',
      'Капніть ефірну олію чайного дерева та обережно перемішайте круговими рухами без спінювання.',
      'Використовуйте для кераміки, плитки, скла та сантехніки.',
    ],
    safetyCheck: '⚠️ Не використовувати на натуральному мармурі та вапняку (кислота розчиняє кальцій). Суворо заборонено змішувати з хлорними відбілювачами!',
    shelfLife: '45 днів при кімнатній температурі подалі від прямих сонячних променів.',
  },
  {
    id: 'rcp-balm',
    title: 'Захисний бальзам на бджолиному воску та календулі',
    category: 'Natural Cosmetics',
    proportions: [
      { ingredient: 'Олія мацерат календули на соняшнику', amount: '60 г', percentage: 60 },
      { ingredient: 'Бджолиний віск натуральний пасічний', amount: '25 г', percentage: 25 },
      { ingredient: 'Олія обліпихова (загоювальна)', amount: '10 г', percentage: 10 },
      { ingredient: 'Вітамін Е (токоферол ацетат)', amount: '5 г', percentage: 5 },
    ],
    instructions: [
      'На водяній бані розтопіть бджолиний віск при температурі не вище 68-70°C.',
      'Додайте мацерат календули, постійно помішуючи дерев’яною або скляною паличкою.',
      'Зніміть з вогню, дайте охолонути до 45°C, вмішайте обліпихову олію та вітамін Е.',
      'Швидко розлийте у чисті сухі алюмінієві або скляні баночки до повного застигання.',
    ],
    safetyCheck: 'Перевірено: 100% натуральні інгредієнти. Перед першим використанням провести тест на індивідуальну чутливість до продуктів бджільництва.',
    shelfLife: '12 місяців у сухому темному місці.',
  },
];

export const DAG_PRESETS: DagPreset[] = [
  {
    id: 'dag-product-launch',
    titleUa: 'Повний цикл: Від ідеї до сайту та рецептури',
    titleEn: 'Full Cycle: From Concept to Verified Web App',
    descriptionUa: 'Послідовний запуск: декомпозиція завдання (Line 5) -> створення рецептури (Line 7) -> перевірка фактів (Line 4) -> генерація веб-сайту (Line 1) -> рефлексія Critique Agent.',
    descriptionEn: 'Sequential pipeline: Goal breakdown (L5) -> Safe Recipe (L7) -> Credibility Check (L4) -> Web Landing Generator (L1) -> Critique Agent reflection.',
    nodes: [
      {
        id: 'node-1',
        agentLine: 'line5_productivity',
        label: 'Декомпозиція цілей проекту',
        inputDescription: 'Сформувати SMART план дій із часовими рамками',
        status: 'idle',
        dependencies: [],
      },
      {
        id: 'node-2',
        agentLine: 'line7_recipes',
        label: 'Розробка безпечної рецептури',
        inputDescription: 'Розрахувати пропорції та перевірити хімічну безпеку',
        status: 'idle',
        dependencies: ['node-1'],
      },
      {
        id: 'node-3',
        agentLine: 'line4_factcheck',
        label: 'Аудит надійності та традицій',
        inputDescription: 'Перевірити твердження за порогом 25% + правило фольклору',
        status: 'idle',
        dependencies: ['node-2'],
      },
      {
        id: 'node-4',
        agentLine: 'line1_web',
        label: 'Генерація веб-інтерфейсу',
        inputDescription: 'Створити чистий HTML/Tailwind SPA під аудитом L5 Gate',
        status: 'idle',
        dependencies: ['node-3'],
      },
    ],
  },
  {
    id: 'dag-market-research',
    titleUa: 'Глибокий аналіз ринку та скрейпінг',
    titleEn: 'Deep Market Scraping & Fact Audit',
    descriptionUa: 'Збір контенту без реклами (Line 3) -> Верифікація джерел (Line 4) -> Створення спеціалізованого системного промпта (Line 2).',
    descriptionEn: 'Ad-free content extraction (L3) -> Fact check (L4) -> Specialized Prompt Architecture (L2).',
    nodes: [
      {
        id: 'node-1',
        agentLine: 'line3_scraping',
        label: 'Очищений парсинг джерел',
        inputDescription: 'Вилучення тексту та видалення рекламного сміття',
        status: 'idle',
        dependencies: [],
      },
      {
        id: 'node-2',
        agentLine: 'line4_factcheck',
        label: 'Фактчекінг та відсікання маніпуляцій',
        inputDescription: 'Фільтрація недостовірних джерел < 25%',
        status: 'idle',
        dependencies: ['node-1'],
      },
      {
        id: 'node-3',
        agentLine: 'line2_prompts',
        label: 'Синтез аналітичного архетипу',
        inputDescription: 'Побудова системного промпту для подальшого аналізу',
        status: 'idle',
        dependencies: ['node-2'],
      },
    ],
  },
];

export const INITIAL_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: 'task-1',
    name: 'Щогодинний моніторинг цілісності бази знань RAG',
    schedule: 'Кожні 60 хв',
    line: 'RAG Core Engine',
    status: 'active',
    lastRun: '15 хв тому',
    nextRun: 'через 45 хв',
  },
  {
    id: 'task-2',
    name: 'Нічне очищення тимчасового кешу та перевірка витоків Privacy Vault',
    schedule: 'Щоденно о 03:00',
    line: 'Privacy Vault L5',
    status: 'active',
    lastRun: 'Сьогодні о 03:00',
    nextRun: 'Завтра о 03:00',
  },
  {
    id: 'task-3',
    name: 'Аудит повторюваних запитів FAQ (>88% коефіцієнт)',
    schedule: 'Кожні 6 годин',
    line: 'FAQ Instant Cache',
    status: 'active',
    lastRun: '2 години тому',
    nextRun: 'через 4 години',
  },
];
