import React, { useState, useMemo } from 'react';
import { db } from '../../lib/supabase/client';
import { X, Scale, Search, BookOpen, ExternalLink, Bookmark, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const LawSearchModal: React.FC<Props> = ({ isOpen, onClose, initialQuery = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [savedSections, setSavedSections] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const docs = db.getLegalDocs();
  const allSections = db.getLegalSections();

  const filteredSections = useMemo(() => {
    return allSections.filter((sec) => {
      const matchDoc = selectedDocId === 'all' || sec.documentId === selectedDocId;
      if (!matchDoc) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const inTitle = sec.titleNe.toLowerCase().includes(q);
      const inContent = sec.contentNe.toLowerCase().includes(q);
      const inSection = sec.sectionNo.toLowerCase().includes(q);
      const inExpl = sec.simpleExplanationNe?.toLowerCase().includes(q) || false;
      const inKeywords = sec.keywords?.some((k) => k.toLowerCase().includes(q)) || false;

      return inTitle || inContent || inSection || inExpl || inKeywords;
    });
  }, [allSections, selectedDocId, searchTerm]);

  if (!isOpen) return null;

  const toggleBookmark = (id: string) => {
    setSavedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copySection = (sec: any) => {
    const text = `${sec.documentTitleNe || 'नेपाल कानुन'}
${sec.chapterTitleNe} - ${sec.sectionNo}: ${sec.titleNe}
[मूल कानुनी पाठ]: ${sec.contentNe}
[सरल व्याख्या]: ${sec.simpleExplanationNe || 'लागू छैन'}
स्रोत: NCSDH डिजिटल कानुनी सहायक`;
    navigator.clipboard.writeText(text);
    setCopiedId(sec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#173B63] text-white">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                नेपाल सरकारी कानुन तथा दफा खोजी (Digital Law Library)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                निजामती सेवा ऐन, सार्वजनिक खरिद ऐन, सुशासन ऐन तथा सम्बन्धित नियमावलीका दफाहरू
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

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="दफा, शीर्षक वा कानुनी विषय खोज्नुहोस् (उदा: सरुवा, बिदा, अवकाश, सोझै खरिद)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
            />
          </div>

          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="all">सबै ऐन तथा कानुनहरू ({allSections.length} दफा)</option>
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.titleNe}
              </option>
            ))}
          </select>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                कुनै कानुनी दफा फेला परेन।
              </p>
              <p className="text-xs text-slate-500 mt-1">
                कृपया फरक शब्द वा ऐन छनोट गरी पुनः खोजी गर्नुहोस्।
              </p>
            </div>
          ) : (
            filteredSections.map((sec) => (
              <div
                key={sec.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-xs hover:border-[#3478B9] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-medium text-[#173B63] dark:text-blue-400">
                        {sec.documentTitleNe || 'निजामती सेवा ऐन, २०४९'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{sec.chapterTitleNe}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sec.sectionNo}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {sec.titleNe}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookmark(sec.id)}
                      title="बुकमार्क गर्नुहोस्"
                      className={`p-2 rounded-lg border text-xs transition-colors ${
                        savedSections.includes(sec.id)
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
                          : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copySection(sec)}
                      className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      {copiedId === sec.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>कपी भयो</span>
                        </>
                      ) : (
                        <span>उद्धरण कपी</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Legal Content */}
                <div className="mt-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-devanagari">
                  {sec.contentNe}
                </div>

                {/* Simple explanation */}
                {sec.simpleExplanationNe && (
                  <div className="mt-2.5 flex items-start gap-2 text-xs text-[#0F766E] dark:text-teal-400 font-medium">
                    <span className="shrink-0 font-bold">[सरल अर्थ]:</span>
                    <span>{sec.simpleExplanationNe}</span>
                  </div>
                )}

                {/* Keywords tags */}
                {sec.keywords && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-slate-400">सम्बन्धित विषय:</span>
                    {sec.keywords.map((k, i) => (
                      <span key={i} className="text-slate-600 dark:text-slate-400">
                        {k}
                        {i < sec.keywords!.length - 1 && ' ·'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
