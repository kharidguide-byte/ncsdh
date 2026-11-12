import React, { useState } from 'react';
import { db } from '../../lib/supabase/client';
import { LegalQueryAnswer } from '../../types';
import {
  X,
  Sparkles,
  Send,
  Scale,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  onSelectSection?: (sectionNo: string) => void;
}

export const LegalAIAssistantDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  initialQuestion = '',
  onSelectSection,
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<LegalQueryAnswer | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: LegalQueryAnswer }[]>([]);

  if (!isOpen) return null;

  const SUGGESTED_QUERIES = [
    'निजामती कर्मचारीले कति दिन घर बिदा पाउँछ?',
    'कर्मचारीको सरुवासम्बन्धी कानुनी व्यवस्था के छ?',
    'सार्वजनिक खरिदमा सोझै खरिद गर्न पाउने सीमा के हो?',
    '५८ वर्षको अनिवार्य अवकाशको गणना कसरी हुन्छ?',
    'का.स.मू. फाराम कहिलेसम्म दर्ता गराउनुपर्छ?',
    'निजामती सेवामा ४५% समावेशी आरक्षण कसरी विभाजन गरिएको छ?',
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setAnswer(null);

    try {
      // First, get client RAG groundings
      const localResult = await db.queryRAGLegalAssistant(queryText);

      // Try calling the server-side API for Gemini synthesis if available
      try {
        const res = await fetch('/api/legal/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: queryText,
            retrievedContext: localResult,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.answerText) {
            // Enhanced with server synthesis if returned
            localResult.plainExplanationNe = data.answerText;
          }
        }
      } catch (err) {
        // Safe graceful fallback to local grounded synthesis
      }

      setAnswer(localResult);
      setChatHistory((prev) => [{ q: queryText, a: localResult }, ...prev]);
    } catch (err) {
      console.error('Legal AI query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };

  const copyAnswer = () => {
    if (!answer) return;
    const text = `नेपाल निजामती कानुनी AI सहायक (प्रमाणित उत्तर)
प्रश्न: ${answer.question}
१. सम्बन्धित ऐन/नियमावली: ${answer.actTitleNe}
२. सम्बन्धित दफा: ${answer.sectionNo} - ${answer.sectionTitleNe}
३. मूल कानुनी पाठ: "${answer.originalStatutoryText}"
४. सरल व्याख्या: ${answer.plainExplanationNe}
५. संशोधन तथा लागू मिति: ${answer.amendmentAndDateNe}
६. आधिकारिक स्रोत: ${answer.officialSourceUrl}
स्रोत: NCSDH Legal AI Knowledge Hub`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0F766E] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  RAG-based AI Legal Assistant (कानुनी AI सहायक)
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  प्रमाणित स्रोत मात्र
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                निजामती सेवा, खरिद र सुशासन कानुनका दफा, उपदफा र मूल पाठसहितको वस्तुनिष्ठ उत्तर
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

        {/* Query Input & Suggested Chips */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3">
          <form onSubmit={handleFormSubmit} className="relative flex gap-2">
            <input
              type="text"
              placeholder="कानुनी प्रश्न सोध्नुहोस् (उदा: बिदा, सरुवा, पेन्सन, सोझै खरिद, का.स.मू.)..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 text-xs font-semibold bg-[#0F766E] text-white rounded-xl hover:bg-[#0c5c56] disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>सोध्नुहोस्</span>
            </button>
          </form>

          {/* Quick query chips */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              सुझावित कानुनी प्रश्नहरू:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuestion(sq);
                    handleAsk(sq);
                  }}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Answer Viewer */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                कानुनी ज्ञानकोषमा ऐन, नियमावली र दफाहरू रुजु हुँदैछ...
              </p>
              <p className="text-[11px] text-slate-400">
                RAG Grounding: केवल उपलब्ध आधिकारिक दफाको आधारमा जवाफ तयार गरिँदैछ।
              </p>
            </div>
          )}

          {!loading && !answer && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                माथिको बाकसमा प्रश्न सोध्नुहोस् वा कुनै सुझावित प्रश्न छनोट गर्नुहोस्।
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                AI ले मनगढन्ते अनुमान नगरी सम्बन्धित ऐनको नाम, लागू दफा, मूल कानुनी पाठ र सरल व्याख्यासहित जवाफ प्रस्तुत गर्दछ।
              </p>
            </div>
          )}

          {!loading && answer && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-xs space-y-4 font-devanagari">
              {/* Question header & confidence */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-sans">तपाईंको प्रश्न:</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    &ldquo;{answer.question}&rdquo;
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {answer.confidence === 'EXACT_STATUTORY_MATCH'
                      ? 'दुरुस्त कानुनी आधार'
                      : 'प्रमाणित अभिलेख'}
                  </span>
                  <button
                    onClick={copyAnswer}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg"
                    title="सम्पूर्ण जवाफ कपी गर्नुहोस्"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1. Official Act and Section Citation */}
              <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">लागू कानुनी व्यवस्था:</span>
                  <p className="text-sm font-bold text-[#173B63] dark:text-blue-300">
                    {answer.actTitleNe} — {answer.sectionNo}: {answer.sectionTitleNe}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    संशोधन तथा लागू स्थिति: {answer.amendmentAndDateNe}
                  </p>
                </div>

                <a
                  href={answer.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 text-[#173B63] dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-1 text-[11px] shrink-0"
                >
                  <span>आधिकारिक स्रोत</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 2. Original Statutory Text */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-sans">
                  <Scale className="w-3.5 h-3.5 text-[#173B63]" />
                  मूल कानुनी पाठ (Verbatim Statutory Text):
                </span>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-devanagari">
                  &ldquo;{answer.originalStatutoryText}&rdquo;
                </div>
              </div>

              {/* 3. Plain Nepali Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  सरल व्याख्या र व्यावहारिक प्रयोग (Plain Nepali Meaning):
                </span>
                <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {answer.plainExplanationNe}
                </div>
              </div>

              {/* 4. Related Provisions if any */}
              {answer.relatedProvisions && answer.relatedProvisions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    सम्बन्धित अन्य कानुनी व्यवस्थाहरू (Cross References):
                  </span>
                  <div className="space-y-1">
                    {answer.relatedProvisions.map((rel) => (
                      <div
                        key={rel.id}
                        className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {rel.targetDocTitleNe} ({rel.targetSectionNo})
                          </span>
                          <p className="text-[11px] text-slate-500">{rel.descriptionNe}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat History */}
          {chatHistory.length > 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                अघिल्ला प्रश्नहरू ({chatHistory.length - 1}):
              </span>
              <div className="space-y-1.5">
                {chatHistory.slice(1).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(item.q);
                      setAnswer(item.a);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between"
                  >
                    <span className="line-clamp-1">{item.q}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.a.sectionNo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
