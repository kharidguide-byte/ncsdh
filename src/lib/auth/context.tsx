import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserRole, NotificationItem } from '../../types';
import { db } from '../supabase/client';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
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
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
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

  // Load initial session
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

      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        const foundUser = db.getUserById(savedUserId);
        if (foundUser) {
          setCurrentUser(foundUser);
          const prof = db.getProfileByUserId(foundUser.id);
          setUserProfile(prof);
          return;
        }
      }
      // Default to guest (not logged in) on first load or maintain guest session
    } catch (e) {
      console.error('Session restore failed:', e);
    }
  }, []);

  const login = async (email: string, _pass: string) => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'उक्त ईमेल ठेगाना फेला परेन। कृपया सही ईमेल प्रविष्ट गर्नुहोस्।' };
    }
    if (!user.isActive) {
      return { success: false, message: 'तपाईंको खाता निष्क्रिय छ। कृपया प्रशासकसँग सम्पर्क गर्नुहोस्।' };
    }

    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    const prof = db.getProfileByUserId(user.id);
    setUserProfile(prof);

    db.logAudit({
      userId: user.id,
      userName: user.fullName,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `${user.fullName} ले सफल लगइन गर्नुभयो।`,
    });

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
    const existing = db.getUserByEmail(data.email);
    if (existing) {
      return { success: false, message: 'यो ईमेल ठेगाना पहिले नै दर्ता भइसकेको छ।' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      mobile: data.mobile,
      role: 'registered_user',
      isActive: true,
      isVerifiedEmployee: false,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Create Profile
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      userId: newUser.id,
      citizenshipNo: 'जारी हुन बाँकी',
      dobBs: '२०५०/०१/०१',
      dobAd: '1993-04-14',
      serviceTier: (data.serviceTier as any) || 'सङ्घीय',
      serviceName: data.serviceName || 'नेपाल प्रशासन सेवा',
      groupName: data.groupName || 'सामान्य प्रशासन',
      currentLevel: data.currentLevel || 'सहायक स्तर / अधिकृत स्तर',
      rankType: 'राजपत्राङ्कित',
      currentOffice: data.currentOffice || 'नेपाल सरकार कार्यालय',
      district: 'काठमाडौँ',
      province: 'बागमती प्रदेश',
      appointmentDateBs: '२०८०/०१/०१',
      isOfficialSynced: false,
      dataSourceDisclaimer: 'User Provided Information - सरकारी प्रणालीसँग प्रमाणीकरण हुन बाँकी',
      leaveBalance: { homeLeave: 12, sickLeave: 6, casualLeave: 4, festivalLeave: 2 },
    };

    db.saveProfile(newProfile);

    // Auto login
    setCurrentUser(newUser);
    setUserProfile(newProfile);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);

    return { success: true };
  };

  const logout = () => {
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
  };

  // Instant demo switcher for evaluation across the 3 essential roles
  const switchDemoRole = (role: UserRole) => {
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
        isVerifiedEmployee,
        isAdmin,
        login,
        register,
        logout,
        switchDemoRole,
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
