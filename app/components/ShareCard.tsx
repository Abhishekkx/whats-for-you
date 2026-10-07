'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Twitter, Linkedin, MessageCircle, Copy, Check, Share } from 'lucide-react';

interface ShareCardProps {
  score: number;
  grade: string;
  monthlyInHand: number;
  trapCount: number;
}

export default function ShareCard({ score, grade, monthlyInHand, trapCount }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

  useEffect(() => {
    const updateNativeShare = () => {
      setNativeShareAvailable(typeof navigator.share === 'function' && window.matchMedia('(max-width: 767px)').matches);
    };
    updateNativeShare();
    window.addEventListener('resize', updateNativeShare);
    return () => window.removeEventListener('resize', updateNativeShare);
  }, []);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://whatsforyou.app';
  const shareText = `My offer scored ${score}/100 on whatsforyou — ${grade}. What's yours hiding?`;
  const compactInHand = monthlyInHand >= 1000
    ? `₹${(monthlyInHand / 1000).toFixed(1)}k`
    : `₹${Math.round(monthlyInHand).toLocaleString('en-IN')}`;
  const stampClass = score < 60
    ? 'border-stamp-red text-stamp-red bg-stamp-redBg'
    : score < 80
    ? 'border-stamp-amber text-stamp-amber bg-stamp-amberBg'
    : 'border-stamp-green text-stamp-green bg-stamp-greenBg';
  const shareMessage = score < 60
    ? `Warn your batchmates — this offer has ${trapCount} traps.`
    : score >= 80
    ? "Clean offer. Flex it — or check your friends' offers."
    : 'Compare offers with your batchmates.';

  const openShareIntent = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  const handleShareX = () => openShareIntent(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`);
  const handleShareLinkedIn = () => openShareIntent(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`);
  const handleShareWhatsApp = () => openShareIntent(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${appUrl}`)}`);

  const handleNativeShare = async () => {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: 'My whatsforyou offer scorecard', text: shareText, url: appUrl });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') console.error('Native share failed:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement('textarea');
      input.value = appUrl;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const didCopy = document.execCommand('copy');
      input.remove();
      if (didCopy) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    }
  };

  return (
    <section className="bg-paper-card border border-paper-border rounded-2xl p-5 sm:p-7 shadow-card">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-paper-border">
        <Share2 className="w-5 h-5 text-ink" />
        <h3 className="font-serif text-xl font-bold text-ink">Share Your Scorecard</h3>
      </div>

      <p className="text-sm text-ink-muted mb-4">{shareMessage} <span className="block mt-1">No personal details or company names are shared.</span></p>

      <div className="relative mb-5 aspect-[1200/630] overflow-hidden rounded-xl border-2 border-ink bg-[#FAF8F3] p-3 sm:p-6 shadow-sm" aria-label={`Offer scorecard: ${score} out of 100, ${grade}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E2DACB] pb-1.5 sm:pb-3">
            <span className="font-serif text-sm font-black tracking-tight text-ink sm:text-2xl">whatsforyou</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted sm:text-xs">Offer Scorecard</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center py-1.5 sm:py-3">
            <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:text-xs">Offer Health Score</div>
            <div className="flex items-baseline leading-none">
              <span className="font-serif text-5xl font-black tracking-tight text-ink sm:text-8xl">{score}</span>
              <span className="ml-1 text-base text-ink-muted sm:ml-2 sm:text-3xl">/ 100</span>
            </div>
            <span className={`mt-1.5 self-start rounded border-2 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider sm:mt-3 sm:px-4 sm:py-1.5 sm:text-base ${stampClass}`}>{grade}</span>
          </div>
          <div className="border-t border-[#E2DACB] pt-1.5 font-mono text-[9px] font-bold leading-tight text-stamp-red sm:pt-3 sm:text-xl">
            {trapCount} {trapCount === 1 ? 'trap' : 'traps'} · {compactInHand}/mo real in-hand
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {nativeShareAvailable && (
          <button type="button" onClick={handleNativeShare} className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-ink px-3 py-3 text-sm font-bold text-paper transition-colors hover:bg-black sm:hidden">
            <Share className="h-4 w-4" /> Share scorecard
          </button>
        )}
        <button type="button" onClick={handleShareX} className="flex items-center justify-center gap-2 rounded-lg border border-paper-border bg-paper px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-paper-hover">
          <Twitter className="h-4 w-4 fill-current" /> Post to X
        </button>
        <button type="button" onClick={handleShareLinkedIn} className="flex items-center justify-center gap-2 rounded-lg border border-paper-border bg-paper px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-paper-hover">
          <Linkedin className="h-4 w-4" /> LinkedIn
        </button>
        <button type="button" onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-2.5 text-xs font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button type="button" onClick={handleCopyLink} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-xs font-semibold text-paper transition-colors hover:bg-black" aria-live="polite">
          {copied ? <><Check className="h-4 w-4" /> Copied ✓</> : <><Copy className="h-4 w-4" /> Copy link</>}
        </button>
      </div>
    </section>
  );
}
