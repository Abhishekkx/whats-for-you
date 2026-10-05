# whatsforyou

> **Know what you're actually signing.** An instant, private offer-letter auditor built for Indian freshers.

---

## 🌟 Overview

**whatsforyou** allows freshers to upload their job offer letter (PDF, photo scan, or pasted text) and within seconds receives:

1. **Hidden Trap Detection**: Scans 9 specific contractual traps (training bonds, probation salary cuts, joining bonus clawbacks, variable pay illusion, notice period asymmetry, non-compete covenants, IP grabs, discretionary increments, and distant jurisdiction clauses) plus illegal scam demands. Every detected trap quotes the exact line from the letter.
2. **Real Monthly In-Hand Salary**: Deterministic computation under the **Indian New Tax Regime (FY 2026-27)**, including Section 87A rebate, standard deduction (₹75,000), Employee PF (12% of Basic), and Professional Tax. Variable pay is flagged as "at risk" and never blended into fixed take-home.
3. **5-Bullet Plain-English Summary**: What you're actually signing without corporate jargon.
4. **Offer Health Score (0–100)**: Deterministic scoring with rubber-stamp grade labels.
5. **"Ask HR This" Negotiation Prompts**: Sharp, polite questions to clarify or negotiate weak points.
6. **Shareable Score Card**: Dynamic OG image generated on the fly via `/api/og`.
7. **100% Ephemeral Privacy**: Browser-based PII redaction (names, emails, phones, PAN, Aadhaar) before upload. Zero database, zero document persistence, zero logs.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS (Custom "Editorial Document" Paper & Ink design tokens)
- **PDF Extraction**: `pdf-parse` (Server-side, in-memory)
- **Share Cards**: `@vercel/og` / Next.js ImageResponse (`/api/og`)
- **LLM Adapter**: Provider-agnostic adapter (`lib/llm.ts`) supporting Gemini, Groq, OpenRouter, and OpenAI via standard OpenAI-compatible endpoints with auto-retry and fallbacks.

---

## 🚀 Quickstart

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Example configuration:

```env
# Primary LLM provider: gemini | groq | openrouter | openai
LLM_PROVIDER=gemini
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-2.5-flash
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai

# Optional Fallback Provider
LLM_FALLBACK_PROVIDER=groq
LLM_FALLBACK_API_KEY=your_groq_key_here
LLM_FALLBACK_MODEL=llama-3.3-70b-versatile
LLM_FALLBACK_BASE_URL=https://api.groq.com/openai/v1
```

### 3. Run Unit Tests

```bash
npm test
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Acceptance Criteria Checklist

- [x] Upload offer-letter PDF / paste text → 9-trap scan runs, each shown trap displays exact quote
- [x] In-hand math verified against hand-computed FY 26-27 sample with unit tests
- [x] Score is deterministic (`100 − Σ trap points`)
- [x] `/api/og?score=78&grade=Decent+Offer&inhand=₹42,000&traps=2` returns dynamic PNG card
- [x] Swappable `LLM_PROVIDER` (Gemini, Groq, OpenRouter, OpenAI) with zero code changes
- [x] Responsive down to 360px mobile viewport without horizontal scroll
- [x] Zero persistence (in-memory processing only, client-side PII redaction)
- [x] "Try a sample" works end-to-end with zero upload

---

## 📄 License & Disclaimer

`whatsforyou` is an informational analysis tool, not formal legal counsel. For high-stakes disputes, consult a licensed labor law advocate.
