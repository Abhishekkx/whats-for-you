import { NextRequest, NextResponse } from 'next/server';
import { detectTraps } from '@/lib/traps';
import { calculateInHand, CompensationInput } from '@/lib/tax';
import { calculateScore } from '@/lib/score';
import { redactPII } from '@/lib/redact';
import { chatJson } from '@/lib/llm';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import { getPrimaryConfig } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max timeout for Vercel/serverless

function normalizeFigureText(text: string): string {
  return text.toLocaleLowerCase().replace(/\u20b9|\brs\.?/gi, '').replace(/[\s,]/g, '');
}

function digitSequences(text: string): string[] {
  return normalizeFigureText(text).match(/\d+/g) || [];
}

function isGroundedFigure(letter: string, quote: unknown, value: number): boolean {
  if (typeof quote !== 'string' || !quote.trim()) return false;
  const digits = String(Math.round(value));
  if (!digitSequences(quote).includes(digits)) return false;
  if (digitSequences(letter).includes(digits)) return true;
  const payKeyword = /month(?:ly)?|stipend|salary|annum|annual|ctc/i;
  const numberPattern = /\d(?:[\d,\s]{0,8}\d)?/g;
  let match: RegExpExecArray | null;
  while ((match = numberPattern.exec(letter)) !== null) {
    if (match[0].replace(/\D/g, '') !== digits) continue;
    const start = match.index ?? 0;
    const nearbyText = letter.slice(Math.max(0, start - 120), Math.min(letter.length, start + match[0].length + 120));
    if (payKeyword.test(nearbyText)) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    let offerText = '';
    const contentType = req.headers.get('content-type') || '';
    // Buffer is extracted early so it's available for vision fallback later
    let buffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textParam = formData.get('text') as string | null;

      if (file && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'File exceeds maximum 10MB limit.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          // Step 1: Try pdf-parse for selectable text
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            offerText = pdfData.text || '';
          } catch {
            // pdf-parse failed â†’ scanned/broke PDF â†’ fall through to vision fallback
            console.warn('[whatsforyou] pdf-parse failed, trying vision fallback');
            offerText = '';
          }
        } else if (file.type.startsWith('image/')) {
          // Image files â€” no direct processing, fall to vision fallback below
          offerText = '';
        } else if (file.type.startsWith('text/')) {
          offerText = buffer.toString('utf-8');
        } else {
          return NextResponse.json(
            { error: 'Unsupported file format. Please upload a PDF or paste offer letter text.' },
            { status: 400 }
          );
        }
      } else if (textParam) {
        offerText = textParam;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      offerText = body.text || '';
    }

    // Step 2: If not enough text from pdf-parse, try vision fallback (Gemini Flash reads PDFs natively)
    // Only attempt vision when we have a PDF buffer (file upload), not when pasting text
    const hasBuffer = typeof buffer !== 'undefined' && buffer !== null;
    if (!offerText || offerText.trim().length < 200) {
      try {
        const primary = getPrimaryConfig();
        if (primary.apiKey && hasBuffer) {
          // Vision fallback: send PDF to Gemini Flash for text extraction
          // Native Gemini API endpoint (strip /openai suffix from OpenAI-compatible base)
          const nativeBaseUrl = primary.baseUrl.replace(/\/openai$/, '');
          const visionEndpoint = `${nativeBaseUrl}/models/${primary.model}:generateContent?key=${primary.apiKey}`;

          const visionResponse = await fetch(visionEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: 'Transcribe all text in this document, preserving order. Return plain text only. Do not include any analysis, commentary, or formatting. If the document is a scanned image, do your best to extract the text.',
                    },
                    {
                      inlineData: {
                        mimeType: 'application/pdf',
                        data: buffer!.toString('base64'),
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.0,
                maxOutputTokens: 4096,
              },
            }),
          });

          if (visionResponse.ok) {
            const visionData = await visionResponse.json();
            const text =
              visionData?.candidates?.[0]?.content?.parts?.[0]?.text ||
              '';
            if (text && text.trim().length >= 200) {
              offerText = text;
              console.log('[whatsforyou] Vision fallback succeeded');
            }
          } else {
            console.warn('[whatsforyou] Vision fallback failed');
          }
        } else {
          console.warn('[whatsforyou] No LLM API key configured, skipping vision fallback');
        }
      } catch (visionError) {
        console.warn('[whatsforyou] Vision fallback error');
      }
    }

    // Step 3: Final text validation
    if (!offerText || offerText.trim().length < 20) {
      // Password-protected PDF detection: if pdf-parse failed AND vision was skipped or failed,
      // give a specific message rather than generic
      const isLikelyPasswordProtected =
        // We can't definitively detect password protection without pdf-parse,
        // but if we get here with no text and the user uploaded a PDF, it's a strong hint
        false; // Placeholder - in a more advanced setup, we could check pdf-parse error type

      let errorMsg = 'This PDF appears to be an image (scan) and cannot be text-extracted. ';
      errorMsg +=
        'Please paste the offer letter text below, or use an OCR tool to convert it to a searchable PDF first.';

      if (isLikelyPasswordProtected) {
        errorMsg = 'This PDF is password-protected. Please remove the password and re-upload the file.';
      }

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Step 4: Proceed with analysis ONLY if we have real text
    // Note: If offerText is still empty here, the user configured no LLM key and
    // vision fallback was skipped. In that case we still proceed with deterministic
    // engine only, but must NOT show fabricated sample data.

    // 1. Client-safe / Server PII Redaction
    const { redactedText, itemsRedactedCount } = redactPII(offerText);

    // 2. Deterministic Trap Engine Scan (Section 4)
    const { traps, scamDetected, totalPointsDeducted } = detectTraps(redactedText);

    // 3. Deterministic Score Calculation (Section 6)
    const scoreGrade = calculateScore(totalPointsDeducted, scamDetected);

    // 4. LLM Extraction for structured compensation, summary, and HR negotiation queries
    let llmResponse: any = null;
    let aiSummaryAvailable = false;

    // Check if we should attempt LLM calls
    const primary = getPrimaryConfig();
    const hasLlmKey = primary.apiKey && offerText && offerText.trim().length >= 20;

    if (hasLlmKey) {
      try {
        llmResponse = await chatJson(SYSTEM_PROMPT, buildUserPrompt(redactedText));
        aiSummaryAvailable = true;
      } catch (llmError) {
        console.warn('[whatsforyou] LLM call failed, falling back to deterministic engine only');
        // LLM failure is non-fatal â€” continue with deterministic results only
      }
    } else if (!hasLlmKey && primary.apiKey === '') {
      // No API key configured â€” run deterministic engine only, clearly label it
      console.log('[whatsforyou] No LLM API key â€” running deterministic analysis only');
      // llmResponse stays null, aiSummaryAvailable stays false
    }

    // Accept numeric extractions only when the evidence number appears in the letter and is grounded nearby.
    const extractedCompensation = llmResponse?.compensation ?? {};
    const evidence = llmResponse?.evidence ?? {};
    const groundingDroppedFields: string[] = [];
    const groundedCompensation = Object.fromEntries(
      Object.entries(extractedCompensation).map(([field, value]) => {
        if (typeof value !== 'number') return [field, value];
        const quote = evidence[field];
        const grounded = isGroundedFigure(redactedText, quote, value);
        if (!grounded) groundingDroppedFields.push(field);
        return [field, grounded ? value : null];
      })
    ) as Record<string, any>;
    const compensationFound = llmResponse?.compensation_found === true &&
      Object.entries(groundedCompensation).some(([field, value]) => typeof value === 'number' && field !== 'notice_period_days_employee' && field !== 'notice_period_days_company' && field !== 'probation_months' && field !== 'bond_months');
    const detectedInternship = /intern|stipend|trainee/i.test(offerText);
    const employmentType = detectedInternship ? 'internship' :
      (['internship', 'fulltime', 'contract'].includes(llmResponse?.employment_type) ? llmResponse.employment_type : null);

    // Build compensation only from grounded values.
    const compensation: CompensationInput = {
      employment_type: employmentType,
      compensation_found: compensationFound,
      stipend_monthly: groundedCompensation.stipend_monthly ?? null,
      pay_frequency: groundedCompensation.pay_frequency ?? null,
      basic_annual: groundedCompensation.basic_annual ?? null,
      hra_annual: groundedCompensation.hra_annual ?? null,
      special_allowance_annual: groundedCompensation.special_allowance_annual ?? null,
      variable_annual: groundedCompensation.variable_annual ?? null,
      variable_conditions: groundedCompensation.variable_conditions ?? null,
      joining_bonus: groundedCompensation.joining_bonus ?? null,
      joining_bonus_conditions: groundedCompensation.joining_bonus_conditions ?? null,
      gratuity_included: Boolean(groundedCompensation.gratuity_included),
      other_allowances_annual: 0,
    };

    // 5. In-Hand Salary Calculation (Section 5)
    const inHandResult = calculateInHand(compensation);

    // 6. Merge & deduplicate HR questions (prioritizing detected trap questions)
    const trapHrQuestions = traps.map((t) => t.askHr).filter(Boolean);
    const llmHrQuestions = Array.isArray(llmResponse?.hr_questions) ? llmResponse.hr_questions : [];
    const combinedQuestions = Array.from(new Set([...trapHrQuestions, ...llmHrQuestions])).slice(0, 5);

    // 7. Summary Bullets
    const summaryBullets = Array.from(new Set([
      ...traps.map((trap) => trap.quote ? `Fact from letter (${trap.name}): ${trap.quote}` : ''),
      ...Object.entries(groundedCompensation)
        .filter(([field, value]) => typeof value === 'number' && ['stipend_monthly', 'basic_annual', 'hra_annual', 'special_allowance_annual', 'variable_annual', 'joining_bonus'].includes(field))
        .map(([field]) => typeof evidence[field] === 'string' ? `Compensation: ${evidence[field]}` : ''),
    ].filter(Boolean))).slice(0, 5);
    // Determine if we should mark results as "partial analysis"
    const aiUnavailable = !aiSummaryAvailable;

    const response: Record<string, any> = {
      success: true,
      score: scoreGrade.score,
      grade: scoreGrade.grade,
      verdict: scoreGrade.verdict,
      badge: scoreGrade.badge,
      color: scoreGrade.color,
      scamDetected,
      traps,
      totalPointsDeducted,
      compensation,
      inHand: inHandResult,
      summaryBullets,
      hrQuestions: combinedQuestions,
      metadata: {
        piiRedactedCount: itemsRedactedCount,
        characterCount: redactedText.length,
        analyzedAt: new Date().toISOString(),
        // NEW: flag whether AI summary is available
        aiSummaryAvailable: aiUnavailable ? false : true,
      },
      // NEW: transparency flag
      analysisMode: aiUnavailable ? 'deterministic-only' : 'ai-enhanced',
    };
    if (new URL(req.url).searchParams.get('debug') === '1') {
      response.debug = { rawExtraction: llmResponse, groundingDroppedFields };
    }
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('[whatsforyou] Error in /api/analyze');
    return NextResponse.json(
      { error: err.message || 'An error occurred while analyzing the offer letter.' },
      { status: 500 }
    );
  }
}
