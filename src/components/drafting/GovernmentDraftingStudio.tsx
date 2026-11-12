import React, { useState, useMemo } from 'react';
import { db } from '../../lib/supabase/client';
import { GovernmentDraftItem, GovernmentDocumentType } from '../../types';
import { exportToDocx, printOfficialDocument } from '../../lib/export/documentExport';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  Users,
  FileCheck2,
  Send,
  RefreshCw,
  HelpCircle,
  Bookmark
} from 'lucide-react';

interface Props {
  initialDraftId?: string;
}

export const GovernmentDraftingStudio: React.FC<Props> = ({ initialDraftId }) => {
  // Drafts stored in DB
  const [drafts, setDrafts] = useState<GovernmentDraftItem[]>(db.getDrafts());
  const [selectedDraftId, setSelectedDraftId] = useState<string>(
    initialDraftId || drafts[0]?.id || 'draft-001'
  );

  // Active Draft Editing state
  const activeDraft = useMemo(() => {
    return drafts.find((d) => d.id === selectedDraftId) || drafts[0];
  }, [drafts, selectedDraftId]);

  // Form State for editing
  const [formData, setFormData] = useState<GovernmentDraftItem>(activeDraft);

  // Keep form data synchronized when selecting another draft
  React.useEffect(() => {
    if (activeDraft) {
      setFormData(activeDraft);
    }
  }, [activeDraft?.id]);

  // View state: 'split' (side by side), 'edit' (form focus), 'preview' (sheet focus)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // AI Assistant Modal/Panel State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter state for sidebar list
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDrafts = useMemo(() => {
    return drafts.filter((d) => {
      const matchType = filterType === 'all' || d.docType === filterType;
      const matchSearch =
        !searchQuery.trim() ||
        d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [drafts, filterType, searchQuery]);

  // Document Type Configuration
  const DOC_TYPES: { id: GovernmentDocumentType; label: string; desc: string }[] = [
    { id: 'tippani', label: 'निर्णयार्थ टिप्पणी', desc: 'निर्णय प्रक्रिया, कानुनी राय र स्वीकृति' },
    { id: 'order', label: 'कार्यालय आदेश', desc: 'पदस्थापन, काज, सरुवा वा जिम्मेवारी तोक्ने' },
    { id: 'letter', label: 'कार्यालय पत्र', desc: 'अन्य कार्यालय वा व्यक्तिलाई आधिकारिक पत्राचार' },
    { id: 'circular', label: 'परिपत्र (Circular)', desc: 'मातहतका सम्पूर्ण निकायहरूलाई नीतिगत निर्देशन' },
    { id: 'minute', label: 'बैठकको माइन्युट', desc: 'बैठकको कार्यसूची, छलफल र सर्वसम्मत निर्णय' },
    { id: 'report', label: 'सरकारी प्रतिवेदन', desc: 'निरीक्षण, अध्ययन, मुख्य निष्कर्ष र सिफारिस' },
  ];

  // Handle Input Changes
  const handleTextChange = (field: keyof GovernmentDraftItem, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleDrafterChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      drafter: { ...prev.drafter, [field]: val },
    }));
  };

  const handleReviewerChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      reviewer: {
        name: prev.reviewer?.name || '',
        designation: prev.reviewer?.designation || '',
        dateBs: prev.reviewer?.dateBs || '',
        remarks: prev.reviewer?.remarks || '',
        [field]: val,
      },
    }));
  };

  const handleApproverChange = (field: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      approver: { ...prev.approver, [field]: val },
    }));
  };

  // Carbon copy handlers
  const handleAddCC = () => {
    const newCC = prompt('नयाँ बोधार्थ (CC) निकाय वा व्यक्तिको नाम लेख्नुहोस्:');
    if (newCC && newCC.trim()) {
      setFormData((prev) => ({
        ...prev,
        carbonCopies: [...(prev.carbonCopies || []), newCC.trim()],
      }));
    }
  };

  const handleRemoveCC = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      carbonCopies: (prev.carbonCopies || []).filter((_, i) => i !== index),
    }));
  };

  // Save current draft
  const handleSave = () => {
    const saved = db.saveDraft(formData);
    setDrafts([...db.getDrafts()]);
    setSelectedDraftId(saved.id);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Create new draft
  const handleCreateNew = (type: GovernmentDocumentType = 'tippani') => {
    const todayBs = '२०८१/०८/०१';
    const newDraft: GovernmentDraftItem = {
      id: `draft-${Date.now()}`,
      docType: type,
      title: `नयाँ ${DOC_TYPES.find((d) => d.id === type)?.label}`,
      subject: 'नयाँ विषय सम्बन्धमा।',
      governmentTier: 'नेपाल सरकार',
      ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
      departmentOrDivision: 'प्रशासन महाशाखा',
      officeName: 'सिंहदरबार, काठमाडौँ',
      dispatchNo: '',
      letterNo: '०८१/८२',
      dateBs: todayBs,
      urgency: 'साधारण',
      legalBasis: '',
      content: db.generateLocalDraft(
        type,
        'नयाँ विषय सम्बन्धमा।',
        'कार्यालयको नियमित कार्यसम्पादन',
        'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
        'प्रशासन महाशाखा'
      ),
      drafter: {
        name: 'रमेश शर्मा',
        designation: 'शाखा अधिकृत',
        dateBs: todayBs,
      },
      approver: {
        name: 'डा. सुरेन्द्र अधिकारी',
        designation: 'सचिव / कार्यालय प्रमुख',
        dateBs: todayBs,
        decisionStatus: 'APPROVED',
      },
      carbonCopies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.saveDraft(newDraft);
    setDrafts([...db.getDrafts()]);
    setSelectedDraftId(saved.id);
    setFormData(saved);
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    if (confirm('के तपाईं यो मस्यौदा हटाउन निश्चित हुनुहुन्छ?')) {
      db.deleteDraft(id);
      const remaining = db.getDrafts();
      setDrafts(remaining);
      if (remaining.length > 0) {
        setSelectedDraftId(remaining[0].id);
      }
    }
  };

  // AI Generation Call
  const handleGenerateAI = async (action: 'new' | 'enhance') => {
    setAiGenerating(true);
    setAiError(null);

    const userInstructions = aiPrompt.trim() || formData.content;

    try {
      const res = await fetch('/api/drafting/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: formData.docType,
          subject: formData.subject,
          contextDetails: userInstructions,
          officeName: formData.officeName,
          department: formData.departmentOrDivision,
          action: action === 'enhance' ? 'enhance' : 'generate',
          existingContent: formData.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.generatedContent) {
          setFormData((prev) => ({
            ...prev,
            content: data.generatedContent,
          }));
          setAiPrompt('');
          setAiGenerating(false);
          return;
        }
      }

      // Safe local fallback generator
      const fallbackText = db.generateLocalDraft(
        formData.docType,
        formData.subject,
        userInstructions,
        formData.officeName,
        formData.departmentOrDivision
      );
      setFormData((prev) => ({
        ...prev,
        content: fallbackText,
      }));
    } catch (err: any) {
      console.warn('AI drafting fallback triggered:', err);
      const fallbackText = db.generateLocalDraft(
        formData.docType,
        formData.subject,
        userInstructions,
        formData.officeName,
        formData.departmentOrDivision
      );
      setFormData((prev) => ({
        ...prev,
        content: fallbackText,
      }));
    } finally {
      setAiGenerating(false);
    }
  };

  // Copy plain text
  const handleCopyText = () => {
    const text = `${formData.governmentTier}
${formData.ministryOrEntity}
${formData.departmentOrDivision}
${formData.officeName}

पत्र संख्या: ${formData.letterNo || '०८१/८२'}    चलानी नं.: ${formData.dispatchNo || '..........'}    मिति: ${formData.dateBs}

विषय: ${formData.subject}

${formData.recipient ? `${formData.recipient}\n` : ''}${formData.content}

पेश गर्ने: ${formData.drafter.name} (${formData.drafter.designation})
निर्णय: ${formData.approver.name} (${formData.approver.designation})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              Government AI Drafting Studio
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">सरकारी टिप्पणी, आदेश र पत्राचार मस्यौदा</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            नेपाल सरकारी कार्यालय AI मस्यौदा केन्द्र
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            टिप्पणी, कार्यालय आदेश, पत्र, परिपत्र, बैठकको माइन्युट र प्रतिवेदन मस्यौदा · DOCX / PDF Export
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => handleCreateNew('tippani')}
            className="px-3 py-2 text-xs font-semibold bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>नयाँ मस्यौदा</span>
          </button>

          <button
            onClick={() => exportToDocx(formData)}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Word (DOCX) डाउनलोड</span>
          </button>

          <button
            onClick={printOfficialDocument}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>PDF / प्रिन्ट</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>कपी</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold bg-[#0F766E] text-white rounded-lg hover:bg-[#0c5c56] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>सेभ गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-2 no-print">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>मस्यौदा सफलतापूर्वक सुरक्षित गरियो!</span>
        </div>
      )}

      {/* Main 3-Part Drafting Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drafts & Templates List (3 cols) */}
        <div className="lg:col-span-3 space-y-4 no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                मस्यौदा सूची ({filteredDrafts.length})
              </span>
              <span className="text-xs text-slate-400 font-mono">६ मानक ढाँचा</span>
            </div>

            {/* Doc Type Filter Pills */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">सबै कागजातहरू (All)</option>
              <option value="tippani">निर्णयार्थ टिप्पणी</option>
              <option value="order">कार्यालय आदेश</option>
              <option value="letter">कार्यालय पत्र</option>
              <option value="circular">परिपत्र (Circular)</option>
              <option value="minute">बैठकको माइन्युट</option>
              <option value="report">सरकारी प्रतिवेदन</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="मस्यौदा खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />

            {/* List */}
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedDraftId === draft.id
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#173B63] dark:border-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-[#173B63] dark:text-blue-400 uppercase">
                      {DOC_TYPES.find((t) => t.id === draft.docType)?.label}
                    </span>
                    <span>{draft.dateBs}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {draft.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {draft.departmentOrDivision}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Templates Quick-launch */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                नयाँ ढाँचा सिर्जना गर्नुहोस्:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleCreateNew(t.id)}
                    className="p-1.5 text-left rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    + {t.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center / Editor Area (5 cols) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            {/* Top View Toggle Tab & Delete */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  मस्यौदा सम्पादन (Draft Editor)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900">
                  {DOC_TYPES.find((d) => d.id === formData.docType)?.label}
                </span>
              </div>

              <button
                onClick={() => handleDeleteDraft(formData.id)}
                title="यो मस्यौदा हटाउनुहोस्"
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* AI Assistant Generator Bar */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" />
                  AI सरकारी मस्यौदा सहायक (AI Administrative Drafter)
                </span>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                  नेपाली सरकारी भाषाशैली
                </span>
              </div>

              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="उदा: सामान्य प्रशासन मन्त्रालयबाट शाखा अधिकृत रमेश शर्मालाई ६ दिनका लागि पोखरा काज खटाउने आदेश तयार गर..."
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  प्रशासनिक ऐन, नियमावली र शिष्ट भाषा समावेश हुन्छ।
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={() => handleGenerateAI('enhance')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 hover:bg-teal-200 rounded border border-teal-300 transition-colors"
                  >
                    शिष्ट भाषा सुधार
                  </button>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={() => handleGenerateAI('new')}
                    className="px-3 py-1 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#0c5c56] rounded transition-colors flex items-center gap-1"
                  >
                    {aiGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>AI मस्यौदा लेख्नुहोस्</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Header Metadata Fields */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    कागजात प्रकार (Document Type)
                  </label>
                  <select
                    value={formData.docType}
                    onChange={(e) => handleTextChange('docType', e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    तह (Government Tier)
                  </label>
                  <select
                    value={formData.governmentTier}
                    onChange={(e) => handleTextChange('governmentTier', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="नेपाल सरकार">नेपाल सरकार (Federal)</option>
                    <option value="प्रदेश सरकार">प्रदेश सरकार (Provincial)</option>
                    <option value="स्थानीय सरकार">स्थानीय सरकार (Local)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    मन्त्रालय / निकाय (Ministry / Entity)
                  </label>
                  <input
                    type="text"
                    value={formData.ministryOrEntity}
                    onChange={(e) => handleTextChange('ministryOrEntity', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    महाशाखा / विभाग (Department / Division)
                  </label>
                  <input
                    type="text"
                    value={formData.departmentOrDivision}
                    onChange={(e) => handleTextChange('departmentOrDivision', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    पत्र संख्या (Letter No)
                  </label>
                  <input
                    type="text"
                    value={formData.letterNo}
                    onChange={(e) => handleTextChange('letterNo', e.target.value)}
                    placeholder="०८१/८२"
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    चलानी नं. (Dispatch No)
                  </label>
                  <input
                    type="text"
                    value={formData.dispatchNo}
                    onChange={(e) => handleTextChange('dispatchNo', e.target.value)}
                    placeholder="४१२"
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    मिति वि.सं. (Date BS)
                  </label>
                  <input
                    type="text"
                    value={formData.dateBs}
                    onChange={(e) => handleTextChange('dateBs', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  विषय (Subject Line)
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleTextChange('subject', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {formData.docType !== 'tippani' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    सम्बोधन / प्राप्तकर्ता (Recipient)
                  </label>
                  <input
                    type="text"
                    value={formData.recipient || ''}
                    onChange={(e) => handleTextChange('recipient', e.target.value)}
                    placeholder="श्री सबै विभागीय प्रमुख/कार्यालय प्रमुखज्यूहरू,"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  कानुनी आधार (Legal Basis)
                </label>
                <input
                  type="text"
                  value={formData.legalBasis || ''}
                  onChange={(e) => handleTextChange('legalBasis', e.target.value)}
                  placeholder="उदा: सार्वजनिक खरिद ऐन, २०६३ को दफा ८ तथा नियमावलीको नियम ७"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Main Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    मुख्य प्रशासनिक व्यहोरा (Document Body Text)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.content.length} अक्षर
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={formData.content}
                  onChange={(e) => handleTextChange('content', e.target.value)}
                  className="w-full p-3 text-xs leading-relaxed font-devanagari bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Signatures Configuration */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  हस्ताक्षर तथा सिफारिसकर्ता विवरण (Signatures Chain)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#173B63] dark:text-blue-400 block uppercase">
                      पेश गर्ने अधिकारी:
                    </span>
                    <input
                      type="text"
                      placeholder="नाम (उदा: रमेश शर्मा)"
                      value={formData.drafter.name}
                      onChange={(e) => handleDrafterChange('name', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="पद (उदा: शाखा अधिकृत)"
                      value={formData.drafter.designation}
                      onChange={(e) => handleDrafterChange('designation', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#0F766E] dark:text-teal-400 block uppercase">
                      निर्णय / स्वीकृत गर्ने:
                    </span>
                    <input
                      type="text"
                      placeholder="नाम (उदा: डा. सुरेन्द्र अधिकारी)"
                      value={formData.approver.name}
                      onChange={(e) => handleApproverChange('name', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="पद (उदा: सचिव / मन्त्रालय)"
                      value={formData.approver.designation}
                      onChange={(e) => handleApproverChange('designation', e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {formData.docType === 'tippani' && (
                  <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">
                      राय / सिफारिसकर्ता (Reviewer / Co-signatory):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="नाम (उदा: हरिप्रसाद दाहाल)"
                        value={formData.reviewer?.name || ''}
                        onChange={(e) => handleReviewerChange('name', e.target.value)}
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                      />
                      <input
                        type="text"
                        placeholder="पद (उदा: सहसचिव)"
                        value={formData.reviewer?.designation || ''}
                        onChange={(e) => handleReviewerChange('designation', e.target.value)}
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Carbon Copies (CC) List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    बोधार्थ (Carbon Copies) सूची
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCC}
                    className="text-[11px] text-[#173B63] dark:text-blue-400 font-semibold hover:underline"
                  >
                    + बोधार्थ थप्नुहोस्
                  </button>
                </div>
                {formData.carbonCopies && formData.carbonCopies.length > 0 ? (
                  <div className="space-y-1">
                    {formData.carbonCopies.map((cc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="truncate">{cc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCC(i)}
                          className="text-slate-400 hover:text-rose-500 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">कुनै बोधार्थ प्रविष्टि छैन।</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Official Document Sheet Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-200/60 dark:bg-slate-800/80 p-3 sm:p-5 rounded-xl border border-slate-300 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-300 dark:border-slate-700 no-print">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#173B63]" />
                सरकारी ढाँचा प्रत्यक्ष अवलोकन (Official Sheet)
              </span>
              <button
                onClick={printOfficialDocument}
                className="text-xs font-semibold text-[#173B63] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                प्रिन्ट पूर्वावलोकन
              </button>
            </div>

            {/* Official Nepal Government Paper Sheet */}
            <div className="official-document-sheet bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-md border border-slate-200 font-devanagari text-xs sm:text-[13px] leading-relaxed">
              {/* National Emblem & Letterhead Header */}
              <div className="text-center space-y-1 border-b-2 border-[#173B63] pb-3 mb-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-red-50 flex items-center justify-center text-lg shadow-xs">
                  🇳🇵
                </div>
                <p className="text-[11px] font-bold text-red-700 tracking-wider">
                  {formData.governmentTier}
                </p>
                <h2 className="text-sm sm:text-base font-bold text-[#173B63] tracking-tight">
                  {formData.ministryOrEntity}
                </h2>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                  {formData.departmentOrDivision}
                </h3>
                {formData.branchName && (
                  <p className="text-[11px] text-slate-600">{formData.branchName}</p>
                )}
                <p className="text-[11px] text-slate-500">{formData.officeName}</p>
              </div>

              {/* Meta Dispatch & Date Table */}
              <div className="flex items-start justify-between text-[11px] text-slate-600 mb-4 pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <p>
                    पत्र संख्या: <strong className="text-slate-900">{formData.letterNo || '०८१/८२'}</strong>
                  </p>
                  <p>
                    चलानी नं.: <strong className="text-slate-900">{formData.dispatchNo || '..........'}</strong>
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p>
                    मिति: <strong className="text-slate-900">{formData.dateBs}</strong>
                  </p>
                  {formData.urgency !== 'साधारण' && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
                      {formData.urgency}
                    </span>
                  )}
                </div>
              </div>

              {/* Recipient for Letters/Orders */}
              {formData.recipient && (
                <div className="mb-4 text-xs font-semibold text-slate-800">
                  <p>{formData.recipient}</p>
                  {formData.recipientDesignation && <p className="font-normal text-slate-600">{formData.recipientDesignation}</p>}
                  {formData.recipientOffice && <p className="font-normal text-slate-600">{formData.recipientOffice}</p>}
                </div>
              )}

              {/* Subject */}
              <div className="text-center font-bold text-xs sm:text-sm text-slate-900 my-4 underline decoration-[#173B63] decoration-2 underline-offset-4">
                विषय: {formData.subject}
              </div>

              {/* Opening Salutation for Tippani */}
              {formData.docType === 'tippani' && (
                <p className="font-bold text-xs text-slate-900 mb-3">श्रीमान्,</p>
              )}

              {/* Legal Basis Callout */}
              {formData.legalBasis && (
                <div className="p-2 mb-3 rounded bg-teal-50 border-l-2 border-[#0F766E] text-[11px] text-teal-900">
                  <strong>कानुनी आधार:</strong> {formData.legalBasis}
                </div>
              )}

              {/* Body Content */}
              <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-justify space-y-2">
                {formData.content}
              </div>

              {/* Meeting Minutes Specific Tables */}
              {formData.docType === 'minute' && formData.meetingDetails && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <p><strong>बैठक मिति र समय:</strong> {formData.meetingDetails.meetingDateBs} ({formData.meetingDetails.meetingTime})</p>
                    <p><strong>स्थान र अध्यक्ष:</strong> {formData.meetingDetails.meetingVenue} | {formData.meetingDetails.chairperson}</p>
                  </div>

                  <h5 className="font-bold text-xs text-slate-800">निर्णयहरू:</h5>
                  <div className="space-y-1.5">
                    {formData.meetingDetails.decisions.map((dec, i) => (
                      <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                        <span className="font-bold text-[#173B63]">{dec.agendaNo}: {dec.agendaTitle}</span>
                        <p className="text-slate-700 mt-0.5">{dec.decisionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Specific Breakdown */}
              {formData.docType === 'report' && formData.reportDetails && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-[11px]">
                  <h5 className="font-bold text-xs text-[#173B63]">१. मुख्य निष्कर्षहरू:</h5>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {formData.reportDetails.keyFindings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>

                  <h5 className="font-bold text-xs text-[#173B63] pt-1">२. सिफारिसहरू:</h5>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {formData.reportDetails.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Multi-Tier Signature Section */}
              {formData.docType === 'tippani' ? (
                <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="font-bold text-[#173B63] block">पेश गर्ने:</span>
                    <div className="mt-5 border-b border-slate-400 w-24"></div>
                    <p className="font-bold mt-1 text-slate-900">{formData.drafter.name}</p>
                    <p className="text-slate-500">{formData.drafter.designation}</p>
                    <p className="text-slate-400 text-[10px]">{formData.drafter.dateBs}</p>
                  </div>

                  <div>
                    {formData.reviewer && (
                      <>
                        <span className="font-bold text-[#173B63] block">राय/सिफारिस:</span>
                        <div className="mt-5 border-b border-slate-400 w-24"></div>
                        <p className="font-bold mt-1 text-slate-900">{formData.reviewer.name}</p>
                        <p className="text-slate-500">{formData.reviewer.designation}</p>
                        <p className="text-slate-400 text-[10px]">{formData.reviewer.dateBs}</p>
                      </>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[#0F766E] block">निर्णय / आदेश:</span>
                    <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                      [ {formData.approver.decisionStatus === 'APPROVED' ? '✔' : ' '} ] स्वीकृत
                    </p>
                    <div className="mt-3 border-b border-slate-400 w-24"></div>
                    <p className="font-bold mt-1 text-slate-900">{formData.approver.name}</p>
                    <p className="text-slate-500">{formData.approver.designation}</p>
                    <p className="text-slate-400 text-[10px]">{formData.approver.dateBs}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-end justify-between text-[11px]">
                  <div className="space-y-1 max-w-[55%]">
                    {formData.carbonCopies && formData.carbonCopies.length > 0 && (
                      <>
                        <span className="font-bold text-slate-700 underline text-[10px]">बोधार्थ:</span>
                        <ul className="text-[10px] text-slate-600 space-y-0.5 list-disc pl-3">
                          {formData.carbonCopies.map((cc, i) => (
                            <li key={i}>{cc}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="mb-4 border-b border-slate-400 w-28 ml-auto"></div>
                    <p className="font-bold text-slate-900">{formData.approver.name}</p>
                    <p className="text-slate-600">{formData.approver.designation}</p>
                    <p className="text-slate-500 text-[10px]">{formData.departmentOrDivision}</p>
                    <p className="text-slate-400 text-[10px]">मिति: {formData.dateBs}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
