# whatsforyou — Master Build Prompt

> Paste this entire prompt into your AI coding assistant (Cursor, Claude Code, Copilot, etc.).
> It is written to be model-agnostic: no provider-specific features, plain JSON in/out.

---

## 1. WHAT YOU'RE BUILDING

**whatsforyou** — a single-page web app for Indian freshers. The user uploads their job offer letter (PDF, photo, or pasted text) and gets:

1. Hidden trap detection (bonds, variable-pay tricks, probation cuts, notice asymmetry…)
2. Real monthly in-hand salary computed from the letter's own breakup
3. A plain-English summary of what they're signing
4. An Offer Score (0–100) with a shareable score card
5. "Ask HR this" negotiation questions

**Goal:** the user goes from upload to "I understand my offer" in under 60 seconds.
**Non-goal:** it is not a job board, not a resume tool, not a salary database.

---

## 2. TECH STACK (LOCKED — DO NOT SUBSTITUTE)

- **Next.js 14+ (App Router) + TypeScript + Tailwind CSS**
- **Backend = Next.js API routes only.** No separate server, no Render, no Express.
- **Deploy target:** Vercel (git push → auto-deploy).
- **PDF parsing:** `pdf-parse` (server-side).
- **Share cards:** `@vercel/og` (dynamic OG image route).
- **LLM access:** provider-agnostic adapter (see section 7). Must work unchanged with Gemini, Groq, OpenRouter, or OpenAI via env vars. No provider SDKs in business logic.
- **No database. No auth. No signup.** This is a hard requirement (privacy is a feature).

---

## 3. FILE STRUCTURE (CREATE EXACTLY THIS)

```
whatsforyou/
├── app/
│   ├── page.tsx                 # Landing + analyzer + results (single page)
│   ├── layout.tsx               # Fonts, metadata, OG tags
│   ├── globals.css              # Design tokens
│   ├── api/
│   │   ├── analyze/route.ts     # POST: { text } → full analysis JSON
│   │   └── og/route.tsx         # GET: dynamic share-card PNG (?score=&inhand=&traps=)
│   └── components/
│       ├── UploadZone.tsx       # Drag-drop / file / camera / paste-text input
│       ├── AnalyzingSteps.tsx   # Progress steps while analyzing
│       ├── ScoreReveal.tsx      # Animated 0–100 score + grade label
│       ├── TrapCard.tsx         # One trap: severity stamp, quote, explanation, HR question
│       ├── InHandBreakdown.tsx  # Monthly in-hand table + annual figure
│       ├── SummaryBullets.tsx   # "What you signed in 5 bullets"
│       ├── ShareCard.tsx        # Share buttons (X, LinkedIn, WhatsApp, copy link)
│       ├── PrivacyBadge.tsx     # "We don't save your data" strip
│       └── Faq.tsx              # 4-item accordion
├── lib/
│   ├── traps.ts                 # THE TRAP ENGINE (section 4) — patterns, weights, copy
│   ├── tax.ts                   # In-hand calculator, pure functions + unit tests
│   ├── llm.ts                   # Provider adapter (section 7)
│   ├── prompts.ts               # LLM prompt templates (section 8)
│   ├── redact.ts                # Client-side PII redaction (runs in browser)
│   ├── score.ts                 # 100 − deductions scoring + grade labels
│   └── sample.ts                # One realistic sample offer letter (for "Try a sample" button)
├── public/
│   └── favicon.svg
├── .env.example                 # LLM_PROVIDER, LLM_API_KEY, LLM_MODEL, LLM_BASE_URL
└── README.md
```

Build in this order: `lib/traps.ts` + `lib/tax.ts` → `app/api/analyze` → `UploadZone` → results components → `api/og` → landing polish. Confirm each stage works before moving on.

---

## 4. THE TRAP ENGINE (`lib/traps.ts`) — THE HEART OF THE APP

Implement as a **deterministic rules engine** (regex + keyword patterns), NOT pure LLM. Every trap has: `id`, `name`, `severity` (high/medium/low), `points` (score deduction), `patterns` (regex list), `explainer` (2 sentences, plain English), `askHr` (one question template).

Detect these 9 traps (+1 scam flag). Expand the pattern lists sensibly:

| # | Trap | Points | What to detect |
|---|------|--------|----------------|
| 1 | **Training bond** | −20 | Duration (1–2 yrs typical), penalty amount (₹75K–₹2L), whether prorated, exceptions if company terminates |
| 2 | **Probation salary cut** | −15 | Reduced % of CTC during probation (e.g. "70% during probation"), different benefits |
| 3 | **Joining bonus clawback** | −10 | Bonus "subject to recovery" if leaving within X months, interest on repayment |
| 4 | **Variable pay illusion** | −15 | % of CTC marked variable/PLI, payout conditions ("subject to KRA"), realistic payout note |
| 5 | **Notice period asymmetry** | −10 | Employee notice (30/60/90 days) vs company termination notice; buyout option presence |
| 6 | **Non-compete / garden leave** | −10 | Restrictions on joining competitors, garden-leave clause duration |
| 7 | **IP ownership grab** | −5 | "All work product vests in company" — flags risk to side projects/freelance |
| 8 | **No guaranteed increment** | −5 | "Increment, if any, at company's discretion" — nothing contractual |
| 9 | **Dispute/location clause** | −5 | Arbitration city far from employee, one-sided terms |
| S | **SCAM FLAG** (separate, red alert) | — | "Security deposit", "blank cheque", "registration fee" — these are illegal to demand in India. Show a hard warning, not a deduction. |

Each detected trap must surface **the exact quoted line** from the letter that triggered it. No quote = don't show the trap (no hallucinating traps).

---

## 5. IN-HAND CALCULATOR (`lib/tax.ts`)

Pure functions, with unit tests. Input: structured compensation (extracted by LLM, editable by user via small override fields). Output: monthly in-hand, annual in-hand, full breakdown table (Basic, HRA, Special Allowance, Variable (shown separately as "at risk"), PF employee 12% of Basic, gratuity, professional tax, income tax).

- Tax = **new regime, FY 2026-27**. ⚠️ VERIFY the slab rates against a current source at build time; keep slabs as a config constant so they can be updated in one place. (Reference structure: 0–4L nil, 4–8L 5%, 8–12L 10%, 12–16L 15%, 16–20L 20%, 20–24L 25%, >24L 30%, standard deduction ₹75,000, 87A rebate up to ₹12L taxable income — VERIFY.)
- Show **fixed monthly** and **variable separately** — never blend variable pay into the monthly figure. Label it "at risk".
- Joining bonus: show as one-time, excluded from monthly.

---

## 6. SCORING (`lib/score.ts`)

`score = max(0, 100 − Σ trap points)`. Grade labels:
- **80–100** "Clean offer" (green)
- **60–79** "Decent — verify the flags" (amber)
- **40–59** "Risky — negotiate first" (orange)
- **0–39** "Walk away carefully" (red)

Deterministic: same letter → same score, always.

---

## 7. LLM ADAPTER (`lib/llm.ts`) — PROVIDER-AGNOSTIC

```ts
// Single interface. Everything goes through this. No provider SDKs elsewhere.
export async function chatJson(system: string, user: string): Promise<any>
```

- Reads `LLM_PROVIDER` (`gemini` | `groq` | `openrouter` | `openai`), `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` from env.
- All providers called via **OpenAI-compatible `POST {baseUrl}/chat/completions`** with `{ model, messages, response_format: { type: "json_object" } }`. (Gemini via its OpenAI-compatible endpoint.)
- Retry once on failure; on second failure, fall back to a secondary provider if `LLM_FALLBACK_*` env is set.
- The LLM is used for **three tasks only**: (a) extract compensation as JSON, (b) 5-bullet plain-English summary, (c) HR questions. Trap *detection* stays in the rules engine (section 4).
- One LLM call per analysis (combine a+b+c in a single prompt). Cache results by SHA-256 of the redacted text (in-memory Map is fine for MVP).

---

## 8. LLM PROMPT TEMPLATES (`lib/prompts.ts`)

System prompt (model-agnostic, no tool calls, JSON-only output):

```
You are an offer-letter analyst for Indian freshers. Read the offer letter text.
Return ONLY valid JSON (no markdown, no commentary) with this exact schema:
{
  "compensation": { "basic_annual": number|null, "hra_annual": number|null,
    "special_allowance_annual": number|null, "variable_annual": number|null,
    "variable_conditions": string|null, "joining_bonus": number|null,
    "joining_bonus_conditions": string|null, "gratuity_included": boolean,
    "notice_period_days_employee": number|null, "notice_period_days_company": number|null,
    "probation_months": number|null, "bond_months": number|null, "bond_penalty_inr": number|null },
  "summary_bullets": [string x5],
  "hr_questions": [string x3]
}
Rules: numbers in INR per annum; null when not stated — never guess.
summary_bullets: plain English, max 15 words each, no jargon.
hr_questions: specific to THIS letter's weak points, polite, one sentence each.
```

---

## 9. PAGE SPEC — SINGLE PAGE, MINIMAL, FULL-WIDTH

One page (`app/page.tsx`), top to bottom. **Nothing on the page that isn't earning its place.**

1. **Header (slim):** logo "whatsforyou" + one link "How it works" (anchor). No nav clutter.
2. **Hero:** one headline — "Know what you're actually signing." One subline — "Upload your offer letter. See the hidden traps, your real in-hand salary, and what to negotiate. Free." Then the **UploadZone front and center** (drag-drop PDF / take photo / paste text / "Try a sample" button).
3. **PrivacyBadge strip** directly under upload: "🔒 Your letter is redacted in your browser and never stored. We couldn't sell your data if we wanted to."
4. **AnalyzingSteps** (only visible during analysis): "Reading your letter… → Checking 9 trap patterns… → Computing real in-hand… → Writing your summary…" with a progress feel. Then smooth-scroll to results.
5. **Results** (appear after analysis):
   - ScoreReveal: big animated number + grade label + one-line verdict.
   - Two-column on desktop (stacked on mobile): left = TrapCards (expandable; each shows severity stamp, exact quote, explainer, "ask HR" line); right = InHandBreakdown table + SummaryBullets.
   - "Ask HR this" list.
   - ShareCard: buttons for X / LinkedIn / WhatsApp / copy link (uses `/api/og` image).
   - "Analyze another offer" reset button.
6. **How it works:** 3 steps, one line each (Upload → We check 9 traps + compute in-hand → You negotiate smarter).
7. **FAQ (4 items, accordion):** Is my data saved? (No.) Is this legal advice? (No — first-pass check, talk to a professional for big decisions.) Which offers does it work for? (Indian fresher/full-time offers.) What if my letter is a photo? (We read it.)
8. **Footer:** one line — "whatsforyou is an informational tool, not legal advice." + privacy line.

---

## 10. DESIGN SYSTEM — DISTINCTIVE, NOT GENERIC AI SLOP

**Aesthetic direction: "editorial document."** Think a beautifully designed legal explainer — warm paper, ink text, rubber-stamp accents for traps. It should feel like a smart friend marking up your offer letter with a red pen. Absolutely **no** purple/blue gradients, no glassmorphism, no generic SaaS hero.

- **Colors:** paper `#FAF8F3` (bg), ink `#1B1710` (text), stamp red `#C2402A` (traps/high severity), deep green `#1E6B4A` (clean/good), amber `#B7791F` (warnings), stone gray `#6B655A` (secondary text). Severity stamps look like actual rubber stamps (bordered, slightly rotated, uppercase, letter-spaced).
- **Typography:** serif display for headlines (use "Newsreader" from Google Fonts, Georgia fallback); Inter/system sans for body; monospace for quoted letter lines and figures.
- **Layout:** full-width, `max-w-7xl`, generous whitespace. Upload zone is large and inviting (dashed ink border, big icon). Results in clean cards with subtle borders — flat, no heavy shadows.
- **Motion (purposeful only):** drag-over state on upload; analyzing steps sequence; count-up animation on the score; trap cards expand on tap to reveal the quote. No decorative animation.
- **Responsive:** mobile-first. Upload from phone camera must work. Trap cards stack vertically. Tables become simple stacked rows on small screens. Test at 360px width.

---

## 11. PRIVACY & SAFETY (HARD REQUIREMENTS)

- `lib/redact.ts` runs **in the browser** before upload: strips emails, phone numbers, addresses, names (regex-based; keep it fast and simple).
- Server: process the text in memory, **never write it to disk, never log it**, return the analysis, forget it.
- UI copy must state: "We don't save your letter, your name, or your results."
- Every results view + footer carries: "Informational tool, not legal advice."
- File limit 10MB; reject non-PDF/non-image with a clear message.

---

## 12. ACCEPTANCE CRITERIA (DONE = ALL TRUE)

- [ ] Upload a real offer-letter PDF → 9-trap scan runs, each shown trap displays its exact quote
- [ ] In-hand math verified against a hand-computed sample (write one unit test with known figures)
- [ ] Score is deterministic (same input twice → same score)
- [ ] `/api/og?score=58` returns a correct PNG card
- [ ] Swap `LLM_PROVIDER` env (gemini→groq) with no code change; analysis still works
- [ ] Page is clean at 360px mobile width; no horizontal scroll
- [ ] No document text is persisted anywhere (verify: no DB, no file writes, no logs of content)
- [ ] "Try a sample" works end-to-end with zero upload

---

Build it. Start with `lib/traps.ts` and `lib/tax.ts` plus their tests, then the API route, then the UI.
