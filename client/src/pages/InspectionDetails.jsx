import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { inspectApi } from '../services/api';
import InspectionViewer from '../components/InspectionViewer';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';

export const InspectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const res = await inspectApi.getById(id);
        setInspection(res.data.inspection);
      } catch (err) {
        console.error('Fetch inspection error:', err);
        setError('Inspection report not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this inspection audit?')) return;
    try {
      await inspectApi.delete(id);
      navigate('/history');
    } catch {
      alert('Failed to delete report.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading inspection audit details...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <Link
            to="/history"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            Back to Audit History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button & control bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-medium transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Audit
        </button>
      </div>

      <InspectionViewer inspection={inspection} />
    </div>
  );
};

export default InspectionDetails;
