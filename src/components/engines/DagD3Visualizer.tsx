/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DagNode } from '../../types/krok';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Play, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface DagD3VisualizerProps {
  nodes: DagNode[];
  currentNodeIdx: number;
  onSelectNode: (node: DagNode) => void;
  selectedNodeId?: string;
  language: 'ua' | 'en';
  onRunPipeline?: () => void;
  isRunning?: boolean;
}

interface D3NodeData extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  agentLine: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  critiqueScore?: number;
  inputDescription?: string;
  output?: string;
  dependencies: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3LinkData extends d3.SimulationLinkDatum<D3NodeData> {
  source: string | D3NodeData;
  target: string | D3NodeData;
  isActive: boolean;
  isCompleted: boolean;
}

const LINE_COLOR_MAP: Record<string, { bg: string; border: string; glow: string; text: string; num: string }> = {
  line1_web: { bg: '#064e3b', border: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#34d399', num: 'L1' },
  line2_prompts: { bg: '#312e81', border: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', text: '#818cf8', num: 'L2' },
  line3_scraping: { bg: '#0c4a6e', border: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.4)', text: '#38bdf8', num: 'L3' },
  line4_factcheck: { bg: '#78350f', border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', num: 'L4' },
  line5_productivity: { bg: '#881337', border: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: '#fb7185', num: 'L5' },
  line6_automation: { bg: '#581c87', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#c084fc', num: 'L6' },
  line7_recipes: { bg: '#134e4a', border: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', text: '#2dd4bf', num: 'L7' },
  critique_agent: { bg: '#4c1d95', border: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', text: '#a78bfa', num: 'CR' },
  l5_security_gate: { bg: '#14532d', border: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: '#4ade80', num: 'SG' },
};

export const DagD3Visualizer: React.FC<DagD3VisualizerProps> = ({
  nodes,
  currentNodeIdx,
  onSelectNode,
  selectedNodeId,
  language,
  onRunPipeline,
  isRunning = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth || 920;
    const height = 440;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions for markers and filters
    const defs = svg.append('defs');

    // Arrow markers
    const createMarker = (id: string, color: string) => {
      defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 30)
        .attr('refY', 0)
        .attr('markerWidth', 7)
        .attr('markerHeight', 7)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    };

    createMarker('arrow-idle', '#334155');
    createMarker('arrow-running', '#38bdf8');
    createMarker('arrow-completed', '#10b981');
    createMarker('arrow-accent', '#A83249');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'd3-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background subtle grid pattern
    const pattern = defs.append('pattern')
      .attr('id', 'd3-grid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 1)
      .attr('fill', 'rgba(255, 255, 255, 0.08)');

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#d3-grid)');

    // Zoom container
    const g = svg.append('g').attr('class', 'dag-main-group');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);

    // Build DAG Graph data
    // Layout nodes horizontally in logical topological order or layered hierarchy
    const nodeCount = nodes.length;
    const paddingX = 80;
    const availableWidth = Math.max(width - paddingX * 2, 700);
    const stepX = nodeCount > 1 ? availableWidth / (nodeCount - 1) : availableWidth / 2;
    const centerY = height / 2;

    const d3Nodes: D3NodeData[] = nodes.map((node, i) => {
      // Alternate Y coordinates for organic DAG feel
      const wave = nodeCount > 2 ? Math.sin((i / (nodeCount - 1)) * Math.PI) * 70 : 0;
      const stagger = i % 2 === 1 ? 35 : -35;
      return {
        id: node.id,
        label: node.label,
        agentLine: node.agentLine,
        status: node.status,
        critiqueScore: node.critiqueScore,
        inputDescription: node.inputDescription,
        output: node.output,
        dependencies: node.dependencies || [],
        x: paddingX + i * stepX,
        y: centerY + stagger + (i === 0 || i === nodeCount - 1 ? 0 : wave * 0.4),
      };
    });

    // Build Links from node dependencies or linear chain
    const links: D3LinkData[] = [];
    d3Nodes.forEach((node) => {
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach((depId) => {
          const sourceNode = d3Nodes.find((n) => n.id === depId);
          if (sourceNode) {
            const isCompleted = sourceNode.status === 'completed' && (node.status === 'completed' || node.status === 'running');
            const isActive = sourceNode.status === 'running' || (sourceNode.status === 'completed' && node.status === 'running');
            links.push({
              source: sourceNode,
              target: node,
              isActive,
              isCompleted,
            });
          }
        });
      }
    });

    // Fallback: If no dependencies are explicitly declared, link in linear chain
    if (links.length === 0 && d3Nodes.length > 1) {
      for (let i = 0; i < d3Nodes.length - 1; i++) {
        const sourceNode = d3Nodes[i];
        const targetNode = d3Nodes[i + 1];
        const isCompleted = sourceNode.status === 'completed' && (targetNode.status === 'completed' || targetNode.status === 'running');
        const isActive = sourceNode.status === 'running' || (sourceNode.status === 'completed' && targetNode.status === 'running');
        links.push({
          source: sourceNode,
          target: targetNode,
          isActive,
          isCompleted,
        });
      }
    }

    // Force simulation for slight organic elasticity and drag support
    const simulation = d3.forceSimulation<D3NodeData>(d3Nodes)
      .force('link', d3.forceLink<D3NodeData, D3LinkData>(links).id(d => d.id).distance(120).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('collision', d3.forceCollide().radius(48))
      .alphaDecay(0.08);

    // Render Links Group
    const linkGroup = g.append('g').attr('class', 'links');

    const linkPaths = linkGroup.selectAll<SVGPathElement, D3LinkData>('path')
      .data(links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.isCompleted) return '#10b981';
        if (d.isActive) return '#38bdf8';
        return '#334155';
      })
      .attr('stroke-width', (d) => (d.isActive || d.isCompleted ? 2.5 : 1.5))
      .attr('stroke-dasharray', (d) => (d.isActive ? '6,4' : 'none'))
      .attr('marker-end', (d) => {
        if (d.isCompleted) return 'url(#arrow-completed)';
        if (d.isActive) return 'url(#arrow-running)';
        return 'url(#arrow-idle)';
      });

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup.selectAll<SVGGElement, D3NodeData>('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const matched = nodes.find(n => n.id === d.id);
        if (matched) onSelectNode(matched);
      });

    // Drag behavior for nodes
    const drag = d3.drag<SVGGElement, D3NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    // Draw Node Visuals
    nodeElements.each(function(d) {
      const el = d3.select(this);
      const isSelected = selectedNodeId === d.id;
      const isRunning = d.status === 'running';
      const isCompleted = d.status === 'completed';
      const meta = LINE_COLOR_MAP[d.agentLine] || { bg: '#0f172a', border: '#475569', glow: 'rgba(71, 85, 105, 0.4)', text: '#94a3b8', num: 'AG' };

      // Outer animated pulse ring when running
      if (isRunning) {
        el.append('circle')
          .attr('r', 32)
          .attr('fill', 'none')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '26;40;26')
          .attr('dur', '1.5s')
          .attr('repeatCount', 'indefinite');

        el.append('circle')
          .attr('r', 28)
          .attr('fill', '#0284c7')
          .attr('opacity', 0.2);
      }

      // Selection indicator halo
      if (isSelected) {
        el.append('circle')
          .attr('r', 28)
          .attr('fill', 'none')
          .attr('stroke', '#34d399')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '4,2')
          .attr('filter', 'url(#d3-glow)');
      }

      // Main Node Circle
      const nodeFill = isCompleted ? '#064e3b' : isRunning ? '#0c4a6e' : meta.bg;
      const nodeStroke = isCompleted ? '#10b981' : isRunning ? '#38bdf8' : meta.border;

      el.append('circle')
        .attr('r', 22)
        .attr('fill', nodeFill)
        .attr('stroke', nodeStroke)
        .attr('stroke-width', isSelected || isCompleted || isRunning ? 2.5 : 1.5)
        .attr('filter', isCompleted || isRunning ? 'url(#d3-glow)' : 'none');

      // Line Number / Badge Text
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', isCompleted ? '#6ee7b7' : isRunning ? '#7dd3fc' : '#ffffff')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(meta.num);

      // Status Indicator Dot (top-right)
      const dotColor = isCompleted ? '#10b981' : isRunning ? '#38bdf8' : '#64748b';
      el.append('circle')
        .attr('cx', 15)
        .attr('cy', -15)
        .attr('r', 4.5)
        .attr('fill', dotColor)
        .attr('stroke', '#0e1217')
        .attr('stroke-width', 1.5);

      // Node Label Text (below)
      const labelText = d.label.length > 20 ? d.label.slice(0, 18) + '...' : d.label;
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 36)
        .attr('fill', isSelected ? '#ffffff' : '#cbd5e1')
        .attr('font-size', '11px')
        .attr('font-weight', isSelected ? '700' : '500')
        .attr('font-family', 'sans-serif')
        .text(labelText);

      // Critique Score Badge (if completed & available)
      if (d.critiqueScore !== undefined) {
        const badgeGroup = el.append('g').attr('transform', 'translate(0, -28)');
        badgeGroup.append('rect')
          .attr('x', -24)
          .attr('y', -7)
          .attr('width', 48)
          .attr('height', 14)
          .attr('rx', 7)
          .attr('fill', '#064e3b')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1);

        badgeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '3')
          .attr('fill', '#6ee7b7')
          .attr('font-size', '9px')
          .attr('font-mono', 'true')
          .attr('font-weight', 'bold')
          .text(`${d.critiqueScore}/100`);
      }
    });

    // Update positions on simulation tick with smooth bezier paths
    simulation.on('tick', () => {
      linkPaths.attr('d', (d) => {
        const source = d.source as D3NodeData;
        const target = d.target as D3NodeData;
        const sx = source.x || 0;
        const sy = source.y || 0;
        const tx = target.x || 0;
        const ty = target.y || 0;
        const dx = tx - sx;
        const cx1 = sx + dx * 0.5;
        const cy1 = sy;
        const cx2 = sx + dx * 0.5;
        const cy2 = ty;
        return `M${sx},${sy} C${cx1},${cy1} ${cx2},${cy2} ${tx},${ty}`;
      });

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Marching dash animation for active links
    let dashOffset = 0;
    const animTimer = d3.timer(() => {
      dashOffset -= 1;
      linkGroup.selectAll<SVGPathElement, D3LinkData>('path')
        .filter(d => d.isActive)
        .attr('stroke-dashoffset', dashOffset);
    });

    return () => {
      animTimer.stop();
      simulation.stop();
    };
  }, [nodes, currentNodeIdx, selectedNodeId, language]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#0e1217] border border-[#262b33] overflow-hidden shadow-2xl flex flex-col">
      {/* Top D3 Toolbar */}
      <div className="p-3 bg-[#14171d] border-b border-[#262b33] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-xs sm:text-sm">
              {language === 'ua' ? 'D3 Граф Оркестратора Рою (7 Ліній)' : 'DAG Orchestrator D3 Graph (7 Lines)'}
            </span>
            <span className="ml-2 text-[10px] font-mono text-slate-400">
              {nodes.length} {language === 'ua' ? 'вузлів' : 'nodes'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {onRunPipeline && (
            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? (language === 'ua' ? 'Виконується...' : 'Running...') : (language === 'ua' ? 'Запустити конвеєр' : 'Run Pipeline')}</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-[#1a1f26] border border-[#262b33] p-0.5 rounded-lg">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-[#252b36] text-slate-300 hover:text-white rounded transition"
              title="Наблизити"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-[#252b36] text-slate-300 hover:text-white rounded transition"
              title="Віддалити"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-[#252b36] text-slate-300 hover:text-white rounded transition"
              title="Скинути масштаб"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* D3 SVG Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[360px] sm:h-[420px] bg-[#0a0d12]">
        <svg ref={svgRef} className="w-full h-full select-none" />

        {/* Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#14171d]/90 backdrop-blur-md border border-[#262b33] p-2 rounded-xl text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Завершено</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Активний (Running)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>Очікує (Idle)</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">| Drag/Zoom активні</span>
        </div>
      </div>
    </div>
  );
};
