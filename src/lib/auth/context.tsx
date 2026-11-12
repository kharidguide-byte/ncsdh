import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserRole, NotificationItem } from '../../types';
import { db, isSupabaseConfigured, supabase } from '../supabase/client';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  cloudAuthUserId: string | null;
  isPasswordRecovery: boolean;
  isVerifiedEmployee: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    serviceTier?: string;
    serviceName?: string;
    groupName?: string;
    currentLevel?: string;
    currentOffice?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  submitVerification: (sanketNo: string, pscRollNo: string, appointmentDateBs: string) => boolean;
  updateProfile: (updates: Partial<UserProfile>) => boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  activeLanguage: 'ne' | 'en';
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ncsdh_current_user_id';
const LANG_KEY = 'ncsdh_active_lang';
const THEME_KEY = 'ncsdh_active_theme';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cloudAuthUserId, setCloudAuthUserId] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'user-admin-001',
      title: 'स्वागत छ - NCSDH पोर्टल',
      message: 'नेपाल निजामती कर्मचारी डिजिटल हबमा तपाईंलाई हार्दिक स्वागत छ।',
      type: 'INFO',
      isRead: false,
      createdAt: '२०८१/०७/०१',
    },
    {
      id: 'notif-2',
      userId: 'user-admin-001',
      title: 'तलबमान २०८१/८२ अद्यावधिक',
      message: 'नयाँ आर्थिक वर्ष २०८१/८२ को तलबमान तथा कर गणना प्रणाली सक्रिय गरिएको छ।',
      type: 'LEGAL',
      isRead: false,
      createdAt: '२०८१/०६/२८',
    },
  ]);
  const [activeLanguage, setActiveLanguage] = useState<'ne' | 'en'>('ne');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applySupabaseUser = (authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    created_at?: string;
  }) => {
    if (!authUser.email) {
      console.error('Supabase Auth user has no email address.');
      return;
    }

    const metadata = authUser.user_metadata || {};
    const serviceTier = metadata.service_tier === 'प्रदेश' || metadata.service_tier === 'स्थानीय तह'
      ? metadata.service_tier
      : 'सङ्घीय';
    const user: User = {
      id: authUser.id,
      email: authUser.email,
      fullName:
        (typeof metadata.full_name === 'string' && metadata.full_name) ||
        authUser.email.split('@')[0],
      mobile: typeof metadata.mobile === 'string' ? metadata.mobile : '',
      role: 'registered_user',
      isActive: true,
      isVerifiedEmployee: false,
      createdAt: authUser.created_at || new Date().toISOString(),
    };

    if (db.getUserById(user.id)) db.updateUser(user.id, user);
    else db.createUser(user);

    let profile = db.getProfileByUserId(user.id);
    if (!profile) {
      profile = {
        id: `prof-${user.id}`,
        userId: user.id,
        citizenshipNo: '',
        dobBs: '',
        dobAd: '',
        serviceTier,
        serviceName: typeof metadata.service_name === 'string' ? metadata.service_name : 'नेपाल प्रशासन सेवा',
        groupName: typeof metadata.group_name === 'string' ? metadata.group_name : 'सामान्य प्रशासन',
        currentLevel: typeof metadata.current_level === 'string' ? metadata.current_level : 'पद विवरण भर्न बाँकी',
        rankType: 'राजपत्राङ्कित',
        currentOffice: typeof metadata.current_office === 'string' ? metadata.current_office : 'नेपाल सरकार कार्यालय',
        district: '',
        province: '',
        appointmentDateBs: '',
        isOfficialSynced: false,
        dataSourceDisclaimer: 'प्रयोगकर्ताले उपलब्ध गराएको विवरण - सरकारी प्रणालीसँग प्रमाणीकरण हुन बाँकी',
        leaveBalance: { homeLeave: 0, sickLeave: 0, casualLeave: 0, festivalLeave: 0 },
      };
      db.saveProfile(profile);
    }

    localStorage.setItem(CURRENT_USER_KEY, user.id);
    setCurrentUser(user);
    setUserProfile(profile);
    setCloudAuthUserId(authUser.id);
  };

  const restoreDemoSession = () => {
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!savedUserId) return;
    const foundUser = db.getUserById(savedUserId);
    if (!foundUser) return;
    setCurrentUser(foundUser);
    setUserProfile(db.getProfileByUserId(foundUser.id));
    setCloudAuthUserId(null);
  };

  // Restore Supabase identity first; local demo roles never grant cloud file access.
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY) as 'ne' | 'en';
      if (savedLang) setActiveLanguage(savedLang);

      const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }

      if (!supabase) {
        restoreDemoSession();
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          applySupabaseUser(session.user);
        }
        if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem(CURRENT_USER_KEY);
          setCurrentUser(null);
          setUserProfile(null);
          setCloudAuthUserId(null);
          setIsPasswordRecovery(false);
        }
      });

      void supabase.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        if (data.session?.user) applySupabaseUser(data.session.user);
        else restoreDemoSession();
      }).catch((error: unknown) => {
        console.error('Supabase session restore failed:', error);
      });

      return () => authListener.subscription.unsubscribe();
    } catch (e) {
      console.error('Session restore failed:', e);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: '.env मा VITE_SUPABASE_URL र VITE_SUPABASE_ANON_KEY राखेर एप पुनः सुरु गर्नुहोस्। Demo भूमिकाले वास्तविक login वा निजी कागजात पहुँच दिँदैन।' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: `लगइन असफल भयो। ${error.message}` };
    if (!data.user) return { success: false, message: 'Supabase बाट प्रयोगकर्ता सत्र प्राप्त भएन।' };

    applySupabaseUser(data.user);

    db.logAudit({
      userId: data.user.id,
      userName: typeof data.user.user_metadata.full_name === 'string'
        ? data.user.user_metadata.full_name
        : data.user.email || 'प्रयोगकर्ता',
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: data.user.id,
      details: 'Supabase Auth मार्फत सफल लगइन।',
    });

    return { success: true };
  };

  const updatePassword = async (password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase जडान उपलब्ध छैन।' };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, message: `पासवर्ड परिवर्तन गर्न सकिएन। ${error.message}` };
    setIsPasswordRecovery(false);
    return { success: true };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    serviceTier?: string;
    serviceName?: string;
    groupName?: string;
    currentLevel?: string;
    currentOffice?: string;
  }) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: '.env मा VITE_SUPABASE_URL र VITE_SUPABASE_ANON_KEY राखेर एप पुनः सुरु गर्नुहोस्। वास्तविक Supabase Auth बिना खाता दर्ता वा कागजात सुरक्षित गर्न सकिँदैन।' };
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          mobile: data.mobile,
          service_tier: data.serviceTier || 'सङ्घीय',
          service_name: data.serviceName || 'नेपाल प्रशासन सेवा',
          group_name: data.groupName || 'सामान्य प्रशासन',
          current_level: data.currentLevel || 'सहायक स्तर / अधिकृत स्तर',
          current_office: data.currentOffice || 'नेपाल सरकार कार्यालय',
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, message: `दर्ता असफल भयो। ${error.message}` };
    if (authData.session && authData.user) applySupabaseUser(authData.user);
    if (!authData.session) {
      return {
        success: true,
        message: 'दर्ता सफल भयो। लगइन गर्नुअघि आफ्नो ईमेलमा आएको verification link खोल्नुहोस्।',
      };
    }
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: '.env मा Supabase URL र anon key राखेर एप पुनः सुरु गर्नुहोस्।' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { success: false, message: `रिसेट ईमेल पठाउन सकिएन। ${error.message}` };
    return { success: true };
  };

  const logout = async () => {
    if (cloudAuthUserId && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        window.alert(`लगआउट असफल भयो। ${error.message}`);
        return;
      }
    }
    if (currentUser) {
      db.logAudit({
        userId: currentUser.id,
        userName: currentUser.fullName,
        action: 'LOGOUT',
        entityType: 'AUTH',
        entityId: currentUser.id,
        details: `${currentUser.fullName} ले लगआउट गर्नुभयो।`,
      });
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setCloudAuthUserId(null);
  };

  // Instant demo switcher for evaluation across the 3 essential roles
  const switchDemoRole = async (role: UserRole) => {
    if (cloudAuthUserId && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        window.alert(`Demo भूमिका परिवर्तन गर्नुअघि लगआउट असफल भयो। ${error.message}`);
        return;
      }
    }
    setCloudAuthUserId(null);
    if (role === 'admin') {
      const admin = db.getUserById('user-admin-001');
      if (admin) {
        setCurrentUser(admin);
        localStorage.setItem(CURRENT_USER_KEY, admin.id);
        setUserProfile(db.getProfileByUserId(admin.id));
      }
    } else if (role === 'verified_employee') {
      const officer = db.getUserById('user-officer-002');
      if (officer) {
        setCurrentUser(officer);
        localStorage.setItem(CURRENT_USER_KEY, officer.id);
        setUserProfile(db.getProfileByUserId(officer.id));
      }
    } else if (role === 'registered_user') {
      const citizen = db.getUserById('user-citizen-003');
      if (citizen) {
        setCurrentUser(citizen);
        localStorage.setItem(CURRENT_USER_KEY, citizen.id);
        setUserProfile(db.getProfileByUserId(citizen.id));
      }
    } else {
      logout();
    }
  };

  const submitVerification = (sanketNo: string, pscRollNo: string, appointmentDateBs: string) => {
    if (!currentUser) return false;
    db.submitVerification({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      sanketNo,
      pscRollNo,
      appointmentDateBs,
    });
    // Add local notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'प्रमाणीकरण आवेदन पेश भयो',
        message: `कर्मचारी सङ्केत नं ${sanketNo} प्रमाणीकरणका लागि प्रशासक समक्ष पठाइएको छ।`,
        type: 'VERIFICATION',
        isRead: false,
        createdAt: 'भर्खरै',
      },
      ...prev,
    ]);
    return true;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return false;
    const updated = { ...userProfile, ...updates };
    db.saveProfile(updated);
    setUserProfile(updated);
    return true;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const toggleLanguage = () => {
    const next = activeLanguage === 'ne' ? 'en' : 'ne';
    setActiveLanguage(next);
    localStorage.setItem(LANG_KEY, next);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const role: UserRole = currentUser?.role || 'guest';
  const isAuthenticated = Boolean(currentUser);
  const isVerifiedEmployee = Boolean(currentUser?.isVerifiedEmployee);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        profile: userProfile,
        role,
        isAuthenticated,
        cloudAuthUserId,
        isPasswordRecovery,
        isVerifiedEmployee,
        isAdmin,
        login,
        register,
        logout,
        switchDemoRole,
        resetPassword,
        updatePassword,
        submitVerification,
        updateProfile,
        notifications,
        unreadCount,
        markNotificationRead,
        activeLanguage,
        toggleLanguage,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
