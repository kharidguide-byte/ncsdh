import React, { useState } from 'react';
import { X, FileText, Copy, Check, Download, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LetterDraftingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [docType, setDocType] = useState<'tippani' | 'circular' | 'clarification' | 'recommendation'>('tippani');
  const [subject, setSubject] = useState<string>('वार्षिक खरिद योजना स्वीकृति सम्बन्धमा');
  const [officeName, setOfficeName] = useState<string>('सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय');
  const [department, setDepartment] = useState<string>('प्रशासन तथा योजना महाशाखा');
  const [drafterName, setDrafterName] = useState<string>('शाखा अधिकृत');
  const [decisionMaker, setDecisionMaker] = useState<string>('सचिव ज्यू');
  const [contextDetails, setContextDetails] = useState<string>(
    'चालु आर्थिक वर्ष २०८१/८२ का लागि स्वीकृत बजेट तथा कार्यक्रम बमोजिम कार्यालय सञ्चालन तथा मसलन्द सामग्री खरिद गर्न सार्वजनिक खरिद ऐन, २०६३ को दफा ८ बमोजिम तयार पारिएको वार्षिक खरिद योजना निर्णयार्थ पेश गरिएको छ।'
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateDraft = () => {
    const todayBs = '२०८१/०७/२५';

    if (docType === 'tippani') {
      return `नेपाल सरकार
${officeName}
${department}

विषय: ${subject}

श्रीमान्,

१. ${contextDetails}

२. सार्वजनिक खरिद ऐन, २०६३ तथा सार्वजनिक खरिद नियमावली, २०६४ को प्रचलित व्यवस्था बमोजिम सार्वजनिक निकायले वार्षिक खरिद योजना तयार गरी अख्तियारवालाबाट स्वीकृत गराउनुपर्ने स्पष्ट कानुनी प्रावधान रहेको छ।

३. सोही बमोजिम यस महाशाखाबाट तयार गरिएको खरिद योजनामा उल्लिखित परिमाण, लागत अनुमान र खरिद विधि कानुनसम्मत देखिएकाले संलग्न खरिद योजना स्वीकृतिका लागि पेश गरिएको व्यहोरा अनुरोध छ।

४. अत: संलग्न वार्षिक खरिद योजना स्वीकृतिका लागि श्रीमान् ${decisionMaker} समक्ष निर्णयार्थ सादर पेश गर्दछु।


पेश गर्ने:
....................................
(${drafterName})
मिति: ${todayBs}


राय/सिफारिस:
....................................
(उपसचिव / सहसचिव)
मिति: ${todayBs}


निर्णय:
[   ] स्वीकृत     [   ] संशोधन सहित स्वीकृत     [   ] अन्य निर्देशन
....................................
(${decisionMaker})
मिति: ${todayBs}`;
    }

    if (docType === 'circular') {
      return `नेपाल सरकार
${officeName}
पत्र संख्या: ०८१/८२
चलानी नम्बर: ............
मिति: ${todayBs}

परिपत्र

विषय: ${subject}

मातहतका सम्पूर्ण कार्यालयहरू,

उपरोक्त विषयमा ${contextDetails}
तसर्थ, प्रचलित कानुन तथा निर्देशिकाको अक्षरसः पालना गरी गराई यस कार्यालयलाई तोकिएको समयसीमाभित्र अनिवार्य प्रगति विवरण उपलब्ध गराउनुहुन निर्णयानुसार अनुरोध गरिन्छ।


....................................
(${drafterName})
${department}`;
    }

    if (docType === 'clarification') {
      return `नेपाल सरकार
${officeName}
गोप्य / अति जरुरी
पत्र संख्या: ०८१/८२
चलानी नम्बर: ............
मिति: ${todayBs}

विषय: स्पष्टीकरण पेश गर्ने सम्बन्धमा।

श्री ....................................................
पद: ....................................................
कार्यालय: ............................................

उपरोक्त विषयमा ${contextDetails}
तपाईंको उक्त कार्य निजामती सेवा ऐन, २०४९ तथा निजामती सेवा नियमावली, २०५० को विपरीत देखिएको हुँदा सो सम्बन्धमा तपाईंलाई विभागीय कारबाही किन नगर्ने? यस पत्र प्राप्त भएको मितिले ७ (सात) दिनभित्र तथ्य र प्रमाणसहित चित्तबुझ्दो स्पष्टीकरण पेश गर्नुहुन सूचित गरिन्छ। म्यादभित्र स्पष्टीकरण पेश नगरेमा कानुनबमोजिम कारबाही अगाडि बढाइने व्यहोरा समेत जानकारी गराइन्छ।


....................................
अख्तियारवाला / विभागीय प्रमुख
${officeName}`;
    }

    return `नेपाल सरकार
${officeName}
पत्र संख्या: ०८१/८२
चलानी नम्बर: ............
मिति: ${todayBs}

सिफारिस पत्र

विषय: ${subject}

जो जससँग सम्बन्धित छ,

प्रस्तुत विषयमा ${contextDetails}
निजको व्यक्तिगत चालचलन, सेवा अभिलेख तथा कार्यसम्पादन सन्तोषजनक रहेको व्यहोरा प्रमाणित गर्दै माग भएबमोजिमको प्रयोजनका लागि यो सिफारिस पत्र जारी गरिएको छ।


....................................
(${drafterName})
${officeName}`;
  };

  const currentDraft = generateDraft();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentDraft], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${subject.replace(/\s+/g, '_')}_मस्यौदा.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0F766E] text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                सरकारी टिप्पणी तथा पत्र मस्यौदा सहायक (Government Drafting Tool)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                नेपाल सरकारको आधिकारिक प्रशासनिक ढाँचा र शिष्ट भाषामा मस्यौदा तयार गर्ने प्रणाली
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
          {/* Controls Column */}
          <div className="lg:col-span-5 p-6 border-r border-slate-200 dark:border-slate-800 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                कागजातको प्रकृति (Document Type)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tippani', label: 'निर्णयार्थ टिप्पणी' },
                  { id: 'circular', label: 'कार्यालय परिपत्र' },
                  { id: 'clarification', label: 'स्पष्टीकरण पत्र' },
                  { id: 'recommendation', label: 'सिफारिस पत्र' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDocType(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                      docType === item.id
                        ? 'bg-[#173B63] text-white border-[#173B63]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                विषय (Subject)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  कार्यालयको नाम
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  महाशाखा / शाखा
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  पेश गर्ने कर्मचारी पद
                </label>
                <input
                  type="text"
                  value={drafterName}
                  onChange={(e) => setDrafterName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  निर्णयकर्ता अधिकारी
                </label>
                <input
                  type="text"
                  value={decisionMaker}
                  onChange={(e) => setDecisionMaker(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                मुख्य व्यहोरा तथा सन्दर्भ
              </label>
              <textarea
                rows={4}
                value={contextDetails}
                onChange={(e) => setContextDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-7 p-6 bg-slate-50 dark:bg-slate-900/60 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  मस्यौदा पूर्वावलोकन (Preview)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'कपी भयो' : 'कपी गर्नुहोस्'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-xs font-medium bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    डाउनलोड (TXT)
                  </button>
                </div>
              </div>

              {/* Document Sheet */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs font-devanagari text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {currentDraft}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              * यो मस्यौदा केवल मस्यौदा तयारीको प्रारम्भिक सहयोगका लागि हो। आधिकारिक सरकारी निर्णयमा समावेश गर्नु अगाडि प्रचलित नियम तथा आवश्यक कागजात संलग्न गरी परीक्षण गर्नुपर्छ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
