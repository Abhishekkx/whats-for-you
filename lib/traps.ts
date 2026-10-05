export type TrapSeverity = 'high' | 'medium' | 'low' | 'scam';

export interface TrapDefinition {
  id: string;
  name: string;
  severity: TrapSeverity;
  points: number;
  category: string;
  patterns: RegExp[];
  explainer: string;
  askHr: string;
}

export interface DetectedTrap {
  id: string;
  name: string;
  severity: TrapSeverity;
  points: number;
  category: string;
  explainer: string;
  askHr: string;
  quote: string;
  matchedPattern?: string;
}

export const TRAP_DEFINITIONS: TrapDefinition[] = [
  // 1. Training Bond / Service Agreement
  {
    id: 'training_bond',
    name: 'Training Bond / Service Agreement',
    severity: 'high',
    points: 20,
    category: 'Commitment & Penalties',
    patterns: [
      /(?:service\s+agreement|training\s+agreement|service\s+bond|employment\s+bond|indemnity\s+bond|mandatory\s+service\s+period|minimum\s+service\s+(?:period|duration)|commitment\s+period)[\s\S]{0,160}?(?:penalty|liquidated\s+damages|reimburse|recover|pay\s+(?:back|a\s+sum|an\s+amount)|rs\.?|inr|\d+\s*(?:lakh|lacs|k|\/|\.))/i,
      /(?:required\s+to\s+serve|agree\s+to\s+serve|commit\s+to\s+work\s+for)\s+(?:a\s+minimum\s+period\s+of\s+)?(?:\d+|one|two|three)\s+(?:years?|months?)[\s\S]{0,160}?(?:failing\s+which|breach|penalty|deposit|repay|recover|damages|rs\.?|inr)/i,
      /(?:penalty|liquidated\s+damages|cost\s+of\s+training|training\s+cost\s+of)\s+(?:inr|rs\.?|sum\s+of)\s*[\d,]+[\s\S]{0,160}?(?:resignation|leaving|termination|breach|service\s+agreement)/i,
      /(?:bank\s+guarantee|promissory\s+note|surety\s+bond)[\s\S]{0,160}?(?:bond|training|service\s+commitment|employment)/i,
    ],
    explainer:
      'You are bound to a mandatory tenure (often 1–3 years) backed by steep monetary penalties if you exit early. In Indian law, bonds are only enforceable for actual, proven training expenses, yet employers often leverage them aggressively.',
    askHr:
      'Is this service bond prorated monthly based on tenure served, and can you share an itemized breakdown of the actual training costs incurred?',
  },

  // 2. Probation Salary Cut / Delayed CTC
  {
    id: 'probation_cut',
    name: 'Probation Salary Reduction',
    severity: 'high',
    points: 15,
    category: 'Compensation Terms',
    patterns: [
      /(?:stipend|salary|remuneration|compensation|ctc)\s+(?:during|for\s+the)\s+probation(?:\s+period)?[\s\S]{0,160}?(?:inr|rs\.?|\d+%).*?(?:revised|enhanced|increased|raised|on\s+confirmation|full\s+ctc)/i,
      /(?:during\s+probation|probationary\s+period)[\s\S]{0,160}?(?:will\s+receive\s+a\s+stipend|paid\s+at\s+\d+%\s+of|lower\s+compensation|stipend\s+of\s+rs)/i,
      /(?:upon\s+successful\s+completion\s+of\s+probation|post\s+confirmation)[\s\S]{0,160}?(?:ctc\s+will\s+be|salary\s+will\s+be\s+revised|eligible\s+for\s+full|full\s+ctc\s+will\s+be\s+activated)/i,
      /probation\s+period\s+of\s+\d+\s+months?[\s\S]{0,160}?(?:stipend|consolidated\s+pay|not\s+entitled\s+to\s+benefits|paid\s+at\s+\d+%)/i,
    ],
    explainer:
      'Your take-home during probation is lower than the advertised CTC. Confirmation to the higher package is contingent on manager evaluations with no automatic timeline.',
    askHr:
      'What specific KRA milestones dictate probation confirmation, and is the CTC bump executed automatically on the probation end date?',
  },

  // 3. Joining Bonus Clawback
  {
    id: 'bonus_clawback',
    name: 'Joining Bonus Clawback',
    severity: 'medium',
    points: 10,
    category: 'Commitment & Penalties',
    patterns: [
      /(?:joining\s+bonus|sign-?on\s+bonus|signing\s+bonus|retention\s+bonus)[\s\S]{0,160}?(?:claw\s*back|recovered|repaid|reimburse|refunded|returned|payable\s+back|subject\s+to\s+recovery)/i,
      /(?:subject\s+to\s+recovery|liable\s+to\s+repay|refund\s+the\s+full\s+amount)[\s\S]{0,160}?(?:joining\s+bonus|sign-?on\s+bonus|signing\s+bonus|relocation\s+allowance)/i,
      /(?:if\s+you\s+(?:resign|leave|separate)\s+within)[\s\S]{0,160}?(?:\d+|12|18|24|one|two)\s+(?:months?|years?)[\s\S]{0,160}?(?:joining\s+bonus|sign-?on|signing\s+bonus|repay|recover)/i,
    ],
    explainer:
      'If you resign within the clawback window (typically 12–24 months), you must refund the gross bonus in full, even though tax was already deducted.',
    askHr:
      'If I leave before the clawback period concludes, is repayment calculated on a prorated basis and on net or gross bonus received?',
  },

  // 4. Variable Pay Illusion / High Risk CTC
  {
    id: 'variable_pay',
    name: 'Variable Pay & Performance Risk',
    severity: 'high',
    points: 15,
    category: 'Compensation Terms',
    patterns: [
      /(?:variable\s+pay|performance\s+linked\s+incentive|pli|discretionary\s+bonus|performance\s+bonus|annual\s+incentive)[\s\S]{0,160}?(?:discretion|subject\s+to\s+company\s+performance|not\s+guaranteed|kra|kpi|target\s+achievement|profitability)/i,
      /(?:variable\s+(?:component|portion|amount)|pli)[\s\S]{0,160}?(?:up\s+to|maximum\s+of|based\s+on\s+business\s+outlook|subject\s+to\s+management\s+discretion)/i,
      /(?:variable|pli)\s*[:=-]?\s*(?:inr|rs\.?)?\s*[\d,]+[\s\S]{0,160}?(?:payable\s+(?:annually|at\s+the\s+end\s+of)|subject\s+to\s+being\s+on\s+rolls|discretion\s+of\s+management)/i,
    ],
    explainer:
      'A large slice of your stated CTC is variable and non-contractual. Freshers commonly receive only 50–70% of variable pay due to organizational multipliers and team quotas.',
    askHr:
      'What was the historical payout percentage of variable pay for freshers in this department over the past two fiscal years?',
  },

  // 5. Notice Period Asymmetry / Long Notice
  {
    id: 'notice_asymmetry',
    name: 'Notice Period Asymmetry',
    severity: 'medium',
    points: 10,
    category: 'Exit & Termination',
    patterns: [
      /(?:notice\s+period\s+of\s+(?:90\s+days|3\s+months|60\s+days|2\s+months))/i,
      /(?:employee\s+shall\s+give|you\s+are\s+required\s+to\s+give|give)\s+(?:60|90|3\s+months|2\s+months)\s+days?(?:'|\s+notice)[\s\S]{0,160}?(?:company\s+reserves|company\s+may\s+terminate|immediate|without\s+notice|shorter\s+notice|7\s+days|15\s+days|30\s+days)/i,
      /(?:notice\s+period)[\s\S]{0,160}?(?:no\s+buyout|buyout\s+not\s+permitted|sole\s+discretion\s+of\s+the\s+company\s+to\s+accept\s+notice\s+pay|cannot\s+be\s+adjusted\s+against\s+leaves|reject\s+requests\s+for\s+notice\s+period\s+buyout)/i,
      /(?:company\s+reserves\s+the\s+right\s+to\s+terminate)[\s\S]{0,160}?(?:with\s+(?:immediate\s+effect|15\s+days|without\s+cause|without\s+assigning\s+any\s+reason))/i,
    ],
    explainer:
      'The contract demands a lengthy 60–90 day employee notice period (which deters prospective future employers) while retaining swift termination rights for the company.',
    askHr:
      'Is there an explicit policy allowing buyout of the notice period by the candidate or their subsequent employer?',
  },

  // 6. Restrictive Non-Compete & Non-Solicit
  {
    id: 'non_compete',
    name: 'Broad Non-Compete / Post-Exit Restraint',
    severity: 'medium',
    points: 10,
    category: 'Legal Restrictions',
    patterns: [
      /(?:non-?compete|non\s+competition|restrictive\s+covenant)[\s\S]{0,160}?(?:period\s+of\s+\d+\s+(?:months?|years?)|shall\s+not\s+join\s+any\s+competitor|similar\s+business|competing\s+firm|competing\s+business)/i,
      /(?:shall\s+not|agree\s+not\s+to|not\s+to\s+join)[\s\S]{0,160}?(?:directly\s+or\s+indirectly\s+engage|employed\s+by\s+any\s+competitor|competitor\s+firm|competing\s+business|render\s+services\s+to\s+any\s+client)[\s\S]{0,160}?(?:for\s+a\s+period\s+of|\d+\s+months|\d+\s+years|post\s+departure)/i,
      /(?:garden\s+leave|restraint\s+period)[\s\S]{0,160}?(?:without\s+prior\s+written\s+consent|\d+\s+months)/i,
    ],
    explainer:
      'Contains broad non-compete covenants restricting you from working for competitors. While post-employment non-competes are largely void under Section 27 of the Indian Contract Act, companies still wield them to discourage mobility.',
    askHr:
      'Can the company furnish a defined, limited list of direct competitors governed by this non-compete clause?',
  },

  // 7. Broad IP & Personal Project Ownership Grab
  {
    id: 'ip_ownership',
    name: 'Overreaching IP & Side Project Grab',
    severity: 'low',
    points: 5,
    category: 'Legal Restrictions',
    patterns: [
      /(?:all\s+inventions|all\s+intellectual\s+property|all\s+works|all\s+copyrights?)[\s\S]{0,160}?(?:whether\s+during\s+or\s+outside\s+business\s+hours|sole\s+and\s+exclusive\s+property|vests?\s+in\s+the\s+company|created\s+during\s+the\s+period\s+of\s+employment)/i,
      /(?:inventions|discoveries|developments|software(?:\s+code)?|code)[\s\S]{0,160}?(?:conceived|developed|authored|developed\s+by\s+you)[\s\S]{0,160}?(?:whether\s+during\s+or\s+outside\s+business\s+hours|whether\s+or\s+not\s+during\s+working\s+hours|using\s+company\s+resources\s+or\s+not|sole\s+and\s+exclusive\s+property)/i,
      /(?:assigns?\s+all\s+rights|irrevocably\s+assigns?|waive\s+all\s+moral\s+rights)[\s\S]{0,160}?(?:throughout\s+the\s+universe|in\s+perpetuity|all\s+future\s+inventions)/i,
    ],
    explainer:
      'The IP assignment wording is expansive enough to capture personal hobby software, open-source work, or side projects created outside working hours.',
    askHr:
      'Does this IP assignment carve out independent open-source projects created entirely on personal hardware and off-duty hours?',
  },

  // 8. No Guaranteed Increment / Discretionary Appraisals
  {
    id: 'no_guaranteed_increment',
    name: 'No Contractual Increment Assurance',
    severity: 'low',
    points: 5,
    category: 'Compensation Terms',
    patterns: [
      /(?:salary\s+review|increment|appraisal|revision\s+of\s+salary)[\s\S]{0,160}?(?:sole\s+discretion|at\s+the\s+discretion\s+of\s+the\s+management|does\s+not\s+guarantee|not\s+confer\s+any\s+right|company's\s+sole\s+discretion)/i,
      /(?:increments?,?\s+if\s+any|revision,?\s+if\s+any)[\s\S]{0,160}?(?:discretionary|business\s+performance|at\s+the\s+sole\s+discretion)/i,
    ],
    explainer:
      'The letter clarifies that annual appraisal increments are strictly discretionary, giving zero contractual assurance against salary stagnation.',
    askHr:
      'What is the standard annual review frequency and the historical median increment percentage for entry-level engineering cohorts?',
  },

  // 9. Far-Off Dispute Jurisdiction / Unilateral Relocation
  {
    id: 'dispute_location',
    name: 'Distant Legal Venue / Unilateral Transfer',
    severity: 'low',
    points: 5,
    category: 'Exit & Termination',
    patterns: [
      /(?:exclusive\s+jurisdiction\s+of\s+courts\s+at|subject\s+to\s+the\s+jurisdiction\s+of\s+the\s+courts\s+in|arbitration\s+shall\s+take\s+place\s+in)\s+(?:new\s+delhi|mumbai|chennai|hyderabad|kolkata|pune|noida|gurugram|bengaluru|bangalore)/i,
      /(?:liable\s+to\s+be\s+transferred|transferred\s+to\s+any\s+(?:branch|subsidiary|location|office|associate\s+company))[\s\S]{0,160}?(?:in\s+india\s+or\s+abroad|without\s+any\s+additional\s+compensation|at\s+the\s+sole\s+discretion\s+of\s+the\s+company)/i,
    ],
    explainer:
      'The company reserves the right to transfer you to any location unilaterally, or mandates dispute resolution in a distant court seat.',
    askHr:
      'If relocated to a different city in the future, does the company provide a fixed relocation allowance and cost-of-living adjustment?',
  },

  // S. SCAM ALERT (Separate flag)
  {
    id: 'scam_alert',
    name: 'ILLEGAL DEPOSIT / SCAM DEMAND',
    severity: 'scam',
    points: 0,
    category: 'Illegal / Scam Warning',
    patterns: [
      /(?:security\s+deposit|refundable\s+deposit|caution\s+deposit|initial\s+deposit|registration\s+fee|processing\s+fee|onboarding\s+fee|document\s+verification\s+charge|laptop\s+deposit|training\s+fee\s+upfront|submit\s+blank\s+cheque|original\s+certificates?\s+(?:retained|deposited|held|kept))/i,
      /(?:deposit\s+(?:a\s+sum\s+of\s+)?(?:inr|rs\.?)\s*[\d,]+)[\s\S]{0,160}?(?:before\s+joining|towards\s+training|towards\s+security|refundable)/i,
      /(?:deposit\s+original\s+(?:degree|marksheets?|certificates?|passport|documents?)\s+with\s+the\s+company)/i,
    ],
    explainer:
      'CRITICAL WARNING: Demanding security deposits, registration fees, blank cheques, or retaining original academic certificates is strictly ILLEGAL under Indian Labor Law. Legitimate companies NEVER ask for money.',
    askHr:
      'WARNING: Do not transfer any funds or surrender original certificates. This is an unlawful hiring practice.',
  },
];

/**
 * Extracts a concise, clean quoted line from text that matched a regex.
 */
function extractQuote(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (!match) return null;

  const matchIndex = match.index ?? 0;
  const matchLength = match[0].length;

  // Find start of line/paragraph before match
  const startLine = text.lastIndexOf('\n', matchIndex);
  const startBound = startLine === -1 ? 0 : startLine + 1;

  // Find end of line/paragraph after match
  let endBound = text.indexOf('\n', matchIndex + matchLength);
  if (endBound === -1) endBound = text.length;

  let snippet = text.slice(startBound, endBound).trim();

  // If snippet is very long (over 280 chars), center it around the match
  if (snippet.length > 280) {
    const relStart = matchIndex - startBound;
    const subStart = Math.max(0, relStart - 40);
    const subEnd = Math.min(snippet.length, relStart + matchLength + 40);
    snippet = (subStart > 0 ? '...' : '') + snippet.slice(subStart, subEnd).trim() + (subEnd < snippet.length ? '...' : '');
  }

  // Clean up excess whitespace
  snippet = snippet.replace(/\s+/g, ' ').trim();

  return snippet || match[0].replace(/\s+/g, ' ').trim();
}

/**
 * Deterministic engine: analyzes raw/redacted offer letter text for traps.
 * Guarantees that every returned trap contains a genuine quoted string.
 */
export function detectTraps(text: string): {
  traps: DetectedTrap[];
  scamDetected: boolean;
  totalPointsDeducted: number;
} {
  if (!text || text.trim().length === 0) {
    return { traps: [], scamDetected: false, totalPointsDeducted: 0 };
  }

  const detected: DetectedTrap[] = [];
  let scamFound = false;

  for (const def of TRAP_DEFINITIONS) {
    for (const pattern of def.patterns) {
      if (pattern.test(text)) {
        const quote = extractQuote(text, pattern);
        if (quote) {
          detected.push({
            id: def.id,
            name: def.name,
            severity: def.severity,
            points: def.points,
            category: def.category,
            explainer: def.explainer,
            askHr: def.askHr,
            quote,
            matchedPattern: pattern.source,
          });

          if (def.severity === 'scam') {
            scamFound = true;
          }

          break; // Avoid duplicate triggers for the same trap definition
        }
      }
    }
  }

  const totalPointsDeducted = detected.reduce((sum, t) => sum + (t.severity === 'scam' ? 0 : t.points), 0);

  return {
    traps: detected,
    scamDetected: scamFound,
    totalPointsDeducted,
  };
}
