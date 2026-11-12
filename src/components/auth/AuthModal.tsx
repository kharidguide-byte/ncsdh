import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { X, Lock, Mail, User, Phone, Building, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { login, register, resetPassword, updatePassword, switchDemoRole, isPasswordRecovery } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [serviceTier, setServiceTier] = useState('सङ्घीय');
  const [serviceName, setServiceName] = useState('नेपाल प्रशासन सेवा');
  const [groupName, setGroupName] = useState('सामान्य प्रशासन');
  const [currentLevel, setCurrentLevel] = useState('शाखा अधिकृत / सातौं तह');
  const [currentOffice, setCurrentOffice] = useState('');
  const [regError, setRegError] = useState('');
  const [regNotice, setRegNotice] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateError, setPasswordUpdateError] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('कृपया ईमेल र पासवर्ड दुवै प्रविष्ट गर्नुहोस्।');
      return;
    }
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) onClose();
      else setLoginError(res.message || 'लगइन असफल भयो।');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'लगइन असफल भयो।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegNotice('');
    if (!fullName || !regEmail || !mobile || !regPassword) {
      setRegError('कृपया सबै अनिवार्य विवरणहरू प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName,
        email: regEmail,
        mobile,
        password: regPassword,
        serviceTier,
        serviceName,
        groupName,
        currentLevel,
        currentOffice: currentOffice || 'नेपाल सरकार कार्यालय',
      });
      if (res.success && res.message) {
        setRegNotice(res.message);
      } else if (res.success) {
        onClose();
      } else {
        setRegError(res.message || 'दर्ता असफल भयो।');
      }
    } catch (error) {
      setRegError(error instanceof Error ? error.message : 'दर्ता असफल भयो।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (role: 'admin' | 'verified_employee' | 'registered_user') => {
    await switchDemoRole(role);
    onClose();
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordUpdateError('');
    if (newPassword.length < 6) {
      setPasswordUpdateError('पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateError('दुवै पासवर्ड मिलेनन्।');
      return;
    }
    setLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.success) setPasswordUpdated(true);
      else setPasswordUpdateError(result.message || 'पासवर्ड परिवर्तन गर्न सकिएन।');
    } catch (error) {
      setPasswordUpdateError(error instanceof Error ? error.message : 'पासवर्ड परिवर्तन गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#173B63] text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                NCSDH सुरक्षित पहुँच प्रणाली (Single Login)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                नेपाल निजामती कर्मचारी डिजिटल प्लेटफर्म
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

        {!isPasswordRecovery && !passwordUpdated && <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              setTab('login');
              setLoginError('');
            }}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
              tab === 'login'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            प्रयोगकर्ता लगइन (Login)
          </button>
          <button
            onClick={() => {
              setTab('register');
              setRegError('');
            }}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            नयाँ खाता दर्ता (Register)
          </button>
        </div>}

        {/* Body */}
        <div className="p-6">
          {passwordUpdated ? (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-800 dark:text-white">पासवर्ड परिवर्तन भयो। अब नयाँ पासवर्डबाट लगइन गर्न सक्नुहुन्छ।</p>
                <button onClick={() => { setPasswordUpdated(false); onClose(); }} className="rounded-lg bg-[#173B63] px-4 py-2 text-xs font-semibold text-white">बन्द गर्नुहोस्</button>
              </div>
          ) : isPasswordRecovery ? (
              <form onSubmit={(event) => void handlePasswordUpdate(event)} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">नयाँ पासवर्ड राख्नुहोस्</h3>
                <input type="password" required minLength={6} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="नयाँ पासवर्ड (कम्तीमा ६ अक्षर)" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                <input type="password" required minLength={6} autoComplete="new-password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} placeholder="नयाँ पासवर्ड फेरि लेख्नुहोस्" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                {passwordUpdateError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{passwordUpdateError}</p>}
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#173B63] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{loading ? 'सुरक्षित हुँदैछ…' : 'नयाँ पासवर्ड सुरक्षित गर्नुहोस्'}</button>
              </form>
          ) : tab === 'login' && (
            <div className="space-y-4">
              {/* Demo roles only control the local interface, not Supabase file access. */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  परीक्षणका लागि Demo भूमिका (कागजात भण्डारण पहुँच हुँदैन):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('admin')}
                    className="p-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#173B63] text-slate-800 dark:text-slate-200 text-center transition-colors"
                  >
                    <span className="block font-bold text-[#173B63] dark:text-blue-400">प्रशासक</span>
                    <span className="text-[10px] text-slate-500">Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('verified_employee')}
                    className="p-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F766E] text-slate-800 dark:text-slate-200 text-center transition-colors"
                  >
                    <span className="block font-bold text-[#0F766E] dark:text-teal-400">प्रमाणित कर्मचारी</span>
                    <span className="text-[10px] text-slate-500">Verified Officer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('registered_user')}
                    className="p-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 text-center transition-colors"
                  >
                    <span className="block font-bold text-slate-700 dark:text-slate-300">दर्ता प्रयोगकर्ता</span>
                    <span className="text-[10px] text-slate-500">Regular User</span>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ईमेल ठेगाना (Email Address)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      पासवर्ड (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-xs text-[#3478B9] hover:underline"
                    >
                      पासवर्ड बिर्सनुभयो?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] transition-colors"
                >
                  {loading ? 'प्रमाणीकरण हुँदैछ...' : 'लगइन गर्नुहोस्'}
                </button>
              </form>
            </div>
          )}

          {tab === 'register' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  <strong>महत्त्वपूर्ण:</strong> साधारण खाता दर्ता गर्दैमा प्रयोगकर्ता प्रमाणित निजामती कर्मचारी मानिने छैन। सेवा विवरण प्रमाणित गर्न प्रोफाइलबाट परिचयपत्र तथा PIS सङ्केत नं पेश गर्नुपर्नेछ।
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700">
                  {regError}
                </div>
              )}
              {regNotice && (
                <div role="status" className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200">
                  {regNotice}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पूरा नाम (Full Name) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="उदा: हरि प्रसाद दाहाल"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ईमेल ठेगाना *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      मोबाइल नम्बर *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98xxxxxxxx"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पासवर्ड सिर्जना गर्नुहोस् *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="कम्तिमा ६ अक्षर"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                {/* Optional Civil Service details */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-slate-500 mb-2">
                    सेवा विवरण (वैकल्पिक - पछि पनि भर्न सकिने):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                        कार्यरत तह
                      </label>
                      <select
                        value={serviceTier}
                        onChange={(e) => setServiceTier(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="सङ्घीय">सङ्घीय तह</option>
                        <option value="प्रदेश">प्रदेश तह</option>
                        <option value="स्थानीय तह">स्थानीय तह</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                        सेवा तथा समूह
                      </label>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      हाल कार्यरत कार्यालय
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: भूमि सुधार तथा मालपोत कार्यालय, कलंकी"
                      value={currentOffice}
                      onChange={(e) => setCurrentOffice(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#173B63] rounded-lg hover:bg-[#122e4e] transition-colors mt-2"
                >
                  {loading ? 'खाता तयार हुँदैछ...' : 'नयाँ खाता दर्ता गर्नुहोस्'}
                </button>
              </form>
            </div>
          )}

          {tab === 'forgot' && (
            <div className="space-y-4">
              {forgotSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    पासवर्ड रिसेट निर्देशन पठाइयो
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    {forgotEmail} मा पासवर्ड रिसेट लिङ्क पठाइएको छ। कृपया आफ्नो इनबक्स जाँच गर्नुहोस्।
                  </p>
                  <button
                    onClick={() => setTab('login')}
                    className="mt-3 px-4 py-2 text-xs font-semibold bg-[#173B63] text-white rounded-lg"
                  >
                    लगइनमा फर्कनुहोस्
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!forgotEmail) return;
                    setForgotError('');
                    setLoading(true);
                    void (async () => {
                      try {
                        const result = await resetPassword(forgotEmail);
                        if (result.success) setForgotSubmitted(true);
                        else setForgotError(result.message || 'पासवर्ड रिसेट ईमेल पठाउन सकिएन।');
                      } catch (error) {
                        setForgotError(error instanceof Error ? error.message : 'पासवर्ड रिसेट ईमेल पठाउन सकिएन।');
                      } finally {
                        setLoading(false);
                      }
                    })();
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    तपाईंको दर्ता भएको ईमेल ठेगाना प्रविष्ट गर्नुहोस्। हामी तपाईंलाई पासवर्ड रिसेट लिङ्क पठाउनेछौं।
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ईमेल ठेगाना
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@ncsdh.gov.np"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  {forgotError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{forgotError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 rounded-lg"
                    >
                      रद्द गर्नुहोस्
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 text-xs font-semibold text-white bg-[#173B63] rounded-lg disabled:opacity-60"
                    >
                      {loading ? 'पठाउँदैछ…' : 'रिसेट लिङ्क पठाउनुहोस्'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
