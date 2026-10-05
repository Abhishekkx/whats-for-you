'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Is my offer letter data or personal info saved?',
    answer:
      'No. Your letter is redacted directly inside your web browser before it leaves your device, stripping names, emails, phone numbers, and addresses. On the server, text is processed strictly in temporary volatile memory and never persisted to any database, file system, or logging service. We have no user accounts or database.',
  },
  {
    question: 'Is whatsforyou legal advice?',
    answer:
      'No. whatsforyou is an automated informational analysis tool designed to help freshers spot common one-sided clauses and calculate real take-home pay. It is not legal counsel. For high-stakes disputes or unique legal obligations, consult a qualified labor advocate.',
  },
  {
    question: 'Which job offers does this analyzer support?',
    answer:
      'It is specifically calibrated for Indian campus placements, off-campus fresher hires, and junior/mid-level corporate offers. The tax calculations follow the Indian New Tax Regime (FY 2026-27), including EPF, Professional Tax, and Section 87A rebate rules.',
  },
  {
    question: 'What if my offer letter is a scanned image or photo?',
    answer:
      'You can upload photos/scans directly or easily copy-paste the text content into the "Paste Letter Text" tab. Our system automatically parses the compensation breakdown tables and contractual clauses.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-16">
      <div className="text-center mb-8">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">
          Frequently Asked Questions
        </h3>
        <p className="text-sm text-ink-muted">
          Clear answers about privacy, accuracy, and Indian labor contract terms.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-paper-border bg-paper-card rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-base sm:text-lg text-ink select-none hover:text-stamp-red transition-colors"
              >
                <span>{item.question}</span>
                <span className="p-1 rounded bg-paper border border-paper-border text-ink-muted flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-sm text-ink-muted leading-relaxed border-t border-paper-border/60 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
