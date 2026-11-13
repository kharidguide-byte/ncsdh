import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { db, isSupabaseConfigured, supabase } from '../../lib/supabase/client';
import {
  ShieldAlert,
  Users,
  FileCheck,
  Scale,
  BellRing,
  Activity,
  Check,
  X,
  Plus,
  Send,
  Database,
  Search,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { User, EmployeeVerification, GovernmentCircular } from '../../types';

interface SignupRequest {
  id: string;
  email: string;
  full_name: string;
  mobile: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at: string | null;
}

interface CloudUser {
  id: string;
  email: string;
  mobile: string;
  fullName: string;
  role: string;
  createdAt: string;
  emailConfirmed: boolean;
  isActive: boolean;
}

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, cloudAuthUserId } = useAuth();

  const [activeTab, setActiveTab] = useState<'verifications' | 'signupRequests' | 'users' | 'circulars' | 'audit' | 'database'>(
    'verifications'
  );

  // Live state from DB
  const [verifications, setVerifications] = useState<EmployeeVerification[]>(db.getVerifications());
  const [usersList, setUsersList] = useState<User[]>(db.getUsers());
  const [circulars, setCirculars] = useState<GovernmentCircular[]>(db.getCirculars());
  const [auditLogs, setAuditLogs] = useState(db.getAuditLogs());
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [signupRequestsLoading, setSignupRequestsLoading] = useState(false);
  const [signupRequestsError, setSignupRequestsError] = useState('');
  const [reviewingSignupId, setReviewingSignupId] = useState<string | null>(null);
  const [cloudUsers, setCloudUsers] = useState<CloudUser[]>([]);
  const [cloudUsersLoading, setCloudUsersLoading] = useState(false);
  const [cloudUsersError, setCloudUsersError] = useState('');
  const [updatingCloudUserId, setUpdatingCloudUserId] = useState<string | null>(null);

  // Search in users
  const [userSearch, setUserSearch] = useState('');

  // Circular form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthority, setNewAuthority] = useState('सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय');
  const [newCircularNo, setNewCircularNo] = useState('');
  const [newDateBs, setNewDateBs] = useState('२०८१/०७/२५');
  const [newCategory, setNewCategory] = useState('कर्मचारी प्रशासन');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'URGENT' | 'VERY_URGENT'>('NORMAL');
  const [newSummary, setNewSummary] = useState('');
  const [circularPublished, setCircularPublished] = useState(false);

  const loadSignupRequests = async () => {
    if (!supabase || !cloudAuthUserId || !isAdmin) return;
    setSignupRequestsLoading(true);
    setSignupRequestsError('');
    const { data, error } = await supabase
      .from('signup_requests')
      .select('id, email, full_name, mobile, status, created_at, reviewed_at')
      .order('created_at', { ascending: false });
    setSignupRequestsLoading(false);
    if (error) {
      setSignupRequestsError(`दर्ता अनुरोध लोड भएन। Migration 004 र admin app_metadata जाँच गर्नुहोस्। ${error.message}`);
      return;
    }
    setSignupRequests((data || []) as SignupRequest[]);
  };

  useEffect(() => {
    if (activeTab === 'signupRequests') void loadSignupRequests();
  }, [activeTab, cloudAuthUserId, isAdmin]);

  const callAdminApi = async (url: string, init?: RequestInit) => {
    if (!supabase || !cloudAuthUserId) throw new Error('Supabase Auth बाट admin रूपमा login गर्नुहोस्।');
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error('Supabase login session भेटिएन। फेरि login गर्नुहोस्।');

    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
    const result = await response.json() as { error?: string; users?: CloudUser[]; success?: boolean };
    if (!response.ok) throw new Error(result.error || `Admin request असफल भयो (HTTP ${response.status})।`);
    return result;
  };

  const loadCloudUsers = async () => {
    if (!cloudAuthUserId || !isAdmin) return;
    setCloudUsersLoading(true);
    setCloudUsersError('');
    try {
      const result = await callAdminApi('/api/admin/users');
      setCloudUsers(result.users || []);
    } catch (error) {
      setCloudUsersError(error instanceof Error ? error.message : 'Supabase प्रयोगकर्ता सूची लोड भएन।');
    } finally {
      setCloudUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && cloudAuthUserId) void loadCloudUsers();
  }, [activeTab, cloudAuthUserId, isAdmin]);

  const updateCloudUser = async (target: CloudUser, updates: { role?: string; isActive?: boolean }) => {
    setUpdatingCloudUserId(target.id);
    setCloudUsersError('');
    try {
      await callAdminApi(`/api/admin/users/${encodeURIComponent(target.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: updates.role || target.role,
          isActive: updates.isActive ?? target.isActive,
        }),
      });
      setCloudUsers((users) => users.map((item) => item.id === target.id ? { ...item, ...updates } : item));
    } catch (error) {
      setCloudUsersError(error instanceof Error ? error.message : 'प्रयोगकर्ता अद्यावधिक भएन।');
      await loadCloudUsers();
    } finally {
      setUpdatingCloudUserId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
        <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-red-500" />
        <h3 className="text-base font-bold">पहुँच अस्वीकृत (Unauthorized Access)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          यो खण्ड प्रणाली प्रशासक (Administrator) का लागि मात्र सुरक्षित गरिएको छ।
        </p>
      </div>
    );
  }

  // Verification actions
  const handleApproveVerification = (id: string) => {
    db.updateVerificationStatus(id, 'APPROVED', user?.id || 'admin');
    setVerifications([...db.getVerifications()]);
    setUsersList([...db.getUsers()]);
    setAuditLogs([...db.getAuditLogs()]);
  };

  const handleRejectVerification = (id: string) => {
    const reason = window.prompt('अस्वीकृत गर्नुको कारण लेख्नुहोस् (Rejection reason):', 'सङ्केत नं किताबखानासँग मेल खाएन।');
    if (reason) {
      db.updateVerificationStatus(id, 'REJECTED', user?.id || 'admin', reason);
      setVerifications([...db.getVerifications()]);
      setAuditLogs([...db.getAuditLogs()]);
    }
  };

  // User role toggle
  const handleChangeRole = (userId: string, newRole: any) => {
    db.updateUser(userId, { role: newRole });
    setUsersList([...db.getUsers()]);
    setAuditLogs([...db.getAuditLogs()]);
  };

  const handleReviewSignup = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!supabase || !cloudAuthUserId) {
      setSignupRequestsError('Supabase Auth बाट प्रशासकको रूपमा लगइन गर्नुहोस्। Demo प्रशासकले cloud अनुरोध परिवर्तन गर्न सक्दैन।');
      return;
    }
    setReviewingSignupId(requestId);
    setSignupRequestsError('');
    const { data, error } = await supabase
      .from('signup_requests')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: cloudAuthUserId })
      .eq('id', requestId)
      .eq('status', 'PENDING')
      .select('id, email, full_name, mobile, status, created_at, reviewed_at')
      .maybeSingle();
    setReviewingSignupId(null);
    if (error) {
      setSignupRequestsError(`दर्ता अनुरोध अद्यावधिक भएन। ${error.message}`);
      return;
    }
    if (!data) {
      setSignupRequestsError('अनुरोध पहिले नै समीक्षा गरिएको हुन सक्छ। सूची पुनःलोड गर्नुहोस्।');
      await loadSignupRequests();
      return;
    }
    setSignupRequests((requests) => requests.map((request) => request.id === requestId ? data as SignupRequest : request));
  };

  // Add Circular
  const handlePublishCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    db.addCircular({
      titleNe: newTitle,
      issuingAuthority: newAuthority,
      circularNo: newCircularNo || 'प.सं. ०८१/८२',
      issuedDateBs: newDateBs,
      subjectCategory: newCategory,
      priority: newPriority,
      summaryNe: newSummary,
    });

    db.logAudit({
      userId: user?.id,
      userName: user?.fullName || 'प्रशासक',
      action: 'CIRCULAR_PUBLISH',
      entityType: 'CIRCULAR',
      details: `नयाँ सरकारी परिपत्र प्रकाशित गरियो: ${newTitle}`,
    });

    setCirculars([...db.getCirculars()]);
    setAuditLogs([...db.getAuditLogs()]);
    setNewTitle('');
    setNewSummary('');
    setNewCircularNo('');
    setCircularPublished(true);
    setTimeout(() => setCircularPublished(false), 2500);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredCloudUsers = cloudUsers.filter((cloudUser) =>
    cloudUser.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    cloudUser.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingCount = verifications.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#173B63] dark:text-blue-400 uppercase tracking-wider">
              System Administration Console
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">प्रणाली प्रशासक कक्ष</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            NCSDH प्रशासनिक ड्यासबोर्ड (Admin Portal)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            कर्मचारी प्रमाणीकरण, प्रयोगकर्ता व्यवस्थापन, परिपत्र प्रकाशन तथा अडिट लग नियन्त्रण
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            PostgreSQL Database Active
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs">दर्ता प्रयोगकर्ता</span>
            <Users className="w-4 h-4 text-[#173B63]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {usersList.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">सक्रिय खाताहरू</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs">प्रमाणीकरण पर्खाइमा</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">
            {pendingCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">रुजु गर्न बाँकी आवेदन</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs">सक्रिय सरकारी परिपत्र</span>
            <BellRing className="w-4 h-4 text-[#0F766E]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {circulars.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">मन्त्रालय सूचनाहरू</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs">अडिट लग प्रविष्टिहरू</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {auditLogs.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">सुरक्षा अडिट लगहरू</span>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 overflow-x-auto bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            कर्मचारी प्रमाणीकरण अनुमोदन
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('signupRequests')}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'signupRequests'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            नयाँ खाता अनुरोध ({signupRequests.filter((request) => request.status === 'PENDING').length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            प्रयोगकर्ता तथा भूमिका व्यवस्थापन ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('circulars')}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'circulars'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BellRing className="w-4 h-4" />
            परिपत्र तथा सूचना प्रकाशन
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 text-xs font-semibold border-b-2 mr-6 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            सुरक्षा अडिट लगहरू (Audit Trail)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: EMPLOYEE VERIFICATIONS */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    निजामती कर्मचारी प्रमाणीकरण आवेदन सूची
                  </h3>
                  <p className="text-xs text-slate-500">
                    कर्मचारी सङ्केत नम्बर (PIS) र नियुक्ति विवरण रुजु गरी स्वीकृत वा अस्वीकृत गर्नुहोस्।
                  </p>
                </div>
              </div>

              {verifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  हाल कुनै प्रमाणीकरण आवेदन उपलब्ध छैन।
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-3">आवेदकको नाम / ईमेल</th>
                        <th className="p-3">सङ्केत नं (PIS)</th>
                        <th className="p-3">लोक सेवा रोल नं</th>
                        <th className="p-3">नियुक्ति मिति</th>
                        <th className="p-3">स्थिति (Status)</th>
                        <th className="p-3 text-right">कार्य (Action)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {verifications.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {v.userName}
                            </span>
                            <span className="text-slate-500 text-[11px]">{v.userEmail}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#173B63] dark:text-blue-400">
                            {v.sanketNo}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {v.pscRollNo || '—'}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {v.appointmentDateBs}
                          </td>
                          <td className="p-3">
                            {v.status === 'APPROVED' && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                स्वीकृत (Approved)
                              </span>
                            )}
                            {v.status === 'REJECTED' && (
                              <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                अस्वीकृत (Rejected)
                              </span>
                            )}
                            {v.status === 'PENDING' && (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                विचाराधीन (Pending)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {v.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveVerification(v.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> स्वीकृत
                                </button>
                                <button
                                  onClick={() => handleRejectVerification(v.id)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> अस्वीकृत
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">सम्पन्न</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'signupRequests' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Supabase बाट आएका नयाँ खाता दर्ता अनुरोध</h3>
                  <p className="mt-1 text-xs text-slate-500">यो सूची Auth user creation trigger बाट भरिन्छ; ईमेल पुष्टि भएपछि मात्र प्रयोगकर्ताले login गर्न सक्छन्।</p>
                </div>
                <button onClick={() => void loadSignupRequests()} disabled={signupRequestsLoading} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  {signupRequestsLoading ? 'लोड हुँदैछ…' : 'सूची पुनःलोड'}
                </button>
              </div>

              {!isSupabaseConfigured && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Supabase URL/key सेट नभएकाले cloud अनुरोध उपलब्ध छैन।</p>}
              {isSupabaseConfigured && !cloudAuthUserId && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">दर्ता अनुरोध समीक्षा गर्न Supabase Auth प्रशासकको रूपमा फेरि login गर्नुहोस्।</p>}
              {signupRequestsError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{signupRequestsError}</p>}

              {cloudAuthUserId && (signupRequestsLoading ? (
                <p className="py-8 text-center text-xs text-slate-500">दर्ता अनुरोध लोड हुँदैछन्…</p>
              ) : signupRequests.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 dark:border-slate-700">अहिले कुनै दर्ता अनुरोध छैन। Migration 004 ले पहिले बनेका Auth खाताहरू पनि थप्छ।</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="p-3">पूरा नाम</th>
                        <th className="p-3">ईमेल / मोबाइल</th>
                        <th className="p-3">अनुरोध मिति</th>
                        <th className="p-3">स्थिति</th>
                        <th className="p-3 text-right">कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {signupRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{request.full_name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            <span className="block">{request.email}</span>
                            <span className="text-[11px] text-slate-400">{request.mobile || '—'}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(request.created_at).toLocaleString('ne-NP')}</td>
                          <td className="p-3">
                            <span className={`rounded border px-2 py-1 font-semibold ${
                              request.status === 'PENDING'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : request.status === 'APPROVED'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-red-200 bg-red-50 text-red-700'
                            }`}>
                              {request.status === 'PENDING' ? 'विचाराधीन' : request.status === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {request.status === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => void handleReviewSignup(request.id, 'APPROVED')} disabled={reviewingSignupId === request.id} className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                  <Check className="h-3 w-3" /> स्वीकृत
                                </button>
                                <button onClick={() => void handleReviewSignup(request.id, 'REJECTED')} disabled={reviewingSignupId === request.id} className="flex items-center gap-1 rounded bg-red-600 px-2.5 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                  <X className="h-3 w-3" /> अस्वीकृत
                                </button>
                              </div>
                            ) : <span className="text-slate-400">समीक्षा सम्पन्न</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="नाम वा ईमेल खोज्नुहोस्..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  कुल {cloudAuthUserId ? filteredCloudUsers.length : filteredUsers.length} प्रयोगकर्ता खाता
                </span>
                {cloudAuthUserId && (
                  <button onClick={() => void loadCloudUsers()} disabled={cloudUsersLoading} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    {cloudUsersLoading ? 'लोड हुँदैछ…' : 'पुनःलोड'}
                  </button>
                )}
              </div>

              {cloudAuthUserId ? (
                <>
                  <p className="text-[11px] text-slate-500">
                    Supabase Auth का वास्तविक खाता। भूमिका/स्थिति परिवर्तन server-side service key र admin claim बाट सुरक्षित गरिन्छ। भूमिका परिवर्तनपछि सम्बन्धित प्रयोगकर्ताले पुनः login गर्नुपर्छ।
                  </p>
                  {cloudUsersError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{cloudUsersError}</p>}
                  {cloudUsersLoading ? (
                    <p className="py-8 text-center text-xs text-slate-500">Supabase хэрэглэгчид ачааллаж байна…</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full min-w-[780px] text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <tr>
                            <th className="p-3">पूरा नाम</th>
                            <th className="p-3">ईमेल / सम्पर्क</th>
                            <th className="p-3">दर्ता / ईमेल</th>
                            <th className="p-3">भूमिका</th>
                            <th className="p-3">खाता स्थिति</th>
                            <th className="p-3 text-right">व्यवस्थापन</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {filteredCloudUsers.map((cloudUser) => {
                            const isSelf = cloudUser.id === cloudAuthUserId;
                            const isUpdating = updatingCloudUserId === cloudUser.id;
                            return (
                              <tr key={cloudUser.id}>
                                <td className="p-3 font-semibold text-slate-900 dark:text-white">{cloudUser.fullName}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400">
                                  <span className="block">{cloudUser.email}</span>
                                  <span className="text-[11px] text-slate-400">{cloudUser.mobile || '—'}</span>
                                </td>
                                <td className="p-3 text-slate-500">
                                  <span className="block">{new Date(cloudUser.createdAt).toLocaleDateString('ne-NP')}</span>
                                  <span className={cloudUser.emailConfirmed ? 'text-emerald-700' : 'text-amber-700'}>
                                    {cloudUser.emailConfirmed ? 'ईमेल पुष्टि भयो' : 'ईमेल पुष्टि बाँकी'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <select
                                    value={cloudUser.role}
                                    disabled={isSelf || isUpdating}
                                    onChange={(event) => void updateCloudUser(cloudUser, { role: event.target.value })}
                                    aria-label={`${cloudUser.email} को भूमिका`}
                                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
                                  >
                                    <option value="registered_user">registered_user</option>
                                    <option value="verified_employee">verified_employee</option>
                                    <option value="content_contributor">content_contributor</option>
                                    <option value="content_editor">content_editor</option>
                                    <option value="admin">admin</option>
                                    <option value="super_admin">super_admin</option>
                                    <option value="super_admin">super_admin</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <span className={cloudUser.isActive ? 'text-emerald-700' : 'text-red-700'}>
                                    {cloudUser.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    disabled={isSelf || isUpdating}
                                    onClick={() => void updateCloudUser(cloudUser, { isActive: !cloudUser.isActive })}
                                    className={`rounded px-2.5 py-1.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                      cloudUser.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                  >
                                    {isUpdating ? 'सुरक्षित हुँदैछ…' : cloudUser.isActive ? 'निष्क्रिय गर्नुहोस्' : 'सक्रिय गर्नुहोस्'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredCloudUsers.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">खाता भेटिएन।</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isSupabaseConfigured && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">वास्तविक Supabase Auth प्रयोगकर्ताहरू हेर्न Auth प्रशासकको रूपमा login गर्नुहोस्।</p>}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">पूरा नाम</th>
                      <th className="p-3">ईमेल / सम्पर्क</th>
                      <th className="p-3">कर्मचारी स्तर</th>
                      <th className="p-3">प्रणाली भूमिका (Role)</th>
                      <th className="p-3 text-right">भूमिका परिवर्तन</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          <div>{u.email}</div>
                          <div className="text-[11px] text-slate-400">{u.mobile}</div>
                        </td>
                        <td className="p-3">
                          {u.isVerifiedEmployee ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              प्रमाणित
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              दर्ता मात्र
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {u.role}
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                          >
                            <option value="registered_user">registered_user</option>
                            <option value="verified_employee">verified_employee</option>
                            <option value="content_editor">content_editor</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: CIRCULAR PUBLISHING */}
          {activeTab === 'circulars' && (
            <div className="space-y-6">
              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#173B63]" />
                  नयाँ सरकारी परिपत्र तथा सूचना प्रकाशन फाराम
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  सबै निजामती कर्मचारीलाई सार्वजनिक ड्यासबोर्डमा देखाउन परिपत्र प्रविष्ट गर्नुहोस्।
                </p>

                {circularPublished && (
                  <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>परिपत्र सफलता पूर्वक प्रकाशित भयो!</span>
                  </div>
                )}

                <form onSubmit={handlePublishCircular} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        परिपत्रको विषय (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: कर्मचारी वैयक्तिक विवरण अद्यावधिक गर्ने सम्बन्धमा"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        जारी गर्ने निकाय (Issuing Authority)
                      </label>
                      <input
                        type="text"
                        value={newAuthority}
                        onChange={(e) => setNewAuthority(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        परिपत्र वा चलानी नम्बर
                      </label>
                      <input
                        type="text"
                        placeholder="स.मा.सा.प्र./०८१-१२"
                        value={newCircularNo}
                        onChange={(e) => setNewCircularNo(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          जारी मिति (वि.सं.)
                        </label>
                        <input
                          type="text"
                          value={newDateBs}
                          onChange={(e) => setNewDateBs(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          प्राथमिकता
                        </label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value as any)}
                          className="w-full px-2 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        >
                          <option value="NORMAL">सामान्य (Normal)</option>
                          <option value="URGENT">जरुरी (Urgent)</option>
                          <option value="VERY_URGENT">अति जरुरी (Very Urgent)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      परिपत्रको संक्षिप्त व्यहोरा तथा निर्देशन (Summary) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="कर्मचारीहरूलाई पालना गर्नुपर्ने मुख्य निर्देशन व्यहोरा..."
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      परिपत्र तुरुन्त प्रकाशित गर्नुहोस्
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Circulars List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  हाल प्रकाशित परिपत्रहरू ({circulars.length})
                </h4>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {circulars.map((c) => (
                    <div key={c.id} className="p-4 bg-white dark:bg-slate-900 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-[#173B63] dark:text-blue-400">
                            {c.issuingAuthority}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{c.issuedDateBs}</span>
                          <span aria-hidden="true">·</span>
                          <span>{c.circularNo}</span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.titleNe}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {c.summaryNe}
                        </p>
                      </div>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        सक्रिय
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    प्रणाली सुरक्षा तथा प्रशासनिक अडिट लग (Audit Trail)
                  </h3>
                  <p className="text-xs text-slate-500">
                    लगइन, प्रमाणीकरण निर्णय, प्रोफाइल सम्पादन र परिपत्र प्रकाशनको टाइमस्ट्याम्प अभिलेख
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                    <tr>
                      <th className="p-3">समय (Timestamp)</th>
                      <th className="p-3">प्रयोगकर्ता</th>
                      <th className="p-3">कार्य (Action)</th>
                      <th className="p-3">इकाइ (Entity)</th>
                      <th className="p-3">विस्तृत विवरण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('ne-NP')}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {log.userName}
                        </td>
                        <td className="p-3 text-[#173B63] dark:text-blue-400 font-bold">
                          {log.action}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {log.entityType}
                        </td>
                        <td className="p-3 font-sans text-slate-700 dark:text-slate-300">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
