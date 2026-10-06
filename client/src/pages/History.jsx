import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inspectApi } from '../services/api';
import { 
  History as HistoryIcon, Search, Filter, Trash2, Eye, 
  Calendar, CheckCircle, AlertTriangle, XCircle, ArrowUpDown 
} from 'lucide-react';

export const History = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search) params.search = search;

      const res = await inspectApi.getHistory(params);
      setInspections(res.data.inspections || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError('Failed to fetch inspection records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this inspection audit record?')) return;
    try {
      await inspectApi.delete(id);
      setInspections(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete inspection.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-indigo-400" />
            Inspection Audit Logs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Historical ledger of all visual inspections, anomaly classifications, and compliance telemetry.
          </p>
        </div>

        <Link
          to="/inspect/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          New Inspection
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, defect, keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">PASS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Industrial Quality">Industrial Quality</option>
              <option value="Hardware & Assembly">Hardware & Assembly</option>
              <option value="Workplace Safety & PPE">Workplace Safety & PPE</option>
              <option value="Document & Label Verification">Document & Label</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading inspection records...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No matching audit records found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or record a new inspection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 pl-4">Specimen / Title</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Verdict</th>
                  <th className="py-3.5 px-3">Confidence</th>
                  <th className="py-3.5 px-3">Findings Summary</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inspections.map((item) => {
                  const isPass = item.status === 'PASS';
                  const isWarning = item.status === 'WARNING';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 pl-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[11px]">#{item.id}</span>
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{item.category}</td>
                      <td className="py-3.5 px-3">
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
                      <td className="py-3.5 px-3 font-mono text-cyan-400">{item.confidence}%</td>
                      <td className="py-3.5 px-3 text-slate-300 max-w-xs truncate" title={item.summary}>
                        {item.summary}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/inspect/${item.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default History;
