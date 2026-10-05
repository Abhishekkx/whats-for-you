'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, MessageCircle, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { formatINR } from '@/lib/tax';

interface ShareCardProps {
  score: number;
  grade: string;
  monthlyInHand: number;
  trapCount: number;
  verdict: string;
}

export default function ShareCard({
  score,
  grade,
  monthlyInHand,
  trapCount,
  verdict,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const formattedInHand = formatINR(monthlyInHand);
  const ogUrl = `/api/og?score=${encodeURIComponent(score)}&grade=${encodeURIComponent(grade)}&inhand=${encodeURIComponent(formattedInHand)}&traps=${encodeURIComponent(trapCount)}&verdict=${encodeURIComponent(verdict)}`;

  const shareText = `My fresher job offer letter scored ${score}/100 on @whatsforyou (${trapCount} trap clauses detected, ₹${monthlyInHand.toLocaleString('en-IN')}/mo real in-hand). Check your offer before signing:`;
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://whatsforyou.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${appUrl}\n\n${shareText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${appUrl}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-paper-card border border-paper-border rounded-2xl p-6 sm:p-7 shadow-card">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-paper-border">
        <Share2 className="w-5 h-5 text-ink" />
        <h3 className="font-serif text-xl font-bold text-ink">Share Your Scorecard</h3>
      </div>

      <p className="text-sm text-ink-muted mb-4">
        Warn college batchmates and compare offers anonymously. No personal details or company names are shared.
      </p>

      {/* OG Image Card Preview */}
      <div className="relative mb-5 border-2 border-paper-border rounded-xl overflow-hidden bg-paper shadow-sm aspect-[1200/630]">
        <img
          src={ogUrl}
          alt={`Offer Scorecard: ${score}/100 - ${grade}`}
          className="w-full h-full object-cover select-none"
          loading="lazy"
        />
      </div>

      {/* Share Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={handleShareX}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-paper hover:bg-paper-hover text-ink border border-paper-border rounded-lg text-xs font-semibold transition-all"
        >
          <Twitter className="w-4 h-4 fill-current" />
          <span>Post to X</span>
        </button>

        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-paper hover:bg-paper-hover text-ink border border-paper-border rounded-lg text-xs font-semibold transition-all"
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 rounded-lg text-xs font-semibold transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-ink hover:bg-black text-paper rounded-lg text-xs font-semibold transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-stamp-green" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
