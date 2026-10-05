'use client';

import React, { useState } from 'react';
import { InHandResult, CompensationInput, calculateInHand, formatINR } from '@/lib/tax';
import { Edit2, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface InHandBreakdownProps {
  initialInHand: InHandResult;
  initialCompensation: CompensationInput;
}

export default function InHandBreakdown({
  initialInHand,
  initialCompensation,
}: InHandBreakdownProps) {
  const [comp, setComp] = useState<CompensationInput>(initialCompensation);
  const [inHand, setInHand] = useState<InHandResult>(initialInHand);
  const [isEditing, setIsEditing] = useState(false);
  const [employmentType, setEmploymentType] = useState<NonNullable<CompensationInput['employment_type']>>(initialCompensation.employment_type || 'fulltime');

  if (initialCompensation.compensation_found === false) {
    return <div className="bg-paper-card border border-paper-border rounded-2xl p-6 sm:p-7 shadow-card text-sm text-ink-muted">We couldn't find clear salary figures in this letter. Try re-uploading or pasting the CTC section.</div>;
  }

  const handleFieldChange = (field: keyof CompensationInput, value: number | null) => {
    const updated = { ...comp, employment_type: employmentType, [field]: value };
    setComp(updated);
    setInHand(calculateInHand(updated));
  };

  return (
    <div className="bg-paper-card border border-paper-border rounded-2xl p-6 sm:p-7 shadow-card">
      <fieldset className="mb-4">
        <legend className="text-xs font-semibold text-ink-muted mb-2">Employment type</legend>
        <div className="inline-flex rounded-lg border border-paper-border bg-paper p-1">
          {(['internship', 'fulltime', 'contract'] as const).map((type) => (
            <button key={type} type="button" aria-pressed={employmentType === type}
              onClick={() => { setEmploymentType(type); const updated = { ...comp, employment_type: type }; setComp(updated); setInHand(calculateInHand(updated)); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize ${employmentType === type ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'}`}>
              {type === 'fulltime' ? 'Full-time' : type === 'internship' ? 'Internship' : 'Contract'}
            </button>
          ))}
        </div>
      </fieldset>
      {/* Top Title & Edit Switch */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-paper-border">
        <div>
          <h3 className="font-serif text-xl font-bold text-ink">Real In-Hand Salary Breakdown</h3>
          <p className="text-xs text-ink-muted">New Tax Regime (FY 2026-27) with Standard Deduction & 87A Rebate</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink bg-paper hover:bg-paper-hover border border-paper-border rounded-lg transition-all"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5 text-stamp-green" />
              <span>Done Editing</span>
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5 text-ink-muted" />
              <span>Adjust Figures</span>
            </>
          )}
        </button>
      </div>

      {/* Headline Monthly Figure */}
      <div className="my-6 p-5 bg-paper rounded-xl border border-paper-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-ink-muted mb-1">
            Guaranteed Fixed Monthly In-Hand
          </div>
          <div className="font-serif text-3xl sm:text-4xl font-extrabold text-ink flex items-baseline gap-2">
            <span>{formatINR(inHand.monthlyInHandFixed)}</span>
            <span className="text-sm font-sans font-normal text-ink-muted">/ month</span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-left sm:text-right">
          <div className="text-xs text-ink-muted uppercase font-semibold">Annual Fixed Take-Home</div>
          <div className="font-mono text-lg font-bold text-ink">{formatINR(inHand.annualInHandFixed)}</div>
          <div className="text-xs text-ink-muted mt-0.5">
            ({inHand.inHandFixedRatio}% of stated CTC package)
          </div>
        </div>
      </div>

      {/* Variable Pay & Joining Bonus Warning Strip */}
      <div className="space-y-2 mb-6">
        {inHand.variableAnnual > 0 && (
          <div className="p-3 bg-stamp-amberBg border border-stamp-amberBorder rounded-lg flex items-start justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-stamp-amber text-white font-bold rounded uppercase text-[10px]">
                At Risk
              </span>
              <span className="text-ink font-medium">
                Variable Pay / PLI: <strong>{formatINR(inHand.variableAnnual)}/yr</strong>
              </span>
            </div>
            <span className="text-ink-muted italic hidden sm:inline">Excluded from monthly fixed in-hand</span>
          </div>
        )}

        {inHand.joiningBonus > 0 && (
          <div className="p-3 bg-paper-hover border border-paper-border rounded-lg flex items-center justify-between text-xs">
            <span className="text-ink font-medium">
              🎁 One-time Joining Bonus: <strong>{formatINR(inHand.joiningBonus)}</strong>
            </span>
            <span className="text-ink-muted italic">Subject to clawback rules</span>
          </div>
        )}
      </div>

      {/* Detailed Line-by-Line Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left">
          <thead>
            <tr className="border-b border-paper-border text-ink-muted uppercase text-[10px] sm:text-xs">
              <th className="py-2.5 font-semibold">Salary Component</th>
              <th className="py-2.5 font-semibold text-right">Annual</th>
              <th className="py-2.5 font-semibold text-right">Monthly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-border/60 font-mono">
            {/* Basic Pay */}
            <tr>
              <td className="py-2.5 font-sans font-medium text-ink flex items-center gap-2">
                Basic Salary
              </td>
              <td className="py-2.5 text-right font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    value={comp.basic_annual || ''}
                    onChange={(e) => handleFieldChange('basic_annual', Number(e.target.value))}
                    className="w-24 p-1 text-right bg-paper border border-paper-border rounded"
                  />
                ) : (
                  formatINR(inHand.basicAnnual)
                )}
              </td>
              <td className="py-2.5 text-right text-ink-muted">{formatINR(inHand.monthlyBasic)}</td>
            </tr>

            {/* HRA */}
            <tr>
              <td className="py-2.5 font-sans font-medium text-ink">House Rent Allowance (HRA)</td>
              <td className="py-2.5 text-right font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    value={comp.hra_annual || ''}
                    onChange={(e) => handleFieldChange('hra_annual', Number(e.target.value))}
                    className="w-24 p-1 text-right bg-paper border border-paper-border rounded"
                  />
                ) : (
                  formatINR(inHand.hraAnnual)
                )}
              </td>
              <td className="py-2.5 text-right text-ink-muted">{formatINR(inHand.monthlyHra)}</td>
            </tr>

            {/* Special / Other Allowances */}
            <tr>
              <td className="py-2.5 font-sans font-medium text-ink">Special / Other Allowances</td>
              <td className="py-2.5 text-right font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    value={comp.special_allowance_annual || ''}
                    onChange={(e) => handleFieldChange('special_allowance_annual', Number(e.target.value))}
                    className="w-24 p-1 text-right bg-paper border border-paper-border rounded"
                  />
                ) : (
                  formatINR(inHand.specialAllowanceAnnual + inHand.otherAllowancesAnnual)
                )}
              </td>
              <td className="py-2.5 text-right text-ink-muted">{formatINR(inHand.monthlySpecialAllowance)}</td>
            </tr>

            {/* Gross Fixed Earnings */}
            <tr className="bg-paper font-semibold">
              <td className="py-2.5 font-sans text-ink">Gross Fixed Earnings</td>
              <td className="py-2.5 text-right text-ink">{formatINR(inHand.fixedGrossAnnual)}</td>
              <td className="py-2.5 text-right text-ink">{formatINR(inHand.monthlyFixedGross)}</td>
            </tr>

            {/* Deductions Header */}
            <tr className="bg-paper-hover/40">
              <td colSpan={3} className="py-2 font-sans font-semibold text-ink-muted text-[11px] uppercase tracking-wider">
                Monthly Deductions
              </td>
            </tr>

            {/* PF Deduction */}
            <tr>
              <td className="py-2.5 font-sans text-ink-muted pl-3">
                Employee PF (12% of Basic)
              </td>
              <td className="py-2.5 text-right text-stamp-red">−{formatINR(inHand.annualPfEmployee)}</td>
              <td className="py-2.5 text-right text-stamp-red">−{formatINR(inHand.monthlyPfEmployee)}</td>
            </tr>

            {/* Professional Tax */}
            <tr>
              <td className="py-2.5 font-sans text-ink-muted pl-3">Professional Tax (PT)</td>
              <td className="py-2.5 text-right text-stamp-red">−{formatINR(inHand.annualProfessionalTax)}</td>
              <td className="py-2.5 text-right text-stamp-red">−{formatINR(inHand.monthlyProfessionalTax)}</td>
            </tr>

            {/* Income Tax (TDS) */}
            <tr>
              <td className="py-2.5 font-sans text-ink-muted pl-3 flex items-center gap-1.5">
                <span>Income Tax (TDS, New Regime)</span>
                {inHand.rebate87A > 0 && (
                  <span className="text-[10px] font-mono text-stamp-green bg-stamp-greenBg px-1.5 py-0.5 rounded border border-stamp-greenBorder">
                    87A Rebate (₹0 Tax)
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right text-stamp-red">
                {inHand.annualTotalTax > 0 ? `−${formatINR(inHand.annualTotalTax)}` : '₹0'}
              </td>
              <td className="py-2.5 text-right text-stamp-red">
                {inHand.monthlyIncomeTax > 0 ? `−${formatINR(inHand.monthlyIncomeTax)}` : '₹0'}
              </td>
            </tr>

            {/* Net Monthly Take-Home */}
            <tr className="bg-paper text-ink font-bold border-t-2 border-ink">
              <td className="py-3 font-sans text-sm">Net Monthly In-Hand (Fixed)</td>
              <td className="py-3 text-right text-sm">{formatINR(inHand.annualInHandFixed)}</td>
              <td className="py-3 text-right text-sm text-stamp-green font-black font-mono">
                {formatINR(inHand.monthlyInHandFixed)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
