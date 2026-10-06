import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, inspectApi } from '../services/api';
import MetricCard from '../components/MetricCard';
import { 
  Scan, CheckCircle, AlertTriangle, XCircle, Sparkles, 
  ArrowRight, ShieldCheck, Activity, PlusCircle, History, Clock 
} from 'lucide-react';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getSummary();
      setMetrics(res.data.metrics);
      setRecentInspections(res.data.recentInspections || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Unable to load latest metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome & Quick Launch */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                ACTIVE AI INFERENCE READY
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Visual Intelligence Command
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Automated computer vision pipeline for real-time defect isolation, 
              structural integrity verification, and actionable remediation insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/inspect/new"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition"
            >
              <PlusCircle className="w-5 h-5" />
              New Visual Inspection
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <History className="w-4 h-4 text-slate-400" />
              Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Scans"
          value={metrics?.total ?? 0}
          subtitle="All recorded visual audits"
          icon={Scan}
          color="indigo"
          badge="Live"
        />
        <MetricCard
          title="Nominal Pass Rate"
          value={`${metrics?.passRate ?? 100}%`}
          subtitle={`${metrics?.passCount ?? 0} components approved`}
          icon={CheckCircle}
          color="emerald"
          badge="Quality"
        />
        <MetricCard
          title="Warning Flags"
          value={metrics?.warningCount ?? 0}
          subtitle="Minor tolerance deviations"
          icon={AlertTriangle}
          color="amber"
          badge="Audit"
        />
        <MetricCard
          title="Critical Anomalies"
          value={metrics?.failCount ?? 0}
          subtitle="Defects requiring remediation"
          icon={XCircle}
          color="rose"
          badge="High Priority"
        />
      </div>

      {/* Recent Inspections & Activity Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Recent Inspection Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest visual scans submitted to the AI analysis engine</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            View all logs
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
            <Scan className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-300">No inspections recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start by uploading an image or capturing a frame using your live camera feed.
            </p>
            <Link
              to="/inspect/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Run First Inspection
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 pl-2">Inspection ID & Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentInspections.map((item) => {
                  const isPass = item.status === 'PASS';
                  const isWarning = item.status === 'WARNING';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 pl-2 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[11px]">#{item.id}</span>
                          <span className="font-semibold">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">{item.category}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isPass
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-cyan-400">{item.confidence}%</td>
                      <td className="py-3.5 text-slate-400 flex items-center gap-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <Link
                          to={`/inspect/${item.id}`}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold hover:text-indigo-300 transition"
                        >
                          View Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
