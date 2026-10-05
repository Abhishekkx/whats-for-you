export type GradeColor = 'green' | 'amber' | 'orange' | 'red';

export interface ScoreGrade {
  score: number;
  grade: string;
  verdict: string;
  badge: string;
  color: GradeColor;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

/**
 * Calculates deterministic score (0-100) and returns grade metadata
 */
export function calculateScore(totalDeductions: number, isScam = false): ScoreGrade {
  if (isScam) {
    return {
      score: 0,
      grade: 'ILLEGAL / SCAM DETECTED',
      verdict: 'Do not sign or pay any money. Demanding monetary deposits for jobs is unlawful.',
      badge: 'Scam Alert',
      color: 'red',
      bgClass: 'bg-stamp-redBg',
      borderClass: 'border-stamp-red',
      textClass: 'text-stamp-red',
    };
  }

  const score = Math.max(0, Math.min(100, 100 - totalDeductions));

  if (score >= 80) {
    return {
      score,
      grade: 'Clean Offer',
      verdict: 'Standard commercial terms with minimal hidden gotchas.',
      badge: 'Low Risk',
      color: 'green',
      bgClass: 'bg-stamp-greenBg',
      borderClass: 'border-stamp-green',
      textClass: 'text-stamp-green',
    };
  }

  if (score >= 60) {
    return {
      score,
      grade: 'Decent — Verify the Flags',
      verdict: 'Fair offer overall, but contains 1–2 clauses you should clarify in writing before signing.',
      badge: 'Moderate Risk',
      color: 'amber',
      bgClass: 'bg-stamp-amberBg',
      borderClass: 'border-stamp-amber',
      textClass: 'text-stamp-amber',
    };
  }

  if (score >= 40) {
    return {
      score,
      grade: 'Risky — Negotiate First',
      verdict: 'Multiple restrictive terms, bonding penalties, or aggressive variable pay detected.',
      badge: 'High Risk',
      color: 'orange',
      bgClass: 'bg-amber-50',
      borderClass: 'border-orange-600',
      textClass: 'text-orange-700',
    };
  }

  return {
    score,
    grade: 'Walk Away Carefully',
    verdict: 'Extremely one-sided contract with high penalties and heavy exit barriers.',
    badge: 'Critical Risk',
    color: 'red',
    bgClass: 'bg-stamp-redBg',
    borderClass: 'border-stamp-red',
    textClass: 'text-stamp-red',
  };
}
