import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';

export const WebcamCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // or 'environment'
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera permissions in your browser or upload an image file.');
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-auto">
        <span className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          LIVE CAMERA FEED
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-700 transition"
            title="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-950/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded-full border border-slate-700 transition"
            title="Close Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-rose-400 max-w-sm">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Grid Overlay */}
            <div className="absolute inset-8 pointer-events-none border-2 border-indigo-400/40 rounded-xl flex flex-col justify-between p-3">
              <div className="flex justify-between text-indigo-400 text-[10px] font-mono tracking-widest uppercase">
                <span>[RETICLE_LOCK]</span>
                <span>FOV: 85°</span>
              </div>
              <div className="w-8 h-8 self-center border border-indigo-400/50 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </div>
              <div className="flex justify-between text-indigo-400 text-[10px] font-mono">
                <span>ALIGN TARGET COMPONENT</span>
                <span>AI_READY</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer trigger button */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-center">
        <button
          type="button"
          onClick={handleCapture}
          disabled={!isStreaming}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          Capture Frame & Run AI Audit
        </button>
      </div>
    </div>
  );
};

export default WebcamCapture;
