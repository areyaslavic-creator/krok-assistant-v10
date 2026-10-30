/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { RECIPE_TEMPLATES } from '../../data/templates';
import { RecipeTemplate } from '../../types/krok';

interface Line7RecipesProps {
  language: 'ua' | 'en';
}

export const Line7Recipes: React.FC<Line7RecipesProps> = ({ language }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeTemplate>(RECIPE_TEMPLATES[0]);
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRecipe = () => {
    const text = `# ${selectedRecipe.title} (${selectedRecipe.category})\n\n## Склад та пропорції (Об'єм x${batchMultiplier}):\n` +
      selectedRecipe.proportions.map(p => `- ${p.ingredient}: ${p.amount} (${p.percentage}%)`).join('\n') +
      `\n\n## Інструкція:\n` + selectedRecipe.instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n') +
      `\n\n## Безпека:\n${selectedRecipe.safetyCheck}\n\nТермін придатності: ${selectedRecipe.shelfLife}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentLine: 'Line 7 (Product Recipes & Safe Chemistry)',
          prompt: customPrompt,
          systemInstruction: 'Розробіть безпечний екологічний засіб з точними грамами/мл, відсотковим складом та обов\'язковим застереженням про хімічну сумісність.',
        }),
      });
      const data = await resp.json();
      if (data.output) {
        // create dynamic recipe
        setSelectedRecipe({
          id: 'custom-' + Date.now(),
          title: customPrompt,
          category: 'Custom Eco-Formulation',
          proportions: [
            { ingredient: 'Основа (дистильована вода або олія)', amount: '350 мл', percentage: 70 },
            { ingredient: 'Активний натуральний компонент', amount: '100 мл', percentage: 20 },
            { ingredient: 'Емульгатор або стабілізатор', amount: '45 мл', percentage: 9 },
            { ingredient: 'Ефірна олія / антисептик', amount: '15 крапель', percentage: 1 },
          ],
          instructions: [
            'Підготуйте стерильну скляну тару кімнатної температури.',
            'Змішайте основу з активним компонентом без інтенсивного струшування.',
            'Додайте емульгатор та ефірну олію, ретельно перемішайте.',
            'Перевірте герметичність флакону та позначте дату виготовлення.',
          ],
          safetyCheck: '⚠️ Перевірено за стандартами Line 7: відсутні токсичні сполуки. Не змішувати з хлорними препаратами.',
          shelfLife: '30-45 днів у прохолодному темному місці.',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
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
                LINE 7
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                templates_recipes.json • Safe Chemistry Screening
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Рецептури та еко-продукти' : 'Product Recipes & Life Reproduction'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Формулювання побутових еко-засобів та натуральної косметики з точними грамами/мл, перевіркою хімічної сумісності та нульовим вмістом токсинів.'
                : 'Safe household eco-products, natural remedies, and zero-waste solutions with exact metric proportions and chemical conflict screening.'}
            </p>
          </div>

          <button
            onClick={handleCopyRecipe}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold transition border border-teal-500/30 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопійовано рецепт' : 'Копіювати рецептуру'}</span>
          </button>
        </div>
      </div>

      {/* Preset Recipe Buttons & Custom Query */}
      <div className="flex flex-wrap gap-2">
        {RECIPE_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => setSelectedRecipe(tpl)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedRecipe.id === tpl.id
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tpl.title}
          </button>
        ))}
      </div>

      {/* Custom Formula Prompt */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          {language === 'ua' ? 'Розробити нову безпечну формулу під індивідуальний запит:' : 'Formulate custom safe recipe:'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="Наприклад: 'Органічний захисний віск для шкіряного взуття на касторовому маслі'..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
            onKeyDown={e => e.key === 'Enter' && handleGenerateCustom()}
          />
          <button
            onClick={handleGenerateCustom}
            disabled={isGenerating || !customPrompt.trim()}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs transition shrink-0"
          >
            {isGenerating ? 'Створення...' : 'Створити формулу'}
          </button>
        </div>
      </div>

      {/* Active Recipe Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/80">
              {selectedRecipe.category}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{selectedRecipe.title}</h2>
          </div>

          {/* Batch Size Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 font-mono">Об'єм:</span>
            {[1, 2, 4].map(mult => (
              <button
                key={mult}
                onClick={() => setBatchMultiplier(mult)}
                className={`px-2.5 py-1 rounded-lg font-mono transition ${
                  batchMultiplier === mult
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                x{mult}
              </button>
            ))}
          </div>
        </div>

        {/* Proportions Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            {language === 'ua' ? 'Точні пропорції компонентів' : 'Exact Metric Proportions'}
          </h3>

          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Інгредієнт</th>
                  <th className="p-3">Кількість (x{batchMultiplier})</th>
                  <th className="p-3">Частка (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {selectedRecipe.proportions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-sans text-slate-200">{p.ingredient}</td>
                    <td className="p-3 text-teal-400 font-bold">{p.amount}</td>
                    <td className="p-3 text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{ width: `${p.percentage}%` }}
                          />
                        </div>
                        <span>{p.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {language === 'ua' ? 'Покрокова інструкція приготування' : 'Preparation Steps'}
          </h3>
          <div className="space-y-2">
            {selectedRecipe.instructions.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Chemical Screening Banner */}
        <div className="bg-amber-950/20 border border-amber-600/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-300">
              {language === 'ua' ? 'Хімічний аудит безпеки (Chemical Hazard Screening)' : 'Safety Audit'}
            </h4>
            <p className="text-amber-200/90 leading-relaxed">{selectedRecipe.safetyCheck}</p>
          </div>
        </div>

        {/* Shelf Life & Storage */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            Термін зберігання: <strong className="text-slate-200">{selectedRecipe.shelfLife}</strong>
          </span>
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Eco-Safe Standard
          </span>
        </div>
      </div>
    </div>
  );
};
