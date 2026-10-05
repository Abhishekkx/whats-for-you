import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateInHand, calculateNewRegimeTax } from '../lib/tax.ts';
import { detectTraps, TRAP_DEFINITIONS } from '../lib/traps.ts';

test('Tax calculation: New Regime FY 2026-27 with 87A rebate under 12L', () => {
  // Taxable income = 8,00,000 (Gross 8,75,000 - 75,000 standard deduction)
  // Under New Regime: 0-4L = 0, 4-8L = 5% of 4L = 20,000.
  // Since 8L <= 12L, 87A rebate applies -> total tax = 0
  const result = calculateNewRegimeTax(800000);
  assert.equal(result.grossTax, 20000);
  assert.equal(result.rebate, 20000);
  assert.equal(result.totalTax, 0);
});

test('Tax calculation: New Regime above 12L threshold', () => {
  // Taxable income = 15,00,000
  // 0-4L = 0
  // 4-8L = 20,000 (5%)
  // 8-12L = 40,000 (10%)
  // 12-15L = 45,000 (15% of 3L)
  // Gross tax = 105,000. No rebate. Cess 4% = 4,200. Total = 109,200.
  const result = calculateNewRegimeTax(1500000);
  assert.equal(result.grossTax, 105000);
  assert.equal(result.rebate, 0);
  assert.equal(result.cess, 4200);
  assert.equal(result.totalTax, 109200);
});

test('In-hand salary breakdown calculation for typical fresher package (6 LPA)', () => {
  const input = {
    basic_annual: 240000,
    hra_annual: 120000,
    special_allowance_annual: 140000,
    variable_annual: 100000,
    joining_bonus: 0,
    gratuity_included: false,
  };

  const res = calculateInHand(input);

  // CTC = 6,00,000
  assert.equal(res.totalCtc, 600000);
  assert.equal(res.fixedGrossAnnual, 500000);
  assert.equal(res.variableAnnual, 100000);

  // PF = 12% of 2,40,000 = 28,800 annual -> 2,400 monthly
  assert.equal(res.annualPfEmployee, 28800);
  assert.equal(res.monthlyPfEmployee, 2400);

  // PT = 2,400 annual -> 200 monthly
  assert.equal(res.annualProfessionalTax, 2400);
  assert.equal(res.monthlyProfessionalTax, 200);

  // Taxable = 500,000 - 75,000 = 425,000. Tax under 12L rebate = 0.
  assert.equal(res.annualTotalTax, 0);

  // Annual in-hand = 500,000 - 28,800 - 2,400 = 468,800
  assert.equal(res.annualInHandFixed, 468800);

  // Monthly fixed gross = 500,000 / 12 = 41,667
  // Monthly in-hand = 41,667 - 2,400 - 200 = 39,067
  assert.equal(res.monthlyInHandFixed, 39067);
});

test('Trap engine detects training bond with exact quote', () => {
  const sampleText = `
    Dear Alex,
    We are pleased to offer you the position of Software Engineer.
    Service Agreement: You are required to serve a minimum period of 2 years from your date of joining, failing which you will be liable to pay liquidated damages of INR 1,50,000 towards training costs.
    Your annual CTC will be INR 7,00,000.
  `;

  const { traps, totalPointsDeducted } = detectTraps(sampleText);
  const bondTrap = traps.find(t => t.id === 'training_bond');

  assert.ok(bondTrap, 'Training bond trap should be detected');
  assert.equal(bondTrap?.points, 20);
  assert.ok(bondTrap?.quote.includes('liquidated damages of INR 1,50,000'), 'Quote must contain exact text');
  assert.equal(totalPointsDeducted, 20);
});

test('Trap engine detects scam fee demand', () => {
  const scamText = `
    Please deposit a refundable security deposit of Rs. 15,000 before onboarding for laptop processing.
  `;

  const { traps, scamDetected } = detectTraps(scamText);
  assert.ok(scamDetected, 'Scam alert should trigger');
  const scamTrap = traps.find(t => t.id === 'scam_alert');
  assert.ok(scamTrap);
});
