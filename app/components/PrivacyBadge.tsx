'use client';

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyBadge() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-paper-card border border-paper-border rounded-lg text-xs md:text-sm text-ink-muted">
      <Lock className="w-4 h-4 text-stamp-green flex-shrink-0" />
      <span>
        <strong className="text-ink font-semibold">100% Client-Redacted & Ephemeral:</strong> Your letter is stripped of personal info in your browser and never persisted to any database or disk.
      </span>
    </div>
  );
}
