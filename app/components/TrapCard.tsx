'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertOctagon, HelpCircle, Quote } from 'lucide-react';
import { DetectedTrap, TrapSeverity } from '@/lib/traps';

interface TrapCardProps {
  trap: DetectedTrap;
  index: number;
}

export default function TrapCard({ trap, index }: TrapCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(trap.askHr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: TrapSeverity) => {
    switch (severity) {
      case 'scam':
        return {
          label: 'CRITICAL SCAM WARNING',
          classes: 'border-stamp-red bg-stamp-redBg text-stamp-red font-black',
        };
      case 'high':
        return {
          label: 'HIGH RISK CLAUSE',
          classes: 'border-stamp-red bg-stamp-redBg text-stamp-red font-bold',
        };
      case 'medium':
        return {
          label: 'MODERATE RISK',
          classes: 'border-stamp-amber bg-stamp-amberBg text-stamp-amber font-bold',
        };
      case 'low':
      default:
        return {
          label: 'LOW / ADVISORY',
          classes: 'border-stone-400 bg-stone-100 text-ink-muted font-medium',
        };
    }
  };

  const badge = getSeverityBadge(trap.severity);

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        trap.severity === 'scam'
          ? 'border-stamp-red bg-stamp-redBg shadow-md'
          : trap.severity === 'high'
          ? 'border-paper-border hover:border-stamp-red bg-paper-card'
          : 'border-paper-border bg-paper-card'
      }`}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
          {/* Rubber Stamp Tag */}
          <span
            className={`inline-block px-2.5 py-0.5 border text-xs tracking-wider uppercase rounded font-mono ${badge.classes} -rotate-0.5`}
          >
            {badge.label}
          </span>

          <h4 className="font-serif font-bold text-base sm:text-lg text-ink">
            {trap.name}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {trap.points > 0 && (
            <span className="font-mono text-xs font-semibold text-stamp-red bg-paper px-2 py-1 rounded border border-paper-border">
              −{trap.points} pts
            </span>
          )}
          <button
            type="button"
            aria-label="Toggle details"
            className="p-1 text-ink-muted hover:text-ink rounded"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-paper-border space-y-4">
          {/* Quoted Line from Offer Letter */}
          {trap.quote && (
            <div className="p-3.5 bg-paper rounded-lg border border-paper-border">
              <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-ink-muted mb-1.5">
                <Quote className="w-3.5 h-3.5 text-stamp-red" />
                <span>Found in your offer letter:</span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-ink leading-relaxed bg-paper-hover p-2 rounded border border-paper-border/60">
                "{trap.quote}"
              </p>
            </div>
          )}

          {/* Plain English Explainer */}
          <div>
            <div className="text-xs uppercase font-semibold text-ink-muted mb-1">
              What this actually means:
            </div>
            <p className="text-sm text-ink leading-relaxed">
              {trap.explainer}
            </p>
          </div>

          {/* Ask HR Action Box */}
          <div className="p-3 bg-paper-hover rounded-lg border border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase text-ink-muted flex items-center gap-1 mb-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-stamp-amber" />
                Ask HR this question:
              </span>
              <p className="text-xs sm:text-sm font-medium text-ink italic">
                "{trap.askHr}"
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyQuestion}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-white text-ink text-xs font-semibold rounded border border-paper-border shadow-xs transition-all flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stamp-green" />
                  <span className="text-stamp-green">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Copy Question</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
