import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectApi } from '../services/api';
import WebcamCapture from '../components/WebcamCapture';
import InspectionViewer from '../components/InspectionViewer';
import { 
  Upload, Camera, Sparkles, FileImage, AlertCircle, 
  RotateCcw, CheckCircle2, ChevronRight, Layers, HelpCircle 
} from 'lucide-react';

export const NewInspection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Industrial Quality');
  const [notesHint, setNotesHint] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inspectionResult, setInspectionResult] = useState(null);

  const categories = [
    'Industrial Quality',
    'Hardware & Assembly',
    'Workplace Safety & PPE',
    'Document & Label Verification',
    'General Anomaly Detection'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
    }
    setError('');
  };

  const handleWebcamCapture = (capturedFile) => {
    setShowWebcam(false);
    processFile(capturedFile);
  };

  // One-click sample test images for immediate demonstration
  const handleLoadSample = (sampleType) => {
    // Generate an SVG-based realistic test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (sampleType === 'crack') {
      // Background surface (metallic plate)
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, 0, 640, 480);
      
      // Grid lines
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      for (let i = 0; i < 640; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 480); ctx.stroke();
      }
      for (let j = 0; j < 480; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(640, j); ctx.stroke();
      }

      // Draw surface fracture/crack
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(220, 180);
      ctx.lineTo(260, 240);
      ctx.lineTo(310, 250);
      ctx.lineTo(350, 320);
      ctx.lineTo(390, 310);
      ctx.stroke();

      // Stress mark
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(280, 240, 35, 0, Math.PI * 2);
      ctx.fill();

      // Label on canvas
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('COMPONENT #QC-9042 [DEFECT TEST SPECIMEN]', 20, 40);
    } else {
      // Clean nominal component
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 480);

      // Gold circuitry tracks
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(120, 100, 400, 280);
      ctx.stroke();

      // Component chip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(240, 180, 160, 120);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('MCU-ARM64 NOMINAL', 255, 245);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('CALIBRATED SPECIMEN [ISO-9001 VERIFIED]', 20, 40);
    }

    canvas.toBlob((blob) => {
      const fileName = sampleType === 'crack' ? 'specimen_surface_fracture_defect.jpg' : 'nominal_pcb_assembly_pass.jpg';
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      processFile(file);
      setTitle(sampleType === 'crack' ? 'Metal Surface Fracture Analysis' : 'Nominal Circuit Assembly Verification');
    }, 'image/jpeg');
  };

  const handleStartInspection = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image or capture a webcam photo before analyzing.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title || 'Automated Visual Inspection');
    formData.append('category', category);
    formData.append('notesHint', notesHint);

    try {
      const res = await inspectApi.analyze(formData);
      setInspectionResult(res.data.inspection);
    } catch (err) {
      console.error('Inspection failed:', err);
      setError(err.response?.data?.error || 'Inspection engine encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setTitle('');
    setInspectionResult(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* If result is ready, render the full viewer */}
      {inspectionResult ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Run Another Inspection
            </button>
            <span className="text-xs text-slate-400">
              Audit stored to database • ID #{inspectionResult.id}
            </span>
          </div>

          <InspectionViewer inspection={inspectionResult} onBack={handleReset} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-indigo-400" />
              Automated Visual Inspection Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload an image specimen or activate your live camera feed to detect visual anomalies and defects in real-time.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Sample Specimen Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Quick Specimen Presets:
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleLoadSample('crack')}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-medium transition"
              >
                🔴 Load Defect Specimen (Fracture)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('clean')}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-medium transition"
              >
                🟢 Load Nominal Specimen (PCB Pass)
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <form onSubmit={handleStartInspection} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Image / Camera Intake (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {showWebcam ? (
                <WebcamCapture
                  onCapture={handleWebcamCapture}
                  onClose={() => setShowWebcam(false)}
                />
              ) : previewUrl ? (
                <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl text-center">
                  <div className="relative rounded-xl overflow-hidden bg-black/60 min-h-[340px] max-h-[460px] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Inspection Target Preview"
                      className="w-full h-full object-contain max-h-[440px]"
                    />

                    {/* Animated Scanning Laser when analyzing */}
                    {loading && (
                      <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center">
                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scanner-laser shadow-[0_0_15px_#22d3ee]" />
                        <div className="bg-slate-950/90 border border-indigo-500/40 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-slate-200">
                            Neural Vision Pipeline Analyzing Frame...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{selectedFile?.name || 'Captured specimen'}</span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Clear & Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-all">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Upload Specimen Image</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, BMP, or WebP up to 15MB
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition">
                        <FileImage className="w-4 h-4" />
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowWebcam(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                      >
                        <Camera className="w-4 h-4 text-cyan-400" />
                        Use Live Camera
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Inspection Parameters & Run (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                  Inspection Parameters
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Inspection Specimen Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PCB Component Lot #482"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Inspection Domain / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Specific Focus or Tolerance Hint (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notesHint}
                    onChange={(e) => setNotesHint(e.target.value)}
                    placeholder="e.g. Check for micro-cracks near mounting holes or missing IC pins..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Visual Patterns...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Execute AI Visual Inspection
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NewInspection;
