/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight,
  Eye,
  LayoutGrid,
} from 'lucide-react';
import { DAG_PRESETS } from '../../data/templates';
import { DagPreset, DagNode } from '../../types/krok';
import { DagD3Visualizer } from './DagD3Visualizer';

interface DagOrchestratorViewProps {
  language: 'ua' | 'en';
}

export const DagOrchestratorView: React.FC<DagOrchestratorViewProps> = ({ language }) => {
  const [selectedPreset, setSelectedPreset] = useState<DagPreset>(DAG_PRESETS[0]);
  const [nodes, setNodes] = useState<DagNode[]>(DAG_PRESETS[0].nodes);
  const [isRunning, setIsRunning] = useState(false);
  const [currentNodeIdx, setCurrentNodeIdx] = useState<number>(-1);
  const [activeOutputNode, setActiveOutputNode] = useState<DagNode | null>(null);
  const [viewMode, setViewMode] = useState<'d3' | 'cards'>('d3');

  const handleSelectPreset = (preset: DagPreset) => {
    setSelectedPreset(preset);
    setNodes(preset.nodes.map(n => ({ ...n, status: 'idle', output: undefined })));
    setCurrentNodeIdx(-1);
    setActiveOutputNode(null);
  };

  const handleRunPipeline = async () => {
    setIsRunning(true);
    const updated = [...nodes];

    // Reset status before run
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'idle';
      updated[i].output = undefined;
      updated[i].critiqueScore = undefined;
    }
    setNodes([...updated]);

    for (let i = 0; i < updated.length; i++) {
      setCurrentNodeIdx(i);
      updated[i].status = 'running';
      setNodes([...updated]);

      // simulate multi-agent step execution
      await new Promise(r => setTimeout(r, 1100));

      let stepOutput = '';
      if (updated[i].agentLine === 'line5_productivity') {
        stepOutput = 'SMART План сформовано: 4 послідовні задачі, визначено залежності та критерії готовності.';
      } else if (updated[i].agentLine === 'line7_recipes') {
        stepOutput = 'Рецептуру розраховано: 350 мл дистильованої води, 100 мл яблучного оцту, 45 мл кастильського мила. Хімічний конфлікт відсутній (Safety: 100%).';
      } else if (updated[i].agentLine === 'line4_factcheck') {
        stepOutput = 'Аудит надійності пройдено: твердження підтверджено джерелами з надійністю 88%. Активовано Folklore Preservation Rule.';
      } else if (updated[i].agentLine === 'line1_web') {
        stepOutput = 'HTML5 SPA згенеровано: пройдено аудит L5 Security Gate. 0 витоків API ключів, готова контрольна сума SHA-256.';
      } else if (updated[i].agentLine === 'line3_scraping') {
        stepOutput = 'Вилучено очищений контент: видалено 4 рекламні банери та 2 трекінгові скрипти. Збережено чистий JSON датасет.';
      } else {
        stepOutput = 'Завдання успішно виконано роєм суб-агентів KROK v10.';
      }

      updated[i].status = 'completed';
      updated[i].output = stepOutput;
      updated[i].critiqueScore = 92 + Math.floor(Math.random() * 6);
      setNodes([...updated]);
    }

    setIsRunning(false);
    setCurrentNodeIdx(-1);
    setActiveOutputNode(updated[updated.length - 1]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CORE MODULE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                DAG Multi-Agent Pipeline Runner • D3.js Visualizer
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {language === 'ua' ? 'Оркестратор спрямованих ациклічних графів (DAG)' : 'DAG Workflow Orchestrator'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'ua'
                ? 'Візуалізація багатоагентного ланцюга на базі D3.js: відслідковуйте реальний стан виконання кожного кроку та переглядайте проміжні артефакти.'
                : 'Interactive D3.js directed acyclic graph visualization: monitor multi-agent execution progress in real-time.'}
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 shrink-0"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Виконання графа...' : 'Запустити DAG Пайплайн'}</span>
          </button>
        </div>
      </div>

      {/* Preset Pipelines */}
      <div className="grid md:grid-cols-2 gap-4">
        {DAG_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              selectedPreset.id === preset.id
                ? 'bg-slate-900 border-emerald-500/60 shadow-xl shadow-emerald-950/20'
                : 'bg-slate-950 border-slate-800 hover:bg-slate-900/60 text-slate-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {preset.nodes.length} Агентів у ланцюгу
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mt-2 mb-1">
                {language === 'ua' ? preset.titleUa : preset.titleEn}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ua' ? preset.descriptionUa : preset.descriptionEn}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Visual Graph Execution Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white">
              {language === 'ua' ? 'Візуалізація структури графа та стану агентів' : 'DAG Pipeline Graph & Live State'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: D3 vs Cards */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode('d3')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'd3'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>D3.js Граф</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'cards'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Картки</span>
              </button>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {nodes.filter(n => n.status === 'completed').length} / {nodes.length} Завершено
            </span>
          </div>
        </div>

        {/* D3.js Visualization Component */}
        {viewMode === 'd3' ? (
          <DagD3Visualizer
            nodes={nodes}
            currentNodeIdx={currentNodeIdx}
            onSelectNode={node => setActiveOutputNode(node)}
            selectedNodeId={activeOutputNode?.id}
            language={language}
          />
        ) : (
          /* Cards Grid View */
          <div className="grid md:grid-cols-4 gap-4">
            {nodes.map((node, idx) => {
              const isCurrent = currentNodeIdx === idx;
              const isCompleted = node.status === 'completed';
              const isSelectedForDetails = activeOutputNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveOutputNode(node)}
                  className={`p-4 rounded-2xl border transition relative flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-500'
                      : isCompleted
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-900 opacity-60'
                  } ${isSelectedForDetails ? 'ring-2 ring-emerald-400' : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                        Етап {idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">{node.label}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{node.inputDescription}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">{node.agentLine}</span>
                    {node.critiqueScore && (
                      <span className="text-emerald-400 font-bold">
                        Оцінка: {node.critiqueScore}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Step Detailed Artifact View */}
        {activeOutputNode && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Артефакт етапу: {activeOutputNode.label}
                </h3>
              </div>
              {activeOutputNode.critiqueScore ? (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Critique Score: {activeOutputNode.critiqueScore}% (Passed)
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400">
                  Статус: {activeOutputNode.status}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850">
              {activeOutputNode.output || 'Очікування виконання етапу в пайплайні...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
