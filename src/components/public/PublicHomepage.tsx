import React, { useState } from 'react';
import {
  Search,
  Scale,
  Calculator,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  Building,
  CheckCircle2,
  BellRing,
  HelpCircle,
  Award
} from 'lucide-react';
import { db } from '../../lib/supabase/client';

interface Props {
  onOpenSalaryCalc: () => void;
  onOpenLawSearch: (initialQuery?: string) => void;
  onOpenDrafting: () => void;
  onOpenDateConverter: () => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onNavigateToDashboard: () => void;
  onNavigateToLegal?: () => void;
  onOpenAiAssistant?: (q?: string) => void;
  onNavigateToModule?: (tab: string) => void;
}

export const PublicHomepage: React.FC<Props> = ({
  onOpenSalaryCalc,
  onOpenLawSearch,
  onOpenDrafting,
  onOpenDateConverter,
  onOpenAuth,
  onNavigateToDashboard,
  onNavigateToLegal,
  onOpenAiAssistant,
  onNavigateToModule,
}) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const circulars = db.getCirculars().slice(0, 3);
  const legalDocs = db.getLegalDocs().slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      onOpenLawSearch(globalSearch.trim());
    }
  };

  const FAQS = [
    {
      q: 'NCSDH प्लेटफर्म कसका लागि बनाइएको हो?',
      a: 'यो प्लेटफर्म नेपालका संघ, प्रदेश र स्थानीय तह गरी तिनै तहका विभिन्न सेवा, समूह, उपसमूह, तह तथा श्रेणीमा कार्यरत निजामती कर्मचारी तथा सार्वजनिक सेवाग्राहीहरूका लागि निर्माण गरिएको एकीकृत डिजिटल सहायक हो।',
    },
    {
      q: 'के यो आधिकारिक सरकारी प्रणाली (PIS/सिटरोल) सँग प्रत्यक्ष जोडिएको छ?',
      a: 'वर्तमान चरण १ मा यसले कर्मचारीको व्यक्तिगत अभिलेख सुरक्षित राख्न र प्रमाणीकरणका लागि आवेदन संकलन गर्न सहयोग गर्दछ। सरकारी किताबखानासँग पूर्ण प्राविधिक एकीकरण नभएसम्म प्रयोगकर्ताद्वारा प्रविष्ट गरिएको विवरणलाई "User Provided Information" का रूपमा मात्र सुरक्षित राखिन्छ।',
    },
    {
      q: 'के तलब तथा कर क्यालकुलेटर निःशुल्क प्रयोग गर्न सकिन्छ?',
      a: 'हो, आ.व. २०८१/८२ को आधिकारिक निजामती तलबमान, ग्रेड दर, महङ्गी भत्ता तथा आयकर ऐन २०५८ को नयाँ स्ल्याबमा आधारित क्यालकुलेटर लगइन नगरी पनि सार्वजनिक रूपमा निःशुल्क प्रयोग गर्न सकिन्छ।',
    },
    {
      q: 'कर्मचारी प्रमाणीकरण (Verified Civil Servant) कसरी प्राप्त गर्ने?',
      a: 'साधारण दर्तापछि आफ्नो प्रोफाइलमा गई कर्मचारी सङ्केत नम्बर (PIS Number) र नियुक्ति मिति प्रविष्ट गरी आवेदन पेश गरेपछि प्रणाली प्रशासकले रुजु गरी खातालाई "प्रमाणित कर्मचारी" मा स्तरोन्नति गर्नेछ।',
    },
    {
      q: 'कानुनी प्रश्नमा AI ले कत्तिको सही जवाफ दिन्छ?',
      a: 'AI कानुनी सहायकले केवल उपलब्ध ऐन, नियमावली तथा आधिकारिक दफा (RAG Architecture) को आधारमा प्रमाणसहित दफा उल्लेख गरेर मात्र जवाफ दिन्छ। यसले मनगढन्ते उत्तर दिँदैन।',
    },
  ];

  const SERVICE_MODULES = [
    {
      title: 'कर्मचारी सेवा तथा अभिलेख',
      sub: 'Module 01: Employee Service Portal',
      desc: 'व्यक्तिगत सिटरोल विवरण, पदस्थापन, सरुवा इतिहास तथा ५८ वर्ष अनिवार्य अवकाश मिति अनुमान।',
      icon: Briefcase,
      color: 'text-[#173B63] bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'तलब, भत्ता तथा कर क्यालकुलेटर',
      sub: 'Module 02: Salary & Tax Calculator',
      desc: 'आ.व. २०८१/८२ लागू दर, ग्रेड रकम, सञ्चय कोष, CIT र आयकर (TDS) कटौतीको पारदर्शी हिसाब।',
      icon: Calculator,
      color: 'text-[#0F766E] bg-teal-50 dark:bg-teal-950/40',
    },
    {
      title: 'नेपाल कानुन तथा दफा ज्ञानकोष',
      sub: 'Module 06: Law AI Knowledge Base',
      desc: 'निजामती सेवा ऐन, सार्वजनिक खरिद ऐन र सुशासन ऐनका दफा, संशोधन र सरल व्याख्या।',
      icon: Scale,
      color: 'text-[#3478B9] bg-sky-50 dark:bg-sky-950/40',
    },
    {
      title: 'सरकारी टिप्पणी र पत्र मस्यौदा',
      sub: 'Module 07: Government Drafting Assistant',
      desc: 'निर्णयार्थ टिप्पणी, परिपत्र, स्पष्टीकरण र सिफारिस पत्रको शिष्ट प्रशासनिक ढाँचा।',
      icon: FileText,
      color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'सार्वजनिक खरिद सहयोगी',
      sub: 'Module 10: Public Procurement Guide',
      desc: 'खरिद ऐन, नियमावली, लागत अनुमान, सोझै खरिद मापदण्ड तथा बोलपत्र मूल्याङ्कन सहयोगी।',
      icon: Building,
      color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'वृत्ति विकास तथा बढुवा योजना',
      sub: 'Module 04: Career Growth Planner',
      desc: 'भौगोलिक कार्यक्षेत्र अङ्क, शैक्षिक योग्यता, तालिम तथा बढुवा न्यूनतम सेवा अवधि मापदण्ड।',
      icon: GraduationCap,
      color: 'text-purple-700 bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#173B63] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
            <span>Good Governance · Knowledge · Productivity · Career</span>
          </div>

          {/* Main Headings */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-devanagari">
            निजामती कर्मचारीका लागि <br className="hidden sm:inline" />
            <span className="text-[#173B63] dark:text-blue-400">एकीकृत डिजिटल सहायक</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-devanagari">
            कानुनी जानकारी, प्रशासनिक सहयोग, व्यक्तिगत सेवा विवरण, वृत्ति विकास र कार्यालय व्यवस्थापनका सबै आवश्यक सेवा एउटै प्लेटफर्ममा।
          </p>

          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToDashboard}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] transition-colors shadow-xs flex items-center gap-2"
            >
              <span>प्लेटफर्म प्रयोग गर्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAiAssistant ? onOpenAiAssistant() : onOpenLawSearch('कानुन')}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0c5c56] transition-colors shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Assistant प्रयोग गर्नुहोस्</span>
            </button>

            <button
              onClick={() => onNavigateToLegal ? onNavigateToLegal() : onOpenLawSearch()}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              कानुन खोज्नुहोस्
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#173B63] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg hover:bg-blue-100 transition-colors"
            >
              दर्ता गर्नुहोस्
            </button>
          </div>
        </div>

        {/* 2. GLOBAL SEARCH IN HERO */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="कानुन, दफा, तलबमान, परिपत्र वा प्रशासनिक औजार खोज्नुहोस्..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3.5 py-1.5 text-xs font-semibold bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e]"
            >
              खोजी
            </button>
          </form>

          {/* Quick search tags */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>लोकप्रिय खोजी:</span>
            <button
              type="button"
              onClick={() => onOpenLawSearch('बिदा')}
              className="text-[#3478B9] hover:underline"
            >
              बिदा सम्बन्धी व्यवस्था
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenLawSearch('सरुवा')}
              className="text-[#3478B9] hover:underline"
            >
              सरुवा मापदण्ड
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenLawSearch('सोझै खरिद')}
              className="text-[#3478B9] hover:underline"
            >
              सोझै खरिद सीमा
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenSalaryCalc}
              className="text-[#3478B9] hover:underline"
            >
              २०८१ तलबमान
            </button>
          </div>
        </div>
      </section>

      {/* 3. POPULAR FREE TOOLS SHOWCASE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              लोकप्रिय प्रशासनिक औजारहरू (Popular Tools)
            </h2>
            <p className="text-xs text-slate-500">
              लगइन नगरी पनि निःशुल्क प्रयोग गर्न सकिने प्रशासनिक तथा कानुनी क्यालकुलेटरहरू
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={onOpenSalaryCalc}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] cursor-pointer transition-all"
          >
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400 w-fit mb-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              तलब तथा कर क्यालकुलेटर
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              आ.व. २०८१/८२ लागू तलबमान, ग्रेड, महङ्गी भत्ता, सञ्चय कोष र TDS गणना गर्नुहोस्।
            </p>
          </div>

          <div
            onClick={() => onNavigateToLegal ? onNavigateToLegal() : onOpenLawSearch()}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] cursor-pointer transition-all"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0F766E] dark:text-teal-400 w-fit mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              कानुन तथा दफा ज्ञानकोष
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              निजामती सेवा ऐन, सार्वजनिक खरिद ऐनका सबै दफा, उपदफा र AI सहायक खोजी गर्नुहोस्।
            </p>
          </div>

          <div
            onClick={onOpenDrafting}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] cursor-pointer transition-all"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 w-fit mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              टिप्पणी र पत्र मस्यौदा
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              निर्णयार्थ टिप्पणी, परिपत्र र स्पष्टीकरणको आधिकारिक सरकारी ढाँचा तयार गर्नुहोस्।
            </p>
          </div>

          <div
            onClick={onOpenDateConverter}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] cursor-pointer transition-all"
          >
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 w-fit mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              नेपाली मिति रूपान्तरक
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              वि.सं. (BS) र ई.सं. (AD) बीचको छिटो रूपान्तरण र बार विवरण हेर्नुहोस्।
            </p>
          </div>
        </div>
      </section>

      {/* 4. MAIN SERVICE MODULES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            प्लेटफर्मका मुख्य सेवा मोड्युलहरू (Service Modules)
          </h2>
          <p className="text-xs text-slate-500">
            सम्पूर्ण २८ वटा प्रशासनिक मोड्युल एउटै डिजिटल खाताबाट एकीकृत रूपमा सञ्चालन हुनेछन्।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const handleClick = () => {
              if (idx === 0) onOpenSalaryCalc();
              else if (idx === 1) onOpenSalaryCalc();
              else if (idx === 2) {
                if (onNavigateToLegal) onNavigateToLegal();
                else onOpenLawSearch();
              } else if (idx === 3) onOpenDrafting();
              else if (idx === 4) {
                if (onNavigateToModule) onNavigateToModule('procurement');
                else window.open?.('https://procurement-bay.vercel.app', '_blank');
              } else if (idx === 5) {
                onOpenSalaryCalc();
              }
            };

            return (
              <div
                key={idx}
                onClick={handleClick}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2 hover:border-[#173B63] dark:hover:border-blue-400 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {mod.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {mod.sub}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LATEST CIRCULARS & LEGAL UPDATES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#173B63] dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ताजा सरकारी परिपत्र तथा सूचना
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">आधिकारिक स्रोत</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {circulars.map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-[#173B63] dark:text-blue-400">
                    {c.issuingAuthority}
                  </span>
                  <span>{c.issuedDateBs}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {c.titleNe}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {c.summaryNe}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Knowledge Updates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                अद्यावधिक सरकारी ऐन तथा कानुनहरू
              </h3>
            </div>
            <button
              onClick={() => onOpenLawSearch()}
              className="text-xs text-[#3478B9] hover:underline"
            >
              सबै हेर्नुहोस्
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {legalDocs.map((doc) => (
              <div key={doc.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {doc.category}
                  </span>
                  <span className="text-emerald-600 font-semibold">{doc.versionNo}</span>
                </div>
                <h4
                  onClick={() => onOpenLawSearch(doc.titleNe)}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#3478B9] cursor-pointer"
                >
                  {doc.titleNe}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. USEFUL GOVERNMENT RESOURCES */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          उपयोगी सरकारी निकाय तथा पोर्टलहरू (Government Portals)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <a
            href="https://psc.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#173B63] flex flex-col justify-between"
          >
            <span className="font-bold text-slate-900 dark:text-white">लोक सेवा आयोग</span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              psc.gov.np <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://pis.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#173B63] flex flex-col justify-between"
          >
            <span className="font-bold text-slate-900 dark:text-white">राष्ट्रिय किताबखाना (निजामती)</span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              pis.gov.np <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://mofaga.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#173B63] flex flex-col justify-between"
          >
            <span className="font-bold text-slate-900 dark:text-white">सङ्घीय मामिला मन्त्रालय</span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              mofaga.gov.np <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://mof.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#173B63] flex flex-col justify-between"
          >
            <span className="font-bold text-slate-900 dark:text-white">अर्थ मन्त्रालय</span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              mof.gov.np <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://lawcommission.gov.np"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#173B63] flex flex-col justify-between"
          >
            <span className="font-bold text-slate-900 dark:text-white">नेपाल कानुन आयोग</span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              lawcommission.gov.np <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#173B63] dark:text-blue-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            प्रायः सोधिने प्रश्नहरू (Frequently Asked Questions)
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-[#173B63]' : ''
                  }`}
                />
              </button>

              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
