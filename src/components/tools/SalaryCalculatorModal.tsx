import React, { useState } from 'react';
import { db } from '../../lib/supabase/client';
import { X, Calculator, Info, FileSpreadsheet, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const scales = db.getSalaryScales();
  const [selectedCode, setSelectedCode] = useState<string>(scales[4]?.levelCode || 'CS_OFFICER');
  const [grades, setGrades] = useState<number>(2);
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('married');
  const [providentFundDeduction, setProvidentFundDeduction] = useState<boolean>(true);
  const [citAmount, setCitAmount] = useState<number>(3000); // नागरिक लगानी कोष
  const [insuranceAmount, setInsuranceAmount] = useState<number>(1000); // सावधिक जीवन बीमा
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentScale = scales.find((s) => s.levelCode === selectedCode) || scales[0];
  const maxGradesAllowed = currentScale.maxGrades;
  const safeGrades = Math.min(grades, maxGradesAllowed);

  // Math Calculations (Official 2081/82 formula)
  const basicSalary = currentScale.basicSalary;
  const gradeRate = currentScale.gradeAmount;
  const totalGradeAmount = safeGrades * gradeRate;
  const totalBasicWithGrade = basicSalary + totalGradeAmount;
  const dearnessAllowance = currentScale.dearnessAllowance; // रु २०००
  const grossMonthlySalary = totalBasicWithGrade + dearnessAllowance;

  // Monthly Deductions
  const pfDeduction = providentFundDeduction ? Math.round(totalBasicWithGrade * 0.10) : 0; // १०% कट्टी
  const totalMonthlyDeductions = pfDeduction + citAmount + insuranceAmount;
  const taxableMonthlyIncome = Math.max(0, grossMonthlySalary - pfDeduction - citAmount - insuranceAmount);

  // Annual Projections (including 1 month festival allowance / दशैं खर्च)
  const annualGross = grossMonthlySalary * 12 + totalBasicWithGrade; // १२ महिना + १ महिना दशैं भत्ता
  const annualDeductions = totalMonthlyDeductions * 12;
  const annualTaxable = Math.max(0, annualGross - annualDeductions);

  // Nepal Tax Slabs (आ.व. २०८१/८२)
  // Single: 0-5L: 1%, 5L-7L: 10%, 7L-10L: 20%, 10L-20L: 30%, 20L+: 36%
  // Married: 0-6L: 1%, 6L-8L: 10%, 8L-11L: 20%, 11L-20L: 30%, 20L+: 36%
  const calculateAnnualTax = (taxable: number, isMarried: boolean) => {
    let tax = 0;
    const slab1Limit = isMarried ? 600000 : 500000;
    const slab2Limit = isMarried ? 800000 : 700000;
    const slab3Limit = isMarried ? 1100000 : 1000000;
    const slab4Limit = 2000000;

    if (taxable <= slab1Limit) {
      tax = taxable * 0.01;
    } else if (taxable <= slab2Limit) {
      tax = slab1Limit * 0.01 + (taxable - slab1Limit) * 0.10;
    } else if (taxable <= slab3Limit) {
      tax = slab1Limit * 0.01 + (slab2Limit - slab1Limit) * 0.10 + (taxable - slab2Limit) * 0.20;
    } else if (taxable <= slab4Limit) {
      tax =
        slab1Limit * 0.01 +
        (slab2Limit - slab1Limit) * 0.10 +
        (slab3Limit - slab2Limit) * 0.20 +
        (taxable - slab3Limit) * 0.30;
    } else {
      tax =
        slab1Limit * 0.01 +
        (slab2Limit - slab1Limit) * 0.10 +
        (slab3Limit - slab2Limit) * 0.20 +
        (slab4Limit - slab3Limit) * 0.30 +
        (taxable - slab4Limit) * 0.36;
    }
    return Math.round(tax);
  };

  const annualTax = calculateAnnualTax(annualTaxable, maritalStatus === 'married');
  const monthlyTds = Math.round(annualTax / 12);
  const netMonthlySalary = grossMonthlySalary - totalMonthlyDeductions - monthlyTds;

  const copySummary = () => {
    const text = `नेपाल निजामती कर्मचारी तलब गणना (आ.व. २०८१/८२)
तह/पद: ${currentScale.levelNameNe}
सुरु तलब: रु. ${basicSalary.toLocaleString('ne-NP')}
ग्रेड (${safeGrades} वटा): रु. ${totalGradeAmount.toLocaleString('ne-NP')}
महङ्गी भत्ता: रु. ${dearnessAllowance.toLocaleString('ne-NP')}
जम्मा मासिक तलब: रु. ${grossMonthlySalary.toLocaleString('ne-NP')}
कट्टीहरू (क.सं.कोष/CIT/बीमा): रु. ${totalMonthlyDeductions.toLocaleString('ne-NP')}
मासिक आयकर (TDS): रु. ${monthlyTds.toLocaleString('ne-NP')}
खुद भुक्तानी (Net Pay): रु. ${netMonthlySalary.toLocaleString('ne-NP')}
स्रोत: NCSDH तलब क्यालकुलेटर (आधिकारिक दर)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#173B63] text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                निजामती कर्मचारी तलब तथा कर गणना (आ.व. २०८१/८२)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                नेपाल राजपत्र तथा अर्थ मन्त्रालय सूचना २०८१ बमोजिम आधिकारिक दर र आयकर स्ल्याब
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Level selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                तह तथा पद छनोट गर्नुहोस्
              </label>
              <select
                value={selectedCode}
                onChange={(e) => {
                  setSelectedCode(e.target.value);
                  setGrades(0);
                }}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
              >
                {scales.map((s) => (
                  <option key={s.levelCode} value={s.levelCode}>
                    {s.levelNameNe} ({s.rankCategory}) - रु. {s.basicSalary.toLocaleString('ne-NP')}
                  </option>
                ))}
              </select>
            </div>

            {/* Grades */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                हालसम्म प्राप्त ग्रेड संख्या (अधिकतम: {maxGradesAllowed} ग्रेड)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={maxGradesAllowed}
                  value={grades}
                  onChange={(e) => setGrades(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center tabular-nums"
                />
                <span className="text-xs text-slate-500">
                  प्रति ग्रेड दर: रु. {gradeRate.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                वैवाहिक स्थिति (आयकर गणनाका लागि)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="marital"
                    checked={maritalStatus === 'married'}
                    onChange={() => setMaritalStatus('married')}
                    className="text-[#173B63]"
                  />
                  विवाहित (६ लाखसम्म १%)
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="marital"
                    checked={maritalStatus === 'single'}
                    onChange={() => setMaritalStatus('single')}
                    className="text-[#173B63]"
                  />
                  अविवाहित (५ लाखसम्म १%)
                </label>
              </div>
            </div>

            {/* Monthly Deductions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                नागरिक लगानी कोष (CIT) मासिक कट्टी
              </label>
              <input
                type="number"
                step={500}
                value={citAmount}
                onChange={(e) => setCitAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          {/* Results Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/70 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              मासिक तलब तथा कट्टी विवरण (Monthly Summary)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">सुरु आधारभूत तलब</p>
                <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  रु. {basicSalary.toLocaleString('ne-NP')}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">ग्रेड रकम ({safeGrades})</p>
                <p className="text-base font-bold text-[#3478B9] tabular-nums mt-1">
                  रु. {totalGradeAmount.toLocaleString('ne-NP')}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">महङ्गी भत्ता</p>
                <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  रु. {dearnessAllowance.toLocaleString('ne-NP')}
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">कूल मासिक तलब</p>
                <p className="text-base font-bold text-[#173B63] dark:text-blue-400 tabular-nums mt-1">
                  रु. {grossMonthlySalary.toLocaleString('ne-NP')}
                </p>
              </div>
            </div>

            {/* Deductions Row */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">कर्मचारी सञ्चय कोष (१०%):</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  रु. {pfDeduction.toLocaleString('ne-NP')}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">नागरिक लगानी कोष (CIT):</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  रु. {citAmount.toLocaleString('ne-NP')}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">सावधिक बीमा कट्टी:</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  रु. {insuranceAmount.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            {/* Net Pay Highlight */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#173B63] to-[#3478B9] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-blue-100">मासिक आयकर (TDS अनुमानित: रु {monthlyTds.toLocaleString('ne-NP')})</p>
                <h4 className="text-xl font-bold tracking-tight">
                  खुद मासिक भुक्तानी: रु. {netMonthlySalary.toLocaleString('ne-NP')}
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  वार्षिक कुल आम्दानी (दशैं खर्च सहित): रु. {annualGross.toLocaleString('ne-NP')}
                </p>
              </div>
              <button
                onClick={copySummary}
                className="px-4 py-2 text-xs font-semibold bg-white text-[#173B63] rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileSpreadsheet className="w-4 h-4" />}
                {copied ? 'प्रतिलिपि गरियो' : 'विवरण कपी गर्नुहोस्'}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
            <Info className="w-4 h-4 shrink-0 text-[#0F766E] mt-0.5" />
            <p>
              नोट: यो गणना नेपाल सरकारद्वारा लागू आ.व. २०८१/८२ को आधिकारिक तलबमान र आयकर ऐन २०५८ को प्रावधानमा आधारित छ। विशेष दुर्गम भत्ता, प्रोत्साहन वा स्थानीय भत्ता लागू हुने कार्यालय अनुसार थप हुन सक्दछ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
