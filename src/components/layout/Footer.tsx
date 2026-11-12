import React from 'react';
import { ShieldCheck, ExternalLink, Heart } from 'lucide-react';

interface Props {
  onOpenSalaryCalc: () => void;
  onOpenLawSearch: () => void;
  onOpenDrafting: () => void;
  onOpenDatabase: () => void;
}

export const Footer: React.FC<Props> = ({
  onOpenSalaryCalc,
  onOpenLawSearch,
  onOpenDrafting,
  onOpenDatabase,
}) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇳🇵</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                NCSDH · नेपाल निजामती हब
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              नेपालका संघ, प्रदेश र स्थानीय तहका निजामती कर्मचारीका लागि एकीकृत प्रशासनिक, कानुनी तथा उत्पादकत्व डिजिटल प्लेटफर्म।
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                PostgreSQL & Supabase Ready
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              प्रशासनिक औजारहरू
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onOpenSalaryCalc} className="hover:text-slate-900 dark:hover:text-white">
                  तलब तथा कर क्यालकुलेटर (२०८१/८२)
                </button>
              </li>
              <li>
                <button onClick={onOpenLawSearch} className="hover:text-slate-900 dark:hover:text-white">
                  नेपाल कानुन तथा दफा खोजी
                </button>
              </li>
              <li>
                <button onClick={onOpenDrafting} className="hover:text-slate-900 dark:hover:text-white">
                  सरकारी टिप्पणी तथा पत्र मस्यौदा
                </button>
              </li>
              <li>
                <button onClick={onOpenDatabase} className="hover:text-slate-900 dark:hover:text-white">
                  डेटाबेस स्किमा र माइग्रेसन
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              सरकारी आधिकारिक पोर्टलहरू
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://psc.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  लोक सेवा आयोग (PSC) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pis.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  राष्ट्रिय किताबखाना (निजामती) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mofaga.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  सङ्घीय मामिला तथा सामान्य प्रशासन <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://lawcommission.gov.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                >
                  नेपाल कानुन आयोग <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal disclaimer */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              अस्वीकरण (Disclaimer)
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              यो प्लेटफर्म निजामती कर्मचारीको कार्यसम्पादन तथा सूचना सहजीकरणका लागि निर्माण गरिएको डिजिटल प्रणाली हो। आधिकारिक सरकारी अभिलेख वा कानुनी विवादमा नेपाल राजपत्र र सम्बन्धित मन्त्रालयको निर्णय नै अन्तिम प्रमाण मानिनेछ।
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Nepal Civil Servants Digital Hub (NCSDH). सर्वाधिकार सुरक्षित।
          </div>
          <div className="flex items-center gap-4">
            <span>सुशासन · ज्ञान · उत्पादकत्व · वृत्ति विकास</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
