/**
 * Tax & In-Hand Salary Calculator for Indian Freshers
 * New Tax Regime (FY 2026-27)
 */

export interface CompensationInput {
  employment_type?: 'internship' | 'fulltime' | 'contract' | null;
  compensation_found?: boolean;
  stipend_monthly?: number | null;
  pay_frequency?: 'monthly' | 'annual' | null;
  basic_annual: number | null;
  hra_annual: number | null;
  special_allowance_annual: number | null;
  variable_annual: number | null;
  variable_conditions?: string | null;
  joining_bonus?: number | null;
  joining_bonus_conditions?: string | null;
  gratuity_included?: boolean;
  other_allowances_annual?: number | null;
  custom_fixed_annual?: number | null;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

// Configurable New Tax Regime slabs (FY 2026-27)
export const NEW_TAX_REGIME_SLABS: TaxSlab[] = [
  { min: 0, max: 400000, rate: 0.0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.3 },
];

export const STANDARD_DEDUCTION = 75000;
export const REBATE_87A_LIMIT = 1200000; // Zero tax if taxable income <= 12L
export const CESS_RATE = 0.04;
export const ANNUAL_PROFESSIONAL_TAX = 2400; // ~₹200/month standard
export const PF_RATE = 0.12; // 12% of Basic salary

export interface InHandResult {
  // Annual figures
  totalCtc: number;
  fixedGrossAnnual: number;
  variableAnnual: number;
  joiningBonus: number;
  basicAnnual: number;
  hraAnnual: number;
  specialAllowanceAnnual: number;
  otherAllowancesAnnual: number;

  // Annual Deductions
  annualStandardDeduction: number;
  taxableIncome: number;
  annualIncomeTaxGross: number;
  rebate87A: number;
  annualIncomeTaxNet: number;
  annualCess: number;
  annualTotalTax: number;
  annualPfEmployee: number;
  annualProfessionalTax: number;
  annualGratuityIfIncluded: number;
  annualTotalDeductions: number;

  // Annual Net
  annualInHandFixed: number;

  // Monthly breakdown
  monthlyFixedGross: number;
  monthlyBasic: number;
  monthlyHra: number;
  monthlySpecialAllowance: number;
  monthlyPfEmployee: number;
  monthlyProfessionalTax: number;
  monthlyIncomeTax: number;
  monthlyTotalDeductions: number;
  monthlyInHandFixed: number;

  // Percentage metrics
  inHandFixedRatio: number; // monthly in-hand / (ctc/12)
}

/**
 * Calculates income tax under New Tax Regime FY 2026-27
 */
export function calculateNewRegimeTax(taxableIncome: number): {
  grossTax: number;
  rebate: number;
  netTax: number;
  cess: number;
  totalTax: number;
} {
  if (taxableIncome <= 0) {
    return { grossTax: 0, rebate: 0, netTax: 0, cess: 0, totalTax: 0 };
  }

  let grossTax = 0;
  for (const slab of NEW_TAX_REGIME_SLABS) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      grossTax += taxableInSlab * slab.rate;
    }
  }

  // 87A rebate if taxable income is within threshold
  let rebate = 0;
  if (taxableIncome <= REBATE_87A_LIMIT) {
    rebate = grossTax;
  }

  const netTax = Math.max(0, grossTax - rebate);
  const cess = Math.round(netTax * CESS_RATE);
  const totalTax = netTax + cess;

  return {
    grossTax: Math.round(grossTax),
    rebate: Math.round(rebate),
    netTax: Math.round(netTax),
    cess,
    totalTax,
  };
}

/**
 * Computes complete In-Hand breakup from structured compensation details
 */
export function calculateInHand(input: CompensationInput): InHandResult {
  const internship = input.employment_type === 'internship';
  const stipend = Math.max(0, input.stipend_monthly ?? 0);
  const basic = Math.max(0, input.basic_annual ?? 0);
  const hra = Math.max(0, input.hra_annual ?? 0);
  const specialAllowance = Math.max(0, input.special_allowance_annual ?? 0);
  const otherAllowances = Math.max(0, input.other_allowances_annual ?? 0);
  const variable = Math.max(0, input.variable_annual ?? 0);
  const joiningBonus = Math.max(0, input.joining_bonus ?? 0);

  // If breakdown isn't given but custom fixed annual is provided
  let fixedGross = basic + hra + specialAllowance + otherAllowances;
  if (internship && stipend > 0) fixedGross = stipend * 12;
  if (fixedGross === 0 && input.custom_fixed_annual && input.custom_fixed_annual > 0) {
    fixedGross = input.custom_fixed_annual;
  }

  const ctc = fixedGross + variable + joiningBonus;

  // Employee PF = 12% of Basic
  const annualPfEmployee = internship ? 0 : Math.round(basic * PF_RATE);

  // Gratuity estimate (if bundled in CTC, ~4.81% of basic)
  const annualGratuityIfIncluded = !internship && input.gratuity_included ? Math.round(basic * 0.0481) : 0;

  // Professional Tax
  const annualProfessionalTax = !internship && fixedGross > 150000 ? ANNUAL_PROFESSIONAL_TAX : 0;

  // Taxable income calculation: Gross - Standard Deduction - (Any eligible exemptions)
  const taxableIncome = Math.max(0, fixedGross - STANDARD_DEDUCTION);
  const taxResult = internship ? { grossTax: 0, rebate: 0, netTax: 0, cess: 0, totalTax: 0 } : calculateNewRegimeTax(taxableIncome);

  const annualTotalDeductions = annualPfEmployee + annualProfessionalTax + taxResult.totalTax;
  const annualInHandFixed = Math.max(0, fixedGross - annualTotalDeductions);

  // Monthly metrics
  const monthlyFixedGross = internship && stipend > 0 ? stipend : Math.round(fixedGross / 12);
  const monthlyBasic = internship && stipend > 0 ? stipend : Math.round(basic / 12);
  const monthlyHra = Math.round(hra / 12);
  const monthlySpecialAllowance = Math.round((specialAllowance + otherAllowances) / 12);
  const monthlyPfEmployee = Math.round(annualPfEmployee / 12);
  const monthlyProfessionalTax = Math.round(annualProfessionalTax / 12);
  const monthlyIncomeTax = Math.round(taxResult.totalTax / 12);
  const monthlyTotalDeductions = monthlyPfEmployee + monthlyProfessionalTax + monthlyIncomeTax;
  const monthlyInHandFixed = Math.max(0, monthlyFixedGross - monthlyTotalDeductions);

  const monthlyStatedCtc = Math.max(1, Math.round(ctc / 12));
  const inHandFixedRatio = Math.round((monthlyInHandFixed / monthlyStatedCtc) * 100);

  return {
    totalCtc: ctc,
    fixedGrossAnnual: fixedGross,
    variableAnnual: variable,
    joiningBonus,
    basicAnnual: basic,
    hraAnnual: hra,
    specialAllowanceAnnual: specialAllowance,
    otherAllowancesAnnual: otherAllowances,

    annualStandardDeduction: STANDARD_DEDUCTION,
    taxableIncome,
    annualIncomeTaxGross: taxResult.grossTax,
    rebate87A: taxResult.rebate,
    annualIncomeTaxNet: taxResult.netTax,
    annualCess: taxResult.cess,
    annualTotalTax: taxResult.totalTax,
    annualPfEmployee,
    annualProfessionalTax,
    annualGratuityIfIncluded,
    annualTotalDeductions,

    annualInHandFixed,

    monthlyFixedGross,
    monthlyBasic,
    monthlyHra,
    monthlySpecialAllowance,
    monthlyPfEmployee,
    monthlyProfessionalTax,
    monthlyIncomeTax,
    monthlyTotalDeductions,
    monthlyInHandFixed,

    inHandFixedRatio,
  };
}

/**
 * Format currency in Indian numbering system (e.g. ₹6,50,000 / ₹42,500)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
