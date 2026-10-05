'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, FileSearch, ShieldAlert, Calculator, FileText } from 'lucide-react';

interface AnalyzingStepsProps {
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, text: 'Reading your letter & masking personal info…', icon: FileSearch, delay: 600 },
  { id: 2, text: 'Checking 9 trap patterns (bonds, notice, probation)…', icon: ShieldAlert, delay: 1400 },
  { id: 3, text: 'Computing real in-hand salary (FY 26-27 regime)…', icon: Calculator, delay: 2200 },
  { id: 4, text: 'Writing your plain-English summary & HR questions…', icon: FileText, delay: 3000 },
];

export default function AnalyzingSteps({ onComplete }: AnalyzingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    STEPS.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setCurrentStep(idx);
      }, step.delay);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 bg-paper-card border border-paper-border rounded-xl shadow-card animate-pulse-slow">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-paper-border">
        <Loader2 className="w-5 h-5 animate-spin text-stamp-red" />
        <h3 className="font-serif text-xl font-bold text-ink">Analyzing Your Offer Letter...</h3>
      </div>

      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? 'text-stamp-green font-medium'
                  : isCurrent
                  ? 'text-ink font-semibold scale-[1.01]'
                  : 'text-ink-faint'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-stamp-green flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-ink animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-paper-border flex-shrink-0" />
              )}
              <span className="flex-1">{step.text}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-ink-muted">
        Evaluating clauses against Indian labor standard benchmarks...
      </p>
    </div>
  );
}
