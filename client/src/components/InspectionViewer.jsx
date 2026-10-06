import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck, 
  Cpu, Target, ListChecks, ArrowRight, Download, Share2, Sparkles 
} from 'lucide-react';

export const InspectionViewer = ({ inspection, onBack }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!inspection) return null;

  const isPass = inspection.status === 'PASS';
  const isWarning = inspection.status === 'WARNING';
  const isFail = inspection.status === 'FAIL';

  const statusConfig = {
    PASS: {
      color: 'emerald',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      label: 'PASSED INSPECTION',
      sub: 'Nominal Quality Confirmed'
    },
    WARNING: {
      color: 'amber',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
      label: 'WARNING / ANOMALY',
      sub: 'Requires Secondary Review'
    },
    FAIL: {
      color: 'rose',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: XCircle,
      label: 'CRITICAL DEFECT DETECTED',
      sub: 'Action Required Immediately'
    }
  };

  const currentStatus = statusConfig[inspection.status] || statusConfig.PASS;
  const StatusIcon = currentStatus.icon;

  const detectedItems = inspection.detected_items || [];
  const recommendations = inspection.recommendations || inspection.actionable_recommendations || [];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inspection, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `qualisight-audit-${inspection.id || 'report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className={`p-6 rounded-2xl border ${currentStatus.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${currentStatus.badge}`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">{currentStatus.label}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${currentStatus.badge}`}>
                {inspection.status}
              </span>
            </div>
            <p className="text-sm opacity-90 mt-0.5">{currentStatus.sub} • Category: <span className="font-semibold text-white">{inspection.category}</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <Share2 className="w-4 h-4" />
            Print Audit Report
          </button>
        </div>
      </div>

      {/* Grid: Visual Viewport (Left) vs Intelligence Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image with Bounding Overlays (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Visual Inspection Viewport
              </span>
              <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">
                Confidence: {inspection.confidence}%
              </span>
            </div>

            {/* Container for Image & Dynamic Bounding Boxes */}
            <div className="relative rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center min-h-[360px] max-h-[550px]">
              <img
                src={inspection.image_url}
                alt="Inspected Object"
                className="w-full h-full object-contain max-h-[520px]"
              />

              {/* Render Bounding Boxes */}
              {detectedItems.map((item, idx) => {
                if (!item.box_2d || item.box_2d.length !== 4) return null;
                const [ymin, xmin, ymax, xmax] = item.box_2d;
                // Coordinates normalized 0-1000 to percentages
                const top = (ymin / 10).toFixed(1) + '%';
                const left = (xmin / 10).toFixed(1) + '%';
                const width = ((xmax - xmin) / 10).toFixed(1) + '%';
                const height = ((ymax - ymin) / 10).toFixed(1) + '%';

                const isCrit = item.severity === 'CRITICAL' || item.severity === 'HIGH';
                const isSelected = selectedItem === idx;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(idx)}
                    style={{ top, left, width, height }}
                    className={`absolute cursor-pointer border-2 transition-all rounded-md ${
                      isCrit
                        ? isSelected ? 'border-rose-400 bg-rose-500/30 ring-4 ring-rose-500/40' : 'border-rose-500/80 bg-rose-500/15'
                        : isSelected ? 'border-amber-400 bg-amber-500/30 ring-4 ring-amber-500/40' : 'border-amber-500/80 bg-amber-500/15'
                    }`}
                  >
                    <span className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow ${
                      isCrit ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      #{idx + 1} {item.label} ({item.confidence}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>{inspection.title}</span>
              <span className="text-[11px] font-mono">ID: #{inspection.id || 'TEMP'}</span>
            </div>
          </div>

          {/* Engine Signature & Compliance Badge */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Vision Model: <strong className="text-slate-200">{inspection.poweredBy || 'Google Gemini 2.5 Flash'}</strong></span>
            </div>
            {inspection.demoMode && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo Mode Active
              </span>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights, Metrics & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Key Metrics Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Inspection Telemetry
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Quality Score</span>
                <p className={`text-xl font-bold mt-1 ${
                  (inspection.metrics?.qualityScore ?? 90) > 80 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {inspection.metrics?.qualityScore ?? (isPass ? 98 : 55)}/100
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Anomalies</span>
                <p className={`text-xl font-bold mt-1 ${isPass ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {inspection.metrics?.defectCount ?? detectedItems.length}
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Confidence</span>
                <p className="text-xl font-bold mt-1 text-cyan-400">
                  {inspection.confidence}%
                </p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-indigo-400 mb-1">Visual Intelligence Assessment:</p>
              <p>{inspection.summary}</p>
            </div>
          </div>

          {/* Detected Anomaly Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Detected Visual Patterns ({detectedItems.length})
              </span>
              <span className="text-[10px] text-slate-400">Click item to highlight</span>
            </h3>

            {detectedItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No individual anomaly patterns isolated.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {detectedItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedItem(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedItem === idx
                        ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        #{idx + 1} {item.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.severity === 'CRITICAL' || item.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    {item.notes && <p className="text-slate-400 mt-1 text-[11px]">{item.notes}</p>}
                    {item.location && <p className="text-[10px] text-slate-500 mt-0.5">Location: {item.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              Actionable Recommendations
            </h3>

            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-400">Standard operating procedure applies.</p>
            ) : (
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionViewer;
