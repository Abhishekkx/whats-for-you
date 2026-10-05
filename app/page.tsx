'use client';

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FileSearch,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import AnalyzingSteps from './components/AnalyzingSteps';
import ScoreReveal from './components/ScoreReveal';
import TrapCard from './components/TrapCard';
import InHandBreakdown from './components/InHandBreakdown';
import SummaryBullets from './components/SummaryBullets';
import ShareCard from './components/ShareCard';
import PrivacyBadge from './components/PrivacyBadge';
import Faq from './components/Faq';
import { redactPII } from '@/lib/redact';
import { DetectedTrap } from '@/lib/traps';
import { InHandResult, CompensationInput } from '@/lib/tax';
import { GradeColor } from '@/lib/score';

interface AnalysisResponse {
  score: number;
  grade: string;
  verdict: string;
  badge: string;
  color: GradeColor;
  scamDetected: boolean;
  traps: DetectedTrap[];
  totalPointsDeducted: number;
  compensation: CompensationInput;
  inHand: InHandResult;
  summaryBullets: string[];
  hrQuestions: string[];
  debug?: { rawExtraction: unknown; groundingDroppedFields: string[] };
  metadata?: {
    piiRedactedCount: number;
    characterCount: number;
  };
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async ({
    file,
    text,
    isSample,
  }: {
    file?: File;
    text?: string;
    isSample?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let payloadText = text || '';

      // If text was passed directly (or sample), redact client-side before sending
      if (payloadText) {
        const { redactedText } = redactPII(payloadText);
        payloadText = redactedText;
      }

      let res: Response;
      const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
      const analyzeUrl = debugMode ? '/api/analyze?debug=1' : '/api/analyze';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch(analyzeUrl, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(analyzeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payloadText }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze offer letter.');
      }

      setAnalysis(data);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Something went wrong. Please try pasting the letter text instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyQuestion = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* 1. SLIM HEADER */}
      <header className="w-full border-b border-paper-border bg-paper/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-black tracking-tight text-ink group-hover:text-stamp-red transition-colors">
              whatsforyou
            </span>
            <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-paper-card border border-paper-border text-ink-muted">
              v1.0
            </span>
          </a>

          <nav className="flex items-center gap-4 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-ink-muted hover:text-ink font-medium transition-colors"
            >
              How it works
            </button>
            {analysis && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-paper-border hover:border-ink text-xs font-semibold text-ink bg-paper-card transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Audit Another</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 2. HERO & UPLOAD ZONE (Visible when not analyzed yet or for new upload) */}
        {!analysis && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Text */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-card border border-paper-border text-xs font-semibold text-ink-muted">
                <Sparkles className="w-3.5 h-3.5 text-stamp-amber" />
                <span>Built for Indian freshers & campus hires</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.15]">
                Know what you're <span className="underline decoration-stamp-red decoration-wavy decoration-2">actually signing</span>.
              </h1>

              <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
                Upload your offer letter. Uncover hidden training bonds, notice period traps, variable pay illusions, and calculate your guaranteed monthly in-hand salary. Free and private.
              </p>
            </div>

            {/* Upload Zone */}
            <UploadZone onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-stamp-redBg border border-stamp-redBorder rounded-xl flex items-center gap-3 text-stamp-red text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy Badge strip */}
            <div className="max-w-2xl mx-auto">
              <PrivacyBadge />
            </div>
          </div>
        )}

        {/* 3. ANALYZING STEPS */}
        {isLoading && <AnalyzingSteps />}

        {/* 4. RESULTS VIEW */}
        {analysis && !isLoading && (
          <div ref={resultsRef} className="space-y-10 animate-fade-in pt-2">
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-paper-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stamp-green animate-ping" />
                <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">
                  Offer Audit Report Completed
                </span>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-paper-card hover:bg-paper-hover border border-paper-border rounded-xl text-xs sm:text-sm font-semibold text-ink transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Analyze Another Offer Letter</span>
              </button>
            </div>

            {/* Scam Alert Critical Banner (if triggered) */}
            {analysis.scamDetected && (
              <div className="p-6 bg-stamp-redBg border-2 border-stamp-red rounded-2xl flex flex-col sm:flex-row items-start gap-4 text-stamp-red shadow-lg">
                <ShieldAlert className="w-8 h-8 flex-shrink-0 mt-1" />
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold uppercase tracking-wide">
                    Critical Warning: Unlawful Monetary Demand Detected
                  </h3>
                  <p className="text-sm leading-relaxed text-ink">
                    This document demands a security deposit, training fee, or blank cheque. Under the Indian Contract Act and Labor Regulations, charging candidates for employment or training is illegal. <strong>Do not make any payment.</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Score Reveal Hero Box */}
            {analysis.debug && (
              <details className="p-4 bg-paper-card border border-paper-border rounded-xl">
                <summary className="cursor-pointer font-semibold text-sm">Extraction debug</summary>
                <p className="mt-3 text-xs"><strong>Fields removed by grounding:</strong> {analysis.debug.groundingDroppedFields.join(', ') || 'None'}</p>
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(analysis.debug.rawExtraction, null, 2)}</pre>
              </details>
            )}
            <ScoreReveal
              score={analysis.score}
              grade={analysis.grade}
              verdict={analysis.verdict}
              badge={analysis.badge}
              color={analysis.color}
              scamDetected={analysis.scamDetected}
              totalPointsDeducted={analysis.totalPointsDeducted}
              trapCount={analysis.traps.length}
            />

            {/* Two-Column Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Trap Cards (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-paper-border">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-stamp-red" />
                    <h3 className="font-serif text-2xl font-bold text-ink">
                      Contractual Traps & Risks
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-paper-card border border-paper-border text-ink-muted">
                    {analysis.traps.length} {analysis.traps.length === 1 ? 'Clause Flagged' : 'Clauses Flagged'}
                  </span>
                </div>

                {analysis.traps.length === 0 ? (
                  <div className="p-8 bg-stamp-greenBg border border-stamp-greenBorder rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-stamp-green mx-auto" />
                    <h4 className="font-serif text-lg font-bold text-ink">No Dangerous Traps Found</h4>
                    <p className="text-sm text-ink-muted max-w-md mx-auto">
                      We scanned for bonds, notice period asymmetry, IP grabs, and probation salary reductions, and found no concerning patterns.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis.traps.map((trap, idx) => (
                      <TrapCard key={trap.id || idx} trap={trap} index={idx} />
                    ))}
                  </div>
                )}

                {/* "Ask HR This" Consolidated Box */}
                {analysis.hrQuestions && analysis.hrQuestions.length > 0 && (
                  <div className="mt-8 p-6 bg-paper-card border border-paper-border rounded-2xl space-y-4 shadow-card">
                    <div className="flex items-center gap-2 pb-3 border-b border-paper-border">
                      <MessageSquare className="w-5 h-5 text-stamp-amber" />
                      <h4 className="font-serif text-xl font-bold text-ink">
                        Questions to Ask HR Before Signing
                      </h4>
                    </div>

                    <p className="text-xs text-ink-muted">
                      Polite, targeted questions to clarify the most ambiguous or one-sided terms in this letter:
                    </p>

                    <div className="space-y-2.5">
                      {analysis.hrQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-3 bg-paper rounded-xl border border-paper-border flex items-start justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono text-xs font-bold text-ink-muted mt-0.5">
                              {qIdx + 1}.
                            </span>
                            <span className="font-serif text-ink italic leading-relaxed">
                              "{q}"
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyQuestion(q, qIdx)}
                            className="p-1.5 rounded hover:bg-paper-hover text-ink-muted hover:text-ink flex-shrink-0 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedQuestionIndex === qIdx ? (
                              <Check className="w-4 h-4 text-stamp-green" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: In-Hand Breakdown & Summary (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-6">
                {/* In-Hand Breakdown */}
                <InHandBreakdown
                  initialInHand={analysis.inHand}
                  initialCompensation={analysis.compensation}
                />

                {/* Summary Bullets */}
                <SummaryBullets bullets={analysis.summaryBullets} />

                {/* Share Card */}
                {analysis.compensation.compensation_found !== false && (
                  <ShareCard
                    score={analysis.score}
                    grade={analysis.grade}
                    monthlyInHand={analysis.inHand.monthlyInHandFixed}
                    trapCount={analysis.traps.length}
                    verdict={analysis.verdict}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. HOW IT WORKS (3 steps) */}
        <div ref={howItWorksRef} className="my-20 pt-12 border-t border-paper-border">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">
              How whatsforyou Works
            </h3>
            <p className="text-sm text-ink-muted">
              Built to give freshers full transparency in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-paper-card border border-paper-border rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-paper border border-paper-border flex items-center justify-center font-mono font-bold text-ink">
                1
              </div>
              <h4 className="font-serif font-bold text-lg text-ink">Upload Document</h4>
              <p className="text-sm text-ink-muted leading-relaxed">
                Drop your PDF or paste offer text. Personal data (names, emails, phones) is redacted directly in your browser.
              </p>
            </div>

            <div className="p-6 bg-paper-card border border-paper-border rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-paper border border-paper-border flex items-center justify-center font-mono font-bold text-ink">
                2
              </div>
              <h4 className="font-serif font-bold text-lg text-ink">Scan Traps & Compute In-Hand</h4>
              <p className="text-sm text-ink-muted leading-relaxed">
                Our deterministic engine detects 9 trap patterns with exact quotes and computes FY 26-27 take-home salary.
              </p>
            </div>

            <div className="p-6 bg-paper-card border border-paper-border rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-paper border border-paper-border flex items-center justify-center font-mono font-bold text-ink">
                3
              </div>
              <h4 className="font-serif font-bold text-lg text-ink">Negotiate Smarter</h4>
              <p className="text-sm text-ink-muted leading-relaxed">
                Receive targeted HR negotiation questions, an Offer Health Score, and a shareable scorecard.
              </p>
            </div>
          </div>
        </div>

        {/* 6. FAQ (4 Accordion Items) */}
        <Faq />
      </main>

      {/* 7. FOOTER */}
      <footer className="border-t border-paper-border bg-paper-card py-8 mt-12 text-center text-xs text-ink-muted space-y-2">
        <p className="font-medium text-ink">
          whatsforyou is an informational analysis tool, not legal advice.
        </p>
        <p>
          Zero data retention • No cookies • No accounts • Built for Indian college freshers & job seekers.
        </p>
      </footer>
    </div>
  );
}
