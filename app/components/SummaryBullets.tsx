'use client';

import React from 'react';
import { FileCheck, Sparkles } from 'lucide-react';

interface SummaryBulletsProps {
  bullets: string[];
}

export default function SummaryBullets({ bullets }: SummaryBulletsProps) {
  if (!bullets || bullets.length === 0) return null;

  return (
    <div className="bg-paper-card border border-paper-border rounded-2xl p-6 sm:p-7 shadow-card">
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-paper-border">
        <FileCheck className="w-5 h-5 text-ink" />
        <h3 className="font-serif text-xl font-bold text-ink">What You're Actually Signing</h3>
      </div>

      <div className="space-y-3">
        {bullets.slice(0, 5).map((bullet, idx) => (
          <div key={idx} className="flex items-start gap-3 text-ink text-sm sm:text-base leading-relaxed">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-paper border border-paper-border flex items-center justify-center font-mono text-xs font-bold text-ink-muted">
              {idx + 1}
            </span>
            <p className="flex-1 font-serif text-ink">{bullet}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-paper-border/60 text-xs text-ink-muted flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-stamp-amber flex-shrink-0" />
        <span>Plain-English distillation based on your offer letter clauses.</span>
      </div>
    </div>
  );
}
