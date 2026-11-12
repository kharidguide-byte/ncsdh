import React, { useState, useMemo } from 'react';
import { useAuth } from '../../lib/auth/context';
import { db } from '../../lib/supabase/client';
import {
  LearningMaterialItem,
  QuizQuestionItem,
  MeetingRecordItem,
  DecisionTrackerItem,
  FileTrackerItem,
  InventoryItem,
  BudgetItem,
  GovernmentCircular,
  RTIRequestItem,
  GovCalendarEvent,
  DocumentToolkitItem,
  CommunityPostItem,
} from '../../types';
import {
  ExternalLink,
  BookOpen,
  Award,
  Users,
  CheckSquare,
  FolderOpen,
  Box,
  PieChart,
  FileText,
  ShieldAlert,
  Calendar,
  Download,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  ThumbsUp,
  X,
  FileCheck,
  Building,
  ArrowRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export type ModuleTabKey =
  | 'procurement'
  | 'learning'
  | 'quiz'
  | 'meetings'
  | 'decisions'
  | 'files'
  | 'inventory'
  | 'budget'
  | 'circulars'
  | 'rti'
  | 'calendar'
  | 'toolkit'
  | 'community';

interface Props {
  initialTab?: ModuleTabKey;
}

export const GovernmentModulesHub: React.FC<Props> = ({ initialTab = 'procurement' }) => {
  const { user, isAdmin, isVerifiedEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState<ModuleTabKey>(initialTab);

  // Search & Filter States per module
  const [learningSearch, setLearningSearch] = useState('');
  const [selectedLearning, setSelectedLearning] = useState<LearningMaterialItem | null>(null);
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [learningList, setLearningList] = useState<LearningMaterialItem[]>(db.getLearningMaterials());

  // Quiz State
  const [quizList, setQuizList] = useState<QuizQuestionItem[]>(db.getQuizQuestions());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizExplanations, setShowQuizExplanations] = useState<Record<string, boolean>>({});
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  // Meetings State
  const [meetingList, setMeetingList] = useState<MeetingRecordItem[]>(db.getMeetings());
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecordItem | null>(null);

  // Decisions State
  const [decisionList, setDecisionList] = useState<DecisionTrackerItem[]>(db.getDecisions());
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  // Files State
  const [fileList, setFileList] = useState<FileTrackerItem[]>(db.getFileTrackers());
  const [fileSearch, setFileSearch] = useState('');
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileMoveModalItem, setFileMoveModalItem] = useState<FileTrackerItem | null>(null);
  const [newDeskName, setNewDeskName] = useState('');
  const [newDeskRemarks, setNewDeskRemarks] = useState('');

  // Inventory State
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(db.getInventory());
  const [invFilter, setInvFilter] = useState<string>('ALL');
  const [invModalOpen, setInvModalOpen] = useState(false);

  // Budget State
  const [budgetList, setBudgetList] = useState<BudgetItem[]>(db.getBudgets());
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Circulars State
  const [circularList, setCircularList] = useState<GovernmentCircular[]>(db.getCirculars());
  const [circSearch, setCircSearch] = useState('');
  const [circModalOpen, setCircModalOpen] = useState(false);

  // RTI State
  const [rtiList, setRTIList] = useState<RTIRequestItem[]>(db.getRTIRequests());
  const [rtiModalOpen, setRTIModalOpen] = useState(false);
  const [rtiResponseModalItem, setRTIResponseModalItem] = useState<RTIRequestItem | null>(null);
  const [rtiResponseText, setRTIResponseText] = useState('');
  const [rtiFee, setRTIFee] = useState<number>(0);

  // Calendar State
  const [calendarList, setCalendarList] = useState<GovCalendarEvent[]>(db.getCalendarEvents());
  const [calendarFilter, setCalendarFilter] = useState<string>('ALL');
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  // Toolkit State
  const [toolkitList, setToolkitList] = useState<DocumentToolkitItem[]>(db.getDocumentToolkits());
  const [toolkitSearch, setToolkitSearch] = useState('');
  const [toolkitModalOpen, setToolkitModalOpen] = useState(false);

  // Community State
  const [communityList, setCommunityList] = useState<CommunityPostItem[]>(db.getCommunityPosts());
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [replyPostId, setReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Procurement Calculator Quick State
  const [calcAmount, setCalcAmount] = useState<number>(450000);

  // Calculate procurement rule for the amount
  const procurementAdvice = useMemo(() => {
    if (calcAmount <= 500000) {
      return {
        method: 'सोझै खरिद (Direct Purchase)',
        rule: 'सार्वजनिक खरिद नियमावली, २०६४ को नियम ८५',
        thresholdText: 'रु. ५,००,००० सम्म',
        requirements: 'कम्तीमा ३ वटा प्यान/भ्याट दर्ता भएका फर्मबाट दरभाउ माग गरी न्यूनतम मूल्याङ्कन भएकोबाट खरिद।',
        urgencyDays: 'तत्काल / सोझै',
        color: 'emerald',
      };
    } else if (calcAmount <= 2000000) {
      return {
        method: 'सिलबन्दी दरभाउपत्र (Sealed Quotations)',
        rule: 'सार्वजनिक खरिद ऐनको दफा ४० तथा नियमावलीको नियम ८४',
        thresholdText: 'रु. २०,००,००० सम्म',
        requirements: 'कम्तीमा १५ दिनको सूचना राष्ट्रिय वा स्थानीय पत्रिकामा वा कार्यालय सूचना पाटीमा प्रकाशन गर्नुपर्ने। कम्तीमा ३ वटा दरभाउपत्र पर्नुपर्ने।',
        urgencyDays: '१५ दिने सूचना',
        color: 'blue',
      };
    } else {
      return {
        method: 'खुल्ला राष्ट्रिय बोलपत्र (National Competitive Bidding - NCB)',
        rule: 'सार्वजनिक खरिद ऐन, २०६३ को दफा १५ तथा नियम ३१',
        thresholdText: 'रु. २०,००,००० भन्दा बढी',
        requirements: 'सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को e-GP II पोर्टलमा अनिवार्य विद्युतीय बोलपत्र। ३० दिनको राष्ट्रिय दैनिक पत्रिकामा सूचना प्रकाशन।',
        urgencyDays: '३० दिने सूचना (e-GP II)',
        color: 'purple',
      };
    }
  }, [calcAmount]);

  // Tab definitions
  const TABS: { id: ModuleTabKey; label: string; icon: any; count?: number; highlight?: boolean }[] = [
    { id: 'procurement', label: 'सार्वजनिक खरिद', icon: Building, highlight: true },
    { id: 'learning', label: 'अध्ययन केन्द्र', icon: BookOpen, count: learningList.length },
    { id: 'quiz', label: 'वस्तुगत परीक्षा', icon: Award, count: quizList.length },
    { id: 'meetings', label: 'बैठक व्यवस्थापन', icon: Users, count: meetingList.length },
    { id: 'decisions', label: 'निर्णय ट्र्याकर', icon: CheckSquare, count: decisionList.length },
    { id: 'files', label: 'दर्ता चलानी/फाइल', icon: FolderOpen, count: fileList.length },
    { id: 'inventory', label: 'PAMS जिन्सी', icon: Box, count: inventoryList.length },
    { id: 'budget', label: 'बजेट योजना', icon: PieChart, count: budgetList.length },
    { id: 'circulars', label: 'सरकारी परिपत्र', icon: FileText, count: circularList.length },
    { id: 'rti', label: 'सूचनाको हक (RTI)', icon: ShieldAlert, count: rtiList.length },
    { id: 'calendar', label: 'प्रशासन क्यालेन्डर', icon: Calendar, count: calendarList.length },
    { id: 'toolkit', label: 'फाराम टुलकिट', icon: Download, count: toolkitList.length },
    { id: 'community', label: 'ज्ञान चौतारी', icon: MessageSquare, count: communityList.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              <span>नेपाल निजामती कर्मचारी डिजिटल हब</span>
              <span>•</span>
              <span>एकीकृत कार्यसञ्चालन प्रणाली</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              प्रशासनिक कार्य सञ्चालन तथा सेवा मोड्युलहरू
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              खरिद, बैठक, टिप्पणी, निर्णय, जिन्सी, बजेट, RTI, अध्ययन सामग्री तथा निजामती ज्ञान चौतारीको एकीकृत पोर्टल।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 font-medium">
              कुल मोड्युल: १३ वटा
            </span>
            {isVerifiedEmployee && (
              <span className="text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> प्रमाणित कर्मचारी पहुँच
              </span>
            )}
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-6 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-[#173B63] dark:border-blue-500 text-[#173B63] dark:text-blue-400 bg-slate-50 dark:bg-slate-800/60'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#173B63] text-white dark:bg-blue-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.highlight && (
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-xs font-bold uppercase">
                    APP
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. PUBLIC PROCUREMENT ASSISTANT (Redirection to procurement-bay.vercel.app) */}
      {/* ==================================================================== */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          {/* External Dedicated App Launch Banner */}
          <div className="bg-gradient-to-br from-[#173B63] via-[#1E4E80] to-[#0F2942] rounded-xl p-8 text-white shadow-md relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-200 border border-white/20">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>सार्वजनिक खरिद सम्बन्धी विशेषीकृत बाह्य अनुप्रयोग (Dedicated External App)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                सार्वजनिक खरिद सहयोगी (Procurement Bay)
              </h2>
              <p className="text-slate-200 text-sm leading-relaxed">
                सार्वजनिक खरिद ऐन २०६३, नियमावली २०६४, लागत अनुमान, सिलबन्दी दरभाउपत्र, खुल्ला बोलपत्र कागजात र PPMO e-GP II सहजीकरणका लागि समर्पित एप <strong className="text-amber-300">procurement-bay.vercel.app</strong> मा उपलब्ध छ।
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://procurement-bay.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-lg shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>सार्वजनिक खरिद सहयोगी खोल्नुहोस्</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="text-xs text-blue-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>procurement-bay.vercel.app (सक्रिय तथा प्रमाणित)</span>
                </div>
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
          </div>

          {/* Quick In-Hub Procurement Rule Checker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#173B63] dark:text-blue-400" />
                <span>खरिद विधि सीमा जाँचक (Threshold Checker)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                लागत अनुमानको अनुमानित रकम प्रविष्ट गरी अनिवार्य खरिद विधि र कानुनी म्याद थाहा पाउनुहोस्:
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  अनुमानित लागत रकम (रु. मा)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">रुपैयाँ</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[250000, 500000, 1500000, 2000000, 5000000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCalcAmount(preset)}
                    className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                      calcAmount === preset
                        ? 'bg-[#173B63] text-white border-[#173B63]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    रु. {(preset / 100000).toLocaleString('ne-NP')} लाख
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">कानुनी परामर्श तथा नतिजा</span>
                <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                  procurementAdvice.color === 'emerald'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : procurementAdvice.color === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                }`}>
                  {procurementAdvice.thresholdText}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {procurementAdvice.method}
                  </h4>
                  <p className="text-xs font-semibold text-[#173B63] dark:text-blue-400 mt-0.5">
                    कानुनी आधार: {procurementAdvice.rule}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>प्रक्रियागत अनिवार्यता:</strong> {procurementAdvice.requirements}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">सूचना प्रकाशन म्याद: <strong>{procurementAdvice.urgencyDays}</strong></span>
                  <a
                    href="https://procurement-bay.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#173B63] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>सम्पूर्ण खरिद कागजात तथा ई-बिड procument-bay मा हेर्नुहोस्</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. LEARNING CENTER (अध्ययन केन्द्र) */}
      {/* ==================================================================== */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="अध्ययन शीर्षक वा कानुन खोजी गर्नुहोस्..."
                value={learningSearch}
                onChange={(e) => setLearningSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#173B63]"
              />
            </div>

            {(isAdmin || isVerifiedEmployee) && (
              <button
                onClick={() => setLearningModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ अध्ययन सामग्री थप्नुहोस्</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningList
              .filter((item) =>
                learningSearch ? item.titleNe.toLowerCase().includes(learningSearch.toLowerCase()) || item.summaryNe.toLowerCase().includes(learningSearch.toLowerCase()) : true
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.readTimeMinutes} मिनेट
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {item.titleNe}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.summaryNe}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        db.likeLearningMaterial(item.id);
                        setLearningList(db.getLearningMaterials());
                      }}
                      className="text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                      title="मनपर्‍यो"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{item.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => setSelectedLearning(item)}
                      className="text-[#173B63] dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>पुरा पढ्नुहोस्</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Reading Modal */}
          {selectedLearning && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#173B63] dark:text-blue-400 uppercase">
                      {selectedLearning.category} • {selectedLearning.readTimeMinutes} मिनेट अध्ययन
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedLearning.titleNe}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLearning(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedLearning.contentNe}

                  {selectedLearning.officialActRef && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-200">
                      कानुनी सन्दर्भ: {selectedLearning.officialActRef}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
                  <span>लेखक/स्रोत: {selectedLearning.author}</span>
                  <button
                    onClick={() => setSelectedLearning(null)}
                    className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 text-slate-800 dark:text-white"
                  >
                    बन्द गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. QUIZ PLATFORM (वस्तुगत परीक्षा तथा लोकसेवा अभ्यास) */}
      {/* ==================================================================== */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                निजामती सेवा तथा सार्वजनिक खरिद वस्तुगत परीक्षा (MCQ Simulator)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                लोकसेवा आयोग तथा आन्तरिक बढुवा प्रथम पत्रका लागि आधिकारिक ऐन र दफामा आधारित प्रश्नोत्तर अभ्यास।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setShowQuizExplanations({});
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                पुनः अभ्यास गर्नुहोस् (Reset)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {quizList.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              const isAnswered = selected !== undefined;
              const isCorrect = isAnswered && selected === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.topic} • प्रश्न नं. {qIndex + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                        {q.questionNe}
                      </h4>
                    </div>

                    {isAnswered && (
                      <span className={`text-xs px-2.5 py-1 rounded font-bold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {isCorrect ? '✓ सही उत्तर' : '✗ गलत उत्तर'}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.optionsNe.map((opt, optIdx) => {
                      const isThisSelected = selected === optIdx;
                      const isThisCorrect = q.correctOptionIndex === optIdx;

                      let btnStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300';
                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isThisSelected && !isThisCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => {
                            setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx });
                            setShowQuizExplanations({ ...showQuizExplanations, [q.id]: true });
                          }}
                          className={`text-left text-xs p-3 rounded-lg border transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{['(क)', '(ख)', '(ग)', '(घ)'][optIdx]} {opt}</span>
                          {isAnswered && isThisCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  {isAnswered && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="font-semibold text-[#173B63] dark:text-blue-400">
                        कानुनी स्पष्टीकरण ({q.actReference}):
                      </div>
                      <p>{q.explanationNe}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MEETING MANAGEMENT (बैठक व्यवस्थापन) */}
      {/* ==================================================================== */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                सरकारी बैठक कार्यसूची तथा निर्णय पुस्तिका
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                मन्त्रालय, महाशाखा तथा कार्यालय स्तरका बैठकहरू, उपस्थिति, कार्यसूची तथा माइन्युट व्यवस्थापन।
              </p>
            </div>

            {(isAdmin || isVerifiedEmployee) && (
              <button
                onClick={() => setMeetingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ बैठक तय गर्नुहोस्</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetingList.map((meet) => (
              <div
                key={meet.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400">
                      मिति: वि.सं. {meet.meetingDateBs} • {meet.meetingTime}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {meet.titleNe}
                    </h4>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    meet.status === 'CONCLUDED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {meet.status === 'CONCLUDED' ? 'सम्पन्न' : 'तय भएको'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div><strong>स्थान:</strong> {meet.venue}</div>
                  <div><strong>अध्यक्षता:</strong> {meet.chairperson}</div>
                </div>

                {/* Agendas */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">कार्यसूची (Agendas):</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {meet.agendas.map((ag, i) => (
                      <li key={i}>{ag}</li>
                    ))}
                  </ul>
                </div>

                {/* Decisions */}
                {meet.decisions && meet.decisions.length > 0 && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-300">गरिएका निर्णयहरू:</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-emerald-800 dark:text-emerald-300">
                      {meet.decisions.map((dec, i) => (
                        <li key={i}>{dec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. DECISION TRACKER (निर्णय कार्यान्वयन ट्र्याकर) */}
      {/* ==================================================================== */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setDecisionFilter(status)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    decisionFilter === status
                      ? 'bg-[#173B63] text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {status === 'ALL' && 'सबै निर्णयहरू'}
                  {status === 'PENDING' && 'कार्यान्वयन हुन बाँकी'}
                  {status === 'IN_PROGRESS' && 'प्रक्रियामा'}
                  {status === 'COMPLETED' && 'सम्पन्न'}
                </button>
              ))}
            </div>

            {(isAdmin || isVerifiedEmployee) && (
              <button
                onClick={() => setDecisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ निर्णय प्रविष्ट गर्नुहोस्</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {decisionList
              .filter((d) => (decisionFilter === 'ALL' ? true : d.status === decisionFilter))
              .map((d) => (
                <div
                  key={d.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-300">
                          {d.decisionNo}
                        </span>
                        <span className="text-xs text-slate-400">
                          निर्णय मिति: {d.decisionDateBs} • लक्ष्य मिति: {d.deadlineBs}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {d.titleNe}
                      </h4>
                      {d.remarks && (
                        <p className="text-xs text-slate-500">{d.remarks}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        प्रगति: {d.progressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        d.progressPercent === 100 ? 'bg-emerald-500' : d.progressPercent > 50 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${d.progressPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>जिम्मेवार फाँट: <strong>{d.department} ({d.responsibleOfficer})</strong></span>

                    {/* Quick progress update controls */}
                    {(isAdmin || isVerifiedEmployee) && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const next = Math.min(100, d.progressPercent + 25);
                            db.updateDecisionProgress(d.id, next, next === 100 ? 'COMPLETED' : 'IN_PROGRESS');
                            setDecisionList(db.getDecisions());
                          }}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200"
                        >
                          +२५% प्रगति
                        </button>
                        {d.progressPercent < 100 && (
                          <button
                            onClick={() => {
                              db.updateDecisionProgress(d.id, 100, 'COMPLETED');
                              setDecisionList(db.getDecisions());
                            }}
                            className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 font-semibold"
                          >
                            सम्पन्न चिन्ह लगाउनुहोस्
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. FILE TRACKER (दर्ता चलानी तथा फाइल ट्र्याकर) */}
      {/* ==================================================================== */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="फाइल नं., दर्ता नं. वा विषय खोजी..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#173B63]"
              />
            </div>

            {(isAdmin || isVerifiedEmployee) && (
              <button
                onClick={() => setFileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ फाइल/पत्र दर्ता गर्नुहोस्</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">फाइल / दर्ता नं.</th>
                    <th className="p-3">विषय व्यहोरा</th>
                    <th className="p-3">हालको फाँट/टेबुल</th>
                    <th className="p-3">अवस्था</th>
                    <th className="p-3">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fileList
                    .filter((f) =>
                      fileSearch
                        ? f.fileNo.toLowerCase().includes(fileSearch.toLowerCase()) ||
                          f.fileSubjectNe.toLowerCase().includes(fileSearch.toLowerCase())
                        : true
                    )
                    .map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          <div>{f.fileNo}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{f.dartaNo} ({f.lastActionDateBs})</div>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs">{f.fileSubjectNe}</td>
                        <td className="p-3 font-medium text-[#173B63] dark:text-blue-400">{f.currentDeskBranch}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {(isAdmin || isVerifiedEmployee) && (
                            <button
                              onClick={() => {
                                setFileMoveModalItem(f);
                                setNewDeskName('');
                                setNewDeskRemarks('');
                              }}
                              className="text-xs font-semibold text-[#173B63] dark:text-blue-400 hover:underline"
                            >
                              फाँट सार्नुहोस्
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. INVENTORY / ASSETS (PAMS) */}
      {/* ==================================================================== */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500">कुल दर्ता जिन्सी सामग्री</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {inventoryList.reduce((acc, i) => acc + i.quantity, 0)} थान
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500">जिन्सी कुल सम्पत्ति मूल्याङ्कन</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                रु. {inventoryList.reduce((acc, i) => acc + i.totalValue, 0).toLocaleString('ne-NP')}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500">मर्मत गर्नुपर्ने सामग्री</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {inventoryList.filter((i) => i.condition === 'REPAIRABLE').length} प्रकार
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">संकेत कोड</th>
                    <th className="p-3">जिन्सी सामानको विवरण</th>
                    <th className="p-3">खाता पाना</th>
                    <th className="p-3 text-right">परिमाण</th>
                    <th className="p-3 text-right">कुल मूल्य (रु.)</th>
                    <th className="p-3">अवस्था</th>
                    <th className="p-3">जिम्मेवार व्यक्ति/कोठा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.itemCode}</td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.itemNameNe}</td>
                      <td className="p-3 text-slate-500">{item.pamsLedgerPageNo}</td>
                      <td className="p-3 text-right font-semibold">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        रु. {item.totalValue.toLocaleString('ne-NP')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.condition === 'WORKING' || item.condition === 'NEW'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.condition === 'WORKING' ? 'चालु' : item.condition === 'NEW' ? 'नयाँ' : item.condition === 'REPAIRABLE' ? 'मर्मतयोग्य' : 'निष्प्रयोजन'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{item.assignedRoomOrPerson}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 8. BUDGET PLANNER (बजेट योजना तथा रकमान्तर) */}
      {/* ==================================================================== */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetList.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400">
                      उपशीर्षक नं. {b.budgetSubhead} • आ.व. {b.fiscalYear}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {b.titleNe}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {b.progressPercent}% खर्च
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${b.progressPercent > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${b.progressPercent}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block">स्वीकृत बजेट</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      रु. {(b.allocatedBudget / 100000).toLocaleString('ne-NP')} लाख
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">भएको खर्च</span>
                    <strong className="text-blue-600 dark:text-blue-400">
                      रु. {(b.expenditure / 100000).toLocaleString('ne-NP')} लाख
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">बाँकी रकम</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      रु. {(b.remainingBalance / 100000).toLocaleString('ne-NP')} लाख
                    </strong>
                  </div>
                </div>

                {b.transferPlanningNotes && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                    <strong>रकमान्तर योजना:</strong> {b.transferPlanningNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 9. CIRCULAR TRACKER (सरकारी परिपत्र तथा निर्देशन) */}
      {/* ==================================================================== */}
      {activeTab === 'circulars' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="परिपत्र नं., मन्त्रालय वा विषय खोजी..."
                value={circSearch}
                onChange={(e) => setCircSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#173B63]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {circularList
              .filter((c) =>
                circSearch
                  ? c.titleNe.toLowerCase().includes(circSearch.toLowerCase()) ||
                    c.issuingAuthority.toLowerCase().includes(circSearch.toLowerCase())
                  : true
              )
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          c.priority === 'VERY_URGENT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {c.priority === 'VERY_URGENT' ? 'अति जरुरी' : 'जरुरी'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.issuingAuthority} • प.नं. {c.circularNo}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.titleNe}
                      </h4>
                    </div>

                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      मिति: {c.issuedDateBs}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {c.summaryNe}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">वर्ग: {c.subjectCategory}</span>
                    {c.officialLink && (
                      <a
                        href={c.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#173B63] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>आधिकारिक सूचना हेर्नुहोस्</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 10. RTI ASSISTANT (सूचनाको हक - १५ दिने काउन्टडाउन) */}
      {/* ==================================================================== */}
      {activeTab === 'rti' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                सूचनाको हक (RTI) १५ दिने काउन्टडाउन ट्र्याकर
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ७ बमोजिम दर्ता भएको १५ दिनभित्र अनिवार्य सूचना उपलब्ध गराउनुपर्ने म्याद।
              </p>
            </div>

            <button
              onClick={() => setRTIModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नयाँ सूचना माग दर्ता</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rtiList.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400">
                      {r.registrationNo}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      निवेदक: {r.applicantName} ({r.applicantPhone})
                    </h4>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    r.status === 'PROVIDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {r.status === 'PROVIDED' ? 'सूचना उपलब्ध' : '१५ दिने म्याद बाँकी'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  <strong>माग गरिएको विवरण:</strong> {r.requestedInfoNe}
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>दर्ता मिति: {r.requestedDateBs} • अन्तिम म्याद: <strong>{r.deadlineDateBs}</strong></div>
                  <div>सूचना अधिकारी: {r.rtiOfficerName}</div>
                </div>

                {r.responseDetails && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>प्रतिक्रिया:</strong> {r.responseDetails} (शुल्क रु. {r.feeCharged})
                  </div>
                )}

                {r.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setRTIResponseModalItem(r);
                      setRTIResponseText('');
                      setRTIFee(0);
                    }}
                    className="w-full text-center py-1.5 bg-[#173B63] text-white text-xs font-semibold rounded hover:bg-[#122e4d]"
                  >
                    सूचना उपलब्ध गराउनुहोस् (फर्स्यौट)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 11. GOVERNMENT CALENDAR (सरकारी क्यालेन्डर) */}
      {/* ==================================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              प्रशासनिक क्यालेन्डर तथा महत्त्वपूर्ण म्यादहरू (वि.सं. २०८१)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarList.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.isPublicHoliday ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {c.isPublicHoliday ? 'सार्वजनिक बिदा' : 'प्रशासनिक कार्यतालिका'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    मिति: {c.dateBs}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {c.titleNe}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {c.descriptionNe}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 12. DOCUMENT TOOLKIT (फाराम टुलकिट) */}
      {/* ==================================================================== */}
      {activeTab === 'toolkit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolkitList.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400">
                      {t.formCode} • {t.formatType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {t.downloadCount} पटक डाउनलोड
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.titleNe}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.descriptionNe}
                  </p>
                </div>

                <button
                  onClick={() => {
                    db.incrementToolkitDownload(t.id);
                    setToolkitList(db.getDocumentToolkits());
                    // Simulated download file
                    const blob = new Blob([`${t.titleNe}\nफाराम कोड: ${t.formCode}\n\nनेपाल सरकार - मानक प्रशासनिक ढाँचा।`], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${t.formCode}_${t.titleNe}.txt`;
                    a.click();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>फाराम डाउनलोड गर्नुहोस् ({t.formatType})</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 13. KNOWLEDGE COMMUNITY (निजामती ज्ञान चौतारी / फोरम) */}
      {/* ==================================================================== */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="प्रश्न वा विषय खोजी..."
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#173B63]"
              />
            </div>

            <button
              onClick={() => setCommunityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नयाँ प्रश्न सोध्नुहोस्</span>
            </button>
          </div>

          <div className="space-y-4">
            {communityList
              .filter((p) =>
                communitySearch ? p.titleNe.toLowerCase().includes(communitySearch.toLowerCase()) : true
              )
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#173B63] dark:text-blue-400">
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          सोधकर्ता: <strong>{post.authorName}</strong> ({post.authorRank})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {post.titleNe}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        db.upvoteCommunityPost(post.id);
                        setCommunityList(db.getCommunityPosts());
                      }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#173B63]" />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                    {post.questionContentNe}
                  </p>

                  {/* Answers */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      सहकर्मीहरूका उत्तर ({post.answers.length}):
                    </span>

                    {post.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {ans.authorName} ({ans.authorRank})
                            {ans.isVerifiedOfficial && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓ प्रमाणित
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{ans.answerText}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Answer */}
                  {replyPostId === post.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="आफ्नो कानुनी राय वा अभ्यास लेख्नुहोस्..."
                        className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#173B63]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setReplyPostId(null)}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          रद्द गर्नुहोस्
                        </button>
                        <button
                          onClick={() => {
                            if (!replyText.trim()) return;
                            db.addCommunityAnswer(
                              post.id,
                              replyText,
                              user?.fullName || 'अतिथि प्रयोगकर्ता',
                              isVerifiedEmployee ? 'प्रमाणित कर्मचारी' : 'सहकर्मी',
                              isVerifiedEmployee
                            );
                            setCommunityList(db.getCommunityPosts());
                            setReplyPostId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1 bg-[#173B63] text-white text-xs font-semibold rounded hover:bg-[#122e4d]"
                        >
                          उत्तर पेश गर्नुहोस्
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyPostId(post.id);
                        setReplyText('');
                      }}
                      className="text-xs font-semibold text-[#173B63] dark:text-blue-400 hover:underline"
                    >
                      + यस प्रश्नमा उत्तर दिनुहोस्
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* File Move Modal */}
      {fileMoveModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              फाइल नयाँ फाँटमा सार्नुहोस्
            </h3>
            <p className="text-xs text-slate-500">
              फाइल: <strong>{fileMoveModalItem.fileNo}</strong> ({fileMoveModalItem.fileSubjectNe})
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                नयाँ फाँट / टेबुल चयन गर्नुहोस्
              </label>
              <select
                value={newDeskName}
                onChange={(e) => setNewDeskName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">फाँट चयन गर्नुहोस्</option>
                <option value="शाखा अधिकृत फाँट">शाखा अधिकृत फाँट</option>
                <option value="उपसचिव (प्रशासन) कक्ष">उपसचिव (प्रशासन) कक्ष</option>
                <option value="सहसचिव / महाशाखा प्रमुख">सहसचिव / महाशाखा प्रमुख</option>
                <option value="सचिव सचिवालय">सचिव सचिवालय</option>
                <option value="लेखा शाखा">लेखा शाखा</option>
                <option value="दर्ता चलानी शाखा">दर्ता चलानी शाखा</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                कैफियत / टिप्पणी
              </label>
              <input
                type="text"
                value={newDeskRemarks}
                onChange={(e) => setNewDeskRemarks(e.target.value)}
                placeholder="उदा. पेश गरिएको वा अध्ययनार्थ"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFileMoveModalItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                disabled={!newDeskName}
                onClick={() => {
                  db.updateFileTrackerStage(fileMoveModalItem.id, 'UNDER_REVIEW', newDeskName, newDeskRemarks);
                  setFileList(db.getFileTrackers());
                  setFileMoveModalItem(null);
                }}
                className="px-4 py-1.5 bg-[#173B63] hover:bg-[#122e4d] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                फाँट अद्यावधिक गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RTI Response Modal */}
      {rtiResponseModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              सूचनाको हक फर्स्यौट तथा प्रतिक्रिया
            </h3>
            <p className="text-xs text-slate-500">
              निवेदक: <strong>{rtiResponseModalItem.applicantName}</strong> ({rtiResponseModalItem.registrationNo})
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                उपलब्ध गराइएको सूचना / प्रतिक्रिया व्यहोरा
              </label>
              <textarea
                rows={3}
                value={rtiResponseText}
                onChange={(e) => setRTIResponseText(e.target.value)}
                placeholder="ऐनको दफा ७ बमोजिम प्रमाणित प्रतिलिपि निवेदकलाई बुझाइयो।"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                शुल्क रकम (रु.)
              </label>
              <input
                type="number"
                value={rtiFee}
                onChange={(e) => setRTIFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRTIResponseModalItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                disabled={!rtiResponseText.trim()}
                onClick={() => {
                  db.updateRTIResponse(rtiResponseModalItem.id, rtiResponseText, rtiFee);
                  setRTIList(db.getRTIRequests());
                  setRTIResponseModalItem(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                फर्स्यौट सम्पन्न गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
