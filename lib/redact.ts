/**
 * Client-Side PII Redaction
 * Runs inside the user's browser before the text leaves their machine.
 */

export interface RedactionResult {
  redactedText: string;
  itemsRedactedCount: number;
}

export function redactPII(text: string): RedactionResult {
  if (!text) return { redactedText: '', itemsRedactedCount: 0 };

  let count = 0;
  let result = text;

  // 1. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  result = result.replace(emailRegex, () => {
    count++;
    return '[REDACTED_EMAIL]';
  });

  // 2. Phone numbers (Indian formats: +91..., 10 digits starting with 6,7,8,9, with spaces/dashes)
  const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  result = result.replace(phoneRegex, (match) => {
    // avoid replacing standard monetary figures or dates like 2026-2027
    if (match.includes('-') && match.length <= 9 && !match.startsWith('+')) {
      return match;
    }
    count++;
    return '[REDACTED_PHONE]';
  });

  // 3. Indian PAN Numbers (5 letters, 4 digits, 1 letter)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
  result = result.replace(panRegex, () => {
    count++;
    return '[REDACTED_PAN]';
  });

  // 4. Aadhaar Numbers (12 digits, spaced or contiguous)
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g;
  result = result.replace(aadhaarRegex, (match) => {
    // Avoid replacing salary amounts like 1200000 (7 digits)
    if (match.replace(/\s/g, '').length === 12) {
      count++;
      return '[REDACTED_AADHAAR]';
    }
    return match;
  });

  // 5. Candidate Greeting / Name redaction: e.g. "Dear Alex Kumar," -> "Dear [Candidate],"
  const greetingRegex = /\b(Dear|To|Name\s*:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g;
  result = result.replace(greetingRegex, (_match, prefix) => {
    count++;
    return `${prefix} [CANDIDATE_NAME]`;
  });

  // 6. Postal Pincodes (6 digits in Indian address contexts)
  const pinRegex = /\b(?:Pin|Pincode|Pin\s*Code|Postal\s*Code)\s*[:=-]?\s*(\d{6})\b/gi;
  result = result.replace(pinRegex, () => {
    count++;
    return 'Pin: [REDACTED_PIN]';
  });

  return {
    redactedText: result,
    itemsRedactedCount: count,
  };
}
