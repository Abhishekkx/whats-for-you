'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, Camera, Sparkles, AlertCircle, ArrowRight, X } from 'lucide-react';
import { SAMPLE_OFFER_LETTER } from '@/lib/sample';
import { redactPII } from '@/lib/redact';

interface UploadZoneProps {
  onAnalyze: (payload: { file?: File; text?: string; isSample?: boolean }) => void;
  isLoading: boolean;
}

export default function UploadZone({ onAnalyze, isLoading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit. Please upload a smaller file or paste the text.');
      return;
    }
    const validExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && !file.type.includes('pdf') && !file.type.includes('image') && !file.type.includes('text')) {
      setErrorMsg('Please upload a PDF document, image scan, or text file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (mode === 'upload') {
      if (!selectedFile) {
        setErrorMsg('Please select or drop an offer letter file first.');
        return;
      }
      onAnalyze({ file: selectedFile });
    } else {
      if (!pastedText.trim() || pastedText.trim().length < 40) {
        setErrorMsg('Please paste the complete offer letter text (at least 40 characters).');
        return;
      }
      onAnalyze({ text: pastedText });
    }
  };

  const handleTrySample = () => {
    setErrorMsg(null);
    onAnalyze({ text: SAMPLE_OFFER_LETTER.rawText, isSample: true });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mode Switcher & Sample Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-paper-border bg-paper-card p-1">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setErrorMsg(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Upload Document (PDF)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('paste');
              setErrorMsg(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'paste'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Paste Letter Text
          </button>
        </div>

        <button
          type="button"
          onClick={handleTrySample}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-ink bg-paper-card hover:bg-paper-hover border border-paper-border hover:border-ink rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-stamp-amber" />
          <span>Try with a Sample Offer</span>
        </button>
      </div>

      {/* Main Upload / Input Box */}
      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-ink bg-paper-hover scale-[1.005]'
              : selectedFile
              ? 'border-stamp-green bg-stamp-greenBg cursor-default'
              : 'border-paper-border hover:border-ink-muted bg-paper-card'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-paper flex items-center justify-center border border-paper-border mb-3">
                <FileText className="w-7 h-7 text-stamp-green" />
              </div>
              <p className="font-serif text-lg font-bold text-ink mb-1">{selectedFile.name}</p>
              <p className="text-xs text-ink-muted mb-4">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for instant audit
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="px-3 py-1 text-xs text-stamp-red hover:underline inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Remove file
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-paper flex items-center justify-center border border-paper-border mb-4 shadow-subtle group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8 text-ink" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink mb-2">
                Drag & Drop your Offer Letter here
              </h3>
              <p className="text-sm text-ink-muted max-w-md mb-6">
                Upload your PDF. We instantly scan 9 hidden trap categories and calculate your real in-hand salary.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 bg-ink text-paper text-sm font-semibold rounded-lg hover:bg-black transition-colors"
                >
                  Browse PDF Files
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-4 py-2.5 bg-paper text-ink text-sm font-semibold border border-paper-border hover:bg-paper-hover rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-ink-muted" />
                  <span>Scan / Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-paper-card border border-paper-border rounded-2xl p-4 sm:p-6">
          <label className="block font-serif font-bold text-lg text-ink mb-2">
            Paste Offer Letter Content
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => {
              setPastedText(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Paste the full text of your offer letter here (including compensation breakup table, bond terms, notice period clauses, etc.)..."
            rows={10}
            className="w-full p-4 bg-paper border border-paper-border rounded-xl font-mono text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
          />
          {pastedText.length > 0 && (
            <div className="flex justify-between items-center mt-2 text-xs text-ink-muted">
              <span>{pastedText.length} characters</span>
              <span>Client-side PII filter will automatically redact names & emails</span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-stamp-redBg border border-stamp-redBorder rounded-lg flex items-center gap-2 text-stamp-red text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Action Trigger */}
      {(selectedFile || (mode === 'paste' && pastedText.trim().length > 0)) && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stamp-red hover:bg-[#A8321E] text-white font-semibold rounded-xl shadow-card hover:shadow-lg transition-all text-base"
          >
            <span>Scan for Hidden Traps & In-Hand Pay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
