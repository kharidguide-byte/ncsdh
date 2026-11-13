import React, { useState } from 'react';
import { db, normalizeLegalImportPayload } from '../../lib/supabase/client';
import {
  X,
  FileCode,
  Upload,
  Check,
  AlertCircle,
  FileText,
  Copy,
  BookOpen,
  ArrowRight,
  Database
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (docTitle: string, count: number) => void;
}

const SAMPLE_CIVIL_RULES_JSON = {
  document: {
    id: 'law-rule-2050',
    title: 'Civil Service Rules, 2050 (Leave and Conduct)',
    titleNe: 'निजामती सेवा नियमावली, २०५० (बिदा तथा आचरण नियमहरू)',
    docType: 'RULE',
    category: 'निजामती प्रशासन तथा सेवा सर्त',
    enactmentDateBs: '२०५०/०३/२८',
    status: 'ACTIVE',
    versionNo: 'सातौं संशोधन २०८०',
    description: 'निजामती सेवा ऐन, २०४९ को दफा ४० कार्यान्वयन गर्न जारी भएको बिदा, हाजिरी तथा आचरण सम्बन्धी नियमहरू।',
    officialSourceUrl: 'https://lawcommission.gov.np',
    ministry: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    versions: [
      {
        id: 'v-rule-1',
        versionName: 'मूल नियमावली २०५०',
        enactmentDateBs: '२०५०/०३/२८',
        status: 'HISTORICAL',
        keyChangesNe: 'निजामती कर्मचारीको बिदा तथा कार्यविधि प्रारम्भ',
      },
      {
        id: 'v-rule-2',
        versionName: 'सातौं संशोधन २०८०',
        enactmentDateBs: '२०८०/०४/१५',
        status: 'ACTIVE',
        keyChangesNe: 'प्रसूति स्याहार बिदा १५ दिन तथा अनलाइन बिदा स्वीकृत प्रक्रिया अद्यावधिक',
      },
    ],
  },
  sections: [
    {
      id: 'sec-rule-58',
      chapterNo: 'परिच्छेद-११',
      chapterTitleNe: 'बिदा सम्बन्धी कार्यविधि',
      sectionNo: 'नियम ५८',
      titleNe: 'घर बिदाको सञ्चिति र भुक्तानी मापदण्ड',
      contentNe: 'निजामती कर्मचारीले सेवा अवधिभर काम गरेको प्रत्येक १२ दिन बराबर १ दिनको दरले घर बिदा पाउनेछ। यस्तो बिदा बढीमा एक सय असी (१८०) दिनसम्म सञ्चित गर्न सकिनेछ। सेवाबाट अवकाश हुँदा सञ्चित घर बिदा बापत अन्तिम तलबमानका आधारमा एकमुष्ट रकम भुक्तानी दिइनेछ।',
      simpleExplanationNe: 'घर बिदा अधिकतम १८० दिनसम्म जोगाउन सकिन्छ र अवकाश हुँदा त्यसको सम्पूर्ण रकम पाइन्छ।',
      subsections: [
        {
          id: 'sub-rule-58-1',
          subsectionNo: 'उपनियम (१)',
          contentNe: 'कर्मचारीले प्रत्येक १२ दिन काम गरे बापत १ दिन घर बिदा प्राप्त गर्नेछ।',
        },
        {
          id: 'sub-rule-58-2',
          subsectionNo: 'उपनियम (२)',
          contentNe: 'सञ्चित घर बिदा १८० दिन भन्दा बढी भएमा बढी भएको दिन स्वतः निष्क्रिय हुनेछ।',
        },
      ],
      relatedProvisions: [
        {
          id: 'rel-rule-58-1',
          targetDocTitleNe: 'निजामती सेवा ऐन, २०४९',
          targetSectionNo: 'दफा ४०',
          relationType: 'RULE_UNDER_ACT',
          descriptionNe: 'ऐनको दफा ४० को मूल बिदा अधिकार कार्यान्वयन गर्ने कार्यविधि।',
        },
      ],
      keywords: ['घर बिदा', '१८० दिन', 'सञ्चिति', 'भुक्तानी', 'अवकाश'],
    },
    {
      id: 'sec-rule-61',
      chapterNo: 'परिच्छेद-११',
      chapterTitleNe: 'बिदा सम्बन्धी कार्यविधि',
      sectionNo: 'नियम ६१',
      titleNe: 'बिरामी बिदा र असाधारण बिदा स्वीकृत गर्ने अधिकारी',
      contentNe: 'कर्मचारीले प्रत्येक वर्ष १२ दिन पूर्ण तलब सहितको बिरामी बिदा पाउनेछ। ७ दिनभन्दा बढीको बिरामी बिदा माग गर्दा नेपाल मेडिकल काउन्सिलमा दर्ता भएको चिकित्सकको सिफारिस पत्र अनिवार्य संलग्न गर्नुपर्नेछ। असाधारण बिदा नेपाल सरकार मन्त्रिपरिषद्ले मात्र स्वीकृत गर्न सक्नेछ।',
      simpleExplanationNe: 'वर्षको १२ दिन बिरामी बिदा पाइन्छ। एकपटकमा ७ दिनभन्दा बढी भए डाक्टरको पूर्जी पेश गर्नुपर्छ।',
      subsections: [
        {
          id: 'sub-rule-61-1',
          subsectionNo: 'उपनियम (१)',
          contentNe: 'बिरामी बिदा वर्षको १२ दिन पाइनेछ र प्रयोग नभएको बिदा सेवा अवधिभर सञ्चित हुनेछ।',
        },
      ],
      keywords: ['बिरामी बिदा', 'चिकित्सक सिफारिस', 'असाधारण बिदा', '१२ दिन'],
    },
  ],
};

const SAMPLE_PROCUREMENT_RULES_JSON = {
  document: {
    id: 'law-rule-2064',
    title: 'Public Procurement Rules, 2064 (Quotation & Direct Purchase)',
    titleNe: 'सार्वजनिक खरिद नियमावली, २०६४ (दरभाउपत्र र सोझै खरिद)',
    docType: 'RULE',
    category: 'सार्वजनिक खरिद तथा वित्तीय व्यवस्थापन',
    enactmentDateBs: '२०६४/०५/०३',
    status: 'ACTIVE',
    versionNo: 'बाह्रौं संशोधन २०८०',
    description: 'सार्वजनिक खरिद ऐन, २०६३ बमोजिम ५ लाखसम्म सोझै खरिद र २० लाखसम्म सिलबन्दी दरभाउपत्र आह्वान कार्यविधि।',
    officialSourceUrl: 'https://ppmo.gov.np',
    ministry: 'सार्वजनिक खरिद अनुगमन कार्यालय (PPMO)',
  },
  sections: [
    {
      id: 'sec-rule-proc-85',
      chapterNo: 'परिच्छेद-६',
      chapterTitleNe: 'सोझै खरिद सम्बन्धी कार्यविधि',
      sectionNo: 'नियम ८५',
      titleNe: 'सोझै खरिद गर्दा अपनाउनुपर्ने न्यूनतम प्रतिस्पर्धा',
      contentNe: 'सार्वजनिक निकायले प्रचलित ऐनको दफा ४१ बमोजिम रु. ५ लाखसम्मको मालसामान वा परामर्श सोझै खरिद गर्दा स्थायी लेखा नम्बर (PAN/VAT) दर्ता भएका कम्तीमा ३ (तीन) वटा फर्म वा व्यवसायीबाट लिखित दरभाउ माग गरी न्यूनतम मूल्याङ्कन गरिएको दरभाउदाताबाट खरिद गर्नुपर्नेछ।',
      simpleExplanationNe: '५ लाखसम्म सोझै खरिद गर्दा पनि कम्तीमा ३ वटा दर्तावाल पसल/कम्पनीबाट कोटेसन मागेर सस्तो दरमा मात्र सामान किन्नुपर्छ।',
      keywords: ['सोझै खरिद', '३ वटा दरभाउ', '५ लाख', 'PAN/VAT', 'कोटेशन'],
    },
    {
      id: 'sec-rule-proc-84',
      chapterNo: 'परिच्छेद-६',
      chapterTitleNe: 'सिलबन्दी दरभाउपत्र कार्यविधि',
      sectionNo: 'नियम ८४',
      titleNe: 'सिलबन्दी दरभाउपत्रको सीमा र सूचना अवधि',
      contentNe: 'रु. २० लाखसम्मको मालसामान, निर्माण कार्य वा अन्य सेवा खरिद गर्दा कम्तीमा १५ (पन्ध्र) दिनको म्याद दिई राष्ट्रिय वा स्थानीय दैनिक पत्रिका तथा कार्यालयको सूचना पाटीमा सिलबन्दी दरभाउपत्रको सूचना प्रकाशन गर्नुपर्नेछ।',
      simpleExplanationNe: '२० लाखसम्मको खरिदमा १५ दिनको सूचना दिएर सिलबन्दी दरभाउपत्र (Sealed Quotation) आह्वान गर्न सकिन्छ।',
      keywords: ['सिलबन्दी दरभाउपत्र', '२० लाख', '१५ दिन', 'सूचना'],
    },
  ],
};

export const LegalJsonImporterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const loadSample = (sample: any) => {
    const formatted = JSON.stringify(sample, null, 2);
    setJsonText(formatted);
    validateJson(formatted);
  };

  const validateJson = (text: string) => {
    try {
      if (!text.trim()) {
        setValidationError(null);
        setParsedPreview(null);
        return;
      }
      const { docData: doc, sections } = normalizeLegalImportPayload(JSON.parse(text));
      setValidationError(null);
      setParsedPreview({ doc, sectionsCount: sections.length, sections });
    } catch (e: unknown) {
      setValidationError(e instanceof Error ? e.message : 'अवैध JSON सिन्ट्याक्स');
      setParsedPreview(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    validateJson(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      validateJson(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedPreview) return;
    setImporting(true);
    try {
      const payload = JSON.parse(jsonText);
      const res = db.importLegalDocumentJSON(payload);
      setImporting(false);

      if (res.success && res.document) {
        onImportSuccess(res.document.titleNe, res.sectionsCount);
        onClose();
      } else {
        setValidationError(res.error || 'आयात असफल भयो।');
      }
    } catch (err: any) {
      setImporting(false);
      setValidationError(err?.message || 'JSON पार्सिङमा त्रुटि');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#173B63] text-white">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Section-wise Legal JSON Importer (दफागत कानुनी डेटा आयात)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ऐन, नियमावली, दफा, उपदफा र सम्बन्धित व्यवस्थाहरूको संरचित JSON डेटाबेसमा आयात गर्नुहोस्
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

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: JSON Editor & Template Buttons */}
          <div className="lg:col-span-7 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-3">
              {/* Preset Sample Buttons */}
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  पूर्वनिर्धारित कानुनी ढाँचा लोड गर्नुहोस् (Load Sample JSON):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample(SAMPLE_CIVIL_RULES_JSON)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors"
                  >
                    निजामती नियमावली २०५० (बिदा)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample(SAMPLE_PROCUREMENT_RULES_JSON)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-900 hover:bg-teal-100 transition-colors"
                  >
                    खरिद नियमावली २०६४ (सोझै खरिद)
                  </button>
                </div>
              </div>

              {/* File upload trigger */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  JSON सम्पादक वा पेस्ट बक्स
                </span>
                <label className="cursor-pointer text-[#3478B9] hover:underline flex items-center gap-1 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>.json फाइल अपलोड गर्नुहोस्</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* JSON Textarea */}
              <textarea
                rows={12}
                value={jsonText}
                onChange={handleTextChange}
                placeholder={`{\n  "title": "...",\n  "chapters": [\n    {\n      "chapter": "परिच्छेद १",\n      "title": "...",\n      "sections": [\n        {\n          "section_no": "१",\n          "title": "...",\n          "text": "...",\n          "subsections": []\n        }\n      ]\n    }\n  ]\n}\n\nवैकल्पिक रूपमा document + sections ढाँचा पनि समर्थित छ।`}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#173B63]"
              />

              {validationError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>* document/sections र title/chapters/sections दुवै ढाँचा समर्थित छन्; उपदफा स्वतः प्रशोधन हुन्छन्।</span>
            </div>
          </div>

          {/* Right Column: Live Validation & Schema Preview */}
          <div className="lg:col-span-5 p-6 bg-slate-50 dark:bg-slate-900/60 overflow-y-auto flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0F766E]" />
                डेटाबेस आयात पूर्वावलोकन (Import Preview)
              </h3>

              {parsedPreview ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      <Check className="w-4 h-4" />
                      मान्य कानुनी संरचना (Valid Structure)
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {parsedPreview.doc.titleNe}
                    </h4>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>
                        प्रकार: <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedPreview.doc.docType}</span> · वर्गीकरण: {parsedPreview.doc.category}
                      </p>
                      <p>
                        संस्करण: <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedPreview.doc.versionNo || 'संस्करण १.०'}</span>
                      </p>
                      <p>
                        दफा संख्या: <span className="font-bold text-[#173B63] dark:text-blue-400 tabular-nums">{parsedPreview.sectionsCount} दफाहरू</span>
                      </p>
                    </div>
                  </div>

                  {/* Sections preview list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                      समावेश गरिएका दफाहरू:
                    </span>
                    {parsedPreview.sections.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-[#173B63] dark:text-blue-400">
                            {s.sectionNo}
                          </span>
                          <span>{s.chapterNo}</span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {s.titleNe}
                        </p>
                        {s.subsections && s.subsections.length > 0 && (
                          <span className="text-[10px] text-teal-600 block mt-1">
                            • {s.subsections.length} उपदफाहरू समावेश
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs space-y-2">
                  <Database className="w-8 h-8 mx-auto text-slate-300" />
                  <p>बायाँतर्फ JSON प्रविष्ट गर्नुहोस् वा माथिको पूर्वनिर्धारित ढाँचा लोड गर्नुहोस्।</p>
                </div>
              )}
            </div>

            {/* Execute Import Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={!parsedPreview || importing}
                onClick={handleExecuteImport}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
                {importing
                  ? 'डेटाबेसमा आयात हुँदैछ...'
                  : `डेटाबेसमा ${parsedPreview ? parsedPreview.sectionsCount : ''} दफाहरू आयात गर्नुहोस्`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
