# KROK Assistant v10.0 — Ultimate Autonomous Swarm Engine 🚀

> **Повнофункціональна мультиагентна платформа штучного інтелекту з 7 спеціалізованими лініями, локальною базою знань RAG, DAG-оркестратором, L5 Security Gate та контуром саморефлексії Critique Agent.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Mode: Offline-First](https://img.shields.io/badge/Mode-Offline--First_Zero--Cost-emerald.svg)]()
[![Security: L5 Gate](https://img.shields.io/badge/Security-L5_Gate_Audited-green.svg)]()

---

## 📌 Що таке KROK Assistant?
**KROK Assistant v10.0** — це автономний локальний цифровий асистент та рушій рою агентів (Swarm Engine), створений для людей без навичок програмування, інженерів, дослідників та крафтових виробників.

### 🌟 7 Спеціалізованих Ліній Агентів:
1. **Line 1 (Web Development & GitHub Publishing):** Генерація SPA, HTML5/Tailwind блоків, живий пісочник та публікація у власний репозиторій на GitHub Pages під захистом L5 Security Gate.
2. **Line 2 (Agent & Prompt Engineering):** Генеральний системний промпт, поведінкові архетипи (SEO, QA, Юридичний, Фольклор), оптимізація системних інструкцій.
3. **Line 3 (Internet Interaction & Smart Scraping):** Очищення веб-контенту від реклами, скриптів і банерів; структурування у чистий JSON та CSV.
4. **Line 4 (Market Analytics & Fact Checking):** Алгоритм `credibility_engine.py` (поріг 25%) для фільтрації дезінформації та збереження усної народної творчості за правилом *Folklore Preservation Rule*.
5. **Line 5 (Personal Productivity & Assistant):** Декомпозиція цілей у SMART кроки з розрахунком таймлайнів та критеріїв готовності.
6. **Line 6 (AI Automation & Integrations):** Створення готових JSON-блюпринтів для n8n, Make, SendPulse та Telegram вебхуків.
7. **Line 7 (Product Recipes & Safe Chemistry):** Еко-рецептури побутової хімії та косметики з точними відсотками і правилами безпеки (заборона реакції кислот з хлором).

---

## 🛡️ Модулі Ядра KROK v10.0:
- **DAG Pipeline Orchestrator (з D3.js графом):** інтерактивна візуалізація послідовності передачі даних між агентами.
- **Critique Agent (Контур саморефлексії):** автоматична оцінка рішень за шкалою 0-100% та ітеративне доопрацювання (до 3 спроб).
- **Local RAG Knowledge Engine & File Manager:** семантичне розбиття документів на чанки (~280 символів) та локальний семантичний пошук у SQLite.
- **L5 Security Gate & Privacy Vault:** локальний скан витоків ключів, CSP політики та обчислення контрольних сум SHA-256.
- **FAQ Instant Cache (>88% схожості):** миттєві відповіді на часті запитання за 0.8 мс без виклику LLM (нульова вартість).
- **Справжній мікрофон (Web Speech & Whisper Voice):** пряме голосове введення з розпізнаванням української та англійської мов.

---

## 🚀 Швидкий запуск

### 1. Встановлення залежностей:
\`\`\`bash
npm install
\`\`\`

### 2. Запуск у режимі розробки:
\`\`\`bash
npm run dev
\`\`\`
Відкрийте у браузері: `http://localhost:3000`

### 3. Локальний LLM рушій (Ollama):
\`\`\`bash
# Встановіть Ollama з https://ollama.com
ollama run llama3
\`\`\`
У налаштуваннях KROK оберіть режим `Ollama (Local)` за адресою `http://localhost:11434`.

---

## 🔒 L5 Security Protocol
Система KROK Assistant працює локально та ніколи не надсилає ваші приватні ключі чи аудіозаписи у відкриті хмари без вашого явного підтвердження.
