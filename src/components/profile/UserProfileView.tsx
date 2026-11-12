import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { db } from '../../lib/supabase/client';
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck,
  Clock,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { ServiceDocumentsVault } from './ServiceDocumentsVault';

export const UserProfileView: React.FC<{ onOpenAuth?: () => void }> = ({ onOpenAuth }) => {
  const { user, profile, isVerifiedEmployee, submitVerification, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [currentOffice, setCurrentOffice] = useState(profile?.currentOffice || '');
  const [district, setDistrict] = useState(profile?.district || 'काठमाडौँ');
  const [province, setProvince] = useState(profile?.province || 'बागमती प्रदेश');
  const [dobBs, setDobBs] = useState(profile?.dobBs || '२०४५/०१/०१');
  const [citizenshipNo, setCitizenshipNo] = useState(profile?.citizenshipNo || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Verification Form state
  const [sanketNo, setSanketNo] = useState('');
  const [pscRollNo, setPscRollNo] = useState('');
  const [appointmentDateBs, setAppointmentDateBs] = useState('२०७५/०८/१०');
  const [verifySubmitted, setVerifySubmitted] = useState(false);

  if (!user || !profile) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          कृपया प्रोफाइल हेर्न पहिले लगइन गर्नुहोस्।
        </p>
      </div>
    );
  }

  // Calculate Retirement Date (58 years civil service age limit)
  const calculateRetirementBs = (dobStr: string) => {
    try {
      const year = parseInt(dobStr.split('/')[0], 10);
      if (year && !isNaN(year)) {
        return `${year + 58} साल (५८ वर्ष उमेर हद)`;
      }
    } catch {}
    return '५८ वर्ष उमेर पुगेको मितिमा';
  };

  const retirementBs = calculateRetirementBs(profile.dobBs);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      currentOffice,
      district,
      province,
      dobBs,
      citizenshipNo,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanketNo) return;
    submitVerification(sanketNo, pscRollNo, appointmentDateBs);
    setVerifySubmitted(true);
    setTimeout(() => {
      setVerifySubmitted(false);
      setShowVerifyModal(false);
    }, 2000);
  };

  // Check if pending verification exists
  const existingVerifs = db.getVerifications();
  const pendingVerif = existingVerifs.find(
    (v) => v.userId === user.id && v.status === 'PENDING'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner / Identity Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#173B63] to-[#3478B9] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-xs">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.fullName}
                </h1>
                {isVerifiedEmployee ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    प्रमाणित निजामती कर्मचारी
                  </span>
                ) : pendingVerif ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    कर्मचारी प्रमाणीकरण विचाराधीन
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    <Shield className="w-3.5 h-3.5" />
                    दर्ता खाता (प्रमाणीकरण हुन बाँकी)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>{user.email}</span>
                <span aria-hidden="true">·</span>
                <span>मोबाइल: {user.mobile}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#173B63] dark:text-blue-400 font-medium">
                  {profile.currentLevel}
                </span>
              </div>

              {/* Data status disclaimer */}
              <p className="text-[11px] text-slate-400 mt-2">
                अभिलेख स्थिति: {profile.dataSourceDisclaimer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isVerifiedEmployee && !pendingVerif && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0c5c56] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                कर्मचारी प्रमाणीकरण आवेदन
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'रद्द गर्नुहोस्' : 'विवरण सम्पादन'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>व्यक्तिगत विवरण सफलतापूर्वक सुरक्षित गरियो।</span>
          </div>
        )}
      </div>

      {/* Main Grid: Service Record & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Service Details */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#173B63]" />
                व्यक्तिगत तथा कार्यालय विवरण सम्पादन गर्नुहोस्
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      हाल कार्यरत कार्यालय
                    </label>
                    <input
                      type="text"
                      value={currentOffice}
                      onChange={(e) => setCurrentOffice(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      नागरिकता नम्बर
                    </label>
                    <input
                      type="text"
                      value={citizenshipNo}
                      onChange={(e) => setCitizenshipNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      जन्ममिति (वि.सं.)
                    </label>
                    <input
                      type="text"
                      value={dobBs}
                      onChange={(e) => setDobBs(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      जिल्ला
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                  >
                    रद्द
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    परिवर्तन सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#173B63]" />
                आधिकारिक सेवा तथा पदस्थापन अभिलेख (Civil Service Details)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">कार्यरत तह / सेवा स्तर</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.serviceTier} तह ({profile.rankType})
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">सेवा तथा समूह</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.serviceName} · {profile.groupName}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">हालको पद तथा श्रेणी</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.currentLevel}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">सुरु नियुक्ति मिति</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.appointmentDateBs} (वि.सं.)
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-500">हाल कार्यरत मन्त्रालय / कार्यालय</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.currentOffice} ({profile.district}, {profile.province})
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">नागरिकता नम्बर</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.citizenshipNo || 'अभिलेख हुन बाँकी'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">जन्ममिति (वि.सं.)</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {profile.dobBs}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Leave Records Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F766E]" />
              बिदा सञ्चित मौज्दात (Leave Balance Summary)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">घर बिदा</span>
                <p className="text-lg font-bold text-[#173B63] dark:text-blue-400 mt-1 tabular-nums">
                  {profile.leaveBalance?.homeLeave || 20} दिन
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">बिरामी बिदा</span>
                <p className="text-lg font-bold text-[#0F766E] dark:text-teal-400 mt-1 tabular-nums">
                  {profile.leaveBalance?.sickLeave || 12} दिन
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">भैपरी आउने बिदा</span>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
                  {profile.leaveBalance?.casualLeave || 5} दिन
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">पर्व बिदा</span>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
                  {profile.leaveBalance?.festivalLeave || 2} दिन
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Career & Retirement Projection */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#173B63]" />
              अनिवार्य अवकाश अनुमान (Retirement)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              निजामती सेवा ऐन, २०४९ को दफा ३३ अनुसार ५८ वर्ष उमेर पुगेको मितिमा स्वतः अनिवार्य अवकाश हुने कानुनी व्यवस्था।
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                सम्भावित अवकाश वर्ष
              </span>
              <h4 className="text-base font-bold text-[#173B63] dark:text-blue-400 mt-1">
                {retirementBs}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                (सिटरोल जन्ममिति: {profile.dobBs} को आधारमा)
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>कुल सेवा अवधि:</span>
                <span className="font-semibold text-slate-900 dark:text-white">८ वर्ष २ महिना</span>
              </div>
              <div className="flex justify-between">
                <span>पेन्सनका लागि न्यूनतम सेवा:</span>
                <span className="font-semibold text-emerald-600">२० वर्ष आवश्यक</span>
              </div>
              <div className="flex justify-between">
                <span>बढुवा सम्भाव्य उम्मेदवार:</span>
                <span className="font-semibold text-[#173B63] dark:text-blue-400">योग्य (Eligible)</span>
              </div>
            </div>
          </div>

          {/* Legal Document Attachment Reminder */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 text-xs space-y-2">
            <h4 className="font-bold text-[#173B63] dark:text-blue-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              व्यक्तिगत अभिलेख सुरक्षा सूचना
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              तपाईंको व्यक्तिगत सेवा विवरण तथा सिटरोल डाटा सुरक्षित छ। कुनै पनि आधिकारिक प्रशासनिक काममा प्रयोग गर्नुअघि राष्ट्रिय किताबखाना (निजामती) को आधिकारिक PIS पोर्टलसँग रुजु गर्न सकिनेछ।
            </p>
          </div>
        </div>
      </div>

      <ServiceDocumentsVault onOpenAuth={onOpenAuth} />

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#0F766E] text-white">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  निजामती कर्मचारी प्रमाणीकरण आवेदन
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {verifySubmitted ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    आवेदन सफलतापूर्वक पेश गरियो!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    तपाईंको कर्मचारी सङ्केत नम्बर प्रणाली प्रशासक समक्ष रुजुका लागि पठाइएको छ। प्रशासकले अनुमोदन गरेपछि तपाईंको खाता &apos;प्रमाणित निजामती कर्मचारी&apos; का रूपमा स्तरोन्नति हुनेछ।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200">
                    <p>
                      <strong>नोट:</strong> राष्ट्रिय किताबखाना (निजामती) बाट जारी भएको ७ अंक वा ६ अंकको कर्मचारी सङ्केत नं (PIS No) सही प्रविष्ट गर्नुहोस्।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      कर्मचारी सङ्केत नम्बर (PIS / Sanket No) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा: २१४८९५"
                      value={sanketNo}
                      onChange={(e) => setSanketNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      लोक सेवा आयोग रोल नम्बर (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: PSC-80-0412"
                      value={pscRollNo}
                      onChange={(e) => setPscRollNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      सुरु स्थायी नियुक्ति मिति (वि.सं.) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="२०७५/०८/१०"
                      value={appointmentDateBs}
                      onChange={(e) => setAppointmentDateBs(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowVerifyModal(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      रद्द
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0c5c56]"
                    >
                      आवेदन पेश गर्नुहोस्
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
