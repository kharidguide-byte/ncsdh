export type UserRole =
  | 'guest'
  | 'registered_user'
  | 'verified_employee'
  | 'content_contributor'
  | 'content_editor'
  | 'admin'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  isVerifiedEmployee: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  citizenshipNo: string;
  dobBs: string;
  dobAd: string;
  serviceTier: 'सङ्घीय' | 'प्रदेश' | 'स्थानीय तह';
  serviceName: string;
  groupName: string;
  subgroupName?: string;
  currentLevel: string;
  rankType: 'राजपत्राङ्कित' | 'राजपत्र अनङ्कित' | 'श्रेणीविहीन';
  currentOffice: string;
  district: string;
  province: string;
  appointmentDateBs: string;
  avatarUrl?: string;
  isOfficialSynced: boolean;
  dataSourceDisclaimer: string;
  leaveBalance?: {
    homeLeave: number; // घर बिदा (दिन)
    sickLeave: number; // बिरामी बिदा (दिन)
    casualLeave: number; // भैपरी आउने बिदा
    festivalLeave: number; // पर्व बिदा
  };
}

export interface EmployeeVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sanketNo: string; // कर्मचारी सङ्केत नम्बर (PIS)
  pscRollNo?: string;
  appointmentDateBs: string;
  officeIdCardUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface LegalSubsection {
  id: string;
  subsectionNo: string; // उदा: उपदफा (१), उपदफा (२)
  contentNe: string;
  clauses?: {
    clauseNo: string; // उदा: खण्ड (क), खण्ड (ख)
    contentNe: string;
  }[];
}

export interface RelatedLegalProvision {
  id: string;
  targetDocTitleNe: string;
  targetSectionNo: string;
  relationType: 'RULE_UNDER_ACT' | 'CROSS_ACT_REFERENCE' | 'CIRCULAR_GUIDELINE';
  descriptionNe: string;
}

export interface LegalVersionRecord {
  id: string;
  versionName: string; // उदा: "मूल ऐन २०४९", "चौथो संशोधन २०७२"
  enactmentDateBs: string;
  gazetteNotificationDateBs?: string;
  status: 'ACTIVE' | 'HISTORICAL' | 'REPEALED';
  keyChangesNe: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  titleNe: string;
  docType: 'ACT' | 'RULE' | 'DIRECTIVE' | 'PROCEDURE' | 'ORDER';
  category: string;
  enactmentDateBs: string;
  status: 'ACTIVE' | 'AMENDED' | 'REPEALED';
  description: string;
  officialSourceUrl: string;
  versionNo: string;
  sectionsCount?: number;
  ministry?: string;
  versions?: LegalVersionRecord[];
}

export interface LegalSection {
  id: string;
  documentId: string;
  documentTitleNe?: string;
  chapterNo: string;
  chapterTitleNe: string;
  sectionNo: string;
  titleNe: string;
  contentNe: string;
  simpleExplanationNe?: string;
  subsections?: LegalSubsection[];
  relatedProvisions?: RelatedLegalProvision[];
  amendmentHistoryNe?: string;
  isRepealed?: boolean;
  repealedByNe?: string;
  keywords?: string[];
  userNotes?: string;
}

export interface LegalQueryAnswer {
  question: string;
  actTitleNe: string;
  sectionNo: string;
  sectionTitleNe: string;
  originalStatutoryText: string;
  plainExplanationNe: string;
  officialSourceUrl: string;
  amendmentAndDateNe: string;
  subsectionsCount?: number;
  relatedProvisions?: RelatedLegalProvision[];
  confidence: 'HIGH' | 'MEDIUM' | 'EXACT_STATUTORY_MATCH';
}

export interface SalaryScale {
  id: string;
  fiscalYear: string;
  levelCode: string;
  levelNameNe: string;
  rankCategory: string;
  basicSalary: number;
  gradeAmount: number;
  maxGrades: number;
  dearnessAllowance: number;
  sourceReference: string;
}

export interface GovernmentCircular {
  id: string;
  titleNe: string;
  issuingAuthority: string;
  circularNo: string;
  issuedDateBs: string;
  subjectCategory: string;
  priority: 'NORMAL' | 'URGENT' | 'VERY_URGENT';
  summaryNe: string;
  officialLink?: string;
  isActive: boolean;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  dueDateBs: string;
  category: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'VERIFICATION' | 'UPDATE' | 'LEGAL';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export type GovernmentDocumentType =
  | 'tippani'      // टिप्पणी (Decision Memo)
  | 'order'        // कार्यालय आदेश (Office Order)
  | 'letter'       // कार्यालय पत्र (Official Letter)
  | 'circular'     // परिपत्र (Circular)
  | 'minute'       // बैठकको माइन्युट (Meeting Minutes)
  | 'report';      // सरकारी प्रतिवेदन (Official Report)

export interface GovernmentDraftItem {
  id: string;
  userId?: string;
  docType: GovernmentDocumentType;
  title: string;
  subject: string;
  governmentTier: 'नेपाल सरकार' | 'प्रदेश सरकार' | 'स्थानीय सरकार';
  ministryOrEntity: string;
  departmentOrDivision: string;
  officeName: string;
  branchName?: string;
  dispatchNo: string; // चलानी नं.
  letterNo: string;   // पत्र संख्या
  dateBs: string;     // मिति (वि.सं.)
  urgency: 'साधारण' | 'जरुरी' | 'अति जरुरी' | 'तुरुन्त' | 'गोप्य';
  recipient?: string; // श्री... / मातहतका सम्पूर्ण निकायहरू
  recipientDesignation?: string;
  recipientOffice?: string;
  content: string;    // मुख्य व्यहोरा
  legalBasis?: string; // कानुनी आधार (ऐन, नियम वा निर्णय)
  drafter: {
    name: string;
    designation: string;
    dateBs: string;
  };
  reviewer?: {
    name: string;
    designation: string;
    dateBs: string;
    remarks?: string;
  };
  approver: {
    name: string;
    designation: string;
    dateBs: string;
    decisionStatus?: 'APPROVED' | 'AMENDED' | 'PENDING' | 'REJECTED';
    decisionNote?: string;
  };
  carbonCopies?: string[]; // बोधार्थ
  meetingDetails?: {
    meetingNo?: string;
    meetingDateBs: string;
    meetingTime: string;
    meetingVenue: string;
    chairperson: string;
    attendees: string[];
    invitees?: string[];
    agendas: string[];
    decisions: {
      agendaNo: string;
      agendaTitle: string;
      decisionText: string;
    }[];
  };
  reportDetails?: {
    reportTitle: string;
    fiscalYear?: string;
    background: string;
    objectives: string[];
    methodology?: string;
    keyFindings: string[];
    recommendations: string[];
    conclusion: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// Versioned Formulas & Rates Database Interfaces
// ----------------------------------------------------------------------

export interface TaxSlabItem {
  id: string;
  slabName: string;
  thresholdSingle: number;
  thresholdMarried: number;
  ratePercent: number;
  descriptionNe: string;
}

export interface TaxPolicyVersion {
  fiscalYear: string;
  enactedDateBs: string;
  sourceLawNe: string;
  status: 'ACTIVE' | 'HISTORICAL';
  singleBasicExemption: number;
  marriedBasicExemption: number;
  slabs: TaxSlabItem[];
  rebates: {
    lifeInsuranceMax: number;
    healthInsuranceMax: number;
    femaleTaxCreditPercent: number; // १०% कर छुट (महिला एकल पारिश्रमिकमा)
    remoteAreaDeductions: {
      categoryA: number; // 'क' वर्ग: रु ५०,०००
      categoryB: number; // 'ख' वर्ग: रु ४०,०००
      categoryC: number; // 'ग' वर्ग: रु ३०,०००
      categoryD: number; // 'घ' वर्ग: रु २०,०००
      categoryE: number; // 'ङ' वर्ग: रु १०,०००
    };
  };
}

export interface PensionPolicyVersion {
  fiscalYear: string;
  sourceLawNe: string;
  status: 'ACTIVE' | 'HISTORICAL';
  minServiceYearsPension: number; // २० वर्ष
  formulaDivisor: number; // ५०
  senior70BonusPercent: number; // १०% थप
  senior75BonusPercent: number; // १५% थप
  contributoryEffectiveDateBs: string; // २०७५/०४/०१
  contributoryCutPercent: number; // ६%
  contributoryGovtPercent: number; // ६%
  gratuityRules: {
    bracket1: { minYears: number; maxYears: number; salaryMultiplier: number };
    bracket2: { minYears: number; maxYears: number; salaryMultiplier: number };
    bracket3: { minYears: number; maxYears: number; salaryMultiplier: number };
  };
}

export interface LeavePolicyVersion {
  fiscalYear: string;
  sourceLawNe: string;
  homeLeaveEarnDays: number; // १२ दिन काम = १ दिन
  homeLeaveMaxAccumulate: number; // १८० दिन
  sickLeavePerYear: number; // १२ दिन (सञ्चित असीमित)
  casualLeavePerYear: number; // ६ दिन
  festivalLeavePerYear: number; // ६ दिन
  maternityLeaveDays: number; // ९८ दिन
  paternityCareLeaveDays: number; // १५ दिन
  mourningLeaveDays: number; // १५ दिन
  encashmentDivisor: number; // ३० (अन्तिम महिनाको तलब / ३०)
}

export interface PromotionCriteriaVersion {
  fiscalYear: string;
  sourceLawNe: string;
  totalMarks: number; // १००
  performanceMax: number; // ४० (का.स.मू.)
  seniorityMax: number; // २० (प्रति वर्ष राजपत्राङ्कित ३.७५ वा ३.२५ / अनङ्कित)
  geographicMax: number; // १६ (क-४, ख-३.२५, ग-२.५, घ-१.२५ प्रति वर्ष)
  academicMax: number; // १२ (प्रथम श्रेणी न्यूनतम ९ + माथिल्लो ३)
  trainingMax: number; // ८ (प्रथम-८, दोस्रो-६, तेस्रो-४)
  interviewMax?: number; // ४
  minServiceYearsOfficer: number; // ५ वर्ष
  minServiceYearsNonOfficer: number; // ५ वर्ष
}

// ----------------------------------------------------------------------
// Operations Modules Interfaces
// ----------------------------------------------------------------------

export interface LearningMaterialItem {
  id: string;
  titleNe: string;
  category: 'प्रशासनिक कानुन' | 'सार्वजनिक खरिद' | 'सुशासन तथा सेवा' | 'वित्तीय व्यवस्थापन' | 'लोकसेवा तयारी';
  author: string;
  summaryNe: string;
  contentNe: string;
  readTimeMinutes: number;
  officialActRef?: string;
  pdfDownloadUrl?: string;
  likesCount: number;
  createdAt: string;
}

export interface QuizQuestionItem {
  id: string;
  topic: string;
  questionNe: string;
  optionsNe: string[];
  correctOptionIndex: number;
  explanationNe: string;
  actReference: string;
}

export interface MeetingRecordItem {
  id: string;
  titleNe: string;
  meetingDateBs: string;
  meetingTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  agendas: string[];
  decisions: string[];
  status: 'SCHEDULED' | 'CONCLUDED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export interface DecisionTrackerItem {
  id: string;
  decisionNo: string;
  titleNe: string;
  issuingBody: string;
  decisionDateBs: string;
  deadlineBs: string;
  responsibleOfficer: string;
  department: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progressPercent: number;
  remarks: string;
  updatedAt: string;
}

export interface FileTrackerItem {
  id: string;
  fileNo: string;
  fileSubjectNe: string;
  dartaNo?: string;
  chalaniNo?: string;
  originatingOffice: string;
  currentDeskBranch: string;
  assignedOfficer: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'DISPATCHED' | 'ARCHIVED';
  lastActionDateBs: string;
  urgency: 'NORMAL' | 'URGENT' | 'TOP_PRIORITY';
  notes: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemNameNe: string;
  category: 'FURNITURE' | 'IT_EQUIPMENT' | 'VEHICLE' | 'MACHINERY' | 'CONSUMABLE';
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  condition: 'NEW' | 'WORKING' | 'REPAIRABLE' | 'SCRAP';
  assignedRoomOrPerson: string;
  lastInspectedBs: string;
  pamsLedgerPageNo: string;
}

export interface BudgetItem {
  id: string;
  budgetSubhead: string;
  titleNe: string;
  allocatedBudget: number;
  expenditure: number;
  remainingBalance: number;
  fiscalYear: string;
  transferPlanningNotes?: string;
  progressPercent: number;
}

export interface RTIRequestItem {
  id: string;
  registrationNo: string;
  applicantName: string;
  applicantPhone: string;
  requestedInfoNe: string;
  requestedDateBs: string;
  deadlineDateBs: string; // १५ दिन
  rtiOfficerName: string;
  status: 'PENDING' | 'PROVIDED' | 'REJECTED' | 'APPEALED';
  feeCharged: number;
  responseDetails?: string;
}

export interface GovCalendarEvent {
  id: string;
  titleNe: string;
  dateBs: string;
  isPublicHoliday: boolean;
  eventType: 'HOLIDAY' | 'TAX_DEADLINE' | 'PERFORMANCE_DEADLINE' | 'CIVIL_SERVICE_DAY' | 'MEETING';
  descriptionNe: string;
}

export interface DocumentToolkitItem {
  id: string;
  titleNe: string;
  formCode: string;
  category: 'PERSONNEL' | 'PROCUREMENT' | 'FINANCE' | 'GENERAL_ADMIN';
  formatType: 'DOCX' | 'PDF' | 'EXCEL';
  downloadCount: number;
  descriptionNe: string;
}

export interface CommunityPostItem {
  id: string;
  authorName: string;
  authorRank: string;
  titleNe: string;
  questionContentNe: string;
  category: string;
  upvotes: number;
  answers: {
    id: string;
    authorName: string;
    authorRank: string;
    answerText: string;
    isVerifiedOfficial: boolean;
    createdAt: string;
  }[];
  createdAt: string;
}
