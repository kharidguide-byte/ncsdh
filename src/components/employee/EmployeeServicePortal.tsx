import React, { useState, useMemo } from 'react';
import { db } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/context';
import {
  SalaryScale,
  TaxPolicyVersion,
  PensionPolicyVersion,
  LeavePolicyVersion,
  PromotionCriteriaVersion
} from '../../types';
import {
  Calculator,
  UserCheck,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Layers,
  FileSpreadsheet,
  Check,
  Copy,
  Info,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Printer,
  Heart,
  Briefcase,
  HelpCircle,
  AlertCircle,
  Database,
  Building
} from 'lucide-react';

export const EmployeeServicePortal: React.FC = () => {
  const { user, profile, isVerifiedEmployee } = useAuth();

  // Tab State
  const [activeModule, setActiveModule] = useState<
    'portal' | 'salary' | 'tax' | 'leave' | 'retirement' | 'pension' | 'career' | 'versions'
  >('salary');

  // Fiscal Year Version State
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('2081/82');

  // DB Data
  const salaryScales = db.getSalaryScales();
  const taxPolicy = db.getTaxPolicy(selectedFiscalYear);
  const pensionPolicy = db.getPensionPolicy(selectedFiscalYear);
  const leavePolicy = db.getLeavePolicy(selectedFiscalYear);
  const promotionPolicy = db.getPromotionPolicy(selectedFiscalYear);

  // ----------------------------------------------------------------------
  // 1. SALARY & TAX STATE
  // ----------------------------------------------------------------------
  const [selectedLevelCode, setSelectedLevelCode] = useState<string>(
    salaryScales[4]?.levelCode || 'CS_OFFICER'
  );
  const [salaryGrades, setSalaryGrades] = useState<number>(3);
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('married');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [remoteAreaCategory, setRemoteAreaCategory] = useState<'NONE' | 'A' | 'B' | 'C' | 'D' | 'E'>('NONE');
  const [citDeduction, setCitDeduction] = useState<number>(3000);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(1000);
  const [healthInsuranceDeduction, setHealthInsuranceDeduction] = useState<number>(0);

  // Selected Salary Scale
  const currentScale = useMemo(() => {
    return salaryScales.find((s) => s.levelCode === selectedLevelCode) || salaryScales[4];
  }, [salaryScales, selectedLevelCode]);

  // Salary Calculations
  const basicSalary = currentScale.basicSalary;
  const gradeRate = currentScale.gradeAmount;
  const safeGrades = Math.min(salaryGrades, currentScale.maxGrades);
  const totalGradeAmount = safeGrades * gradeRate;
  const basicWithGrade = basicSalary + totalGradeAmount;
  const dearnessAllowance = currentScale.dearnessAllowance; // रु २०००
  const grossMonthlySalary = basicWithGrade + dearnessAllowance;

  // Monthly Deductions
  const pfEmployeeDeduction = Math.round(basicWithGrade * 0.10); // १०% सञ्चय कोष कट्टी
  const totalMonthlyDeductions = pfEmployeeDeduction + citDeduction + insuranceAmount + healthInsuranceDeduction;

  // Annual Projections (12 months salary + 1 month Dashain festival allowance)
  const annualGrossIncome = grossMonthlySalary * 12 + basicWithGrade;
  const annualDeductions = totalMonthlyDeductions * 12;

  // Remote area deduction from tax policy
  const remoteAreaDeduction = useMemo(() => {
    if (remoteAreaCategory === 'A') return taxPolicy.rebates.remoteAreaDeductions.categoryA;
    if (remoteAreaCategory === 'B') return taxPolicy.rebates.remoteAreaDeductions.categoryB;
    if (remoteAreaCategory === 'C') return taxPolicy.rebates.remoteAreaDeductions.categoryC;
    if (remoteAreaCategory === 'D') return taxPolicy.rebates.remoteAreaDeductions.categoryD;
    if (remoteAreaCategory === 'E') return taxPolicy.rebates.remoteAreaDeductions.categoryE;
    return 0;
  }, [remoteAreaCategory, taxPolicy]);

  // Insurance rebate capped at taxPolicy limits
  const lifeInsuranceRebate = Math.min(insuranceAmount * 12, taxPolicy.rebates.lifeInsuranceMax);
  const healthInsuranceRebate = Math.min(healthInsuranceDeduction * 12, taxPolicy.rebates.healthInsuranceMax);

  // Annual Taxable Income
  const totalAnnualAllowableDeductions =
    pfEmployeeDeduction * 12 +
    citDeduction * 12 +
    lifeInsuranceRebate +
    healthInsuranceRebate +
    remoteAreaDeduction;

  const annualTaxableIncome = Math.max(0, annualGrossIncome - totalAnnualAllowableDeductions);

  // Progressive Tax Calculation using selected TaxPolicy Version
  const calculatedTax = useMemo(() => {
    const isMarried = maritalStatus === 'married';
    const basicExemption = isMarried
      ? taxPolicy.marriedBasicExemption
      : taxPolicy.singleBasicExemption;

    let totalTax = 0;
    const slabBreakdown: { slabName: string; taxableAmount: number; rate: number; tax: number }[] = [];

    let remaining = annualTaxableIncome;

    // 1st Slab: 1% social security
    const slab1Taxable = Math.min(remaining, basicExemption);
    const slab1Tax = Math.round(slab1Taxable * 0.01);
    slabBreakdown.push({
      slabName: isMarried ? 'पहिलो रु ६,००,००० (१%)' : 'पहिलो रु ५,००,००० (१%)',
      taxableAmount: slab1Taxable,
      rate: 1,
      tax: slab1Tax,
    });
    totalTax += slab1Tax;
    remaining = Math.max(0, remaining - slab1Taxable);

    // 2nd Slab: 10% (next 200,000)
    if (remaining > 0) {
      const slab2Taxable = Math.min(remaining, 200000);
      const slab2Tax = Math.round(slab2Taxable * 0.10);
      slabBreakdown.push({
        slabName: 'त्यसपछिको रु २,००,००० (१०%)',
        taxableAmount: slab2Taxable,
        rate: 10,
        tax: slab2Tax,
      });
      totalTax += slab2Tax;
      remaining = Math.max(0, remaining - slab2Taxable);
    }

    // 3rd Slab: 20% (next 300,000)
    if (remaining > 0) {
      const slab3Taxable = Math.min(remaining, 300000);
      const slab3Tax = Math.round(slab3Taxable * 0.20);
      slabBreakdown.push({
        slabName: 'त्यसपछिको रु ३,००,००० (२०%)',
        taxableAmount: slab3Taxable,
        rate: 20,
        tax: slab3Tax,
      });
      totalTax += slab3Tax;
      remaining = Math.max(0, remaining - slab3Taxable);
    }

    // 4th Slab: 30% (next 1,000,000)
    if (remaining > 0) {
      const slab4Taxable = Math.min(remaining, 1000000);
      const slab4Tax = Math.round(slab4Taxable * 0.30);
      slabBreakdown.push({
        slabName: 'त्यसपछिको रु १०,००,००० (३०%)',
        taxableAmount: slab4Taxable,
        rate: 30,
        tax: slab4Tax,
      });
      totalTax += slab4Tax;
      remaining = Math.max(0, remaining - slab4Taxable);
    }

    // 5th Slab: 36% (above 20L up to 50L)
    if (remaining > 0) {
      const slab5Taxable = Math.min(remaining, 3000000);
      const slab5Tax = Math.round(slab5Taxable * 0.36);
      slabBreakdown.push({
        slabName: 'रु २० देखि ५० लाखसम्म (३६%)',
        taxableAmount: slab5Taxable,
        rate: 36,
        tax: slab5Tax,
      });
      totalTax += slab5Tax;
      remaining = Math.max(0, remaining - slab5Taxable);
    }

    // 6th Slab: 39% (above 50L)
    if (remaining > 0) {
      const slab6Taxable = remaining;
      const slab6Tax = Math.round(slab6Taxable * 0.39);
      slabBreakdown.push({
        slabName: 'रु ५० लाखभन्दा माथि (३९%)',
        taxableAmount: slab6Taxable,
        rate: 39,
        tax: slab6Tax,
      });
      totalTax += slab6Tax;
    }

    // Female Tax Credit (10% rebate on tax for single female with only salary income)
    let femaleCredit = 0;
    if (gender === 'female' && maritalStatus === 'single') {
      femaleCredit = Math.round(totalTax * 0.10);
      totalTax = Math.max(0, totalTax - femaleCredit);
    }

    const monthlyTds = Math.round(totalTax / 12);
    const netMonthlyPay = grossMonthlySalary - totalMonthlyDeductions - monthlyTds;

    return {
      annualTax: totalTax,
      monthlyTds,
      netMonthlyPay,
      femaleCredit,
      slabBreakdown,
    };
  }, [annualTaxableIncome, maritalStatus, gender, taxPolicy, grossMonthlySalary, totalMonthlyDeductions]);

  // ----------------------------------------------------------------------
  // 2. LEAVE PLANNER STATE
  // ----------------------------------------------------------------------
  const [accumulatedHomeLeave, setAccumulatedHomeLeave] = useState<number>(
    profile?.leaveBalance?.homeLeave || 45
  );
  const [accumulatedSickLeave, setAccumulatedSickLeave] = useState<number>(
    profile?.leaveBalance?.sickLeave || 18
  );

  // Leave Encashment Calculation at Retirement
  // Cash payout = (Total Days * Final Basic Salary) / 30
  const leaveEncashmentCash = useMemo(() => {
    const totalDays = accumulatedHomeLeave + accumulatedSickLeave;
    const dailyRate = basicWithGrade / leavePolicy.encashmentDivisor;
    return Math.round(totalDays * dailyRate);
  }, [accumulatedHomeLeave, accumulatedSickLeave, basicWithGrade, leavePolicy]);

  // ----------------------------------------------------------------------
  // 3. RETIREMENT ESTIMATOR STATE
  // ----------------------------------------------------------------------
  const [dobBs, setDobBs] = useState<string>(profile?.dobBs || '२०३८/०४/१५');
  const [appointmentBs, setAppointmentBs] = useState<string>(
    profile?.appointmentDateBs || '२०६८/०५/०१'
  );

  // Compute 58-Year Mandatory Retirement Date
  const retirementCalculation = useMemo(() => {
    try {
      const dobParts = dobBs.split('/').map(Number);
      if (dobParts.length === 3 && !isNaN(dobParts[0])) {
        const birthYear = dobParts[0];
        const birthMonth = dobParts[1];
        const birthDay = dobParts[2];
        const retirementYear = birthYear + 58;

        // Current Nepal approximate date 2081/08
        const currentYear = 2081;
        const currentMonth = 8;
        const currentDay = 12;

        const retirementDateBs = `${retirementYear}/${String(birthMonth).padStart(2, '0')}/${String(birthDay).padStart(2, '0')}`;

        // Remaining months & years
        const totalRemainingMonths = (retirementYear - currentYear) * 12 + (birthMonth - currentMonth);
        const remainingYears = Math.floor(totalRemainingMonths / 12);
        const remainingMonths = totalRemainingMonths % 12;

        // Service years from appointment
        const appParts = appointmentBs.split('/').map(Number);
        const appYear = appParts[0] || 2068;
        const appMonth = appParts[1] || 5;
        const totalServiceMonths = (currentYear - appYear) * 12 + (currentMonth - appMonth);
        const serviceYears = Math.max(0, Math.floor(totalServiceMonths / 12));
        const serviceMonthsRemainder = Math.max(0, totalServiceMonths % 12);

        // Projected total service at retirement
        const totalServiceAtRetirement = retirementYear - appYear;

        return {
          retirementDateBs,
          remainingYears,
          remainingMonths,
          serviceYears,
          serviceMonthsRemainder,
          totalServiceAtRetirement,
          isPensionEligible: serviceYears >= 20,
        };
      }
    } catch {
      // fallback
    }
    return {
      retirementDateBs: '२०९६/०४/१५',
      remainingYears: 14,
      remainingMonths: 8,
      serviceYears: 13,
      serviceMonthsRemainder: 3,
      totalServiceAtRetirement: 28,
      isPensionEligible: false,
    };
  }, [dobBs, appointmentBs]);

  // ----------------------------------------------------------------------
  // 4. PENSION & GRATUITY PLANNER STATE
  // ----------------------------------------------------------------------
  const [pensionServiceYears, setPensionServiceYears] = useState<number>(
    retirementCalculation.serviceYears || 22
  );
  const [isContributoryPension, setIsContributoryPension] = useState<boolean>(false);

  // Traditional Civil Service Pension Formula:
  // Monthly Pension = (Total Service Years * Final Basic Salary with Grades) / 50
  const pensionCalculation = useMemo(() => {
    const years = pensionServiceYears;
    const finalSalary = basicWithGrade;

    if (years >= pensionPolicy.minServiceYearsPension) {
      // Full pension
      const basePension = Math.round((years * finalSalary) / pensionPolicy.formulaDivisor);
      // Senior citizens bonuses
      const senior70Pension = Math.round(basePension * (1 + pensionPolicy.senior70BonusPercent / 100));
      const senior75Pension = Math.round(basePension * (1 + pensionPolicy.senior75BonusPercent / 100));

      return {
        type: 'PENSION' as const,
        monthlyBasePension: basePension,
        senior70Pension,
        senior75Pension,
        formulaText: `(${years} वर्ष × रु ${finalSalary.toLocaleString('ne-NP')}) ÷ ${pensionPolicy.formulaDivisor}`,
      };
    } else {
      // Gratuity (उपदान)
      let multiplier = 0.5;
      if (years >= 15) multiplier = 1.5;
      else if (years >= 10) multiplier = 1.0;

      const totalGratuity = Math.round(years * finalSalary * multiplier);
      return {
        type: 'GRATUITY' as const,
        totalGratuity,
        multiplier,
        formulaText: `${years} वर्ष × रु ${finalSalary.toLocaleString('ne-NP')} × ${multiplier}`,
      };
    }
  }, [pensionServiceYears, basicWithGrade, pensionPolicy]);

  // ----------------------------------------------------------------------
  // 5. CAREER GROWTH & PROMOTION PLANNER STATE
  // ----------------------------------------------------------------------
  const [kasamuScore, setKasamuScore] = useState<number>(38.5); // का.स.मू. (max 40)
  const [seniorityYears, setSeniorityYears] = useState<number>(6); // ज्येष्ठता वर्ष
  const [geoCategory, setGeoCategory] = useState<'A' | 'B' | 'C' | 'D'>('A'); // क, ख, ग, घ
  const [geoYears, setGeoYears] = useState<number>(3);
  const [academicDegreeGrade, setAcademicDegreeGrade] = useState<'FIRST' | 'SECOND' | 'THIRD'>('FIRST');
  const [hasHigherDegree, setHasHigherDegree] = useState<boolean>(true);
  const [trainingGrade, setTrainingGrade] = useState<'FIRST' | 'SECOND' | 'THIRD'>('FIRST');

  // Promotion Score Calculation (Max 100 marks)
  const promotionCalculation = useMemo(() => {
    // 1. Performance (का.स.मू. max 40)
    const pScore = Math.min(kasamuScore, promotionPolicy.performanceMax);

    // 2. Seniority (max 20 marks: 3.25 marks per year for Gazetted / 3.75 for Non-Gazetted)
    const seniorityRate = 3.25;
    const sScore = Math.min(seniorityYears * seniorityRate, promotionPolicy.seniorityMax);

    // 3. Geographic Marks (max 16 marks: A=4, B=3.25, C=2.5, D=1.25 per year)
    let geoRate = 4;
    if (geoCategory === 'B') geoRate = 3.25;
    if (geoCategory === 'C') geoRate = 2.5;
    if (geoCategory === 'D') geoRate = 1.25;
    const gScore = Math.min(geoYears * geoRate, promotionPolicy.geographicMax);

    // 4. Academic Qualification (max 12 marks: minimum degree + higher degree)
    let minEdu = 9; // First class 9, Second 8, Third 7
    if (academicDegreeGrade === 'SECOND') minEdu = 8;
    if (academicDegreeGrade === 'THIRD') minEdu = 7;
    const higherEdu = hasHigherDegree ? 3 : 0;
    const eduScore = Math.min(minEdu + higherEdu, promotionPolicy.academicMax);

    // 5. Training (max 8 marks: First 8, Second 6, Third 4)
    let tScore = 8;
    if (trainingGrade === 'SECOND') tScore = 6;
    if (trainingGrade === 'THIRD') tScore = 4;
    tScore = Math.min(tScore, promotionPolicy.trainingMax);

    const totalScore = Number((pScore + sScore + gScore + eduScore + tScore).toFixed(2));
    const isEligible = seniorityYears >= promotionPolicy.minServiceYearsOfficer;

    return {
      performance: pScore,
      seniority: Number(sScore.toFixed(2)),
      geographic: Number(gScore.toFixed(2)),
      education: eduScore,
      training: tScore,
      totalScore,
      isEligible,
    };
  }, [
    kasamuScore,
    seniorityYears,
    geoCategory,
    geoYears,
    academicDegreeGrade,
    hasHigherDegree,
    trainingGrade,
    promotionPolicy,
  ]);

  // Copy Summary Clipboard
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopySummary = (title: string, content: string) => {
    navigator.clipboard.writeText(`${title}\n${content}\nस्रोत: NCSDH निजामती कर्मचारी सेवा पोर्टल (${selectedFiscalYear})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & FISCAL YEAR SWITCHER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              Employee Services & Versioned Calculators
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">निजामती सेवा गणना तथा योजना केन्द्र</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            निजामती कर्मचारी सेवा पोर्टल तथा क्यालकुलेटर सुइट
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            तलबमान, आयकर (TDS), बिदा सञ्चिति, ५८ वर्षे अवकाश, निवृत्तिभरण र बढुवा अङ्क योजनाकार
          </p>
        </div>

        {/* Versioned Fiscal Year Selector */}
        <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Database className="w-4 h-4 text-[#173B63] dark:text-blue-400 ml-1" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              लागू आर्थिक वर्ष दर (Version):
            </span>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="text-xs font-bold bg-transparent text-[#173B63] dark:text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="2081/82">आ.व. २०८१/८२ (हाल लागू दर)</option>
              <option value="2080/81">आ.व. २०८०/८१ (ऐतिहासिक दर)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. SUB-MODULE NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold no-scrollbar">
        <button
          onClick={() => setActiveModule('salary')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'salary'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>तलब क्यालकुलेटर</span>
        </button>

        <button
          onClick={() => setActiveModule('tax')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'tax'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>आयकर र TDS</span>
        </button>

        <button
          onClick={() => setActiveModule('leave')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'leave'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>बिदा योजना तथा सञ्चिति</span>
        </button>

        <button
          onClick={() => setActiveModule('retirement')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'retirement'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>५८ वर्षे अवकाश अनुमानक</span>
        </button>

        <button
          onClick={() => setActiveModule('pension')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'pension'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>निवृत्तिभरण र उपदान</span>
        </button>

        <button
          onClick={() => setActiveModule('career')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'career'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>बढुवा अङ्क योजनाकार</span>
        </button>

        <button
          onClick={() => setActiveModule('portal')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'portal'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>सिटरोल प्रोफाइल</span>
        </button>

        <button
          onClick={() => setActiveModule('versions')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeModule === 'versions'
              ? 'border-[#173B63] dark:border-blue-400 text-[#173B63] dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>कानुनी दर र सुत्र अभिलेख</span>
        </button>
      </div>

      {/* 3. MODULE CONTENT AREAS */}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE A: SALARY CALCULATOR */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'salary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Inputs (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                तलबमान तथा ग्रेड छनोट
              </span>
              <span className="text-[11px] text-[#0F766E] font-semibold">
                {currentScale.sourceReference}
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                कर्मचारीको श्रेणी वा तह छनोट गर्नुहोस्:
              </label>
              <select
                value={selectedLevelCode}
                onChange={(e) => {
                  setSelectedLevelCode(e.target.value);
                  setSalaryGrades(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {salaryScales.map((s) => (
                  <option key={s.id} value={s.levelCode}>
                    {s.levelNameNe} — सुरु तलब रु. {s.basicSalary.toLocaleString('ne-NP')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  प्राप्त ग्रेड संख्या (अधिकतम {currentScale.maxGrades}):
                </label>
                <input
                  type="number"
                  min={0}
                  max={currentScale.maxGrades}
                  value={salaryGrades}
                  onChange={(e) => setSalaryGrades(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  प्रति ग्रेड दर:
                </label>
                <div className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono">
                  रु. {currentScale.gradeAmount.toLocaleString('ne-NP')}
                </div>
              </div>
            </div>

            {/* Deductions inputs */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ऐच्छिक मासिक कट्टीहरू (Monthly Deductions):
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                    नागरिक लगानी कोष (CIT):
                  </label>
                  <input
                    type="number"
                    step={500}
                    value={citDeduction}
                    onChange={(e) => setCitDeduction(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">
                    सावधिक जीवन बीमा:
                  </label>
                  <input
                    type="number"
                    step={100}
                    value={insuranceAmount}
                    onChange={(e) => setInsuranceAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary: Payout Sheet (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                  आधिकारिक मासिक तलब विवरण (Salary Pay Slip)
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentScale.levelNameNe} ({selectedFiscalYear})
                </h3>
              </div>

              <button
                onClick={() =>
                  handleCopySummary(
                    'तलब गणना विवरण',
                    `सुरु तलब: रु ${basicSalary} | ग्रेड (${safeGrades}): रु ${totalGradeAmount} | खुद मासिक भुक्तानी: रु ${calculatedTax.netMonthlyPay}`
                  )
                }
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>कपी गर्नुहोस्</span>
              </button>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">सुरु तलबमान (Basic)</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  रु. {basicSalary.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">
                  ग्रेड रकम ({safeGrades} वटा)
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  रु. {totalGradeAmount.toLocaleString('ne-NP')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <span className="text-[10px] text-blue-700 dark:text-blue-400 block uppercase">
                  जम्मा मासिक तलब (Gross)
                </span>
                <span className="text-sm font-bold text-[#173B63] dark:text-blue-400 font-mono">
                  रु. {grossMonthlySalary.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>

            {/* Deductions Breakdown Table */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                मासिक कट्टी विवरण (Monthly Deductions):
              </span>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40">
                  <span>कर्मचारी सञ्चय कोष (१०% कट्टी):</span>
                  <span className="font-mono font-semibold">रु. {pfEmployeeDeduction.toLocaleString('ne-NP')}</span>
                </div>
                <div className="flex justify-between p-2.5">
                  <span>नागरिक लगानी कोष (CIT):</span>
                  <span className="font-mono font-semibold">रु. {citDeduction.toLocaleString('ne-NP')}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40">
                  <span>सावधिक जीवन बीमा:</span>
                  <span className="font-mono font-semibold">रु. {insuranceAmount.toLocaleString('ne-NP')}</span>
                </div>
                <div className="flex justify-between p-2.5 text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                  <span>अनुमानित मासिक आयकर (TDS):</span>
                  <span className="font-mono font-bold">रु. {calculatedTax.monthlyTds.toLocaleString('ne-NP')}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Payout Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                  कर्मचारीको बैंक खातामा जम्मा हुने खुद रकम (Net Monthly Payout):
                </span>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  सबै अनिवार्य तथा ऐच्छिक कट्टी र TDS पछि
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  रु. {calculatedTax.netMonthlyPay.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE B: TAX & TDS CALCULATOR */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                आयकर तथा कर छुट मापदण्ड
              </span>
              <span className="text-[11px] text-[#0F766E] font-semibold">
                {taxPolicy.sourceLawNe}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  वैवाहिक स्थिति (Marital Status):
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="single">एकल (Single) - ५ लाखसम्म १%</option>
                  <option value="married">दम्पती (Married) - ६ लाखसम्म १%</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  लिङ्ग (Gender):
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="male">पुरुष (Male)</option>
                  <option value="female">महिला (Female - १०% कर छुट)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                दुर्गम भत्ता क्षेत्र (Remote Area Category):
              </label>
              <select
                value={remoteAreaCategory}
                onChange={(e) => setRemoteAreaCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="NONE">सुगम / लागू नहुने (No remote deduction)</option>
                <option value="A">'क' वर्ग क्षेत्र (रु ५०,००० कर छुट)</option>
                <option value="B">'ख' वर्ग क्षेत्र (रु ४०,००० कर छुट)</option>
                <option value="C">'ग' वर्ग क्षेत्र (रु ३०,००० कर छुट)</option>
                <option value="D">'घ' वर्ग क्षेत्र (रु २०,००० कर छुट)</option>
                <option value="E">'ङ' वर्ग क्षेत्र (रु १०,००० कर छुट)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                वार्षिक कुल आय विवरण:
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">वार्षिक कुल पारिश्रमिक (१२ महिना):</span>
                <span className="font-mono">रु. {(grossMonthlySalary * 12).toLocaleString('ne-NP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">चाडपर्व भत्ता (१ महिनाको सुरु तलब):</span>
                <span className="font-mono">रु. {basicWithGrade.toLocaleString('ne-NP')}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                <span>कुल वार्षिक आय:</span>
                <span className="font-mono text-[#173B63] dark:text-blue-400">
                  रु. {annualGrossIncome.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Slabs Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                आयकर स्ल्याब तथा गणना विवरण
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                आर्थिक ऐन {selectedFiscalYear} बमोजिम
              </h3>
            </div>

            {/* Slabs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">कर स्ल्याब</th>
                    <th className="p-2.5">करयोग्य रकम</th>
                    <th className="p-2.5">दर</th>
                    <th className="p-2.5 text-right">कर रकम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {calculatedTax.slabBreakdown.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-sans">{s.slabName}</td>
                      <td className="p-2.5">रु. {s.taxableAmount.toLocaleString('ne-NP')}</td>
                      <td className="p-2.5">{s.rate}%</td>
                      <td className="p-2.5 text-right font-bold">रु. {s.tax.toLocaleString('ne-NP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {calculatedTax.femaleCredit > 0 && (
              <div className="p-2.5 rounded bg-pink-50 dark:bg-pink-950/30 text-xs text-pink-700 dark:text-pink-300 flex justify-between">
                <span>महिला एकल कर छुट (१०%):</span>
                <span className="font-mono font-bold">- रु. {calculatedTax.femaleCredit.toLocaleString('ne-NP')}</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">वार्षिक जम्मा आयकर:</span>
                <span className="text-lg font-bold font-mono">
                  रु. {calculatedTax.annualTax.toLocaleString('ne-NP')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 block">मासिक कट्टी हुने TDS:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  रु. {calculatedTax.monthlyTds.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE C: LEAVE PLANNER */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                निजामती बिदा अधिकार तथा सञ्चिति
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{leavePolicy.sourceLawNe}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">घर बिदा (Home Leave)</h4>
                  <p className="text-[11px] text-slate-500">प्रत्येक १२ दिन काम बराबर १ दिन (वर्षको ३० दिन)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">सञ्चित:</span>
                  <input
                    type="number"
                    max={180}
                    value={accumulatedHomeLeave}
                    onChange={(e) => setAccumulatedHomeLeave(Math.min(180, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 text-xs font-bold font-mono text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                  />
                  <span className="text-xs text-slate-500">/ १८० दिन</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">बिरामी बिदा (Sick Leave)</h4>
                  <p className="text-[11px] text-slate-500">वर्षको १२ दिन (पूर्ण तलब सहित, आजीवन सञ्चित)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">सञ्चित:</span>
                  <input
                    type="number"
                    value={accumulatedSickLeave}
                    onChange={(e) => setAccumulatedSickLeave(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 text-xs font-bold font-mono text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                  />
                  <span className="text-xs text-slate-500">दिन</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">भैपरी आउने बिदा:</span>
                  <span className="text-slate-500 text-[11px]">वर्षको ६ दिन (सञ्चित नहुने)</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">पर्व बिदा:</span>
                  <span className="text-slate-500 text-[11px]">वर्षको ६ दिन (सञ्चित नहुने)</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">प्रसूति बिदा:</span>
                  <span className="text-slate-500 text-[11px]">महिला कर्मचारी: ९८ दिन</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">प्रसूति स्याहार बिदा:</span>
                  <span className="text-slate-500 text-[11px]">पुरुष कर्मचारी: १५ दिन</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Encashment Projection (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                अवकाश हुँदा पाउने सञ्चित बिदा नगद भुक्तानी
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Leave Encashment Cash Projection
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              निजामती सेवा नियमावली, २०५० को नियम ५८ र ६१ अनुसार अवकाश हुँदा सञ्चित घर बिदा (अधिकतम १८० दिन) र सम्पूर्ण सञ्चित बिरामी बिदाको रकम अन्तिम महिनाको तलबमानका आधारमा एकमुष्ट भुक्तानी गरिन्छ।
            </p>

            <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 space-y-3">
              <div className="flex justify-between text-xs">
                <span>सञ्चित घर बिदा ({accumulatedHomeLeave} दिन):</span>
                <span className="font-mono font-semibold">
                  रु. {Math.round((accumulatedHomeLeave * basicWithGrade) / 30).toLocaleString('ne-NP')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>सञ्चित बिरामी बिदा ({accumulatedSickLeave} दिन):</span>
                <span className="font-mono font-semibold">
                  रु. {Math.round((accumulatedSickLeave * basicWithGrade) / 30).toLocaleString('ne-NP')}
                </span>
              </div>
              <div className="border-t border-teal-200 dark:border-teal-800 pt-2 flex justify-between items-center font-bold text-sm text-[#0F766E] dark:text-teal-300">
                <span>कुल एकमुष्ट नगद भुक्तानी:</span>
                <span className="text-xl font-mono">
                  रु. {leaveEncashmentCash.toLocaleString('ne-NP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE D: RETIREMENT ESTIMATOR */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'retirement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                ५८ वर्षे उमेर हद मिति प्रविष्टि
              </span>
              <p className="text-xs text-slate-500 mt-0.5">निजामती सेवा ऐन, २०४९ को दफा ३३</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                जन्म मिति वि.सं. (Date of Birth BS):
              </label>
              <input
                type="text"
                value={dobBs}
                onChange={(e) => setDobBs(e.target.value)}
                placeholder="२०३८/०४/१५"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                नागरिकता, शैक्षिक प्रमाणपत्र वा सिटरोलमा जे जेष्ठ हुन्छ सोही मान्य हुन्छ।
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                स्थायी नियुक्ति मिति वि.सं. (Appointment Date BS):
              </label>
              <input
                type="text"
                value={appointmentBs}
                onChange={(e) => setAppointmentBs(e.target.value)}
                placeholder="२०६८/०५/०१"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                अनिवार्य अवकाश गणना नतिजा
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                ५८ वर्ष उमेर पूरा हुने मिति: {retirementCalculation.retirementDateBs}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <span className="text-[10px] text-blue-700 dark:text-blue-400 block uppercase">
                  अवकाश हुन बाँकी सेवा अवधि:
                </span>
                <span className="text-xl font-bold text-[#173B63] dark:text-blue-300 font-mono">
                  {retirementCalculation.remainingYears} वर्ष {retirementCalculation.remainingMonths} महिना
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 block uppercase">
                  हालसम्म पूरा भएको सेवा अवधि:
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {retirementCalculation.serviceYears} वर्ष {retirementCalculation.serviceMonthsRemainder} महिना
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                पेन्सन योग्यता स्थिति:
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {retirementCalculation.isPensionEligible
                  ? 'तपाईंको सेवा अवधि २० वर्ष पूरा भइसकेकाले तपाईं निवृत्तिभरण (Pension) का लागि योग्य हुनुहुन्छ।'
                  : `पेन्सनका लागि २० वर्ष सेवा आवश्यक पर्दछ। तपाईंको हाल ${retirementCalculation.serviceYears} वर्ष पुगेको छ।`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE E: PENSION & GRATUITY PLANNER */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'pension' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                पेन्सन सुत्र मापदण्ड
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{pensionPolicy.sourceLawNe}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                जम्मा गणना हुने सेवा वर्ष (Service Years):
              </label>
              <input
                type="number"
                min={5}
                max={40}
                value={pensionServiceYears}
                onChange={(e) => setPensionServiceYears(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                २० वर्ष वा सोभन्दा बढी भएमा पेन्सन, ५ देखि २० वर्षसम्म उपदान पाइन्छ।
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                अन्तिम महिनाको सुरु तलबमान (ग्रेड सहित):
              </label>
              <div className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white font-mono font-bold">
                रु. {basicWithGrade.toLocaleString('ne-NP')} ({currentScale.levelNameNe})
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                पेन्सन / उपदान रकम अनुमान
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {pensionCalculation.type === 'PENSION'
                  ? 'मासिक निवृत्तिभरण (Monthly Pension)'
                  : 'एकमुष्ट उपदान (Lump-sum Gratuity)'}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              {pensionCalculation.type === 'PENSION' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      मासिक मूल पेन्सन रकम:
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      रु. {pensionCalculation.monthlyBasePension.toLocaleString('ne-NP')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    सुत्र: {pensionCalculation.formulaText}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[10px] text-slate-400 block">७० वर्ष पुगेपछि (+१०%):</span>
                      <span className="font-bold font-mono">रु. {pensionCalculation.senior70Pension.toLocaleString('ne-NP')}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[10px] text-slate-400 block">७५ वर्ष पुगेपछि (+१५%):</span>
                      <span className="font-bold font-mono">रु. {pensionCalculation.senior75Pension.toLocaleString('ne-NP')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">एकमुष्ट उपदान रकम:</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    रु. {pensionCalculation.totalGratuity.toLocaleString('ne-NP')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE F: CAREER GROWTH & PROMOTION PLANNER */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'career' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                बढुवा अङ्क सिमुलेटर (१०० अङ्क)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{promotionPolicy.sourceLawNe}</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                १. कार्यसम्पादन मूल्याङ्कन औसत (का.स.मू. - अधिकतम ४०):
              </label>
              <input
                type="number"
                step={0.5}
                min={0}
                max={40}
                value={kasamuScore}
                onChange={(e) => setKasamuScore(Math.min(40, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  २. हालको पदमा सेवा वर्ष (ज्येष्ठता):
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={seniorityYears}
                  onChange={(e) => setSeniorityYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  ३. भौगोलिक वर्ग:
                </label>
                <select
                  value={geoCategory}
                  onChange={(e) => setGeoCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="A">'क' वर्ग (प्रति वर्ष ४ अङ्क)</option>
                  <option value="B">'ख' वर्ग (प्रति वर्ष ३.२५ अङ्क)</option>
                  <option value="C">'ग' वर्ग (प्रति वर्ष २.५ अङ्क)</option>
                  <option value="D">'घ' वर्ग (प्रति वर्ष १.२५ अङ्क)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                ४. शैक्षिक योग्यता श्रेणी:
              </label>
              <select
                value={academicDegreeGrade}
                onChange={(e) => setAcademicDegreeGrade(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="FIRST">प्रथम श्रेणी (९ अङ्क)</option>
                <option value="SECOND">द्वितीय श्रेणी (८ अङ्क)</option>
                <option value="THIRD">तृतीय श्रेणी (७ अङ्क)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                बढुवा अङ्क विश्लेषण
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                कुल प्राप्त सम्भावित अङ्क: {promotionCalculation.totalScore} / १००
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>१. कार्यसम्पादन मूल्याङ्कन (का.स.मू.):</span>
                <span className="font-mono font-bold">{promotionCalculation.performance} / ४०</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>२. ज्येष्ठता अङ्क:</span>
                <span className="font-mono font-bold">{promotionCalculation.seniority} / २०</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>३. भौगोलिक क्षेत्र अङ्क:</span>
                <span className="font-mono font-bold">{promotionCalculation.geographic} / १६</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>४. शैक्षिक योग्यता:</span>
                <span className="font-mono font-bold">{promotionCalculation.education} / १२</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span>५. सेवाकालीन तालिम:</span>
                <span className="font-mono font-bold">{promotionCalculation.training} / ८</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300">
              <span className="font-bold block">न्यूनतम सेवा अवधि मापदण्ड:</span>
              <p className="mt-0.5">
                {promotionCalculation.isEligible
                  ? 'तपाईंले सम्बन्धित पदमा न्यूनतम ५ वर्ष सेवा अवधि पूरा गर्नुभएकाले बढुवा उम्मेदवारीका लागि योग्य हुनुहुन्छ।'
                  : `बढुवा उम्मेदवार हुन न्यूनतम ५ वर्ष सेवा आवश्यक पर्दछ। तपाईंको हाल ${seniorityYears} वर्ष पुगेको छ।`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE G: SIT-ROLL PROFILE OVERVIEW */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'portal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
                कर्मचारी व्यक्तिगत सेवा विवरण (Sit-Roll Summary)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {user?.fullName || 'रमेश शर्मा'} — {profile?.currentLevel || 'शाखा अधिकृत (सातौं तह)'}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isVerifiedEmployee ? 'प्रमाणित निजामती कर्मचारी' : 'साधारण प्रयोगकर्ता'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">कर्मचारी सङ्केत (PIS):</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">२१४५८९</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">सेवा तह:</span>
              <span className="font-bold text-slate-900 dark:text-white">सङ्घीय निजामती सेवा</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">हालको कार्यालय:</span>
              <span className="font-bold text-slate-900 dark:text-white">सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">नियुक्ति मिति:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">२०६८/०५/०१</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODULE H: VERSIONED FORMULAS DATABASE INSPECTOR */}
      {/* ---------------------------------------------------------------- */}
      {activeModule === 'versions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              Versioned Policies & Legal Formulas Database
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              प्रणालीमा सुरक्षित कानुनी दर र सुत्रहरूको संस्करण अभिलेख
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-[#173B63] dark:text-blue-400 block">
                १. आयकर दर नीति (Tax Policy Version):
              </span>
              <p><strong>आ.व.:</strong> {taxPolicy.fiscalYear} ({taxPolicy.status})</p>
              <p><strong>कानुनी स्रोत:</strong> {taxPolicy.sourceLawNe}</p>
              <p><strong>एकल छुट:</strong> रु. {taxPolicy.singleBasicExemption.toLocaleString('ne-NP')} | <strong>दम्पती छुट:</strong> रु. {taxPolicy.marriedBasicExemption.toLocaleString('ne-NP')}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-[#0F766E] dark:text-teal-400 block">
                २. निवृत्तिभरण नीति (Pension Policy Version):
              </span>
              <p><strong>आ.व.:</strong> {pensionPolicy.fiscalYear} ({pensionPolicy.status})</p>
              <p><strong>कानुनी स्रोत:</strong> {pensionPolicy.sourceLawNe}</p>
              <p><strong>पेन्सन सुत्र:</strong> सेवा वर्ष × अन्तिम तलब ÷ {pensionPolicy.formulaDivisor}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-purple-700 dark:text-purple-400 block">
                ३. बिदा सञ्चिति नीति (Leave Policy Version):
              </span>
              <p><strong>आ.व.:</strong> {leavePolicy.fiscalYear}</p>
              <p><strong>कानुनी स्रोत:</strong> {leavePolicy.sourceLawNe}</p>
              <p><strong>घर बिदा सञ्चिति सीमा:</strong> {leavePolicy.homeLeaveMaxAccumulate} दिन</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-amber-700 dark:text-amber-400 block">
                ४. बढुवा मूल्याङ्कन नीति (Promotion Policy Version):
              </span>
              <p><strong>आ.व.:</strong> {promotionPolicy.fiscalYear}</p>
              <p><strong>कानुनी स्रोत:</strong> {promotionPolicy.sourceLawNe}</p>
              <p><strong>पूर्णाङ्क:</strong> {promotionPolicy.totalMarks} अङ्क (का.स.मू. {promotionPolicy.performanceMax}, ज्येष्ठता {promotionPolicy.seniorityMax}, भौगोलिक {promotionPolicy.geographicMax})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
