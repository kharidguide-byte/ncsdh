import React, { useState, useMemo } from 'react';
import { db } from '../../lib/supabase/client';
import { LegalDocument, LegalSection } from '../../types';
import { LegalJsonImporterModal } from './LegalJsonImporterModal';
import { LegalAIAssistantDrawer } from './LegalAIAssistantDrawer';
import {
  Scale,
  Search,
  BookOpen,
  FileCode,
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Copy,
  Plus,
  History,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  StickyNote
} from 'lucide-react';

export const LegalKnowledgeHub: React.FC = () => {
  // DB state
  const [docs, setDocs] = useState<LegalDocument[]>(db.getLegalDocs());
  const [sections, setSections] = useState<LegalSection[]>(db.getLegalSections());

  // Navigation & selection
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id || 'law-001');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-001');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [docTypeFilter, setDocTypeFilter] = useState('all');

  // Tab inside section reader
  const [readerTab, setReaderTab] = useState<'text' | 'explanation' | 'related' | 'versions' | 'notes'>('text');

  // Personal note text for currently selected section
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Modals state
  const [importerOpen, setImporterOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiQuestionPrompt, setAiQuestionPrompt] = useState('');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Current selected document
  const currentDoc = useMemo(() => {
    return docs.find((d) => d.id === selectedDocId) || docs[0];
  }, [docs, selectedDocId]);

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    return db.searchLegalKnowledge(searchQuery, categoryFilter, docTypeFilter);
  }, [searchQuery, categoryFilter, docTypeFilter, sections]);

  // Sections of current document
  const currentDocSections = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredSections;
    }
    return sections.filter((s) => s.documentId === selectedDocId);
  }, [sections, selectedDocId, searchQuery, filteredSections]);

  // Currently selected section
  const activeSection = useMemo(() => {
    const found = sections.find((s) => s.id === selectedSectionId);
    if (found) return found;
    return currentDocSections[0] || sections[0];
  }, [sections, selectedSectionId, currentDocSections]);

  // Load note for active section
  React.useEffect(() => {
    if (activeSection) {
      setNoteText(activeSection.userNotes || '');
    }
  }, [activeSection?.id]);

  const handleSaveNote = () => {
    if (!activeSection) return;
    db.saveSectionNote(activeSection.id, noteText);
    setSections([...db.getLegalSections()]);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleCopyCitation = () => {
    if (!activeSection) return;
    const text = `${currentDoc?.titleNe || activeSection.documentTitleNe}
${activeSection.chapterTitleNe} - ${activeSection.sectionNo}: ${activeSection.titleNe}
[मूल कानुनी पाठ]: ${activeSection.contentNe}
[सरल व्याख्या]: ${activeSection.simpleExplanationNe || 'लागू छैन'}
स्रोत: NCSDH डिजिटल कानुनी सहायक (${currentDoc?.officialSourceUrl || 'https://lawcommission.gov.np'})`;
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleImportSuccess = (title: string, count: number) => {
    setDocs([...db.getLegalDocs()]);
    setSections([...db.getLegalSections()]);
    setImportNotification(`सफलतापूर्वक "${title}" (${count} दफाहरू) आयात भयो!`);
    setTimeout(() => setImportNotification(null), 4000);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAiForSection = (title: string, sectionNo: string) => {
    setAiQuestionPrompt(`${currentDoc?.titleNe} को ${sectionNo} (${title}) सम्बन्धी कानुनी प्रावधान के छ?`);
    setAiAssistantOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              Legal Knowledge Base & AI Hub
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">नेपाल सरकारी कानुन ज्ञानकेन्द्र</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            नेपाल निजामती कानुन तथा दफा ज्ञानकोष
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ऐन, नियमावली, उपदफा, संशोधन इतिहास, Full Text Search तथा RAG-based AI Legal Assistant
          </p>
        </div>

        {/* Action Buttons: JSON Importer & AI Assistant */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setImporterOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-[#173B63] dark:text-blue-400 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileCode className="w-4 h-4 text-[#173B63] dark:text-blue-400" />
            <span>JSON Importer</span>
          </button>

          <button
            onClick={() => {
              setAiQuestionPrompt('');
              setAiAssistantOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0c5c56] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Legal Assistant</span>
          </button>
        </div>
      </div>

      {importNotification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Global Search & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ऐन, नियमावली, दफा, उपदफा वा कानुनी विषय खोज्नुहोस् (उदा: सरुवा, घर बिदा, सोझै खरिद, अनिवार्य अवकाश)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="all">सबै प्रकार (All Types)</option>
            <option value="ACT">ऐन (Acts)</option>
            <option value="RULE">नियमावली (Rules)</option>
            <option value="DIRECTIVE">निर्देशिका (Directives)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="all">सबै विषय (All Categories)</option>
            <option value="निजामती प्रशासन तथा सेवा सर्त">निजामती प्रशासन</option>
            <option value="सार्वजनिक खरिद तथा वित्तीय व्यवस्थापन">सार्वजनिक खरिद</option>
            <option value="सुशासन तथा सार्वजनिक सेवा प्रवाह">सुशासन तथा सेवा</option>
          </select>
        </div>
      </div>

      {/* Main Legal Explorer: 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Acts Catalog (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              कानुन सूची ({docs.length} दस्तावेज)
            </span>

            <div className="space-y-1.5">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedDocId === doc.id && !searchQuery
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#173B63] dark:border-blue-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-[#173B63] dark:text-blue-400">
                      {doc.docType}
                    </span>
                    <span>{doc.enactmentDateBs}</span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1">{doc.titleNe}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {doc.versionNo || 'मूल ऐन'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Sections Tree / Search Results (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2 max-h-[78vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {searchQuery
                  ? `खोजी नतिजा (${currentDocSections.length} दफा)`
                  : `${currentDoc?.titleNe} का दफाहरू`}
              </span>
              <span className="text-xs text-slate-400">
                {currentDocSections.length} दफा
              </span>
            </div>

            {currentDocSections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                कुनै दफा फेला परेन।
              </div>
            ) : (
              <div className="space-y-1.5">
                {currentDocSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      activeSection?.id === sec.id
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-[#0F766E] text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-[#173B63] dark:text-blue-400">
                        {sec.sectionNo}
                      </span>
                      <span>{sec.chapterTitleNe}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {sec.titleNe}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {sec.simpleExplanationNe || sec.contentNe}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Section Reader & Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeSection ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
              {/* Section Header */}
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-[#173B63] dark:text-blue-400">
                      {activeSection.documentTitleNe || currentDoc?.titleNe}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeSection.chapterNo}: {activeSection.chapterTitleNe}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleBookmark(activeSection.id)}
                      title="बुकमार्क गर्नुहोस्"
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        bookmarkedSections.includes(activeSection.id)
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopyCitation}
                      title="उद्धरण कपी गर्नुहोस्"
                      className="p-1.5 text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      {copiedCitation ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeSection.sectionNo} — {activeSection.titleNe}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-medium">हाल लागू कानुनी व्यवस्था</span>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => openAiForSection(activeSection.titleNe, activeSection.sectionNo)}
                    className="text-[#0F766E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI लाई यस दफाबारे सोध्नुहोस्
                  </button>
                </div>
              </div>

              {/* Reader Sub-Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setReaderTab('text')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    readerTab === 'text'
                      ? 'border-[#173B63] text-[#173B63] dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  मूल पाठ र उपदफा
                </button>
                <button
                  onClick={() => setReaderTab('explanation')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    readerTab === 'explanation'
                      ? 'border-[#173B63] text-[#173B63] dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  सरल व्याख्या
                </button>
                <button
                  onClick={() => setReaderTab('related')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    readerTab === 'related'
                      ? 'border-[#173B63] text-[#173B63] dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  सम्बन्धित व्यवस्था
                </button>
                <button
                  onClick={() => setReaderTab('notes')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    readerTab === 'notes'
                      ? 'border-[#173B63] text-[#173B63] dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  मेरो नोट
                </button>
              </div>

              {/* Reader Content Body */}
              <div className="space-y-4 text-xs sm:text-sm font-devanagari">
                {readerTab === 'text' && (
                  <div className="space-y-4">
                    {/* Main section text */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {activeSection.contentNe}
                    </div>

                    {/* Subsections list */}
                    {activeSection.subsections && activeSection.subsections.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-500 font-sans block uppercase">
                          उपदफाहरू (Subsections):
                        </span>
                        {activeSection.subsections.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5"
                          >
                            <span className="font-bold text-[#173B63] dark:text-blue-400">
                              {sub.subsectionNo}
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                              {sub.contentNe}
                            </p>

                            {/* Clauses खण्डहरू */}
                            {sub.clauses && (
                              <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 mt-2">
                                {sub.clauses.map((c, ci) => (
                                  <div key={ci} className="text-xs text-slate-600 dark:text-slate-400">
                                    <strong className="text-slate-800 dark:text-slate-200 mr-1.5">
                                      {c.clauseNo}:
                                    </strong>
                                    {c.contentNe}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {readerTab === 'explanation' && (
                  <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 space-y-2">
                    <span className="text-xs font-bold text-[#0F766E] uppercase font-sans flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#0F766E]" />
                      सरल नेपाली व्याख्या (Plain Language Summary)
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {activeSection.simpleExplanationNe || 'यस दफाको सरल व्याख्या उपलब्ध छैन।'}
                    </p>
                  </div>
                )}

                {readerTab === 'related' && (
                  <div className="space-y-3">
                    {activeSection.relatedProvisions && activeSection.relatedProvisions.length > 0 ? (
                      activeSection.relatedProvisions.map((rel) => (
                        <div
                          key={rel.id}
                          className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                        >
                          <span className="font-bold text-[#173B63] dark:text-blue-400 text-xs">
                            {rel.targetDocTitleNe} ({rel.targetSectionNo})
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {rel.descriptionNe}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 p-4 text-center">
                        यस दफासँग सम्बन्धित अन्य कानुनी क्रस-रेफरेन्स प्रविष्टि उपलब्ध छैन।
                      </p>
                    )}
                  </div>
                )}

                {readerTab === 'notes' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      यस दफामा तपाईंको व्यक्तिगत कार्यालय टिप्पणी वा नोट:
                    </span>
                    <textarea
                      rows={5}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="उदा: यो दफा अनुसार हाम्रो कार्यालयले भदौ १५ सम्म फाइल पेश गर्नुपर्ने..."
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center justify-between">
                      {noteSaved ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> नोट सुरक्षित गरियो!
                        </span>
                      ) : (
                        <span></span>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e]"
                      >
                        नोट सेभ गर्नुहोस्
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              कृपया बायाँबाट कुनै कानुनी दफा छनोट गर्नुहोस्।
            </div>
          )}
        </div>
      </div>

      {/* JSON Importer Modal */}
      <LegalJsonImporterModal
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* RAG AI Assistant Drawer */}
      <LegalAIAssistantDrawer
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        initialQuestion={aiQuestionPrompt}
      />
    </div>
  );
};
