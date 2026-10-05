import crypto from 'crypto';

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const cache = new Map<string, any>();

function getProviderDefaults(provider: string): { baseUrl: string; model: string } {
  const p = (provider || '').toLowerCase();
  switch (p) {
    case 'gemini':
      return {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-3.8-flash',
      };
    case 'groq':
      return {
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'llama-3.3-70b-versatile',
      };
    case 'openrouter':
      return {
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'google/gemini-2.0-flash-001',
      };
    case 'openai':
    default:
      return {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      };
  }
}

export function getPrimaryConfig(): LLMConfig {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  const defaults = getProviderDefaults(provider);
  return {
    provider,
    apiKey: process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '',
    model: process.env.LLM_MODEL || defaults.model,
    baseUrl: (process.env.LLM_BASE_URL || defaults.baseUrl).replace(/\/$/, ''),
  };
}

function getFallbackConfig(): LLMConfig | null {
  const provider = process.env.LLM_FALLBACK_PROVIDER;
  const apiKey = process.env.LLM_FALLBACK_API_KEY;
  if (!provider || !apiKey) return null;

  const defaults = getProviderDefaults(provider);
  return {
    provider,
    apiKey,
    model: process.env.LLM_FALLBACK_MODEL || defaults.model,
    baseUrl: (process.env.LLM_FALLBACK_BASE_URL || defaults.baseUrl).replace(/\/$/, ''),
  };
}

async function callOpenAICompatible(config: LLMConfig, system: string, user: string): Promise<any> {
  const endpoint = `${config.baseUrl}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM call to ${config.provider} (${endpoint}) failed with status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('LLM returned an empty response');
  }

  // Handle potential markdown backticks inside json string
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(cleaned);
}

/**
 * Universal model-agnostic chatJson function.
 * Features:
 * - Caches by SHA-256 of text
 * - Auto-retries once on failure
 * - Falls back to LLM_FALLBACK_* if configured
 * - Provides graceful fallback if no API key is supplied in dev/offline mode
 */
export async function chatJson(system: string, user: string): Promise<any> {
  const hash = crypto.createHash('sha256').update(system + '::' + user).digest('hex');
  if (cache.has(hash)) {
    return cache.get(hash);
  }

  const primary = getPrimaryConfig();

  // If no API key is set, fallback to heuristic extraction to prevent hard crash in local preview
  if (!primary.apiKey) {
    console.warn('[whatsforyou] No LLM_API_KEY configured. Using heuristic parsing fallback.');
    return fallbackHeuristicExtraction(user);
  }

  // 1st attempt: Primary config
  try {
    const result = await callOpenAICompatible(primary, system, user);
    cache.set(hash, result);
    return result;
  } catch (primaryErr1) {
    console.warn(`[whatsforyou] Primary LLM 1st attempt failed:`, primaryErr1);

    // 2nd attempt: Retry primary once
    try {
      const result = await callOpenAICompatible(primary, system, user);
      cache.set(hash, result);
      return result;
    } catch (primaryErr2) {
      console.warn(`[whatsforyou] Primary LLM retry failed:`, primaryErr2);

      // Fallback provider attempt
      const fallback = getFallbackConfig();
      if (fallback) {
        try {
          const result = await callOpenAICompatible(fallback, system, user);
          cache.set(hash, result);
          return result;
        } catch (fallbackErr) {
          console.error(`[whatsforyou] Fallback LLM failed:`, fallbackErr);
        }
      }

      // If all LLM calls fail, return heuristic extraction rather than blocking user
      console.warn('[whatsforyou] Falling back to heuristic text extractor.');
      return fallbackHeuristicExtraction(user);
    }
  }
}

/**
 * Fallback heuristic extractor when LLM key is absent or unreachable
 */
function fallbackHeuristicExtraction(userText: string): any {
  const letter = userText.split('---').slice(1, -1).join('---').toLowerCase();
  return {
    employment_type: /intern|stipend|trainee/.test(letter) ? 'internship' : null,
    compensation_found: false,
    evidence: {},
    compensation: {
      basic_annual: null,
      hra_annual: null,
      special_allowance_annual: null,
      variable_annual: null,
      variable_conditions: null,
      joining_bonus: null,
      joining_bonus_conditions: null,
      stipend_monthly: null,
      pay_frequency: null,
      gratuity_included: false,
      notice_period_days_employee: null,
      notice_period_days_company: null,
      probation_months: null,
      bond_months: null,
      bond_penalty_inr: null,
    },
    summary_bullets: [],
    hr_questions: [
      'Is the service agreement bond prorated based on months served before resignation?',
      'Can the 90-day notice period be bought out if leaving for higher studies or another role?',
      'What was the actual variable pay payout percentage across this team last year?',
    ],
  };
}
