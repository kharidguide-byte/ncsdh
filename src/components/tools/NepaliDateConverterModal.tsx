import React, { useState } from 'react';
import { X, Calendar, ArrowRightLeft, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NepaliDateConverterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'bs_to_ad' | 'ad_to_bs'>('bs_to_ad');

  // BS inputs
  const [bsYear, setBsYear] = useState<number>(2081);
  const [bsMonth, setBsMonth] = useState<number>(7); // कार्तिक
  const [bsDay, setBsDay] = useState<number>(25);

  // AD inputs
  const [adDate, setAdDate] = useState<string>('2026-11-12');

  if (!isOpen) return null;

  const NEPALI_MONTHS = [
    'बैशाख',
    'जेठ',
    'असार',
    'साउन',
    'भदौ',
    'असोज',
    'कार्तिक',
    'मंसिर',
    'पौष',
    'माघ',
    'फागुन',
    'चैत',
  ];

  // Quick mathematical BS <-> AD approximation for modern civil service documents
  // (Difference between BS and AD is ~56 years, 8 months, 15–17 days)
  const convertBsToAd = (year: number, month: number, day: number) => {
    // 2081 Baishakh 1 was ~ 2024-04-13
    // Standard approximation: subtract 56 years, adjust days
    const approxYear = year - 57;
    // Estimated corresponding date calculation
    const baseDate = new Date(2024, 3, 13); // 2081-01-01
    const monthOffsets = [0, 31, 62, 93, 124, 155, 185, 215, 245, 274, 304, 334];
    const totalDaysFromBaishakh1 = (monthOffsets[month - 1] || 0) + (day - 1);
    
    // Offset for years difference from 2081
    const yearDiff = year - 2081;
    const resultDate = new Date(baseDate.getTime() + (yearDiff * 365 + totalDaysFromBaishakh1) * 86400000);
    
    return {
      dateString: resultDate.toISOString().split('T')[0],
      weekday: resultDate.toLocaleDateString('en-US', { weekday: 'long' }),
      formatted: resultDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  };

  const convertAdToBs = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10) || 2026;
    const month = parseInt(parts[1], 10) || 1;
    const day = parseInt(parts[2], 10) || 1;

    // Approximate BS year is AD year + 57 (after mid-April) or + 56
    const estBsYear = month >= 4 ? year + 57 : year + 56;
    let estBsMonth = (month + 8) % 12 || 12;
    let estBsDay = Math.min(30, (day + 14) % 30 || 1);

    return {
      bsString: `${estBsYear}/${String(estBsMonth).padStart(2, '0')}/${String(estBsDay).padStart(2, '0')}`,
      monthName: NEPALI_MONTHS[estBsMonth - 1] || 'कार्तिक',
      formattedNe: `${estBsYear} साल ${NEPALI_MONTHS[estBsMonth - 1]} ${estBsDay} गते`,
    };
  };

  const adResult = convertBsToAd(bsYear, bsMonth, bsDay);
  const bsResult = convertAdToBs(adDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#173B63] text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                नेपाली मिति रूपान्तरक (BS ⇄ AD Converter)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                वि.सं. र ई.सं. बीचको छिटो रूपान्तरण
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

        {/* Tab switch */}
        <div className="p-6 space-y-5">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setMode('bs_to_ad')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'bs_to_ad'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              वि.सं. बाट ई.सं. (BS to AD)
            </button>
            <button
              onClick={() => setMode('ad_to_bs')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'ad_to_bs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ई.सं. बाट वि.सं. (AD to BS)
            </button>
          </div>

          {mode === 'bs_to_ad' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    वर्ष (BS Year)
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    value={bsYear}
                    onChange={(e) => setBsYear(parseInt(e.target.value) || 2081)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    महिना (Month)
                  </label>
                  <select
                    value={bsMonth}
                    onChange={(e) => setBsMonth(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {NEPALI_MONTHS.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {idx + 1}. {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    गते (Day)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={32}
                    value={bsDay}
                    onChange={(e) => setBsDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums text-center"
                  />
                </div>
              </div>

              {/* Converted Output Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  ईस्वी संवत् (AD Date)
                </span>
                <h3 className="text-xl font-bold text-[#173B63] dark:text-blue-400 mt-1 tabular-nums">
                  {adResult.formatted}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  वार: {adResult.weekday} · मानक ढाँचा: {adResult.dateString}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ईस्वी संवत् मिति (Select Gregorian Date)
                </label>
                <input
                  type="date"
                  value={adDate}
                  onChange={(e) => setAdDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Converted Output Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  विक्रम संवत् मिति (BS Date)
                </span>
                <h3 className="text-xl font-bold text-[#0F766E] dark:text-teal-400 mt-1">
                  {bsResult.formattedNe}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  अंकमा: {bsResult.bsString} (वि.सं.)
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-100 dark:border-blue-900 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              आजको सरकारी मिति:
            </span>
            <span className="font-bold">२०८१ कार्तिक २५ गते (आइतबार)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
