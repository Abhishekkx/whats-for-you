import test from 'node:test';
import assert from 'node:assert/strict';
import { detectTraps } from '../lib/traps.ts';
import { calculateScore } from '../lib/score.ts';
import { calculateInHand } from '../lib/tax.ts';
import { redactPII } from '../lib/redact';
import { SAMPLE_OFFER_LETTER } from '../lib/sample.ts';

test('End-to-End Sample Offer Letter Audit', () => {
  // 1. Browser PII Redaction
  const { redactedText, itemsRedactedCount } = redactPII(SAMPLE_OFFER_LETTER.rawText);
  assert.ok(itemsRedactedCount >= 2, 'PII items (email/phone/name) must be redacted');
  assert.ok(!redactedText.includes('rahul.sharma@example.com'), 'Email must be masked');
  assert.ok(!redactedText.includes('98765 43210'), 'Phone must be masked');

  // 2. Trap detection
  const { traps, scamDetected, totalPointsDeducted } = detectTraps(redactedText);
  assert.equal(scamDetected, false, 'Sample letter is not an illegal fee scam');
  assert.ok(traps.length >= 6, `Should detect at least 6 traps in sample, detected: ${traps.length}`);

  // Check specific traps
  const trapIds = traps.map((t) => t.id);
  assert.ok(trapIds.includes('training_bond'), 'Must detect 24-month training bond');
  assert.ok(trapIds.includes('bonus_clawback'), 'Must detect joining bonus clawback');
  assert.ok(trapIds.includes('probation_cut'), 'Must detect probation stipend / salary cut');
  assert.ok(trapIds.includes('variable_pay'), 'Must detect variable pay risk');
  assert.ok(trapIds.includes('notice_asymmetry'), 'Must detect 90-day notice period');
  assert.ok(trapIds.includes('ip_ownership'), 'Must detect IP ownership grab');
  assert.ok(trapIds.includes('non_compete'), 'Must detect non-compete covenant');

  // Check that every trap has a non-empty, genuine quote
  for (const trap of traps) {
    assert.ok(trap.quote && trap.quote.length > 5, `Trap ${trap.id} must include exact quote`);
  }

  // 3. Score determination
  const scoreResult = calculateScore(totalPointsDeducted, scamDetected);
  assert.ok(scoreResult.score >= 0 && scoreResult.score <= 100);
  assert.ok(scoreResult.grade.length > 0);

  // 4. In-Hand Calculation with sample figures (CTC: 8,50,000; Basic: 3,60,000; HRA: 1,80,000; Special: 1,60,000; Variable: 1,50,000)
  const inHandResult = calculateInHand({
    basic_annual: 360000,
    hra_annual: 180000,
    special_allowance_annual: 160000,
    variable_annual: 150000,
    joining_bonus: 50000,
    gratuity_included: false,
  });

  // Fixed Gross = 7,00,000
  assert.equal(inHandResult.fixedGrossAnnual, 700000);
  assert.equal(inHandResult.variableAnnual, 150000);

  // PF = 12% of 3,60,000 = 43,200 (₹3,600/month)
  assert.equal(inHandResult.annualPfEmployee, 43200);
  assert.equal(inHandResult.monthlyPfEmployee, 3600);

  // PT = 2,400 (₹200/month)
  assert.equal(inHandResult.annualProfessionalTax, 2400);
  assert.equal(inHandResult.monthlyProfessionalTax, 200);

  // Taxable = 7,00,000 - 75,000 = 6,25,000. Under 12L rebate -> 0 tax.
  assert.equal(inHandResult.annualTotalTax, 0);

  // Net Annual Fixed In-Hand = 7,00,000 - 43,200 - 2,400 = 6,54,400
  assert.equal(inHandResult.annualInHandFixed, 654400);

  // Monthly Fixed In-Hand = 58,333 - 3,600 - 200 = 54,533
  assert.equal(inHandResult.monthlyInHandFixed, 54533);
});
