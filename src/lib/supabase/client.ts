import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  UserProfile,
  EmployeeVerification,
  LegalDocument,
  LegalSection,
  SalaryScale,
  GovernmentCircular,
  TaskItem,
  NotificationItem,
  AuditLogEntry,
  LegalQueryAnswer,
  GovernmentDraftItem,
  GovernmentDocumentType,
  TaxPolicyVersion,
  PensionPolicyVersion,
  LeavePolicyVersion,
  PromotionCriteriaVersion,
  LearningMaterialItem,
  QuizQuestionItem,
  MeetingRecordItem,
  DecisionTrackerItem,
  FileTrackerItem,
  InventoryItem,
  BudgetItem,
  RTIRequestItem,
  GovCalendarEvent,
  DocumentToolkitItem,
  CommunityPostItem
} from '../../types';

// Check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ============================================================================
// Robust Local Persistent Database Engine
// (Initialized with authentic Nepal Civil Service Seed Data)
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'ncsdh_db_users',
  PROFILES: 'ncsdh_db_profiles',
  VERIFICATIONS: 'ncsdh_db_verifications',
  LEGAL_DOCS: 'ncsdh_db_legal_docs',
  LEGAL_SECTIONS: 'ncsdh_db_legal_sections',
  SALARY_SCALES: 'ncsdh_db_salary_scales',
  CIRCULARS: 'ncsdh_db_circulars',
  TASKS: 'ncsdh_db_tasks',
  NOTIFICATIONS: 'ncsdh_db_notifications',
  AUDIT_LOGS: 'ncsdh_db_audit_logs',
  DRAFTS: 'ncsdh_db_drafts',
  TAX_POLICIES: 'ncsdh_db_tax_policies',
  PENSION_POLICIES: 'ncsdh_db_pension_policies',
  LEAVE_POLICIES: 'ncsdh_db_leave_policies',
  PROMOTION_POLICIES: 'ncsdh_db_promotion_policies',
  LEARNING: 'ncsdh_db_learning',
  QUIZ: 'ncsdh_db_quiz',
  MEETINGS: 'ncsdh_db_meetings',
  DECISIONS: 'ncsdh_db_decisions',
  FILE_TRACKER: 'ncsdh_db_file_tracker',
  INVENTORY: 'ncsdh_db_inventory',
  BUDGET: 'ncsdh_db_budget',
  RTI: 'ncsdh_db_rti',
  CALENDAR: 'ncsdh_db_calendar',
  TOOLKIT: 'ncsdh_db_toolkit',
  COMMUNITY: 'ncsdh_db_community',
};

const LEGACY_DEMO_USER_IDS = new Set([
  'user-admin-001',
  'user-officer-002',
  'user-citizen-003',
]);

const INITIAL_LEGAL_DOCS: LegalDocument[] = [
  {
    id: 'law-001',
    title: 'Civil Service Act, 2049',
    titleNe: 'निजामती सेवा ऐन, २०४९',
    docType: 'ACT',
    category: 'निजामती प्रशासन तथा सेवा सर्त',
    enactmentDateBs: '२०५०/०२/०४',
    status: 'ACTIVE',
    description: 'निजामती सेवालाई सक्षम, सुदृढ, सेवामूलक र उत्तरदायी बनाउन बनेको मूल ऐन।',
    officialSourceUrl: 'https://lawcommission.gov.np',
    versionNo: 'चौथो संशोधन २०७२',
    sectionsCount: 76,
    ministry: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    versions: [
      {
        id: 'ver-001-1',
        versionName: 'मूल ऐन २०४९',
        enactmentDateBs: '२०५०/०२/०४',
        status: 'HISTORICAL',
        keyChangesNe: 'निजामती सेवाको मूल कानुनी संरचना तथा सेवा सर्त प्रारम्भ',
      },
      {
        id: 'ver-001-2',
        versionName: 'दोस्रो संशोधन २०६४',
        enactmentDateBs: '२०६४/०४/२३',
        status: 'HISTORICAL',
        keyChangesNe: '४५ प्रतिशत पदमा समावेशी आरक्षण व्यवस्था र सकारात्मक विभेद नीति लागू',
      },
      {
        id: 'ver-001-3',
        versionName: 'चौथो संशोधन २०७२',
        enactmentDateBs: '२०७२/०३/२९',
        status: 'ACTIVE',
        keyChangesNe: 'समायोजन व्यवस्था, अनिवार्य अवकाश उमेर हद ५८ वर्षको व्याख्या तथा वृत्ति विकास सुधार',
      },
    ],
  },
  {
    id: 'law-002',
    title: 'Public Procurement Act, 2063',
    titleNe: 'सार्वजनिक खरिद ऐन, २०६३',
    docType: 'ACT',
    category: 'सार्वजनिक खरिद तथा वित्तीय व्यवस्थापन',
    enactmentDateBs: '२०६३/०९/३०',
    status: 'ACTIVE',
    description: 'सार्वजनिक खरिद प्रक्रियालाई पारदर्शी, वस्तुनिष्ठ, विश्वसनीय र मितव्ययी बनाउन बनेको ऐन।',
    officialSourceUrl: 'https://ppmo.gov.np',
    versionNo: 'तेस्रो संशोधन २०७६',
    sectionsCount: 84,
    ministry: 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय / PPMO',
    versions: [
      {
        id: 'ver-002-1',
        versionName: 'मूल ऐन २०६३',
        enactmentDateBs: '२०६३/०९/३०',
        status: 'HISTORICAL',
        keyChangesNe: 'सार्वजनिक निकायको खरिद प्रणालीको राष्ट्रिय संहिता',
      },
      {
        id: 'ver-002-2',
        versionName: 'तेस्रो संशोधन २०७६',
        enactmentDateBs: '२०७६/०१/३०',
        status: 'ACTIVE',
        keyChangesNe: 'विद्युतीय खरिद (e-GP), सोझै खरिद सीमा तथा म्याद थप सम्बन्धी कडाइ',
      },
    ],
  },
  {
    id: 'law-003',
    title: 'Good Governance Act, 2064',
    titleNe: 'सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४',
    docType: 'ACT',
    category: 'सुशासन तथा सार्वजनिक सेवा प्रवाह',
    enactmentDateBs: '२०६४/१०/२३',
    status: 'ACTIVE',
    description: 'मुलुकको सार्वजनिक प्रशासनलाई जनमुखी, जवाफदेही, पारदर्शी र परिणाममुखी बनाउन जारी ऐन।',
    officialSourceUrl: 'https://lawcommission.gov.np',
    versionNo: 'मूल ऐन',
    sectionsCount: 48,
    ministry: 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय',
  },
  {
    id: 'law-004',
    title: 'Civil Service Rules, 2050',
    titleNe: 'निजामती सेवा नियमावली, २०५०',
    docType: 'RULE',
    category: 'निजामती प्रशासन तथा सेवा सर्त',
    enactmentDateBs: '२०५०/०३/२८',
    status: 'ACTIVE',
    description: 'निजामती सेवा ऐन २०४९ लाई कार्यान्वयन गर्न जारी भएको विस्तृत कार्यविधि नियमावली।',
    officialSourceUrl: 'https://lawcommission.gov.np',
    versionNo: 'सातौं संशोधन २०८०',
    sectionsCount: 138,
    ministry: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
  },
  {
    id: 'law-005',
    title: 'Public Procurement Rules, 2064',
    titleNe: 'सार्वजनिक खरिद नियमावली, २०६४',
    docType: 'RULE',
    category: 'सार्वजनिक खरिद तथा वित्तीय व्यवस्थापन',
    enactmentDateBs: '२०६४/०५/०३',
    status: 'ACTIVE',
    description: 'सार्वजनिक खरिद ऐन, २०६३ बमोजिम खरिद विधि, बोलपत्र तथा सम्झौता व्यवस्थापन नियमहरू।',
    officialSourceUrl: 'https://ppmo.gov.np',
    versionNo: 'बाह्रौं संशोधन २०८०',
    sectionsCount: 154,
    ministry: 'सार्वजनिक खरिद अनुगमन कार्यालय (PPMO)',
  },
];

const INITIAL_SECTIONS: LegalSection[] = [
  {
    id: 'sec-001',
    documentId: 'law-001',
    documentTitleNe: 'निजामती सेवा ऐन, २०४९',
    chapterNo: 'परिच्छेद-३',
    chapterTitleNe: 'पदपूर्ति सम्बन्धी व्यवस्था',
    sectionNo: 'दफा ७',
    titleNe: 'पदपूर्ति सम्बन्धी व्यवस्था र समावेशी आधार',
    contentNe: 'निजामती सेवाका रिक्त पदहरूको पूर्ति लोक सेवा आयोगद्वारा लिइने खुला प्रतियोगितात्मक परीक्षा तथा आन्तरिक बढुवाद्वारा गरिनेछ। आरक्षण सम्बन्धी ४५% कोटालाई महिला (३३%), आदिवासी जनजाति (२७%), मधेसी (२२%), दलित (९%), अपाङ्गता भएका (५%) र पिछडिएको क्षेत्र (४%) मा विभाजन गरिएको छ।',
    simpleExplanationNe: 'सरकारी सेवाका रिक्त पदहरू खुला परीक्षा र बढुवाबाट पूर्ति हुन्छन्। कूल रिक्त पदमध्ये ४५ प्रतिशत पद समावेशी समूहका लागि अनिवार्य रूपमा छुट्याउनुपर्छ।',
    subsections: [
      {
        id: 'sub-001-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'निजामती सेवाका रिक्त पदहरू खुला प्रतियोगिता र बढुवाद्वारा पदपूर्ति गरिनेछ।',
      },
      {
        id: 'sub-001-2',
        subsectionNo: 'उपदफा (२)',
        contentNe: 'खुला प्रतियोगिताद्वारा पदपूर्ति गरिने पदहरूमध्ये ४५ प्रतिशत पद निम्न वर्गका उम्मेदवारहरूबीच मात्र प्रतिस्पर्धा गराइ पदपूर्ति गरिनेछ:',
        clauses: [
          { clauseNo: 'खण्ड (क)', contentNe: 'महिला - ३३ प्रतिशत' },
          { clauseNo: 'खण्ड (ख)', contentNe: 'आदिवासी/जनजाति - २७ प्रतिशत' },
          { clauseNo: 'खण्ड (ग)', contentNe: 'मधेसी - २२ प्रतिशत' },
          { clauseNo: 'खण्ड (घ)', contentNe: 'दलित - ९ प्रतिशत' },
          { clauseNo: 'खण्ड (ङ)', contentNe: 'अपाङ्गता भएका व्यक्ति - ५ प्रतिशत' },
          { clauseNo: 'खण्ड (च)', contentNe: 'पिछडिएको क्षेत्र - ४ प्रतिशत' },
        ],
      },
    ],
    relatedProvisions: [
      {
        id: 'rel-001-1',
        targetDocTitleNe: 'निजामती सेवा नियमावली, २०५०',
        targetSectionNo: 'नियम ११',
        relationType: 'RULE_UNDER_ACT',
        descriptionNe: 'खुला प्रतियोगिताको प्रतिशत निर्धारण र समावेशी समूहको विज्ञापन प्रक्रिया सम्बन्धी नियम।',
      },
    ],
    amendmentHistoryNe: 'दोस्रो संशोधन २०६४ द्वारा उपदफा (२) थप गरी ४५% समावेशी कोटा लागू गरिएको।',
    keywords: ['पदपूर्ति', 'समावेशी', 'आरक्षण', 'खुला परीक्षा', 'बढुवा', 'कोटा', 'महिला आरक्षण'],
  },
  {
    id: 'sec-002',
    documentId: 'law-001',
    documentTitleNe: 'निजामती सेवा ऐन, २०४९',
    chapterNo: 'परिच्छेद-४',
    chapterTitleNe: 'सरुवा र पदस्थापन',
    sectionNo: 'दफा १८',
    titleNe: 'कर्मचारीको नियमित सरुवा र भौगोलिक वर्गीकरण',
    contentNe: 'निजामती कर्मचारीलाई सामान्यतया वर्षमा एकपटक तोकिएको समय तालिका अनुसार सरुवा गरिनेछ। भौगोलिक क्षेत्र (क, ख, ग, घ वर्ग) को अनुभव र कार्यसम्पादन मूल्याङ्कनलाई सरुवाको मुख्य आधार बनाइनेछ। २ वर्ष अवधि नपुगी विशेष परिस्थिति बाहेक सरुवा गर्न पाइने छैन।',
    simpleExplanationNe: 'कर्मचारीको नियमित सरुवा भदौ महिनाभित्र हुन्छ। "क" वा "ख" वर्गको दुर्गम क्षेत्रमा न्यूनतम अवधि पूरा गरेपछि मात्र सुगम वा अन्य क्षेत्रमा सरुवा हुन पाइन्छ।',
    subsections: [
      {
        id: 'sub-002-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'अख्तियारवालाले निजामती कर्मचारीलाई यस ऐन र प्रचलित नियमावलीमा तोकिएको कार्यतालिका बमोजिम वर्षमा एक पटक सरुवा गर्नेछ।',
      },
      {
        id: 'sub-002-2',
        subsectionNo: 'उपदफा (२)',
        contentNe: 'सरुवा गर्दा भौगोलिक क्षेत्रको अनुभवलाई प्राथमिकता दिइनेछ। "क" वा "ख" वर्गको दुर्गम क्षेत्रमा कम्तीमा तोकिएको अवधि काम नगरेको कर्मचारीलाई सुगम क्षेत्रमा सरुवा गरिने छैन।',
        clauses: [
          { clauseNo: 'खण्ड (क)', contentNe: '"क" वर्गको अति दुर्गम क्षेत्र - न्यूनतम १ वर्ष' },
          { clauseNo: 'खण्ड (ख)', contentNe: '"ख" वर्गको दुर्गम क्षेत्र - न्यूनतम २ वर्ष' },
        ],
      },
      {
        id: 'sub-002-3',
        subsectionNo: 'उपदफा (३)',
        contentNe: 'तोकिएको अवधि नपुगी कर्मचारीको सहमति बिना विशेष स्वास्थ्य उपचार वा कारबाही बाहेक अन्य अवस्थामा सरुवा गर्न पाइने छैन।',
      },
    ],
    relatedProvisions: [
      {
        id: 'rel-002-1',
        targetDocTitleNe: 'निजामती सेवा नियमावली, २०५०',
        targetSectionNo: 'नियम ३६',
        relationType: 'RULE_UNDER_ACT',
        descriptionNe: 'मन्त्रालय, विभाग र जिल्ला स्तरीय कार्यालयहरूको सरुवा कार्यतालिका (भदौ महिनाभित्र गर्ने व्यवस्था)।',
      },
    ],
    amendmentHistoryNe: 'चौथो संशोधन २०७२ द्वारा भौगोलिक क्षेत्रको अङ्क गणना र मन्त्रालयगत सरुवाको कडाइ थप गरिएको।',
    keywords: ['सरुवा', 'पदस्थापन', 'भौगोलिक क्षेत्र', 'दुर्गम', 'सुगम', 'कार्यतालिका', 'भदौ'],
  },
  {
    id: 'sec-003',
    documentId: 'law-001',
    documentTitleNe: 'निजामती सेवा ऐन, २०४९',
    chapterNo: 'परिच्छेद-७',
    chapterTitleNe: 'सेवाको सुरक्षा र अवकाश',
    sectionNo: 'दफा ३३',
    titleNe: 'अनिवार्य अवकाशको उमेर हद (५८ वर्ष)',
    contentNe: 'निजामती कर्मचारीले अन्ठाउन्न (५८) वर्षको उमेर पूरा भएपछि निजामती सेवाबाट स्वतः अनिवार्य अवकाश पाउनेछ। राष्ट्रिय किताबखानामा दर्ता भएको वैयक्तिक विवरण फाराम (सिटरोल) मा उल्लेखित जन्ममिति वा नागरिकता प्रमाणपत्रमा उल्लेखित जन्ममितिमध्ये जुन पहिले आउँछ सोही आधार मानिनेछ।',
    simpleExplanationNe: 'निजामती कर्मचारीको अनिवार्य अवकाश उमेर ५८ वर्ष हो। सिटरोल दर्ता र नागरिकता प्रमाणपत्रको पहिलो जन्ममिति जुन जेठो छ सोही आधार मानिन्छ।',
    subsections: [
      {
        id: 'sub-003-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'निजामती कर्मचारीले अन्ठाउन्न वर्षको उमेर पूरा भएपछि निजामती सेवाबाट स्वतः अनिवार्य अवकाश पाउनेछ।',
      },
      {
        id: 'sub-003-2',
        subsectionNo: 'उपदफा (२)',
        contentNe: 'उमेर गणना गर्दा राष्ट्रिय किताबखानामा दर्ता भएको वैयक्तिक विवरण फाराम (सिटरोल) को जन्ममिति र नागरिकताको सुरु जन्ममितिमा वर्ष मात्र उल्लेख भएमा असार मसान्त वा जुन मिति जेठो ठहरिन्छ सोही आधार मानिनेछ।',
      },
    ],
    relatedProvisions: [
      {
        id: 'rel-003-1',
        targetDocTitleNe: 'निजामती सेवा ऐन, २०४९',
        targetSectionNo: 'दफा ३७',
        relationType: 'CROSS_ACT_REFERENCE',
        descriptionNe: '२० वर्ष वा सोभन्दा बढी सेवा अवधि पूरा गरेको कर्मचारीले निवृत्तिभरण (पेन्सन) पाउने व्यवस्था।',
      },
    ],
    amendmentHistoryNe: 'मूल ऐनमा ६० वर्ष रहेको उमेर हदलाई २०४९ को पहिलो संशोधनमार्फत ५८ वर्ष कायम गरिएको।',
    keywords: ['अवकाश', 'उमेर हद', '५८ वर्ष', 'पेन्सन', 'सिटरोल', 'निवृत्तिभरण', 'जन्ममिति'],
  },
  {
    id: 'sec-004',
    documentId: 'law-001',
    documentTitleNe: 'निजामती सेवा ऐन, २०४९',
    chapterNo: 'परिच्छेद-८',
    chapterTitleNe: 'बिदा सम्बन्धी व्यवस्था',
    sectionNo: 'दफा ४०',
    titleNe: 'कर्मचारीले पाउने विभिन्न प्रकारका बिदाहरू',
    contentNe: 'निजामती कर्मचारीले प्रचलित नियमावली अनुसार भैपरी आउने र पर्व बिदा (६/६ दिन गरी १२ दिन), घर बिदा (प्रत्येक १२ दिन काम गरे बापत १ दिन), बिरामी बिदा (वर्षको १२ दिन पूर्ण तलब सहित), प्रसूति बिदा (९८ दिन), प्रसूति स्याहार बिदा (१५ दिन), किरिया बिदा (१५ दिन), अध्ययन बिदा तथा असाधारण बिदा पाउन सक्नेछन्।',
    simpleExplanationNe: 'कर्मचारीले वर्षको १२ दिन घर बिदा (सञ्चित हुने), १२ दिन बिरामी बिदा, १२ दिन भैपरी र पर्व बिदा, र महिला कर्मचारीले ९८ दिन प्रसूति बिदा पाउँछन्।',
    subsections: [
      {
        id: 'sub-004-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'निजामती कर्मचारीले देहाय बमोजिमका बिदाहरू पाउनेछन्:',
        clauses: [
          { clauseNo: 'खण्ड (क)', contentNe: 'भैपरी आउने बिदा - वर्षको ६ दिन र पर्व बिदा वर्षको ६ दिन' },
          { clauseNo: 'खण्ड (ख)', contentNe: 'घर बिदा - प्रत्येक १२ दिन काम गरे बापत १ दिन (अधिकतम १८० दिनसम्म सञ्चित हुने)' },
          { clauseNo: 'खण्ड (ग)', contentNe: 'बिरामी बिदा - प्रत्येक वर्ष १२ दिन (पूर्ण तलब सहित, आजीवन सञ्चित हुने)' },
          { clauseNo: 'खण्ड (घ)', contentNe: 'प्रसूति बिदा - महिला कर्मचारीले सुत्केरी अघि र पछि गरी ९८ दिन पूर्ण तलब सहित' },
          { clauseNo: 'खण्ड (ङ)', contentNe: 'प्रसूति स्याहार बिदा - पुरुष कर्मचारीले पत्नी सुत्केरी हुँदा १५ दिन' },
          { clauseNo: 'खण्ड (च)', contentNe: 'किरिया बिदा - कुल १५ दिन' },
        ],
      },
    ],
    relatedProvisions: [
      {
        id: 'rel-004-1',
        targetDocTitleNe: 'निजामती सेवा नियमावली, २०५०',
        targetSectionNo: 'नियम ५८ देखि ६५',
        relationType: 'RULE_UNDER_ACT',
        descriptionNe: 'बिदा माग गर्ने ढाँचा, स्वीकृत गर्ने अधिकारी तथा सञ्चित बिदाको रकम भुक्तानी सम्बन्धी नियम।',
      },
    ],
    keywords: ['बिदा', 'घर बिदा', 'बिरामी बिदा', 'प्रसूति बिदा', 'पर्व बिदा', 'किरिया बिदा', '१८० दिन'],
  },
  {
    id: 'sec-005',
    documentId: 'law-002',
    documentTitleNe: 'सार्वजनिक खरिद ऐन, २०६३',
    chapterNo: 'परिच्छेद-४',
    chapterTitleNe: 'खरिदका विधिहरू',
    sectionNo: 'दफा ४१',
    titleNe: 'सोझै खरिद गर्न सकिने विशेष अवस्थाहरू र सीमा',
    contentNe: 'प्रचलित नियमावलीले तोकेको सीमा (रु. ५ लाख सम्मको मालसामान वा परामर्श) सम्म सोझै खरिद गर्न सकिनेछ। यसका अतिरिक्त प्राकृतिक विपद्, आपतकालीन परिस्थिति, उत्पादक एक मात्र भएको अवस्था वा स्वामित्व सम्बन्धी एकाधिकार भएको सेवामा औचित्य पुष्टि गरी सोझै खरिद प्रक्रिया अवलम्बन गर्न सकिन्छ।',
    simpleExplanationNe: '५ लाख रुपैयाँसम्मको मालसामान सोझै खरिद गर्न सकिन्छ। ५ लाखभन्दा माथिको रकममा प्रतिस्पर्धा बिना सोझै खरिद गर्न पाइँदैन, विपद् वा विशेष अवस्थामा मन्त्रिपरिषद् वा उच्च निर्णय आवश्यक पर्छ।',
    subsections: [
      {
        id: 'sub-005-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'सार्वजनिक निकायले देहायको अवस्थामा सोझै खरिद विधिको माध्यमबाट खरिद गर्न सक्नेछ:',
        clauses: [
          { clauseNo: 'खण्ड (क)', contentNe: 'तोकिएको रकम (रु. ५ लाख) भन्दा कम मूल्यको मालसामान वा परामर्श सेवा' },
          { clauseNo: 'खण्ड (ख)', contentNe: 'पेटेन्ट, कपीराइट वा प्राविधिक एकाधिकार भएको सामान उत्पादक एक मात्र भएको अवस्था' },
          { clauseNo: 'खण्ड (ग)', contentNe: 'प्राकृतिक विपद् वा आपतकालीन उद्धार कार्यका लागि तत्काल आवश्यक परेमा' },
        ],
      },
    ],
    relatedProvisions: [
      {
        id: 'rel-005-1',
        targetDocTitleNe: 'सार्वजनिक खरिद नियमावली, २०६४',
        targetSectionNo: 'नियम ८५',
        relationType: 'RULE_UNDER_ACT',
        descriptionNe: 'सोझै खरिद गर्दा कम्तीमा ३ वटा सूचीकृत आपूर्तिकर्ताबाट दरभाउ माग गरी तुलनात्मक विश्लेषण गर्नुपर्ने कार्यविधि।',
      },
    ],
    keywords: ['खरिद विधि', 'सोझै खरिद', '५ लाख', 'विपद् खरिद', 'कोटेशन', 'बोलपत्र', 'सिलबन्दी'],
  },
  {
    id: 'sec-006',
    documentId: 'law-003',
    documentTitleNe: 'सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४',
    chapterNo: 'परिच्छेद-४',
    chapterTitleNe: 'सार्वजनिक सेवा प्रवाह',
    sectionNo: 'दफा २५',
    titleNe: 'नागरिक बडापत्र (Citizen Charter) सम्बन्धी व्यवस्था',
    contentNe: 'प्रत्येक सरकारी कार्यालयले सेवाग्राहीलाई सेवा प्रवाह गर्ने प्रयोजनका लागि कार्यालय परिसरमा सबैले देख्ने गरी नागरिक बडापत्र राख्नु पर्नेछ। जसमा सेवाको प्रकृति, लाग्ने समय, दस्तुर, आवश्यक कागजात, जिम्मेवार शाखा तथा गुनासो सुन्ने अधिकारीको विवरण अनिवार्य उल्लेख हुनु पर्नेछ।',
    simpleExplanationNe: 'सेवा दिने हरेक सरकारी कार्यालयले सेवाको मूल्य, लाग्ने समय, चाहिने कागजात र गुनासो सुन्ने अधिकारी खुलाइएको नागरिक बडापत्र अनिवार्य राख्नुपर्छ।',
    subsections: [
      {
        id: 'sub-006-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'सार्वजनिक निकायले सेवा प्रवाह गर्ने प्रयोजनका लागि कार्यालयको परिसरभित्र सबैले देख्ने उपयुक्त ठाउँमा नागरिक बडापत्र राख्नु पर्नेछ।',
      },
      {
        id: 'sub-006-2',
        subsectionNo: 'उपदफा (२)',
        contentNe: 'नागरिक बडापत्रमा देहायका कुराहरू स्पष्ट रूपमा खुलाइएको हुनुपर्नेछ:',
        clauses: [
          { clauseNo: 'खण्ड (क)', contentNe: 'सम्बन्धित कार्यालयले दिने सेवा र त्यसको प्रकृति' },
          { clauseNo: 'खण्ड (ख)', contentNe: 'सेवा प्राप्त गर्न लाग्ने समय' },
          { clauseNo: 'खण्ड (ग)', contentNe: 'सेवा प्राप्त गर्न लाग्ने दस्तुर वा शुल्क' },
          { clauseNo: 'खण्ड (घ)', contentNe: 'सेवाग्राहीले पेश गर्नुपर्ने आवश्यक कागजातहरू' },
          { clauseNo: 'खण्ड (ङ)', contentNe: 'जिम्मेवार अधिकारी र गुनासो सुन्ने अधिकारीको नाम तथा सम्पर्क' },
        ],
      },
    ],
    keywords: ['सुशासन', 'नागरिक बडापत्र', 'सेवा प्रवाह', 'गुनासो अधिकारी', 'दस्तुर', 'पारदर्शिता'],
  },
  {
    id: 'sec-007',
    documentId: 'law-004',
    documentTitleNe: 'निजामती सेवा नियमावली, २०५०',
    chapterNo: 'परिच्छेद-१४',
    chapterTitleNe: 'कार्यसम्पादन मूल्याङ्कन',
    sectionNo: 'नियम ७८',
    titleNe: 'कार्यसम्पादन मूल्याङ्कन (का.स.मू.) फाराम पेश गर्ने कार्यतालिका',
    contentNe: 'निजामती कर्मचारीले प्रत्येक आर्थिक वर्ष समाप्त भएको मितिले साउन महिनाभित्र आफ्नो कार्यसम्पादन मूल्याङ्कन फाराम भरी सुपरिवेक्षक समक्ष दर्ता गराउनुपर्नेछ। सुपरिवेक्षकले भदौ १५ सम्म र पुनरावलोकन समितिले असोज मसान्तभित्र मूल्याङ्कन सम्पन्न गर्नुपर्नेछ।',
    simpleExplanationNe: 'का.स.मू. फाराम साउन मसान्तभित्र सुपरिवेक्षककहाँ दर्ता गराउनुपर्छ, म्याद नाघेर पेश गरेमा अङ्क गणना हुँदैन।',
    subsections: [
      {
        id: 'sub-007-1',
        subsectionNo: 'उपदफा (१)',
        contentNe: 'कर्मचारीले आर्थिक वर्ष समाप्त भएको मितिले एक महिनाभित्र (साउन मसान्तभित्र) फाराम भरी बुझाउनु पर्नेछ।',
      },
    ],
    keywords: ['कासमू', 'कार्यसम्पादन मूल्याङ्कन', 'फाराम', 'साउन', 'बढुवा अङ्क'],
  },
];

const INITIAL_SALARY_SCALES: SalaryScale[] = [
  {
    id: 'sal-001',
    fiscalYear: '2081/82',
    levelCode: 'CS_SEC_CHIEF',
    levelNameNe: 'मुख्य सचिव',
    rankCategory: 'विशिष्ट श्रेणी',
    basicSalary: 77211,
    gradeAmount: 2574,
    maxGrades: 2,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-002',
    fiscalYear: '2081/82',
    levelCode: 'CS_SEC',
    levelNameNe: 'सचिव / विशिष्ट श्रेणी',
    rankCategory: 'विशिष्ट श्रेणी',
    basicSalary: 72082,
    gradeAmount: 2403,
    maxGrades: 2,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-003',
    fiscalYear: '2081/82',
    levelCode: 'CS_JOINT_SEC',
    levelNameNe: 'सहसचिव (रा.प. प्रथम श्रेणी)',
    rankCategory: 'राजपत्राङ्कित',
    basicSalary: 56787,
    gradeAmount: 1893,
    maxGrades: 6,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-004',
    fiscalYear: '2081/82',
    levelCode: 'CS_UNDER_SEC',
    levelNameNe: 'उपसचिव (रा.प. द्वितीय श्रेणी)',
    rankCategory: 'राजपत्राङ्कित',
    basicSalary: 48737,
    gradeAmount: 1625,
    maxGrades: 7,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-005',
    fiscalYear: '2081/82',
    levelCode: 'CS_OFFICER',
    levelNameNe: 'शाखा अधिकृत (रा.प. तृतीय श्रेणी)',
    rankCategory: 'राजपत्राङ्कित',
    basicSalary: 43689,
    gradeAmount: 1456,
    maxGrades: 8,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-006',
    fiscalYear: '2081/82',
    levelCode: 'CS_SUBBA',
    levelNameNe: 'नायब सुब्बा (रा.अन. प्रथम श्रेणी / पाचौं तह)',
    rankCategory: 'राजपत्र अनङ्कित',
    basicSalary: 34730,
    gradeAmount: 1158,
    maxGrades: 10,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-007',
    fiscalYear: '2081/82',
    levelCode: 'CS_KHARIDAR',
    levelNameNe: 'खरिदार (रा.अन. द्वितीय श्रेणी / चौथो तह)',
    rankCategory: 'राजपत्र अनङ्कित',
    basicSalary: 32902,
    gradeAmount: 1097,
    maxGrades: 10,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-008',
    fiscalYear: '2081/82',
    levelCode: 'CS_MUKHIYA',
    levelNameNe: 'मुखिया (रा.अन. तृतीय श्रेणी)',
    rankCategory: 'राजपत्र अनङ्कित',
    basicSalary: 27612,
    gradeAmount: 920,
    maxGrades: 10,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
  {
    id: 'sal-009',
    fiscalYear: '2081/82',
    levelCode: 'CS_HELPER',
    levelNameNe: 'कार्यालय सहयोगी (प्रथम स्तर)',
    rankCategory: 'श्रेणीविहीन',
    basicSalary: 24702,
    gradeAmount: 823,
    maxGrades: 10,
    dearnessAllowance: 2000,
    sourceReference: 'नेपाल सरकार मन्त्रिपरिषद् निर्णय तथा राजपत्र २०८१',
  },
];

const INITIAL_TAX_POLICIES: TaxPolicyVersion[] = [
  {
    fiscalYear: '2081/82',
    enactedDateBs: '२०८१/०४/०१',
    sourceLawNe: 'आर्थिक ऐन, २०८१ तथा आयकर ऐन, २०५८ को अनुसूची-१',
    status: 'ACTIVE',
    singleBasicExemption: 500000,
    marriedBasicExemption: 600000,
    slabs: [
      {
        id: 'slab-1',
        slabName: 'पहिलो स्ल्याब (सामाजिक सुरक्षा कर)',
        thresholdSingle: 500000,
        thresholdMarried: 600000,
        ratePercent: 1,
        descriptionNe: 'एकल ५ लाख र दम्पती ६ लाखसम्म १% सामाजिक सुरक्षा कर (प्राकृतिक व्यक्ति)',
      },
      {
        id: 'slab-2',
        slabName: 'दोस्रो स्ल्याब (१०%)',
        thresholdSingle: 700000,
        thresholdMarried: 800000,
        ratePercent: 10,
        descriptionNe: 'त्यसपछिको २ लाख रुपैयाँसम्म १०% आयकर',
      },
      {
        id: 'slab-3',
        slabName: 'तेस्रो स्ल्याब (२०%)',
        thresholdSingle: 1000000,
        thresholdMarried: 1100000,
        ratePercent: 20,
        descriptionNe: 'त्यसपछिको ३ लाख रुपैयाँसम्म २०% आयकर',
      },
      {
        id: 'slab-4',
        slabName: 'चौथो स्ल्याब (३०%)',
        thresholdSingle: 2000000,
        thresholdMarried: 2000000,
        ratePercent: 30,
        descriptionNe: 'त्यसपछिको १० लाख रुपैयाँ (२० लाखसम्म) ३०% आयकर',
      },
      {
        id: 'slab-5',
        slabName: 'पाँचौं स्ल्याब (३६% - सरचार्ज सहित)',
        thresholdSingle: 5000000,
        thresholdMarried: 5000000,
        ratePercent: 36,
        descriptionNe: '२० लाखदेखि ५० लाखसम्म ३६% (३०% + २०% अतिरिक्त सरचार्ज)',
      },
      {
        id: 'slab-6',
        slabName: 'छैटौं स्ल्याब (३९% - उच्च सरचार्ज)',
        thresholdSingle: 99999999,
        thresholdMarried: 99999999,
        ratePercent: 39,
        descriptionNe: '५० लाखभन्दा बढी आयमा ३९% (३०% + ३०% अतिरिक्त सरचार्ज)',
      },
    ],
    rebates: {
      lifeInsuranceMax: 40000,
      healthInsuranceMax: 20000,
      femaleTaxCreditPercent: 10,
      remoteAreaDeductions: {
        categoryA: 50000,
        categoryB: 40000,
        categoryC: 30000,
        categoryD: 20000,
        categoryE: 10000,
      },
    },
  },
  {
    fiscalYear: '2080/81',
    enactedDateBs: '२०८०/०४/०१',
    sourceLawNe: 'आर्थिक ऐन, २०८०',
    status: 'HISTORICAL',
    singleBasicExemption: 500000,
    marriedBasicExemption: 600000,
    slabs: [
      {
        id: 'slab-old-1',
        slabName: 'पहिलो स्ल्याब (१%)',
        thresholdSingle: 500000,
        thresholdMarried: 600000,
        ratePercent: 1,
        descriptionNe: 'एकल ५ लाख र दम्पती ६ लाखसम्म १% कर',
      },
      {
        id: 'slab-old-2',
        slabName: 'दोस्रो स्ल्याब (१०%)',
        thresholdSingle: 700000,
        thresholdMarried: 800000,
        ratePercent: 10,
        descriptionNe: 'त्यसपछिको २ लाख रुपैयाँसम्म १०%',
      },
      {
        id: 'slab-old-3',
        slabName: 'तेस्रो स्ल्याब (२०%)',
        thresholdSingle: 1000000,
        thresholdMarried: 1100000,
        ratePercent: 20,
        descriptionNe: 'त्यसपछिको ३ लाख रुपैयाँसम्म २०%',
      },
      {
        id: 'slab-old-4',
        slabName: 'चौथो स्ल्याब (३०%)',
        thresholdSingle: 2000000,
        thresholdMarried: 2000000,
        ratePercent: 30,
        descriptionNe: '२० लाखसम्म ३०%',
      },
      {
        id: 'slab-old-5',
        slabName: 'पाँचौं स्ल्याब (३६%)',
        thresholdSingle: 99999999,
        thresholdMarried: 99999999,
        ratePercent: 36,
        descriptionNe: '२० लाखभन्दा माथि ३६%',
      },
    ],
    rebates: {
      lifeInsuranceMax: 40000,
      healthInsuranceMax: 20000,
      femaleTaxCreditPercent: 10,
      remoteAreaDeductions: {
        categoryA: 50000,
        categoryB: 40000,
        categoryC: 30000,
        categoryD: 20000,
        categoryE: 10000,
      },
    },
  },
];

const INITIAL_PENSION_POLICIES: PensionPolicyVersion[] = [
  {
    fiscalYear: '2081/82',
    sourceLawNe: 'निवृत्तिभरण कोष ऐन, २०७५ तथा निजामती सेवा ऐन, २०४९ को दफा ३७',
    status: 'ACTIVE',
    minServiceYearsPension: 20,
    formulaDivisor: 50,
    senior70BonusPercent: 10,
    senior75BonusPercent: 15,
    contributoryEffectiveDateBs: '२०७५/०४/०१',
    contributoryCutPercent: 6,
    contributoryGovtPercent: 6,
    gratuityRules: {
      bracket1: { minYears: 5, maxYears: 10, salaryMultiplier: 0.5 },
      bracket2: { minYears: 10, maxYears: 15, salaryMultiplier: 1.0 },
      bracket3: { minYears: 15, maxYears: 20, salaryMultiplier: 1.5 },
    },
  },
];

const INITIAL_LEAVE_POLICIES: LeavePolicyVersion[] = [
  {
    fiscalYear: '2081/82',
    sourceLawNe: 'निजामती सेवा नियमावली, २०५० (सातौं संशोधन २०८०) को परिच्छेद-११',
    homeLeaveEarnDays: 12,
    homeLeaveMaxAccumulate: 180,
    sickLeavePerYear: 12,
    casualLeavePerYear: 6,
    festivalLeavePerYear: 6,
    maternityLeaveDays: 98,
    paternityCareLeaveDays: 15,
    mourningLeaveDays: 15,
    encashmentDivisor: 30,
  },
];

const INITIAL_PROMOTION_CRITERIA: PromotionCriteriaVersion[] = [
  {
    fiscalYear: '2081/82',
    sourceLawNe: 'निजामती सेवा ऐन, २०४९ को दफा २४ (कार्यक्षमता मूल्याङ्कनद्वारा बढुवा)',
    totalMarks: 100,
    performanceMax: 40,
    seniorityMax: 20,
    geographicMax: 16,
    academicMax: 12,
    trainingMax: 8,
    interviewMax: 4,
    minServiceYearsOfficer: 5,
    minServiceYearsNonOfficer: 5,
  },
];

const INITIAL_CIRCULARS: GovernmentCircular[] = [
  {
    id: 'circ-001',
    titleNe: 'आ.व. २०८१/८२ को कार्यसम्पादन सम्झौता र प्रगति प्रतिवेदन सम्बन्धमा',
    issuingAuthority: 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय, सिंहदरबार',
    circularNo: 'प.म.का/०८१-२४',
    issuedDateBs: '२०८१/०५/१५',
    subjectCategory: 'सुशासन तथा अनुगमन',
    priority: 'VERY_URGENT',
    summaryNe: 'सबै मन्त्रालय, आयोग तथा निकायहरूले मातहतका कर्मचारीसँग कार्यसम्पादन सम्झौता गरी त्रैमासिक प्रगति विवरण अनलाइन प्रणालीमा प्रविष्ट गर्नुपर्ने निर्देशन।',
    officialLink: 'https://opmcm.gov.np',
    isActive: true,
  },
  {
    id: 'circ-002',
    titleNe: 'कर्मचारीको वैयक्तिक विवरण (PIS/सिटरोल) अनलाइन अद्यावधिक गर्ने सम्बन्धमा',
    issuingAuthority: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    circularNo: 'स.मा.सा.प्र./०८१-११',
    issuedDateBs: '२०८१/०६/०२',
    subjectCategory: 'कर्मचारी प्रशासन',
    priority: 'URGENT',
    summaryNe: 'राष्ट्रिय किताबखाना (निजामती) मा आफ्नो सिटरोलमा नयाँ शैक्षिक योग्यता, तालिम तथा पारिवारिक विवरण अनलाइन पोर्टल मार्फत प्रविष्ट गरी प्रमाणित गराउनुहुन।',
    officialLink: 'https://mofaga.gov.np',
    isActive: true,
  },
  {
    id: 'circ-003',
    titleNe: 'चालु आर्थिक वर्षको बजेट खर्चमा मितव्ययिता र वित्तीय अनुशासन पालना सम्बन्धी',
    issuingAuthority: 'अर्थ मन्त्रालय, बजेट तथा कार्यक्रम महाशाखा',
    circularNo: 'अ.म./०८१-०९',
    issuedDateBs: '२०८१/०४/०८',
    subjectCategory: 'बजेट तथा वित्तीय प्रशासन',
    priority: 'NORMAL',
    summaryNe: 'इन्धन, बैठक भत्ता, नयाँ सवारी साधन खरिद तथा वैदेशिक भ्रमणमा नियन्त्रण गरी तोकिएका सार्वजनिक खर्चका मापदण्डहरू कडाइका साथ पालना गर्ने सम्बन्धी निर्देशिका।',
    officialLink: 'https://mof.gov.np',
    isActive: true,
  },
  {
    id: 'circ-004',
    titleNe: 'सार्वजनिक निकायहरूमा विद्युतीय हाजिरी तथा पोशाक भत्ता कार्यान्वयन सम्बन्धी',
    issuingAuthority: 'राष्ट्रिय सतर्कता केन्द्र',
    circularNo: 'रा.स.के./०८१-०३',
    issuedDateBs: '२०८१/०४/२२',
    subjectCategory: 'अनुगमन तथा आचारसंहिता',
    priority: 'NORMAL',
    summaryNe: 'कार्यालय समयको पूर्ण पालना, बायोमेट्रिक हाजिरी प्रणालीको नियमित अनुगमन तथा तोकिएको पोशाक अनिवार्य लगाउनुपर्ने निर्देशन।',
    officialLink: 'https://nvc.gov.np',
    isActive: true,
  },
];

const INITIAL_TASKS: TaskItem[] = [];
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

const INITIAL_DRAFTS: GovernmentDraftItem[] = [
  {
    id: 'draft-001',
    docType: 'tippani',
    title: 'वार्षिक खरिद योजना स्वीकृति तथा बजेट विनियोजन सम्बन्धी निर्णय',
    subject: 'आर्थिक वर्ष २०८१/८२ को वार्षिक खरिद योजना स्वीकृति सम्बन्धमा।',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'योजना, अनुगमन तथा मूल्यांकन महाशाखा',
    officeName: 'सिंहदरबार, काठमाडौँ',
    branchName: 'आन्तरिक प्रशासन तथा खरिद शाखा',
    dispatchNo: '४१२',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०७/२८',
    urgency: 'जरुरी',
    legalBasis: 'सार्वजनिक खरिद ऐन, २०६३ को दफा ८ तथा सार्वजनिक खरिद नियमावली, २०६४ को नियम ७',
    content: `१. प्रस्तुत विषयमा चालु आर्थिक वर्ष २०८१/८२ का लागि स्वीकृत वार्षिक बजेट तथा कार्यक्रम बमोजिम यस मन्त्रालय तथा अन्तर्गतका निकायहरूलाई आवश्यक पर्ने मसलन्द, कम्प्युटर उपकरण, सवारी साधन मर्मत तथा सफ्टवेयर स्तरोन्नति खरिद गर्न सार्वजनिक खरिद ऐन, २०६३ को दफा ८ को उपदफा (१) बमोजिम तयार पारिएको वार्षिक खरिद योजना (Annual Procurement Plan) निर्णयार्थ पेश गरिएको छ।

२. सार्वजनिक खरिद नियमावली, २०६४ को नियम ७ अनुसार वार्षिक १० लाख रुपैयाँभन्दा बढी लागत अनुमान हुने खरिद कार्यका लागि वार्षिक खरिद योजना तयार गरी अख्तियारवालाबाट अनिवार्य स्वीकृत गराउनुपर्ने स्पष्ट कानुनी व्यवस्था रहेको छ।

३. यस महाशाखाबाट तयार गरिएको खरिद योजनामा उल्लिखित खरिद परिमाण, अनुमानित लागत रकम रु. १,४५,००,०००/- (अक्षरेपी एक करोड पैँतालीस लाख रुपैयाँ मात्र) र प्रस्तावित खरिद विधि (खुल्ला राष्ट्रिय बोलपत्र तथा सोझै खरिद) विद्यमान कानुन र मापदण्ड अनुकूल देखिएको छ।

४. अतः संलग्न वार्षिक खरिद योजना स्वीकृतिका लागि श्रीमान् सचिव ज्यू समक्ष निर्णयार्थ सादर पेश गर्दछु।`,
    drafter: {
      name: 'रमेश शर्मा',
      designation: 'शाखा अधिकृत',
      dateBs: '२०८१/०७/२८',
    },
    reviewer: {
      name: 'हरिप्रसाद दाहाल',
      designation: 'सहसचिव / महाशाखा प्रमुख',
      dateBs: '२०८१/०७/२९',
      remarks: 'प्रचलित खरिद कानुनसम्मत देखिएकाले वार्षिक खरिद योजना स्वीकृतिका लागि सिफारिस गर्दछु।',
    },
    approver: {
      name: 'डा. सुरेन्द्र अधिकारी',
      designation: 'सचिव',
      dateBs: '२०८१/०७/३०',
      decisionStatus: 'APPROVED',
      decisionNote: 'पेश भए बमोजिम वार्षिक खरिद योजना स्वीकृत गरिएको छ। खरिद प्रक्रियामा उच्चतम प्रतिस्पर्धा र मितव्ययिता कायम गर्नुहोला।',
    },
    carbonCopies: ['लेखा तथा आर्थिक प्रशासन शाखा', 'आन्तरिक लेखापरीक्षण शाखा'],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'draft-002',
    docType: 'order',
    title: 'कर्मचारी काज खटन तथा कार्य जिम्मेवारी सम्बन्धी कार्यालय आदेश',
    subject: 'कर्मचारी काज खटन गरिएको सम्बन्धमा।',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'कर्मचारी प्रशासन महाशाखा',
    officeName: 'सिंहदरबार, काठमाडौँ',
    branchName: 'आन्तरिक प्रशासन शाखा',
    dispatchNo: '५०८',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०८/०१',
    urgency: 'जरुरी',
    legalBasis: 'निजामती सेवा नियमावली, २०५० को नियम ८८ बमोजिम',
    content: `उपरोक्त सम्बन्धमा गण्डकी प्रदेश अन्तर्गतका स्थानीय तहहरूमा सञ्चालन हुन गइरहेको "स्थानीय तह वित्तीय सुशासन तथा विद्युतीय खरिद (e-GP) प्रणाली सहजीकरण कार्यक्रम" मा स्रोत व्यक्तिका रूपमा कार्य सम्पादन गर्नका लागि यस मन्त्रालयका प्रशासन सेवा, सामान्य प्रशासन समूह, राजपत्राङ्कित तृतीय श्रेणीका शाखा अधिकृत श्री रमेश शर्मालाई मिति २०८१/०८/०५ देखि २०८१/०८/१० सम्म ६ (छ) दिनका लागि पोखरा, कास्कीमा काज खटाइएको छ।

निज अधिकृतले काज अवधिभर प्रचलित निजामती सेवा नियमावली अनुसार पाउने दैनिक तथा भ्रमण भत्ता यस मन्त्रालयको स्वीकृत बजेट उपशीर्षकबाट नियमानुसार भुक्तानी पाउने गरी यो कार्यालय आदेश जारी गरिएको छ। काज सम्पन्न भएपछि ३ दिनभित्र प्रतिवेदन पेश गर्नुपर्नेछ।`,
    drafter: {
      name: 'कृष्णप्रसाद सापकोटा',
      designation: 'उपसचिव',
      dateBs: '२०८१/०८/०१',
    },
    approver: {
      name: 'हरिप्रसाद दाहाल',
      designation: 'सहसचिव (प्रशासन)',
      dateBs: '२०८१/०८/०१',
      decisionStatus: 'APPROVED',
    },
    carbonCopies: [
      'श्री रमेश शर्मा, शाखा अधिकृत - जानकारी तथा कार्यार्थ।',
      'लेखा शाखा, मन्त्रालय - नियमानुसार भ्रमण भत्ता भुक्तानीका लागि।',
      'स्थानीय तह समन्वय शाखा - अभिलेखका लागि।',
    ],
    createdAt: '2026-03-02T11:00:00Z',
    updatedAt: '2026-03-02T11:00:00Z',
  },
  {
    id: 'draft-003',
    docType: 'letter',
    title: 'कर्मचारी अभिलेख तथा सिटरोल रुजु सम्बन्धी आधिकारिक पत्र',
    subject: 'कर्मचारी व्यक्तिगत विवरण (सिटरोल) तथा प्रगति प्रतिवेदन उपलब्ध गराउने सम्बन्धमा।',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'कर्मचारी अभिलेख तथा योजना महाशाखा',
    officeName: 'सिंहदरबार, काठमाडौँ',
    branchName: 'कर्मचारी अभिलेख शाखा',
    dispatchNo: '१०२४',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०८/१२',
    urgency: 'साधारण',
    recipient: 'श्री सबै विभागीय प्रमुख/कार्यालय प्रमुखज्यूहरू,',
    recipientDesignation: 'कार्यालय प्रमुख',
    recipientOffice: 'मातहतका सम्पूर्ण निकाय तथा कार्यालयहरू।',
    legalBasis: 'निजामती सेवा ऐन, २०४९ को दफा ३३ तथा सुशासन ऐन, २०६४',
    content: `उपरोक्त सम्बन्धमा राष्ट्रिय किताबखाना (निजामती) को विद्युतीय अभिलेख प्रणाली (PIS) मा चालु आर्थिक वर्षभित्र ५८ वर्ष उमेर पूरा भई अनिवार्य अवकाश हुन लागेका तथा ज्येष्ठताका आधारमा पदोन्नति सूचीमा पर्ने कर्मचारीहरूको सेवा विवरण र नागरिकता रुजु गर्नुपर्ने भएकाले तपाईंको कार्यालय मातहत कार्यरत सम्पूर्ण स्थायी निजामती कर्मचारीहरूको अद्यावधिक सिटरोल तथा कार्यसम्पादन मूल्याङ्कन फारामको प्रमाणित प्रतिलिपि यही मिति २०८१ मंसिर मसान्तभित्र मन्त्रालयको पोर्टलमा प्रविष्ट गरी यस महाशाखामा पठाइदिनुहुन निर्णयानुसार सादर अनुरोध गरिन्छ।`,
    drafter: {
      name: 'रमेश शर्मा',
      designation: 'शाखा अधिकृत',
      dateBs: '२०८१/०८/१२',
    },
    approver: {
      name: 'कृष्णप्रसाद सापकोटा',
      designation: 'उपसचिव / निमित्त महाशाखा प्रमुख',
      dateBs: '२०८१/०८/१२',
      decisionStatus: 'APPROVED',
    },
    carbonCopies: [
      'राष्ट्रिय किताबखाना (निजामती), हरिहरभवन, ललितपुर।',
      'मन्त्रालयको सूचना प्रविधि शाखा - वेबसाइटमा सूचना प्रकाशनार्थ।',
    ],
    createdAt: '2026-03-03T09:30:00Z',
    updatedAt: '2026-03-03T09:30:00Z',
  },
  {
    id: 'draft-004',
    docType: 'circular',
    title: 'बजेट कार्यान्वयन तथा वित्तीय अनुशासन सम्बन्धी परिपत्र',
    subject: 'आ.व. २०८१/८२ को बजेट कार्यान्वयन, खर्च मितव्ययिता र खरिद कार्यविधि पालना सम्बन्धमा।',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'आर्थिक प्रशासन महाशाखा',
    officeName: 'सिंहदरबार, काठमाडौँ',
    dispatchNo: 'परिपत्र-०३/०८१',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०८/१५',
    urgency: 'अति जरुरी',
    recipient: 'मातहतका सम्पूर्ण विभाग, निर्देशनालय, आयोजना तथा कार्यालयहरू।',
    legalBasis: 'आर्थिक कार्यविधि तथा वित्तीय उत्तरदायित्व ऐन, २०७६ तथा सार्वजनिक खरिद ऐन, २०६३',
    content: `उपरोक्त सम्बन्धमा नेपाल सरकार, अर्थ मन्त्रालयबाट जारी भएको "बजेट कार्यान्वयन मार्गदर्शन, २०८१" तथा प्रचलित सार्वजनिक खरिद कानुनको प्रभावकारी कार्यान्वयनका लागि मातहतका सबै निकायहरूले देहाय बमोजिमका निर्देशनहरूको कडाइका साथ पालना गर्नुहुन निर्णयानुसार यो परिपत्र जारी गरिएको छ:

१. स्वीकृत वार्षिक बजेट र कार्यक्रममा नपरेका गैर-बजेटरी शीर्षकमा कुनै पनि प्रकारको आर्थिक दायित्व सिर्जना नगर्ने।
२. सवारी साधन मर्मत, इन्धन तथा कार्यालय मसलन्द खरिद गर्दा सार्वजनिक खरिद नियमावली, २०६४ को नियम ८४ र ८५ बमोजिमको प्रतिस्पर्धात्मक प्रक्रिया अनिवार्य अवलम्बन गर्ने।
३. रु. ५ लाखभन्दा बढी लागत अनुमान हुने निर्माण तथा मालसामान खरिद अनिवार्य रूपमा सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को विद्युतीय खरिद प्रणाली (e-GP II) बाट मात्र सञ्चालन गर्ने।
४. प्रत्येक महिनाको ७ गतेभित्र अघिल्लो महिनाको वित्तीय खर्च, राजस्व संकलन तथा भौतिक प्रगति विवरण मन्त्रालयको प्रगति अनुगमन पोर्टलमा अद्यावधिक गर्ने।

माथि उल्लिखित निर्देशनको अक्षरसः पालना गर्नु गराउनुहुन सबै सम्बन्धित अधिकारीहरूलाई सूचित गरिन्छ।`,
    drafter: {
      name: 'रमेश शर्मा',
      designation: 'शाखा अधिकृत',
      dateBs: '२०८१/०८/१५',
    },
    approver: {
      name: 'डा. सुरेन्द्र अधिकारी',
      designation: 'सचिव',
      dateBs: '२०८१/०८/१५',
      decisionStatus: 'APPROVED',
    },
    carbonCopies: [
      'माननीय मन्त्रीज्यूको निजी सचिवालय - जानकारीका लागि।',
      'महालेखा नियन्त्रक कार्यालय, अनामनगर।',
    ],
    createdAt: '2026-03-04T14:00:00Z',
    updatedAt: '2026-03-04T14:00:00Z',
  },
  {
    id: 'draft-005',
    docType: 'minute',
    title: 'सुशासन तथा सेवा प्रवाह सुधार समिति बैठकको निर्णय पुस्तिका',
    subject: 'सार्वजनिक सेवा प्रवाहलाई नागरिकमैत्री र प्रविधिमैत्री बनाउने सम्बन्धी निर्णयहरू',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'सुशासन तथा सेवा प्रवाह सुधार समिति',
    officeName: 'सिंहदरबार, काठमाडौँ',
    dispatchNo: 'बैठक-०२/०८१',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०८/१८',
    urgency: 'साधारण',
    legalBasis: 'सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४ को दफा १९ र २५',
    content: `मिति २०८१ साल मंसिर १८ गते मंगलबारका दिन यस मन्त्रालयका सचिव डा. सुरेन्द्र अधिकारीज्यूको अध्यक्षतामा मन्त्रालयको सभाहलमा बसेको "सुशासन तथा सेवा प्रवाह सुधार समिति" को बैठकमा देहायका महानुभावहरूको उपस्थितिमा कार्यसूची बमोजिमका प्रस्तावहरूमाथि छलफल भई देहाय बमोजिमका निर्णयहरू सर्वसम्मत रूपमा पारित गरियो:

उपस्थित महानुभावहरू:
१. डा. सुरेन्द्र अधिकारी, सचिव - अध्यक्ष
२. श्री हरिप्रसाद दाहाल, सहसचिव (प्रशासन) - सदस्य
३. श्री कृष्णप्रसाद सापकोटा, उपसचिव (योजना) - सदस्य
४. श्रीमती मन्जु अधिकारी, लेखा अधिकृत - सदस्य
५. श्री रमेश शर्मा, शाखा अधिकृत - सदस्य-सचिव

कार्यसूची (Agendas):
प्रस्ताव नं. १: डिजिटल नागरिक बडापत्र तथा अनलाइन टोकन प्रणाली व्यवस्थापन सम्बन्धमा।
प्रस्ताव नं. २: गुनासो पेटिका नियमित खोल्ने र ७२ घण्टाभित्र फर्स्यौट गर्ने मापदण्ड सम्बन्धमा।

गरिएका निर्णयहरू:
निर्णय नं. १:
प्रस्ताव नं. १ माथि विस्तृत छलफल हुँदा, सेवाग्राहीको सहजताका लागि मन्त्रालयको मुख्य प्रवेशद्वारमा आगामी १५ दिनभित्र ५५ इन्चको डिजिटल नागरिक बडापत्र डिस्प्ले जडान गर्ने र सेवा शुल्क भुक्तानीमा QR कोड तथा विद्युतीय माध्यम लागू गर्ने निर्णय सर्वसम्मत गरियो।

निर्णय नं. २:
प्रस्ताव नं. २ माथि छलफल हुँदा, सुशासन ऐन, २०६४ को दफा ३१ बमोजिम प्रत्येक हप्ताको शुक्रबार अपरान्ह ३:०० बजे गुनासो सुन्ने अधिकारी र शाखा प्रमुखको उपस्थितिमा गुनासो पेटिका खोल्ने र प्राप्त उजुरीको ७२ घण्टाभित्र छानबिन गरी फर्स्यौट गर्ने निर्णय गरियो।`,
    drafter: {
      name: 'रमेश शर्मा',
      designation: 'शाखा अधिकृत तथा सदस्य-सचिव',
      dateBs: '२०८१/०८/१८',
    },
    approver: {
      name: 'डा. सुरेन्द्र अधिकारी',
      designation: 'सचिव तथा समितिका अध्यक्ष',
      dateBs: '२०८१/०८/१८',
      decisionStatus: 'APPROVED',
    },
    meetingDetails: {
      meetingNo: '०२/०८१-८२',
      meetingDateBs: '२०८१/०८/१८',
      meetingTime: 'दिनको २:०० बजे',
      meetingVenue: 'मन्त्रालयको मुख्य सभाहल',
      chairperson: 'डा. सुरेन्द्र अधिकारी (सचिव)',
      attendees: [
        'डा. सुरेन्द्र अधिकारी, सचिव',
        'श्री हरिप्रसाद दाहाल, सहसचिव',
        'श्री कृष्णप्रसाद सापकोटा, उपसचिव',
        'श्रीमती मन्जु अधिकारी, लेखा अधिकृत',
        'श्री रमेश शर्मा, शाखा अधिकृत',
      ],
      agendas: [
        'प्रस्ताव नं. १: डिजिटल नागरिक बडापत्र तथा अनलाइन टोकन प्रणाली व्यवस्थापन सम्बन्धमा।',
        'प्रस्ताव नं. २: गुनासो पेटिका नियमित खोल्ने र ७२ घण्टाभित्र फर्स्यौट गर्ने मापदण्ड सम्बन्धमा।',
      ],
      decisions: [
        {
          agendaNo: 'प्रस्ताव नं. १',
          agendaTitle: 'डिजिटल नागरिक बडापत्र तथा अनलाइन टोकन प्रणाली',
          decisionText: 'मन्त्रालयको मुख्य प्रवेशद्वारमा १५ दिनभित्र ५५ इन्चको डिजिटल नागरिक बडापत्र डिस्प्ले जडान गर्ने र सेवा शुल्क भुक्तानीमा QR कोड तथा विद्युतीय माध्यम लागू गर्ने निर्णय सर्वसम्मत गरियो।',
        },
        {
          agendaNo: 'प्रस्ताव नं. २',
          agendaTitle: 'गुनासो व्यवस्थापन र फर्स्यौट मापदण्ड',
          decisionText: 'प्रत्येक शुक्रबार अपरान्ह ३:०० बजे गुनासो सुन्ने अधिकारीको उपस्थितिमा उजुरी पेटिका खोल्ने र ७२ घण्टाभित्र फर्स्यौट गर्ने निर्णय गरियो।',
        },
      ],
    },
    createdAt: '2026-03-05T15:30:00Z',
    updatedAt: '2026-03-05T15:30:00Z',
  },
  {
    id: 'draft-006',
    docType: 'report',
    title: 'वार्षिक आन्तरिक प्रशासन तथा जिन्सी निरीक्षण प्रतिवेदन, २०८१',
    subject: 'मन्त्रालय मातहतका निकायहरूको भौतिक सम्पत्ति तथा जिन्सी निरीक्षण प्रतिवेदन',
    governmentTier: 'नेपाल सरकार',
    ministryOrEntity: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    departmentOrDivision: 'आन्तरिक प्रशासन तथा सम्पत्ति व्यवस्थापन शाखा',
    officeName: 'सिंहदरबार, काठमाडौँ',
    dispatchNo: 'प्रतिवेदन-०१/०८१',
    letterNo: '०८१/८२',
    dateBs: '२०८१/०८/२२',
    urgency: 'साधारण',
    legalBasis: 'आर्थिक कार्यविधि तथा वित्तीय उत्तरदायित्व ऐन, २०७६ तथा नियमावली, २०७७ को नियम ९१',
    content: `१. पृष्ठभूमि:
आर्थिक कार्यविधि तथा वित्तीय उत्तरदायित्व ऐन, २०७६ तथा सार्वजनिक सम्पत्ति व्यवस्थापन निर्देशिका बमोजिम यस मन्त्रालय तथा अन्तर्गतका शाखाहरूमा रहेका चालु तथा अचल जिन्सी मालसामान, सवारी साधन, आइटी उपकरण तथा फर्निचरको भौतिक अवस्था यकिन गर्न मिति २०८१/०७/१५ को निर्णयानुसार गठित निरीक्षण समितिले स्थलगत निरीक्षण सम्पन्न गरी यो प्रतिवेदन पेश गरेको छ।

२. निरीक्षणको उद्देश्य:
- कार्यालयका मौज्दात सामानहरूको खाता (PAMS) र स्थलगत भौतिक अवस्था भिडान गर्ने।
- मर्मत गरी प्रयोगमा आउन सक्ने र पूर्ण रूपमा बिग्रेका (निष्प्रयोजन) सामानहरूको यथार्थ पहिचान गर्ने।
- सरकारी सम्पत्तिको अभिलेख अद्यावधिक गरी संरक्षण सुनिश्चित गर्ने।

३. प्रमुख निष्कर्षहरू:
- कम्प्युटर, ल्यापटप, प्रिन्टर तथा युपिएस गरी कुल २८ थान उपकरणहरू प्रविधिको पुरानोपनका कारण मर्मत हुन नसक्ने अवस्थामा रहेका छन्।
- मन्त्रालयका ४ वटा हलुका सवारी साधनमध्ये १ वटा गाडी लामो समयदेखि थन्किएर बसेको पाइएको छ।
- मसलन्द र स्टेशनरी खाता नियमित अद्यावधिक गरिएको र मौज्दात सन्तोषजनक रहेको छ।

४. सुधारका लागि सिफारिसहरू:
- प्रयोगविहीन तथा मर्मत हुन नसक्ने २८ थान कम्प्युटर उपकरणहरूलाई सार्वजनिक खरिद ऐन, २०६३ को दफा ५५ बमोजिम लिलाम बिक्री प्रक्रियामा लैजाने।
- सम्पत्ति व्यवस्थापन सफ्टवेयर (PAMS) मा सबै सामानहरूको बारकोड प्रणाली अनिवार्य लागू गर्ने।
- आगामी आर्थिक वर्षको वार्षिक खरिद योजना तर्जुमा गर्दा मौज्दातलाई आधार मानी माग संकलन गर्ने।

५. निष्कर्ष:
कार्यालयको वित्तीय सुशासन र भौतिक सम्पत्तिको पारदर्शी उपयोगका लागि माथि उल्लिखित सिफारिसहरू शीघ्र कार्यान्वयन गर्न उपयुक्त देखिन्छ।`,
    drafter: {
      name: 'रमेश शर्मा',
      designation: 'शाखा अधिकृत तथा संयोजक',
      dateBs: '२०८१/०८/२२',
    },
    approver: {
      name: 'हरिप्रसाद दाहाल',
      designation: 'सहसचिव / महाशाखा प्रमुख',
      dateBs: '२०८१/०८/२४',
      decisionStatus: 'APPROVED',
      decisionNote: 'प्रतिवेदनमा उल्लिखित सिफारिसहरू कार्यान्वयनका लागि सम्बन्धित खरिद तथा लिलाम समितिलाई निर्देशन दिइएको छ।',
    },
    reportDetails: {
      reportTitle: 'वार्षिक आन्तरिक प्रशासन तथा जिन्सी निरीक्षण प्रतिवेदन, २०८१',
      fiscalYear: '२०८०/८१',
      background: 'आर्थिक कार्यविधि तथा वित्तीय उत्तरदायित्व ऐन, २०७६ तथा नियमावली, २०७७ को नियम ९१ बमोजिम कार्यालयमा रहेका चालु तथा अचल जिन्सी मालसामानको यथार्थ स्थिति पत्ता लगाई प्रतिवेदन पेश गर्न यो समिति गठन गरिएको हो।',
      objectives: [
        '१. जिन्सी खाता र भौतिक मालसामानको यथार्थ मौज्दात भिडान गर्ने।',
        '२. मर्मत हुन नसक्ने र लिलाम गर्नुपर्ने सामानहरूको पहिचान गर्ने।',
        '३. सरकारी सम्पत्तिको अभिलेख अद्यावधिक गरी संरक्षण सुनिश्चित गर्ने।',
      ],
      keyFindings: [
        '१. कम्प्युटर, ल्यापटप र प्रिन्टर गरी कुल २८ वटा उपकरणहरू मर्मत हुन नसकी निष्प्रयोजन अवस्थामा रहेको।',
        '२. अधिकांश सवारी साधनको लगबुक नियमित अद्यावधिक गरिएको पाइएको।',
        '३. मसलन्द र स्टेशनरी मौज्दात सन्तोषजनक देखिएको।',
      ],
      recommendations: [
        '१. निष्प्रयोजन भएका उपकरणहरूलाई प्रचलित खरिद ऐन अनुसार तत्काल लिलाम बिक्री प्रक्रियामा लैजाने।',
        '२. जिन्सी अभिलेखलाई सफ्टवेयर प्रणाली (PAMS) मा तत्काल प्रविष्ट गर्ने।',
        '३. आगामी खरिद योजना तर्जुमा गर्दा मौज्दातलाई आधार बनाउने।',
      ],
      conclusion: 'कार्यालयको भौतिक सम्पत्ति संरक्षण र सदुपयोगका लागि सिफारिसहरूको शीघ्र कार्यान्वयन गर्न आवश्यक देखिन्छ।',
    },
    createdAt: '2026-03-06T10:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
  },
];

const INITIAL_LEARNING_MATERIALS: LearningMaterialItem[] = [
  {
    id: 'learn-001',
    titleNe: 'सरकारी निर्णय प्रक्रिया र टिप्पणी लेखनको मानक मार्गनिर्देशन',
    category: 'प्रशासनिक कानुन',
    author: 'डा. सुरेन्द्र अधिकारी (प्रशासक)',
    summaryNe: 'नेपाल सरकारको कार्यसञ्चालन नियमावली अनुसार चार-बुँदे टिप्पणी लेखन, कानुनी आधार परीक्षण र निर्णयार्थ पेश गर्ने शिष्ट प्रशासनिक ढाँचा।',
    contentNe: `१. टिप्पणीको परिभाषा र औचित्य:
टिप्पणी कुनै विषयमा निर्णय प्राप्त गर्नका लागि आवश्यक तथ्य, कानुनी व्यवस्था, पूर्व नजिर र औचित्य विश्लेषण गरी तहगत रूपमा निर्णयकर्ता समक्ष पेश गरिने प्रशासनिक दस्तावेज हो।

२. चार-बुँदे संरचना:
- १. तथ्य र पृष्ठभूमि (प्रस्तुत विषयमा...)
- २. प्रचलित कानुनी तथा नीतिगत आधार (ऐन वा नियमावलीको दफा)
- ३. विश्लेषण र औचित्य
- ४. निर्णयार्थ पेश व्यहोरा (अतः निर्णयार्थ श्रीमान् समक्ष सादर पेश गर्दछु।)

३. सावधानीहरू:
अनावश्यक लामो भूमिका नबाँध्ने, कानुनी दफा स्पष्ट खुलाउने, र व्यक्तिगत पूर्वाग्रह नराखी वस्तुनिष्ठ राय लेख्ने।`,
    readTimeMinutes: 5,
    officialActRef: 'सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४',
    likesCount: 42,
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'learn-002',
    titleNe: 'सार्वजनिक खरिद ऐन, २०६३ बमोजिम बोलपत्र मूल्याङ्कन विधि',
    category: 'सार्वजनिक खरिद',
    author: 'खरिद विज्ञ समूह',
    summaryNe: 'सार्वजनिक निकायले सिलबन्दी बोलपत्र वा दरभाउपत्रको प्राविधिक तथा आर्थिक मूल्याङ्कन गर्दा पालना गर्नुपर्ने न्यूनतम सारभूत प्रभावग्राही मापदण्ड।',
    contentNe: `१. बोलपत्र खोल्ने प्रक्रिया (ऐनको दफा १९):
तोकिएको म्यादभित्र दर्ता भएका बोलपत्रहरू सूचनामा उल्लेख भएको समय र स्थानमा बोलपत्रदाता वा निजका प्रतिनिधिको उपस्थितिमा खोल्नुपर्छ।

२. परीक्षण र प्रारम्भिक छानबिन:
- जमानत (Bid Security) को रकम र म्याद यकिन गर्ने।
- आवश्यक इजाजतपत्र, कर चुक्ता प्रमाणपत्र र कम्पनी दर्ता प्रमाणपत्र रुजु गर्ने।

३. न्यूनतम मूल्याङ्कन गरिएको सारभूत रूपमा प्रभावग्राही बोलपत्र:
प्राविधिक रूपमा योग्य ठहरिएका बोलपत्रहरूमध्ये सबैभन्दा कम कबोल गर्ने बोलपत्रदातालाई सम्झौताका लागि छनोट गर्नुपर्छ।`,
    readTimeMinutes: 7,
    officialActRef: 'सार्वजनिक खरिद ऐन, २०६३ को दफा २५ र ३१',
    likesCount: 38,
    createdAt: '2026-02-20T11:30:00Z',
  },
  {
    id: 'learn-003',
    titleNe: 'सुशासन ऐन, २०६४ र नागरिक बडापत्रको प्रभावकारी कार्यान्वयन',
    category: 'सुशासन तथा सेवा',
    author: 'प्रशासन सुधार महाशाखा',
    summaryNe: 'प्रत्येक सरकारी कार्यालयले सेवाग्राहीलाई सेवा, लाग्ने समय, दस्तुर र जिम्मेवार अधिकृतको विवरणसहित बडापत्र राख्नुपर्ने अनिवार्य व्यवस्था।',
    contentNe: `सुशासन ऐनको दफा २५ बमोजिम सर्वसाधारणलाई सेवा प्रदान गर्ने वा जनसम्पर्क हुने प्रत्येक सरकारी कार्यालयले कार्यालय परिसरमा सबैले देख्ने ठाउँमा नागरिक बडापत्र (Citizen Charter) राख्नुपर्छ।

बडापत्रमा हुनुपर्ने विवरण:
१. सेवाको नाम र प्रकृति
२. सेवा पाउन पूरा गर्नुपर्ने कार्यविधि वा कागजात
३. सेवा प्राप्त गर्न लाग्ने समयसीमा
४. सेवा प्रदान गर्ने जिम्मेवार अधिकृत र निजको कोठा नं.
५. सेवा शुल्क वा दस्तुर लाग्ने भए सोको विवरण
६. गुनासो सुन्ने अधिकारीको नाम र सम्पर्क`,
    readTimeMinutes: 4,
    officialActRef: 'सुशासन ऐन, २०६४ को दफा २५ र ३१',
    likesCount: 29,
    createdAt: '2026-03-01T14:00:00Z',
  },
];

const INITIAL_QUIZ_QUESTIONS: QuizQuestionItem[] = [
  {
    id: 'quiz-001',
    topic: 'निजामती सेवा ऐन, २०४९',
    questionNe: 'निजामती सेवा ऐन, २०४९ अनुसार खुला प्रतियोगिताद्वारा पूर्ति हुने पदहरूमध्ये कति प्रतिशत पद समावेशी समूहका लागि छुट्याइएको छ?',
    optionsNe: ['४० प्रतिशत', '४५ प्रतिशत', '४९ प्रतिशत', '५० प्रतिशत'],
    correctOptionIndex: 1,
    explanationNe: 'ऐनको दफा ७ को उपदफा (७) अनुसार खुला प्रतियोगिताबाट पूर्ति हुने पदमध्ये ४५ प्रतिशत पदलाई शतप्रतिशत मानी विभिन्न समावेशी समूहमा विभाजन गरिएको छ।',
    actReference: 'निजामती सेवा ऐन, २०४९ को दफा ७(७)',
  },
  {
    id: 'quiz-002',
    topic: 'निजामती सेवा ऐन, २०४९',
    questionNe: 'निजामती कर्मचारीले अनिवार्य अवकाश पाउने उमेर हद कति वर्ष तोकिएको छ?',
    optionsNe: ['५६ वर्ष', '५८ वर्ष', '६० वर्ष', '६२ वर्ष'],
    correctOptionIndex: 1,
    explanationNe: 'दफा ३३ बमोजिम निजामती कर्मचारीले ५८ वर्ष उमेर पूरा भएपछि निजामती सेवाबाट अनिवार्य अवकाश पाउनेछ।',
    actReference: 'निजामती सेवा ऐन, २०४९ को दफा ३३',
  },
  {
    id: 'quiz-003',
    topic: 'सार्वजनिक खरिद ऐन, २०६३',
    questionNe: 'सार्वजनिक निकायले प्रचलित ऐन बमोजिम सोझै खरिद (Direct Purchase) गर्न पाउने अधिकतम सीमा कति हो?',
    optionsNe: ['रु. ३ लाखसम्म', 'रु. ५ लाखसम्म', 'रु. १० लाखसम्म', 'रु. २० लाखसम्म'],
    correctOptionIndex: 1,
    explanationNe: 'सार्वजनिक खरिद ऐन, २०६३ को दफा ४१ तथा नियमावलीको नियम ८५ बमोजिम रु. ५ लाखसम्मको मालसामान वा परामर्श सेवा सोझै खरिद गर्न सकिन्छ।',
    actReference: 'सार्वजनिक खरिद ऐन, २०६३ को दफा ४१(१)(क)',
  },
  {
    id: 'quiz-004',
    topic: 'निजामती सेवा नियमावली, २०५०',
    questionNe: 'निजामती कर्मचारीले सेवा अवधिभर बढीमा कति दिनसम्म घर बिदा सञ्चित गर्न पाउँछ?',
    optionsNe: ['१२० दिन', '१५० दिन', '१८० दिन', '२१० दिन'],
    correctOptionIndex: 2,
    explanationNe: 'निजामती सेवा नियमावली, २०५० को नियम ५८ अनुसार कर्मचारीले बढीमा १८० दिनसम्म घर बिदा सञ्चित गर्न पाउनेछ र अवकाश हुँदा सो बापत एकमुष्ट भुक्तानी पाउनेछ।',
    actReference: 'निजामती सेवा नियमावली, २०५० को नियम ५८(२)',
  },
  {
    id: 'quiz-005',
    topic: 'सुशासन ऐन, २०६४',
    questionNe: 'सूचनाको हक सम्बन्धी ऐन, २०६४ अनुसार सूचना अधिकारीले माग भएको सूचना साधारणतया कति दिनभित्र उपलब्ध गराउनुपर्छ?',
    optionsNe: ['७ दिनभित्र', '१० दिनभित्र', '१५ दिनभित्र', '३० दिनभित्र'],
    correctOptionIndex: 2,
    explanationNe: 'सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ७ बमोजिम सूचना अधिकारीले निवेदन प्राप्त भएको मितिले १५ दिनभित्र सूचना उपलब्ध गराउनुपर्छ।',
    actReference: 'सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ७',
  },
];

const INITIAL_MEETINGS: MeetingRecordItem[] = [
  {
    id: 'meet-001',
    titleNe: 'सार्वजनिक सेवा प्रवाह तथा त्रैमासिक प्रगति समीक्षा बैठक',
    meetingDateBs: '२०८१/०८/२०',
    meetingTime: 'दिनको २:०० बजे',
    venue: 'मन्त्रालयको मुख्य सभाहल',
    chairperson: 'डा. सुरेन्द्र अधिकारी (सचिव)',
    attendees: ['डा. सुरेन्द्र अधिकारी, सचिव', 'श्री हरिप्रसाद दाहाल, सहसचिव', 'श्री कृष्णप्रसाद सापकोटा, उपसचिव', 'श्री रमेश शर्मा, शाखा अधिकृत'],
    agendas: ['१. प्रथम त्रैमासिक वित्तीय तथा भौतिक प्रगति समीक्षा', '२. विद्युतीय नागरिक बडापत्र स्थापना सम्बन्धमा'],
    decisions: ['प्रस्ताव नं. १ माथि छलफल गरी खर्च प्रतिशत बढाउन निर्देशन दिइयो।', 'प्रस्ताव नं. २ अनुसार आगामी १५ दिनभित्र बडापत्र जडान गर्ने निर्णय गरियो।'],
    status: 'CONCLUDED',
    createdBy: 'user-officer-002',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'meet-002',
    titleNe: 'आन्तरिक प्रशासन तथा कर्मचारी व्यवस्थापन समन्वय बैठक',
    meetingDateBs: '२०८१/०८/२५',
    meetingTime: 'बिहान ११:०० बजे',
    venue: 'प्रशासन महाशाखा कक्ष',
    chairperson: 'श्री हरिप्रसाद दाहाल (सहसचिव)',
    attendees: ['श्री हरिप्रसाद दाहाल, सहसचिव', 'श्री रमेश शर्मा, शाखा अधिकृत', 'श्रीमती मन्जु अधिकारी, लेखा अधिकृत'],
    agendas: ['१. कर्मचारी काज खटन र तालिम सहभागिता', '२. वर्षान्त जिन्सी निरीक्षण कार्ययोजना'],
    decisions: ['काज खटन मापदण्ड अनुसार प्राथमिकता निर्धारण गर्ने।'],
    status: 'SCHEDULED',
    createdBy: 'user-officer-002',
    createdAt: '2026-03-02T10:30:00Z',
  },
];

const INITIAL_DECISIONS: DecisionTrackerItem[] = [
  {
    id: 'dec-001',
    decisionNo: 'निर्णय नं. १४/०८१',
    titleNe: 'विद्युतीय खरिद प्रणाली (e-GP II) शतप्रतिशत लागू गर्ने',
    issuingBody: 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
    decisionDateBs: '२०८१/०७/१५',
    deadlineBs: '२०८१/०८/३०',
    responsibleOfficer: 'रमेश शर्मा (शाखा अधिकृत)',
    department: 'योजना तथा खरिद शाखा',
    status: 'IN_PROGRESS',
    progressPercent: 75,
    remarks: 'सबै मातहत निकायहरूलाई तालिम सम्पन्न भई e-GP मार्फत टेन्डर आह्वान सुरु गरिएको।',
    updatedAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 'dec-002',
    decisionNo: 'निर्णय नं. १८/०८१',
    titleNe: 'कर्मचारी सिटरोल तथा व्यक्तिगत विवरण अनलाइन प्रमाणीकरण',
    issuingBody: 'राष्ट्रिय किताबखाना (निजामती)',
    decisionDateBs: '२०८१/०६/०१',
    deadlineBs: '२०८१/०८/१५',
    responsibleOfficer: 'कृष्णप्रसाद सापकोटा (उपसचिव)',
    department: 'कर्मचारी प्रशासन महाशाखा',
    status: 'COMPLETED',
    progressPercent: 100,
    remarks: 'सबै स्थायी कर्मचारीहरूको PIS विवरण अद्यावधिक सम्पन्न।',
    updatedAt: '2026-03-04T16:00:00Z',
  },
  {
    id: 'dec-003',
    decisionNo: 'निर्णय नं. २२/०८१',
    titleNe: 'कार्यालयका निष्प्रयोजन आइटी उपकरणहरूको लिलाम बिक्री',
    issuingBody: 'सम्पत्ति व्यवस्थापन समिति',
    decisionDateBs: '२०८१/०८/०५',
    deadlineBs: '२०८१/०९/१५',
    responsibleOfficer: 'रमेश शर्मा (संयोजक)',
    department: 'आन्तरिक प्रशासन शाखा',
    status: 'PENDING',
    progressPercent: 25,
    remarks: 'प्राविधिक मूल्याङ्कन समितिबाट मुचुल्का तयार भइरहेको।',
    updatedAt: '2026-03-06T09:30:00Z',
  },
];

const INITIAL_FILES: FileTrackerItem[] = [
  {
    id: 'file-001',
    fileNo: 'फाइल नं. प-२१४/०८१',
    fileSubjectNe: 'सवारी साधन मर्मत तथा इन्धन खर्च भुक्तानी टिप्पणी',
    dartaNo: 'दर्ता नं. १०५२',
    chalaniNo: 'चलानी नं. ४१६',
    originatingOffice: 'आन्तरिक प्रशासन शाखा',
    currentDeskBranch: 'लेखा तथा आर्थिक प्रशासन शाखा',
    assignedOfficer: 'मन्जु अधिकारी (लेखा अधिकृत)',
    status: 'UNDER_REVIEW',
    lastActionDateBs: '२०८१/०८/२२',
    urgency: 'URGENT',
    notes: 'बिल भरपाई रुजु भई चेक भुक्तानी प्रक्रियामा।',
  },
  {
    id: 'file-002',
    fileNo: 'फाइल नं. क-०८८/०८१',
    fileSubjectNe: 'कर्मचारी अध्ययन बिदा तथा छात्रवृत्ति सिफारिस',
    dartaNo: 'दर्ता नं. ९४५',
    originatingOffice: 'कर्मचारी प्रशासन महाशाखा',
    currentDeskBranch: 'सचिव सचिवालय',
    assignedOfficer: 'डा. सुरेन्द्र अधिकारी (सचिव)',
    status: 'APPROVED',
    lastActionDateBs: '२०८१/०८/२०',
    urgency: 'NORMAL',
    notes: 'सचिवज्यूबाट निर्णयार्थ स्वीकृत भई पत्र तयार।',
  },
  {
    id: 'file-003',
    fileNo: 'फाइल नं. ख-१२/०८१',
    fileSubjectNe: 'वार्षिक खरिद योजना स्वीकृति सम्बन्धी मूल टिप्पणी',
    dartaNo: 'दर्ता नं. ८०२',
    chalaniNo: 'चलानी नं. ५०८',
    originatingOffice: 'योजना महाशाखा',
    currentDeskBranch: 'अभिलेख शाखा',
    assignedOfficer: 'रमेश शर्मा (शाखा अधिकृत)',
    status: 'DISPATCHED',
    lastActionDateBs: '२०८१/०८/१८',
    urgency: 'TOP_PRIORITY',
    notes: 'सबै सम्बन्धित शाखाहरूमा बोधार्थ सहित पठाइसकिएको।',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    itemCode: 'PAMS-IT-001',
    itemNameNe: 'डेल ल्यापटप कोर i7 (Dell Latitude 5430)',
    category: 'IT_EQUIPMENT',
    quantity: 12,
    unit: 'थान',
    unitPrice: 125000,
    totalValue: 1500000,
    condition: 'WORKING',
    assignedRoomOrPerson: 'योजना तथा अनुगमन महाशाखा',
    lastInspectedBs: '२०८१/०७/१५',
    pamsLedgerPageNo: 'खाता पाना नं. २४',
  },
  {
    id: 'inv-002',
    itemCode: 'PAMS-VH-002',
    itemNameNe: 'महिन्द्रा स्कोर्पियो एस ११ हलुका सवारी',
    category: 'VEHICLE',
    quantity: 2,
    unit: 'थान',
    unitPrice: 6500000,
    totalValue: 13000000,
    condition: 'WORKING',
    assignedRoomOrPerson: 'मन्त्रालय पुल सवारी (सवारी चालक दल)',
    lastInspectedBs: '२०८१/०८/०१',
    pamsLedgerPageNo: 'खाता पाना नं. ०५',
  },
  {
    id: 'inv-003',
    itemCode: 'PAMS-FN-003',
    itemNameNe: 'कार्यकारी अफिस टेबल तथा रिभोल्भिङ कुर्सी',
    category: 'FURNITURE',
    quantity: 25,
    unit: 'सेट',
    unitPrice: 35000,
    totalValue: 875000,
    condition: 'WORKING',
    assignedRoomOrPerson: 'विभिन्न प्रशासन शाखाहरू',
    lastInspectedBs: '२०८१/०६/२०',
    pamsLedgerPageNo: 'खाता पाना नं. ४२',
  },
  {
    id: 'inv-004',
    itemCode: 'PAMS-IT-004',
    itemNameNe: 'एचपी लेजरजेट मल्टिफंक्सन प्रिन्टर',
    category: 'IT_EQUIPMENT',
    quantity: 8,
    unit: 'थान',
    unitPrice: 42000,
    totalValue: 336000,
    condition: 'REPAIRABLE',
    assignedRoomOrPerson: 'दर्ता चलानी तथा आन्तरिक प्रशासन',
    lastInspectedBs: '२०८१/०८/०५',
    pamsLedgerPageNo: 'खाता पाना नं. ३१',
  },
];

const INITIAL_BUDGET: BudgetItem[] = [
  {
    id: 'bud-001',
    budgetSubhead: '२११११',
    titleNe: 'कर्मचारी पारिश्रमिक तथा तलब भत्ता',
    allocatedBudget: 45000000,
    expenditure: 21500000,
    remainingBalance: 23500000,
    fiscalYear: '2081/82',
    transferPlanningNotes: 'नियमित तलब भुक्तानी सन्तोषजनक।',
    progressPercent: 47.7,
  },
  {
    id: 'bud-002',
    budgetSubhead: '२२२१२',
    titleNe: 'सवारी साधन मर्मत तथा इन्धन खर्च',
    allocatedBudget: 3500000,
    expenditure: 1850000,
    remainingBalance: 1650000,
    fiscalYear: '2081/82',
    transferPlanningNotes: 'दोस्रो त्रैमासिकमा थप ५ लाख रकमान्तर माग हुन सक्ने।',
    progressPercent: 52.8,
  },
  {
    id: 'bud-003',
    budgetSubhead: '२२३११',
    titleNe: 'कार्यालय मसलन्द तथा स्टेशनरी सामग्री',
    allocatedBudget: 2800000,
    expenditure: 1200000,
    remainingBalance: 1600000,
    fiscalYear: '2081/82',
    transferPlanningNotes: 'वार्षिक खरिद योजना बमोजिम खर्च भइरहेको।',
    progressPercent: 42.8,
  },
  {
    id: 'bud-004',
    budgetSubhead: '२२५२२',
    titleNe: 'कार्यक्रम तथा सेवाकालीन कर्मचारी तालिम',
    allocatedBudget: 5000000,
    expenditure: 2200000,
    remainingBalance: 2800000,
    fiscalYear: '2081/82',
    transferPlanningNotes: 'स्थानीय तह सहजीकरण कार्यक्रम सम्पन्न।',
    progressPercent: 44.0,
  },
];

const INITIAL_RTI: RTIRequestItem[] = [
  {
    id: 'rti-001',
    registrationNo: 'सूचना दर्ता नं. ०५/०८१',
    applicantName: 'सन्तोष खतिवडा',
    applicantPhone: '9841002233',
    requestedInfoNe: 'चालु आर्थिक वर्ष २०८१/८२ मा मन्त्रालयबाट स्वीकृत भएका सार्वजनिक खरिद सम्झौता तथा परामर्श सेवाको विस्तृत लागत विवरण।',
    requestedDateBs: '२०८१/०८/०५',
    deadlineDateBs: '२०८१/०८/२०',
    rtiOfficerName: 'हरिप्रसाद दाहाल (सूचना अधिकारी)',
    status: 'PROVIDED',
    feeCharged: 50,
    responseDetails: 'ऐनको दफा ७ बमोजिम प्रमाणित प्रतिलिपि मिति २०८१/०८/१५ मा निवेदकलाई हस्तान्तरण गरियो।',
  },
  {
    id: 'rti-002',
    registrationNo: 'सूचना दर्ता नं. ०८/०८१',
    applicantName: 'सीता थापा',
    applicantPhone: '9851123456',
    requestedInfoNe: 'मन्त्रालय मातहतका निकायहरूमा रिक्त रहेका अधिकृत तथा सहायक स्तरका दरबन्दीको विवरण।',
    requestedDateBs: '२०८१/०८/१८',
    deadlineDateBs: '२०८१/०९/०३',
    rtiOfficerName: 'हरिप्रसाद दाहाल (सूचना अधिकारी)',
    status: 'PENDING',
    feeCharged: 0,
    responseDetails: 'कर्मचारी प्रशासन महाशाखाबाट विवरण संकलन भइरहेको।',
  },
];

const INITIAL_CALENDAR: GovCalendarEvent[] = [
  {
    id: 'cal-001',
    titleNe: 'मंसिर मसान्त: कर्मचारी कार्यसम्पादन मूल्याङ्कन (का.स.मू.) अर्धवार्षिक समीक्षा',
    dateBs: '२०८१/०८/३०',
    isPublicHoliday: false,
    eventType: 'PERFORMANCE_DEADLINE',
    descriptionNe: 'निजामती कर्मचारीले आफ्नो अर्धवार्षिक कार्यसम्पादन प्रगति सुपरीवेक्षक समक्ष पेश गर्ने समयसीमा।',
  },
  {
    id: 'cal-002',
    titleNe: 'पुस १: उधौली पर्व तथा योमरी पुन्ही (सार्वजनिक बिदा)',
    dateBs: '२०८१/०९/०१',
    isPublicHoliday: true,
    eventType: 'HOLIDAY',
    descriptionNe: 'नेपाल राजपत्रमा प्रकाशित सार्वजनिक बिदा।',
  },
  {
    id: 'cal-003',
    titleNe: 'पुस १५: दोस्रो त्रैमासिक बजेट समीक्षा तथा प्रगति प्रतिवेदन पेश',
    dateBs: '२०८१/०९/१५',
    isPublicHoliday: false,
    eventType: 'TAX_DEADLINE',
    descriptionNe: 'अर्थ मन्त्रालय र राष्ट्रिय योजना आयोगमा दोस्रो त्रैमासिक वित्तीय प्रगति पेश गर्ने म्याद।',
  },
  {
    id: 'cal-004',
    titleNe: 'भाद्र २२: निजामती सेवा दिवस (Civil Service Day)',
    dateBs: '२०८२/०५/२२',
    isPublicHoliday: true,
    eventType: 'CIVIL_SERVICE_DAY',
    descriptionNe: 'निजामती सेवा ऐन २०१३ जारी भएको दिनको सम्झनामा मनाइने राष्ट्रिय निजामती सेवा दिवस।',
  },
];

const INITIAL_TOOLKIT: DocumentToolkitItem[] = [
  {
    id: 'tool-001',
    titleNe: 'निजामती कर्मचारी कार्यसम्पादन मूल्याङ्कन फाराम (का.स.मू. अनुसूची-१)',
    formCode: 'अनुसूची-१',
    category: 'PERSONNEL',
    formatType: 'DOCX',
    downloadCount: 1420,
    descriptionNe: 'राजपत्राङ्कित तथा राजपत्र अनङ्कित कर्मचारीहरूले सुपरिवेक्षक र पुनरावलोकन समिति समक्ष पेश गर्ने आधिकारिक फाराम।',
  },
  {
    id: 'tool-002',
    titleNe: 'निजामती कर्मचारी बिदा माग तथा स्वीकृति फाराम',
    formCode: 'अनुसूची-८',
    category: 'PERSONNEL',
    formatType: 'DOCX',
    downloadCount: 2310,
    descriptionNe: 'घर, बिरामी, प्रसूति स्याहार तथा अध्ययन बिदा माग गर्दा पेश गर्नुपर्ने मानक सरकारी ढाँचा।',
  },
  {
    id: 'tool-003',
    titleNe: 'दैनिक तथा भ्रमण भत्ता (TA/DA) बिल भरपाई फाराम',
    formCode: 'अनुसूची-१२',
    category: 'FINANCE',
    formatType: 'EXCEL',
    downloadCount: 1890,
    descriptionNe: 'सरकारी काज भ्रमण सम्पन्न भएपछि लेखा शाखामा भुक्तानीका लागि पेश गरिने आधिकारिक बिल फाराम।',
  },
  {
    id: 'tool-004',
    titleNe: 'सार्वजनिक खरिद लागत अनुमान फाराम (Cost Estimation Sheet)',
    formCode: 'PPMO-EST-01',
    category: 'PROCUREMENT',
    formatType: 'EXCEL',
    downloadCount: 1140,
    descriptionNe: 'खरिद ऐनको दफा २५ बमोजिम मालसामान तथा निर्माण कार्यको आधिकारिक लागत अनुमान तयार गर्ने स्प्रेडसिट।',
  },
  {
    id: 'tool-005',
    titleNe: 'सरकारी निर्णयका लागि चार-बुँदे टिप्पणी मस्यौदा टेम्प्लेट',
    formCode: 'DOC-TIP-01',
    category: 'GENERAL_ADMIN',
    formatType: 'DOCX',
    downloadCount: 3120,
    descriptionNe: 'तहगत रूपमा निर्णयार्थ पेश गरिने आधिकारिक चार-बुँदे टिप्पणी र हस्ताक्षर ब्लक ढाँचा।',
  },
];

const INITIAL_COMMUNITY: CommunityPostItem[] = [
  {
    id: 'post-001',
    authorName: 'दीपक कार्की',
    authorRank: 'शाखा अधिकृत (स्थानीय तह)',
    titleNe: 'स्थानीय तहमा सोझै खरिद गर्दा ३ वटा कोटेशन अनिवार्य हुन्छ कि हुँदैन?',
    questionContentNe: 'सार्वजनिक खरिद नियमावली, २०६४ को नियम ८५ अनुसार रु. ५ लाखसम्म सोझै खरिद गर्दा प्यान/भ्याट दर्ता भएका कम्तीमा ३ वटा फर्मबाट दरभाउ माग गर्नुपर्ने हो कि १ वटा भए पुग्छ? साथीहरूको अभ्यास कस्तो छ?',
    category: 'सार्वजनिक खरिद',
    upvotes: 18,
    answers: [
      {
        id: 'ans-001',
        authorName: 'रमेश शर्मा',
        authorRank: 'प्रमाणित शाखा अधिकृत',
        answerText: 'सार्वजनिक खरिद नियमावलीको नियम ८५ को उपनियम (१) बमोजिम ५ लाखसम्मको खरिदमा पनि स्थायी लेखा नम्बर दर्ता भएका कम्तीमा ३ वटा सूचीकृत वा स्थानीय फर्मबाट लिखित दरभाउ माग गरी न्यूनतम मूल्याङ्कन गरिएको दरभाउदाताबाट खरिद गर्नुपर्छ। १ वटा मात्र पसलबाट किन्दा लेखापरीक्षणमा बेरुजु औंल्याइन्छ।',
        isVerifiedOfficial: true,
        createdAt: '2026-03-01T11:00:00Z',
      },
    ],
    createdAt: '2026-03-01T09:30:00Z',
  },
  {
    id: 'post-002',
    authorName: 'अनिता श्रेष्ठ',
    authorRank: 'नायब सुब्बा',
    titleNe: 'घर बिदा १८० दिनभन्दा बढी भएमा के हुन्छ?',
    questionContentNe: 'मेरो सिटरोलमा घर बिदा १९२ दिन पुगिसकेको देखिन्छ। के बढी भएको १२ दिन अवकाश हुँदा नगद पाइन्छ कि निष्क्रिय हुन्छ?',
    category: 'कर्मचारी बिदा',
    upvotes: 14,
    answers: [
      {
        id: 'ans-002',
        authorName: 'डा. सुरेन्द्र अधिकारी',
        authorRank: 'प्रशासक',
        answerText: 'निजामती सेवा नियमावली, २०५० को नियम ५८(२) अनुसार घर बिदा बढीमा १८० दिनसम्म मात्र सञ्चित हुन्छ। १८० दिनभन्दा बढी भएको बिदा स्वतः निष्क्रिय (Lapse) हुन्छ र अवकाश हुँदा बढीमा १८० दिनको मात्र रकम भुक्तानी पाइन्छ। तसर्थ बढी भएको बिदा समयमै उपभोग गर्नु बुद्धिमानी हुन्छ।',
        isVerifiedOfficial: true,
        createdAt: '2026-03-02T15:00:00Z',
      },
    ],
    createdAt: '2026-03-02T12:00:00Z',
  },
];

// In-Memory / LocalStorage helper
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to persist ${key}:`, e);
  }
}

type LegalImportRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LegalImportRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getImportText = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';

export const normalizeLegalImportPayload = (payload: unknown): {
  docData: LegalImportRecord;
  sections: LegalImportRecord[];
} => {
  if (!isRecord(payload)) {
    throw new Error('अवैध JSON ढाँचा (Invalid JSON structure)');
  }

  const sourceDoc = isRecord(payload.document) ? payload.document : payload;
  const providedTitle = getImportText(sourceDoc.title).trim();
  const providedTitleNe = getImportText(sourceDoc.titleNe).trim();
  const title = providedTitle || providedTitleNe;
  const titleNe = providedTitleNe || providedTitle;
  if (!title || !titleNe) {
    throw new Error('दस्तावेजको शीर्षक (title वा titleNe) अनिवार्य छ।');
  }

  const docData = {
    ...sourceDoc,
    title,
    titleNe,
    description: getImportText(sourceDoc.description || payload.preamble),
  };
  const sections: LegalImportRecord[] = [];

  if (Array.isArray(payload.sections)) {
    sections.push(...payload.sections.filter(isRecord));
  } else if (Array.isArray(payload.chapters)) {
    for (const chapter of payload.chapters.filter(isRecord)) {
      if (!Array.isArray(chapter.sections)) continue;
      const chapterNo = getImportText(chapter.chapter);
      const chapterTitleNe = getImportText(chapter.title);

      for (const section of chapter.sections.filter(isRecord)) {
        const sourceTitle = getImportText(section.titleNe || section.title);
        const sourceText = getImportText(section.contentNe || section.text);
        const rawSubsections = Array.isArray(section.subsections)
          ? section.subsections.filter(isRecord)
          : [];

        sections.push({
          ...section,
          chapterNo: getImportText(section.chapterNo) || chapterNo || 'परिच्छेद-१',
          chapterTitleNe: getImportText(section.chapterTitleNe) || chapterTitleNe || 'प्रारम्भिक',
          sectionNo: getImportText(section.sectionNo)
            || (getImportText(section.section_no) ? `दफा ${getImportText(section.section_no)}` : ''),
          titleNe: sourceTitle || 'दफा शीर्षक',
          contentNe: sourceText || (sourceTitle.length > 100 ? sourceTitle : ''),
          subsections: rawSubsections.map((subsection) => ({
            ...subsection,
            subsectionNo: getImportText(subsection.subsectionNo || subsection.no),
            contentNe: getImportText(subsection.contentNe || subsection.text),
          })),
        });
      }
    }
  }

  return { docData, sections };
};

// Database Operations Layer
export const db = {
  // Users
  getUsers: (): User[] => {
    const users = getStored<User[]>(STORAGE_KEYS.USERS, []);
    const actualUsers = users.filter((user) => !LEGACY_DEMO_USER_IDS.has(user.id));
    if (actualUsers.length !== users.length) saveStored(STORAGE_KEYS.USERS, actualUsers);
    return actualUsers;
  },
  getUserById: (id: string): User | undefined => db.getUsers().find((u) => u.id === id),
  getUserByEmail: (email: string): User | undefined =>
    db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User): User => {
    const users = db.getUsers();
    users.push(user);
    saveStored(STORAGE_KEYS.USERS, users);
    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'USER_REGISTER',
      entityType: 'USER',
      entityId: user.id,
      details: `नयाँ प्रयोगकर्ता दर्ता भयो: ${user.fullName} (${user.email})`,
    });
    return user;
  },
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = db.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    saveStored(STORAGE_KEYS.USERS, users);
    return users[idx];
  },

  // Profiles
  getProfiles: (): Record<string, UserProfile> => {
    const profiles = getStored<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, {});
    let removedLegacyProfile = false;
    for (const id of LEGACY_DEMO_USER_IDS) {
      if (profiles[id]) {
        delete profiles[id];
        removedLegacyProfile = true;
      }
    }
    if (removedLegacyProfile) saveStored(STORAGE_KEYS.PROFILES, profiles);
    return profiles;
  },
  getProfileByUserId: (userId: string): UserProfile | null => {
    const profiles = db.getProfiles();
    return profiles[userId] || null;
  },
  saveProfile: (profile: UserProfile): UserProfile => {
    const profiles = db.getProfiles();
    profiles[profile.userId] = profile;
    saveStored(STORAGE_KEYS.PROFILES, profiles);
    db.logAudit({
      userId: profile.userId,
      userName: profile.currentLevel,
      action: 'PROFILE_UPDATE',
      entityType: 'PROFILE',
      entityId: profile.id,
      details: `कर्मचारी व्यक्तिगत विवरण अद्यावधिक गरियो: ${profile.currentOffice}`,
    });
    return profile;
  },

  // Verifications
  getVerifications: (): EmployeeVerification[] => {
    const verifications = getStored<EmployeeVerification[]>(STORAGE_KEYS.VERIFICATIONS, []);
    const actualVerifications = verifications.filter((item) => !LEGACY_DEMO_USER_IDS.has(item.userId));
    if (actualVerifications.length !== verifications.length) {
      saveStored(STORAGE_KEYS.VERIFICATIONS, actualVerifications);
    }
    return actualVerifications;
  },
  submitVerification: (req: Omit<EmployeeVerification, 'id' | 'status' | 'createdAt'>): EmployeeVerification => {
    const verifs = db.getVerifications();
    const newVerif: EmployeeVerification = {
      ...req,
      id: `verif-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    verifs.unshift(newVerif);
    saveStored(STORAGE_KEYS.VERIFICATIONS, verifs);
    db.logAudit({
      userId: req.userId,
      userName: req.userName,
      action: 'VERIFICATION_REQUEST',
      entityType: 'EMPLOYEE_VERIFICATION',
      entityId: newVerif.id,
      details: `कर्मचारी प्रमाणीकरणको नयाँ आवेदन पेश भयो (सङ्केत नं: ${req.sanketNo})`,
    });
    return newVerif;
  },
  updateVerificationStatus: (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    rejectionReason?: string
  ): EmployeeVerification | null => {
    const verifs = db.getVerifications();
    const idx = verifs.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    verifs[idx].status = status;
    verifs[idx].reviewedBy = adminId;
    verifs[idx].reviewedAt = new Date().toISOString();
    if (rejectionReason) verifs[idx].rejectionReason = rejectionReason;
    saveStored(STORAGE_KEYS.VERIFICATIONS, verifs);

    // If approved, update user's verification state
    if (status === 'APPROVED') {
      db.updateUser(verifs[idx].userId, {
        isVerifiedEmployee: true,
        role: 'verified_employee',
      });
      const prof = db.getProfileByUserId(verifs[idx].userId);
      if (prof) {
        db.saveProfile({
          ...prof,
          isOfficialSynced: true,
          dataSourceDisclaimer: 'प्रमाणित निजामती कर्मचारी (सङ्केत नं: ' + verifs[idx].sanketNo + ')',
        });
      }
    }

    db.logAudit({
      userId: adminId,
      userName: 'प्रशासक',
      action: status === 'APPROVED' ? 'VERIFICATION_APPROVE' : 'VERIFICATION_REJECT',
      entityType: 'EMPLOYEE_VERIFICATION',
      entityId: id,
      details: `कर्मचारी आवेदन #${id} (${verifs[idx].userName}) ${status === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'} गरियो।`,
    });

    return verifs[idx];
  },

  // Legal
  getLegalDocs: (): LegalDocument[] =>
    getStored<LegalDocument[]>(STORAGE_KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCS),

  getLegalDocById: (id: string): LegalDocument | undefined =>
    db.getLegalDocs().find((d) => d.id === id),

  getLegalSections: (): LegalSection[] =>
    getStored<LegalSection[]>(STORAGE_KEYS.LEGAL_SECTIONS, INITIAL_SECTIONS),

  getLegalSectionById: (id: string): LegalSection | undefined =>
    db.getLegalSections().find((s) => s.id === id),

  saveSectionNote: (sectionId: string, noteText: string): void => {
    const sections = db.getLegalSections();
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx !== -1) {
      sections[idx].userNotes = noteText;
      saveStored(STORAGE_KEYS.LEGAL_SECTIONS, sections);
    }
  },

  importLegalDocumentJSON: (payload: unknown): { success: boolean; document?: LegalDocument; sectionsCount: number; error?: string } => {
    try {
      const { docData, sections: rawSections } = normalizeLegalImportPayload(payload);
      const docTypes: LegalDocument['docType'][] = ['ACT', 'RULE', 'DIRECTIVE', 'PROCEDURE', 'ORDER'];
      const statuses: LegalDocument['status'][] = ['ACTIVE', 'AMENDED', 'REPEALED'];
      const docType = docTypes.find((type) => type === docData.docType) || 'ACT';
      const status = statuses.find((value) => value === docData.status) || 'ACTIVE';
      const docId = getImportText(docData.id) || `law-${Date.now()}`;
      const newDoc: LegalDocument = {
        id: docId,
        title: getImportText(docData.title),
        titleNe: getImportText(docData.titleNe),
        docType,
        category: getImportText(docData.category) || 'निजामती प्रशासन तथा सेवा सर्त',
        enactmentDateBs: getImportText(docData.enactmentDateBs) || '२०८०/०१/०१',
        status,
        description: getImportText(docData.description) || 'NCSDH JSON Importer बाट आयातित कानुनी दस्तावेज।',
        officialSourceUrl: getImportText(docData.officialSourceUrl) || 'https://lawcommission.gov.np',
        versionNo: getImportText(docData.versionNo) || 'आयातित संस्करण १.०',
        ministry: getImportText(docData.ministry) || 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय',
        versions: Array.isArray(docData.versions) ? docData.versions as LegalDocument['versions'] : [
          {
            id: `ver-${Date.now()}`,
            versionName: getImportText(docData.versionNo) || 'संस्करण १.०',
            enactmentDateBs: getImportText(docData.enactmentDateBs) || '२०८०/०१/०१',
            status: 'ACTIVE',
            keyChangesNe: 'JSON Importer मार्फत सिधै डेटाबेसमा प्रविष्ट गरिएको।',
          }
        ],
      };

      const newSections: LegalSection[] = rawSections.map((sec, index) => ({
        id: getImportText(sec.id) || `sec-${docId}-${index + 1}`,
        documentId: docId,
        documentTitleNe: newDoc.titleNe,
        chapterNo: getImportText(sec.chapterNo) || 'परिच्छेद-१',
        chapterTitleNe: getImportText(sec.chapterTitleNe) || 'प्रारम्भिक',
        sectionNo: getImportText(sec.sectionNo) || `दफा ${index + 1}`,
        titleNe: getImportText(sec.titleNe) || 'दफा शीर्षक',
        contentNe: getImportText(sec.contentNe),
        simpleExplanationNe: getImportText(sec.simpleExplanationNe),
        subsections: Array.isArray(sec.subsections) ? sec.subsections as LegalSection['subsections'] : undefined,
        relatedProvisions: Array.isArray(sec.relatedProvisions) ? sec.relatedProvisions as LegalSection['relatedProvisions'] : undefined,
        amendmentHistoryNe: getImportText(sec.amendmentHistoryNe) || undefined,
        isRepealed: Boolean(sec.isRepealed),
        keywords: Array.isArray(sec.keywords)
          ? sec.keywords.filter((keyword: unknown): keyword is string => typeof keyword === 'string')
          : [newDoc.titleNe, getImportText(sec.sectionNo)],
      }));

      newDoc.sectionsCount = newSections.length;

      // Persist document
      const currentDocs = db.getLegalDocs().filter((d) => d.id !== docId);
      currentDocs.push(newDoc);
      saveStored(STORAGE_KEYS.LEGAL_DOCS, currentDocs);

      // Persist sections
      const currentSections = db.getLegalSections().filter((s) => s.documentId !== docId);
      const updatedSections = [...currentSections, ...newSections];
      saveStored(STORAGE_KEYS.LEGAL_SECTIONS, updatedSections);

      db.logAudit({
        userName: 'प्रशासक / Importer',
        action: 'LEGAL_JSON_IMPORT',
        entityType: 'LEGAL_DOCUMENT',
        entityId: docId,
        details: `नयाँ कानुन JSON Importer बाट आयात भयो: ${newDoc.titleNe} (${newSections.length} दफाहरू सहित)`,
      });

      return { success: true, document: newDoc, sectionsCount: newSections.length };
    } catch (err: any) {
      return { success: false, sectionsCount: 0, error: err?.message || 'JSON प्रशोधनमा त्रुटि' };
    }
  },

  searchLegalKnowledge: (query: string, category?: string, docType?: string, status?: string): LegalSection[] => {
    const allSections = db.getLegalSections();
    const allDocs = db.getLegalDocs();
    const docMap = new Map(allDocs.map((d) => [d.id, d]));

    const cleanQ = query.trim().toLowerCase();

    return allSections.filter((sec) => {
      const parentDoc = docMap.get(sec.documentId);
      if (category && category !== 'all' && parentDoc?.category !== category) return false;
      if (docType && docType !== 'all' && parentDoc?.docType !== docType) return false;
      if (status && status !== 'all' && parentDoc?.status !== status) return false;

      if (!cleanQ) return true;

      const inSectionTitle = sec.titleNe.toLowerCase().includes(cleanQ);
      const inContent = sec.contentNe.toLowerCase().includes(cleanQ);
      const inSectionNo = sec.sectionNo.toLowerCase().includes(cleanQ);
      const inDocTitle = sec.documentTitleNe?.toLowerCase().includes(cleanQ) || false;
      const inChapter = sec.chapterTitleNe?.toLowerCase().includes(cleanQ) || false;
      const inExpl = sec.simpleExplanationNe?.toLowerCase().includes(cleanQ) || false;
      const inKeywords = sec.keywords?.some((k) => k.toLowerCase().includes(cleanQ)) || false;
      const inSubsections = sec.subsections?.some((sub) =>
        sub.contentNe.toLowerCase().includes(cleanQ) ||
        sub.clauses?.some((c) => c.contentNe.toLowerCase().includes(cleanQ))
      ) || false;

      return (
        inSectionTitle ||
        inContent ||
        inSectionNo ||
        inDocTitle ||
        inChapter ||
        inExpl ||
        inKeywords ||
        inSubsections
      );
    });
  },

  queryRAGLegalAssistant: async (userQuestion: string): Promise<LegalQueryAnswer> => {
    const q = userQuestion.toLowerCase().trim();
    const sections = db.getLegalSections();
    const docs = db.getLegalDocs();
    const docMap = new Map(docs.map((d) => [d.id, d]));

    // Keyword matching & relevance scoring
    const scored = sections.map((sec) => {
      let score = 0;
      const doc = docMap.get(sec.documentId);

      // Specific intent boosters
      if ((q.includes('बिदा') || q.includes('घर बिदा') || q.includes('प्रसूति')) && sec.sectionNo === 'दफा ४०') score += 100;
      if ((q.includes('सरुवा') || q.includes('भौगोलिक') || q.includes('दुर्गम')) && sec.sectionNo === 'दफा १८') score += 100;
      if ((q.includes('अवकाश') || q.includes('उमेर') || q.includes('५८') || q.includes('पेन्सन')) && sec.sectionNo === 'दफा ३३') score += 100;
      if ((q.includes('सोझै खरिद') || q.includes('५ लाख') || q.includes('खरिद सीमा') || q.includes('विपद्')) && sec.sectionNo === 'दफा ४१') score += 100;
      if ((q.includes('पदपूर्ति') || q.includes('आरक्षण') || q.includes('समावेशी') || q.includes('४५%')) && sec.sectionNo === 'दफा ७') score += 100;
      if ((q.includes('बडापत्र') || q.includes('नागरिक बडापत्र') || q.includes('सुशासन')) && sec.sectionNo === 'दफा २५') score += 100;
      if ((q.includes('कासमू') || q.includes('कार्यसम्पादन मूल्याङ्कन') || q.includes('साउन')) && sec.sectionNo === 'नियम ७८') score += 100;

      // Lexical overlap
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      words.forEach((w) => {
        if (sec.titleNe.toLowerCase().includes(w)) score += 10;
        if (sec.contentNe.toLowerCase().includes(w)) score += 5;
        if (sec.simpleExplanationNe?.toLowerCase().includes(w)) score += 6;
        if (sec.keywords?.some((k) => k.toLowerCase().includes(w))) score += 8;
        if (doc?.titleNe.toLowerCase().includes(w)) score += 4;
      });

      return { section: sec, doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMatch = scored[0]?.score > 0 ? scored[0] : null;

    if (!topMatch) {
      return {
        question: userQuestion,
        actTitleNe: 'नेपाल कानुन ज्ञानकेन्द्र',
        sectionNo: 'दफा यकिन हुन नसकेको',
        sectionTitleNe: 'स्पष्ट कानुनी दफा फेला परेन',
        originalStatutoryText: 'उपलब्ध कानुनी आधार तथा अभिलेखमा तपाईंको प्रश्नसँग दुरुस्त मेल खाने स्पष्ट दफा फेला परेन।',
        plainExplanationNe: 'निजामती सेवा ऐन तथा खरिद ऐनको वर्तमान ज्ञानकोषमा यस सम्बन्धी दफा समावेश नभएको वा फरक कानुनी शब्दावली हुन सक्ने भएकाले थप विवरण खुलाएर पुनः खोजी गर्नुहोला वा आधिकारिक निकायसँग परामर्श गर्नुहोस्।',
        officialSourceUrl: 'https://lawcommission.gov.np',
        amendmentAndDateNe: 'लागू कानुन अभिलेख',
        confidence: 'MEDIUM',
      };
    }

    const { section: s, doc: d } = topMatch;

    return {
      question: userQuestion,
      actTitleNe: d?.titleNe || s.documentTitleNe || 'निजामती सेवा ऐन, २०४९',
      sectionNo: s.sectionNo,
      sectionTitleNe: s.titleNe,
      originalStatutoryText: s.contentNe,
      plainExplanationNe: s.simpleExplanationNe || 'उक्त दफाले तोकिएको प्रक्रिया र मापदण्ड पालना गर्न निर्देशित गर्दछ।',
      officialSourceUrl: d?.officialSourceUrl || 'https://lawcommission.gov.np',
      amendmentAndDateNe: `${d?.versionNo || 'संशोधित'} (लागू मिति: ${d?.enactmentDateBs || '२०५०/०२/०४'})`,
      subsectionsCount: s.subsections?.length || 0,
      relatedProvisions: s.relatedProvisions,
      confidence: topMatch.score >= 50 ? 'EXACT_STATUTORY_MATCH' : 'HIGH',
    };
  },

  // Salary Scales
  getSalaryScales: (): SalaryScale[] =>
    getStored<SalaryScale[]>(STORAGE_KEYS.SALARY_SCALES, INITIAL_SALARY_SCALES),

  // Circulars
  getCirculars: (): GovernmentCircular[] =>
    getStored<GovernmentCircular[]>(STORAGE_KEYS.CIRCULARS, INITIAL_CIRCULARS),
  addCircular: (circ: Omit<GovernmentCircular, 'id' | 'isActive'>): GovernmentCircular => {
    const circs = db.getCirculars();
    const newCirc: GovernmentCircular = {
      ...circ,
      id: `circ-${Date.now()}`,
      isActive: true,
    };
    circs.unshift(newCirc);
    saveStored(STORAGE_KEYS.CIRCULARS, circs);
    return newCirc;
  },

  // Tasks
  getTasksByUserId: (userId: string): TaskItem[] => {
    const all = getStored<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const userTasks = all.filter((task) => task.userId === userId);
    if (userTasks.length !== all.length) saveStored(STORAGE_KEYS.TASKS, userTasks);
    return userTasks;
  },
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>): TaskItem => {
    const tasks = getStored<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    saveStored(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },
  updateTaskStatus: (taskId: string, status: TaskItem['status']): void => {
    const tasks = getStored<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].status = status;
      saveStored(STORAGE_KEYS.TASKS, tasks);
    }
  },
  deleteTask: (taskId: string): void => {
    const tasks = getStored<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const updated = tasks.filter((t) => t.id !== taskId);
    saveStored(STORAGE_KEYS.TASKS, updated);
  },

  // Audit Logs
  getAuditLogs: (): AuditLogEntry[] => {
    const logs = getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const actualLogs = logs.filter((log) => !log.userId || !LEGACY_DEMO_USER_IDS.has(log.userId));
    if (actualLogs.length !== logs.length) saveStored(STORAGE_KEYS.AUDIT_LOGS, actualLogs);
    return actualLogs;
  },
  logAudit: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
    const logs = db.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    saveStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // Keep latest 100
  },

  // Government Office Drafting Studio
  getDrafts: (): GovernmentDraftItem[] =>
    getStored<GovernmentDraftItem[]>(STORAGE_KEYS.DRAFTS, INITIAL_DRAFTS),

  getDraftById: (id: string): GovernmentDraftItem | undefined => {
    const drafts = db.getDrafts();
    return drafts.find((d) => d.id === id);
  },

  saveDraft: (draft: GovernmentDraftItem): GovernmentDraftItem => {
    const drafts = db.getDrafts();
    const idx = drafts.findIndex((d) => d.id === draft.id);
    const updatedDraft: GovernmentDraftItem = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      drafts[idx] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }
    saveStored(STORAGE_KEYS.DRAFTS, drafts);
    db.logAudit({
      userName: draft.drafter?.name || 'कर्मचारी',
      action: idx !== -1 ? 'DRAFT_UPDATE' : 'DRAFT_CREATE',
      entityType: 'GOVERNMENT_DRAFT',
      entityId: draft.id,
      details: `${draft.docType} मस्यौदा "${draft.subject}" सुरक्षित गरियो।`,
    });
    return updatedDraft;
  },

  deleteDraft: (id: string): void => {
    const drafts = db.getDrafts();
    const target = drafts.find((d) => d.id === id);
    const filtered = drafts.filter((d) => d.id !== id);
    saveStored(STORAGE_KEYS.DRAFTS, filtered);
    if (target) {
      db.logAudit({
        userName: target.drafter?.name || 'कर्मचारी',
        action: 'DRAFT_DELETE',
        entityType: 'GOVERNMENT_DRAFT',
        entityId: id,
        details: `${target.docType} मस्यौदा "${target.subject}" हटाइयो।`,
      });
    }
  },

  generateLocalDraft: (
    docType: GovernmentDocumentType,
    subject: string,
    context: string,
    office: string,
    dept: string
  ): string => {
    const cleanOffice = office || 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय';
    const cleanDept = dept || 'प्रशासन महाशाखा';
    const cleanSubject = subject || 'कार्यालय काम कारबाही सम्बन्धमा';
    const cleanContext = context || 'कार्यालयको दैनिक कार्य सञ्चालन तथा प्रशासनिक कार्यसम्पादन';

    if (docType === 'tippani') {
      return `१. प्रस्तुत विषयमा ${cleanOffice}, ${cleanDept}को चालु आर्थिक वर्षको स्वीकृत कार्यक्रम अनुसार ${cleanContext}।

२. यस सम्बन्धमा प्रचलित नेपाल सरकारको कार्यसम्पादन नियमावली तथा सम्बन्धित कानुनी व्यवस्था अनुसार आवश्यक प्रक्रिया पूरा गरी निर्णयार्थ पेश गर्नुपर्ने स्पष्ट व्यवस्था रहेको छ।

३. प्रस्तुत विषयमा उल्लिखित विवरण, तथ्य र कानुनी आधारहरू परीक्षण गर्दा कानुनसम्मत एवं कार्यालयको प्रशासनिक औचित्य अनुकूल देखिएकाले आवश्यक निर्णयका लागि उपयुक्त देखिन्छ।

४. अतः माथि उल्लिखित व्यहोरा अनुसार ${cleanSubject} का लागि श्रीमान् समक्ष निर्णयार्थ सादर पेश गर्दछु।`;
    }

    if (docType === 'order') {
      return `उपरोक्त सम्बन्धमा ${cleanOffice}को कार्य सञ्चालन तथा प्रशासनिक व्यवस्थापनका लागि ${cleanContext}।

तसर्थ, प्रचलित कानुन तथा अख्तियारवालाको निर्णयानुसार देहाय बमोजिम कार्यान्वयन हुने गरी यो कार्यालय आदेश जारी गरिएको छ। सम्बन्धित सबैले यस आदेशको अक्षरसः पालना गर्नुपर्नेछ।

देहाय:
१. कार्यान्वयन समयावधि: तोकिएको मितिदेखि तत्काल लागू हुनेछ।
२. कार्य सर्तहरू: प्रचलित निजामती सेवा नियमावली अनुसार हुनेछ।`;
    }

    if (docType === 'letter') {
      return `उपरोक्त सम्बन्धमा ${cleanOffice}को च.नं. बमोजिम ${cleanContext}।

तसर्थ, सो सम्बन्धमा आवश्यक कारबाही अगाडि बढाई तोकिएको समयसीमाभित्र प्रगति विवरण यस कार्यालयमा उपलब्ध गराइदिनुहुन निर्णयानुसार सादर अनुरोध गरिन्छ।`;
    }

    if (docType === 'circular') {
      return `उपरोक्त सम्बन्धमा ${cleanOffice} मातहतका सम्पूर्ण निकायहरूमा एकरूपता, मितव्ययिता र वित्तीय अनुशासन कायम गर्नका लागि ${cleanContext}।

तसर्थ, देहाय बमोजिमका निर्देशनहरूको पूर्ण पालना गर्न गराउनुहुन सबै मातहतका निकायहरूलाई निर्णयानुसार सूचित गरिन्छ:
१. स्वीकृत बजेट र कार्यक्रम बाहेक अन्य शीर्षकमा कुनै दायित्व सिर्जना नगर्ने।
२. तोकिएको समयसीमाभित्र अनिवार्य प्रगति विवरण मन्त्रालयमा पेश गर्ने।
३. सार्वजनिक सेवा प्रवाहलाई छिटो, छरितो र नागरिकमैत्री बनाउने।`;
    }

    if (docType === 'minute') {
      return `आज मिति २०८१ साल ... गतेका दिन ${cleanOffice}को सभाहलमा बसेको बैठकमा ${cleanSubject} सम्बन्धमा विस्तृत छलफल भई देहाय बमोजिमका निर्णयहरू सर्वसम्मत रूपमा पारित गरियो:

उपस्थित महानुभावहरू:
१. कार्यालय प्रमुख तथा अध्यक्ष
२. महाशाखा / शाखा प्रमुखहरू

कार्यसूची:
प्रस्ताव नं. १: ${cleanSubject} सम्बन्धमा।

गरिएका निर्णयहरू:
प्रस्ताव नं. १ माथि छलफल हुँदा, ${cleanContext} विषयलाई दृष्टिगत गर्दै तत्काल प्रभावकारी कार्यान्वयनमा लैजाने सर्वसम्मत निर्णय गरियो।`;
    }

    // Report
    return `१. पृष्ठभूमि:
${cleanOffice}को वार्षिक कार्ययोजना अनुसार ${cleanSubject} को यथार्थ अवस्था अध्ययन तथा विश्लेषण गरी प्रतिवेदन पेश गर्न यो प्रतिवेदन तयार पारिएको हो।

२. उद्देश्य:
- ${cleanContext} सम्बन्धी विद्यमान अवस्थाको मूल्याङ्कन गर्ने।
- देखिएका समस्या र चुनौतीहरूको पहिचान गर्ने।
- आगामी दिनमा गर्नुपर्ने नीतिगत तथा कार्यगत सुधारका उपायहरू सिफारिस गर्ने।

३. मुख्य निष्कर्षहरू:
- प्रशासनिक प्रक्रियामा पारदर्शिता र प्रभावकारिता बढ्दै गएको।
- प्रविधिको प्रयोग र विद्युतीय सुशासनलाई अझ सुदृढ गर्नुपर्ने आवश्यकता देखिएको।

४. सुधारका लागि सिफारिसहरू:
- सेवा प्रवाहलाई पूर्ण रूपमा अनलाइन प्रणालीसँग आबद्ध गर्ने।
- कर्मचारीहरूको क्षमता विकास तालिम नियमित सञ्चालन गर्ने।

५. निष्कर्ष:
माथि उल्लिखित सिफारिसहरूको कार्यान्वयनले कार्यालयको सेवा प्रवाह थप चुस्त र प्रभावकारी हुने विश्वास गरिएको छ।`;
  },

  // Versioned Tax, Pension, Leave, and Promotion Policies
  getTaxPolicies: (): TaxPolicyVersion[] =>
    getStored<TaxPolicyVersion[]>(STORAGE_KEYS.TAX_POLICIES, INITIAL_TAX_POLICIES),

  getTaxPolicy: (fiscalYear: string = '2081/82'): TaxPolicyVersion => {
    const policies = db.getTaxPolicies();
    return policies.find((p) => p.fiscalYear === fiscalYear) || policies[0];
  },

  getPensionPolicies: (): PensionPolicyVersion[] =>
    getStored<PensionPolicyVersion[]>(STORAGE_KEYS.PENSION_POLICIES, INITIAL_PENSION_POLICIES),

  getPensionPolicy: (fiscalYear: string = '2081/82'): PensionPolicyVersion => {
    const policies = db.getPensionPolicies();
    return policies.find((p) => p.fiscalYear === fiscalYear) || policies[0];
  },

  getLeavePolicies: (): LeavePolicyVersion[] =>
    getStored<LeavePolicyVersion[]>(STORAGE_KEYS.LEAVE_POLICIES, INITIAL_LEAVE_POLICIES),

  getLeavePolicy: (fiscalYear: string = '2081/82'): LeavePolicyVersion => {
    const policies = db.getLeavePolicies();
    return policies.find((p) => p.fiscalYear === fiscalYear) || policies[0];
  },

  getPromotionPolicies: (): PromotionCriteriaVersion[] =>
    getStored<PromotionCriteriaVersion[]>(STORAGE_KEYS.PROMOTION_POLICIES, INITIAL_PROMOTION_CRITERIA),

  getPromotionPolicy: (fiscalYear: string = '2081/82'): PromotionCriteriaVersion => {
    const policies = db.getPromotionPolicies();
    return policies.find((p) => p.fiscalYear === fiscalYear) || policies[0];
  },

  // 1. Learning Center
  getLearningMaterials: (): LearningMaterialItem[] =>
    getStored<LearningMaterialItem[]>(STORAGE_KEYS.LEARNING, INITIAL_LEARNING_MATERIALS),
  saveLearningMaterial: (item: LearningMaterialItem): LearningMaterialItem => {
    const list = db.getLearningMaterials();
    const idx = list.findIndex((m) => m.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.LEARNING, list);
    db.logAudit({
      userName: item.author || 'कर्मचारी',
      action: idx !== -1 ? 'LEARNING_UPDATE' : 'LEARNING_CREATE',
      entityType: 'LEARNING_MATERIAL',
      entityId: item.id,
      details: `अध्ययन सामग्री "${item.titleNe}" सुरक्षित गरियो।`,
    });
    return item;
  },
  deleteLearningMaterial: (id: string): void => {
    const list = db.getLearningMaterials().filter((m) => m.id !== id);
    saveStored(STORAGE_KEYS.LEARNING, list);
  },
  likeLearningMaterial: (id: string): void => {
    const list = db.getLearningMaterials();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.likesCount = (item.likesCount || 0) + 1;
      saveStored(STORAGE_KEYS.LEARNING, list);
    }
  },

  // 2. Quiz Platform
  getQuizQuestions: (): QuizQuestionItem[] =>
    getStored<QuizQuestionItem[]>(STORAGE_KEYS.QUIZ, INITIAL_QUIZ_QUESTIONS),
  saveQuizQuestion: (item: QuizQuestionItem): QuizQuestionItem => {
    const list = db.getQuizQuestions();
    const idx = list.findIndex((q) => q.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.QUIZ, list);
    return item;
  },
  deleteQuizQuestion: (id: string): void => {
    const list = db.getQuizQuestions().filter((q) => q.id !== id);
    saveStored(STORAGE_KEYS.QUIZ, list);
  },

  // 3. Meeting Management
  getMeetings: (): MeetingRecordItem[] =>
    getStored<MeetingRecordItem[]>(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS),
  saveMeeting: (item: MeetingRecordItem): MeetingRecordItem => {
    const list = db.getMeetings();
    const idx = list.findIndex((m) => m.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.MEETINGS, list);
    db.logAudit({
      userName: item.chairperson || 'बैठक प्रशासक',
      action: idx !== -1 ? 'MEETING_UPDATE' : 'MEETING_CREATE',
      entityType: 'MEETING_RECORD',
      entityId: item.id,
      details: `बैठक विवरण "${item.titleNe}" सुरक्षित गरियो।`,
    });
    return item;
  },
  deleteMeeting: (id: string): void => {
    const list = db.getMeetings().filter((m) => m.id !== id);
    saveStored(STORAGE_KEYS.MEETINGS, list);
  },

  // 4. Decision Tracker
  getDecisions: (): DecisionTrackerItem[] =>
    getStored<DecisionTrackerItem[]>(STORAGE_KEYS.DECISIONS, INITIAL_DECISIONS),
  saveDecision: (item: DecisionTrackerItem): DecisionTrackerItem => {
    const list = db.getDecisions();
    const idx = list.findIndex((d) => d.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.DECISIONS, list);
    return item;
  },
  updateDecisionProgress: (id: string, progress: number, status: DecisionTrackerItem['status']): void => {
    const list = db.getDecisions();
    const item = list.find((d) => d.id === id);
    if (item) {
      item.progressPercent = progress;
      item.status = status;
      saveStored(STORAGE_KEYS.DECISIONS, list);
    }
  },
  deleteDecision: (id: string): void => {
    const list = db.getDecisions().filter((d) => d.id !== id);
    saveStored(STORAGE_KEYS.DECISIONS, list);
  },

  // 5. File Tracker
  getFileTrackers: (): FileTrackerItem[] =>
    getStored<FileTrackerItem[]>(STORAGE_KEYS.FILE_TRACKER, INITIAL_FILES),
  saveFileTracker: (item: FileTrackerItem): FileTrackerItem => {
    const list = db.getFileTrackers();
    const idx = list.findIndex((f) => f.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.FILE_TRACKER, list);
    db.logAudit({
      userName: item.currentDeskBranch || 'दर्ता चलानी शाखा',
      action: idx !== -1 ? 'FILE_UPDATE' : 'FILE_CREATE',
      entityType: 'FILE_TRACKER',
      entityId: item.id,
      details: `फाइल/पत्र "${item.fileSubjectNe}" (${item.fileNo}) दर्ता/अद्यावधिक गरियो।`,
    });
    return item;
  },
  updateFileTrackerStage: (id: string, stage: FileTrackerItem['status'], desk: string, remarks?: string): void => {
    const list = db.getFileTrackers();
    const item = list.find((f) => f.id === id);
    if (item) {
      item.status = stage;
      item.currentDeskBranch = desk;
      item.lastActionDateBs = '२०८१/०८/२२';
      if (remarks) item.notes = remarks;
      saveStored(STORAGE_KEYS.FILE_TRACKER, list);
    }
  },
  deleteFileTracker: (id: string): void => {
    const list = db.getFileTrackers().filter((f) => f.id !== id);
    saveStored(STORAGE_KEYS.FILE_TRACKER, list);
  },

  // 6. Inventory / Assets (PAMS)
  getInventory: (): InventoryItem[] =>
    getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY),
  saveInventoryItem: (item: InventoryItem): InventoryItem => {
    const list = db.getInventory();
    const idx = list.findIndex((inv) => inv.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.INVENTORY, list);
    return item;
  },
  deleteInventoryItem: (id: string): void => {
    const list = db.getInventory().filter((inv) => inv.id !== id);
    saveStored(STORAGE_KEYS.INVENTORY, list);
  },

  // 7. Budget Planner
  getBudgets: (): BudgetItem[] =>
    getStored<BudgetItem[]>(STORAGE_KEYS.BUDGET, INITIAL_BUDGET),
  saveBudgetItem: (item: BudgetItem): BudgetItem => {
    const list = db.getBudgets();
    const idx = list.findIndex((b) => b.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.BUDGET, list);
    return item;
  },
  deleteBudgetItem: (id: string): void => {
    const list = db.getBudgets().filter((b) => b.id !== id);
    saveStored(STORAGE_KEYS.BUDGET, list);
  },

  // 8. RTI Assistant
  getRTIRequests: (): RTIRequestItem[] =>
    getStored<RTIRequestItem[]>(STORAGE_KEYS.RTI, INITIAL_RTI),
  saveRTIRequest: (item: RTIRequestItem): RTIRequestItem => {
    const list = db.getRTIRequests();
    const idx = list.findIndex((r) => r.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.RTI, list);
    db.logAudit({
      userName: item.applicantName,
      action: idx !== -1 ? 'RTI_UPDATE' : 'RTI_CREATE',
      entityType: 'RTI_REQUEST',
      entityId: item.id,
      details: `सूचना माग दर्ता (${item.registrationNo}) सुरक्षित गरियो।`,
    });
    return item;
  },
  updateRTIResponse: (id: string, response: string, fee: number = 0): void => {
    const list = db.getRTIRequests();
    const item = list.find((r) => r.id === id);
    if (item) {
      item.responseDetails = response;
      item.feeCharged = fee;
      item.status = 'PROVIDED';
      saveStored(STORAGE_KEYS.RTI, list);
    }
  },
  deleteRTIRequest: (id: string): void => {
    const list = db.getRTIRequests().filter((r) => r.id !== id);
    saveStored(STORAGE_KEYS.RTI, list);
  },

  // 9. Calendar Events
  getCalendarEvents: (): GovCalendarEvent[] =>
    getStored<GovCalendarEvent[]>(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR),
  saveCalendarEvent: (item: GovCalendarEvent): GovCalendarEvent => {
    const list = db.getCalendarEvents();
    const idx = list.findIndex((c) => c.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.CALENDAR, list);
    return item;
  },
  deleteCalendarEvent: (id: string): void => {
    const list = db.getCalendarEvents().filter((c) => c.id !== id);
    saveStored(STORAGE_KEYS.CALENDAR, list);
  },

  // 10. Document Toolkit
  getDocumentToolkits: (): DocumentToolkitItem[] =>
    getStored<DocumentToolkitItem[]>(STORAGE_KEYS.TOOLKIT, INITIAL_TOOLKIT),
  saveDocumentToolkit: (item: DocumentToolkitItem): DocumentToolkitItem => {
    const list = db.getDocumentToolkits();
    const idx = list.findIndex((t) => t.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.TOOLKIT, list);
    return item;
  },
  incrementToolkitDownload: (id: string): void => {
    const list = db.getDocumentToolkits();
    const item = list.find((t) => t.id === id);
    if (item) {
      item.downloadCount = (item.downloadCount || 0) + 1;
      saveStored(STORAGE_KEYS.TOOLKIT, list);
    }
  },
  deleteDocumentToolkit: (id: string): void => {
    const list = db.getDocumentToolkits().filter((t) => t.id !== id);
    saveStored(STORAGE_KEYS.TOOLKIT, list);
  },

  // 11. Knowledge Community
  getCommunityPosts: (): CommunityPostItem[] =>
    getStored<CommunityPostItem[]>(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY),
  saveCommunityPost: (item: CommunityPostItem): CommunityPostItem => {
    const list = db.getCommunityPosts();
    const idx = list.findIndex((p) => p.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    saveStored(STORAGE_KEYS.COMMUNITY, list);
    return item;
  },
  addCommunityAnswer: (
    postId: string,
    answerText: string,
    authorName: string,
    authorRank: string,
    isVerifiedOfficial: boolean
  ): void => {
    const list = db.getCommunityPosts();
    const post = list.find((p) => p.id === postId);
    if (post) {
      const newAnswer = {
        id: `ans-${Date.now()}`,
        authorName,
        authorRank,
        answerText,
        isVerifiedOfficial,
        createdAt: new Date().toISOString(),
      };
      post.answers.push(newAnswer);
      saveStored(STORAGE_KEYS.COMMUNITY, list);
      db.logAudit({
        userName: authorName,
        action: 'COMMUNITY_ANSWER',
        entityType: 'COMMUNITY_POST',
        entityId: postId,
        details: `फोरम प्रश्नमा उत्तर थपियो: "${post.titleNe}"`,
      });
    }
  },
  upvoteCommunityPost: (postId: string): void => {
    const list = db.getCommunityPosts();
    const post = list.find((p) => p.id === postId);
    if (post) {
      post.upvotes = (post.upvotes || 0) + 1;
      saveStored(STORAGE_KEYS.COMMUNITY, list);
    }
  },
  deleteCommunityPost: (id: string): void => {
    const list = db.getCommunityPosts().filter((p) => p.id !== id);
    saveStored(STORAGE_KEYS.COMMUNITY, list);
  },

  // Database Reset / Re-seed
  resetDatabase: (): void => {
    saveStored(STORAGE_KEYS.USERS, []);
    saveStored(STORAGE_KEYS.PROFILES, {});
    saveStored(STORAGE_KEYS.VERIFICATIONS, []);
    saveStored(STORAGE_KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCS);
    saveStored(STORAGE_KEYS.LEGAL_SECTIONS, INITIAL_SECTIONS);
    saveStored(STORAGE_KEYS.SALARY_SCALES, INITIAL_SALARY_SCALES);
    saveStored(STORAGE_KEYS.CIRCULARS, INITIAL_CIRCULARS);
    saveStored(STORAGE_KEYS.TASKS, []);
    saveStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    saveStored(STORAGE_KEYS.DRAFTS, INITIAL_DRAFTS);
    saveStored(STORAGE_KEYS.TAX_POLICIES, INITIAL_TAX_POLICIES);
    saveStored(STORAGE_KEYS.PENSION_POLICIES, INITIAL_PENSION_POLICIES);
    saveStored(STORAGE_KEYS.LEAVE_POLICIES, INITIAL_LEAVE_POLICIES);
    saveStored(STORAGE_KEYS.PROMOTION_POLICIES, INITIAL_PROMOTION_CRITERIA);
    saveStored(STORAGE_KEYS.LEARNING, INITIAL_LEARNING_MATERIALS);
    saveStored(STORAGE_KEYS.QUIZ, INITIAL_QUIZ_QUESTIONS);
    saveStored(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
    saveStored(STORAGE_KEYS.DECISIONS, INITIAL_DECISIONS);
    saveStored(STORAGE_KEYS.FILE_TRACKER, INITIAL_FILES);
    saveStored(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    saveStored(STORAGE_KEYS.BUDGET, INITIAL_BUDGET);
    saveStored(STORAGE_KEYS.RTI, INITIAL_RTI);
    saveStored(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR);
    saveStored(STORAGE_KEYS.TOOLKIT, INITIAL_TOOLKIT);
    saveStored(STORAGE_KEYS.COMMUNITY, INITIAL_COMMUNITY);
  },
};
