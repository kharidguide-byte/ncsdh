import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { db } from '../../lib/supabase/client';
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

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'circulars' | 'audit' | 'database'>(
    'verifications'
  );

  // Live state from DB
  const [verifications, setVerifications] = useState<EmployeeVerification[]>(db.getVerifications());
  const [usersList, setUsersList] = useState<User[]>(db.getUsers());
  const [circulars, setCirculars] = useState<GovernmentCircular[]>(db.getCirculars());
  const [auditLogs, setAuditLogs] = useState(db.getAuditLogs());

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
                  कुल {filteredUsers.length} प्रयोगकर्ता खाता
                </span>
              </div>

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
