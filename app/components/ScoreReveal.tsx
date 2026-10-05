'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldX, CheckCircle, Info } from 'lucide-react';
import { GradeColor } from '@/lib/score';

interface ScoreRevealProps {
  score: number;
  grade: string;
  verdict: string;
  badge: string;
  color: GradeColor;
  scamDetected: boolean;
  totalPointsDeducted: number;
  trapCount: number;
}

export default function ScoreReveal({
  score,
  grade,
  verdict,
  badge,
  color,
  scamDetected,
  totalPointsDeducted,
  trapCount,
}: ScoreRevealProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 16; // ~60fps
    const totalSteps = duration / stepTime;
    const increment = score / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const getStampStyles = () => {
    if (scamDetected || color === 'red') {
      return {
        border: 'border-stamp-red',
        bg: 'bg-stamp-redBg',
        text: 'text-stamp-red',
        glow: 'shadow-[0_0_15px_rgba(194,64,42,0.15)]',
      };
    }
    if (color === 'orange') {
      return {
        border: 'border-orange-600',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        glow: 'shadow-[0_0_15px_rgba(217,119,6,0.15)]',
      };
    }
    if (color === 'amber') {
      return {
        border: 'border-stamp-amber',
        bg: 'bg-stamp-amberBg',
        text: 'text-stamp-amber',
        glow: 'shadow-[0_0_15px_rgba(183,121,31,0.15)]',
      };
    }
    return {
      border: 'border-stamp-green',
      bg: 'bg-stamp-greenBg',
      text: 'text-stamp-green',
      glow: 'shadow-[0_0_15px_rgba(30,107,74,0.15)]',
    };
  };

  const stamp = getStampStyles();

  return (
    <div className="w-full bg-paper-card border border-paper-border rounded-2xl p-6 sm:p-8 shadow-card">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Big Score & Stamp */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Big Number Circle */}
          <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-paper border-2 border-paper-border shadow-subtle">
            <div className="flex flex-col items-center justify-center">
              <span className="font-serif text-5xl sm:text-6xl font-black text-ink leading-none">
                {displayScore}
              </span>
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold mt-1">
                out of 100
              </span>
            </div>
          </div>

          {/* Details & Grade */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-xs uppercase tracking-widest font-semibold text-ink-muted mb-1.5">
              Offer Letter Health Rating
            </span>

            {/* Rubber Stamp */}
            <div
              className={`inline-block px-4 py-1.5 border-2 ${stamp.border} ${stamp.bg} ${stamp.text} rounded font-serif font-black text-base sm:text-lg tracking-wider uppercase transform -rotate-1 shadow-sm mb-3`}
            >
              {grade}
            </div>

            <p className="font-serif text-lg text-ink italic max-w-lg">
              "{verdict}"
            </p>
          </div>
        </div>

        {/* Right: Quick Stats breakdown */}
        <div className="w-full md:w-auto flex flex-row md:flex-col justify-around gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-paper-border md:pl-8 text-center md:text-left">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">
              Traps Detected
            </div>
            <div className={`text-2xl font-bold font-mono ${trapCount > 0 ? 'text-stamp-red' : 'text-stamp-green'}`}>
              {trapCount} {trapCount === 1 ? 'flag' : 'flags'}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">
              Score Deductions
            </div>
            <div className="text-2xl font-bold font-mono text-ink">
              −{totalPointsDeducted} <span className="text-xs text-ink-muted font-normal">pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
