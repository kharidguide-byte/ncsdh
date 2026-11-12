import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChevronDown,
  Database,
  FileText,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  UserRound,
  X,
  Blocks,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/context';

type View = 'home' | 'dashboard' | 'profile' | 'admin' | 'legal' | 'drafting' | 'employee' | 'modules';

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onOpenDatabase: () => void;
  onOpenSalaryCalc: () => void;
  onOpenLawSearch: () => void;
  onOpenDateConverter: () => void;
}

interface PanelProps extends Props {
  onClose: () => void;
}

const SidebarPanel: React.FC<PanelProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenDatabase,
  onOpenSalaryCalc,
  onOpenLawSearch,
  onOpenDateConverter,
  onClose,
}) => {
  const {
    user,
    role,
    isAuthenticated,
    isAdmin,
    logout,
    notifications,
    unreadCount,
    markNotificationRead,
    theme,
    toggleTheme,
    switchDemoRole,
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navigate = (view: View) => {
    onNavigate(view);
    onClose();
  };

  const navClass = (view: View) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
      currentView === view
        ? 'bg-blue-50 text-[#173B63] dark:bg-blue-950/50 dark:text-blue-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <aside className="relative flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <button onClick={() => navigate('home')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173B63] text-lg text-white shadow-sm">
            🇳🇵
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              NCSDH <span className="font-semibold text-[#3478B9] dark:text-blue-400">निजामती हब</span>
            </span>
            <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
              नेपाल निजामती कर्मचारी डिजिटल प्लेटफर्म
            </span>
          </span>
        </button>
        <button
          onClick={onClose}
          aria-label="मेनु बन्द गर्नुहोस्"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="मुख्य नेभिगेसन" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          मुख्य मेनु
        </p>
        <button onClick={() => navigate('home')} className={navClass('home')}>
          <Home className="h-4 w-4 shrink-0" /> गृहपृष्ठ
        </button>
        <button onClick={() => navigate('dashboard')} className={navClass('dashboard')}>
          <LayoutDashboard className="h-4 w-4 shrink-0" /> ड्यासबोर्ड
        </button>
        <button onClick={() => navigate('employee')} className={navClass('employee')}>
          <BriefcaseBusiness className="h-4 w-4 shrink-0" /> कर्मचारी सेवा
        </button>
        <button onClick={() => navigate('modules')} className={navClass('modules')}>
          <Blocks className="h-4 w-4 shrink-0" /> कार्य सञ्चालन मोड्युलहरू
        </button>
        <button onClick={() => navigate('legal')} className={navClass('legal')}>
          <BookOpen className="h-4 w-4 shrink-0" /> कानुन ज्ञानकेन्द्र
        </button>
        <button onClick={() => navigate('drafting')} className={navClass('drafting')}>
          <FileText className="h-4 w-4 shrink-0" /> सरकारी मस्यौदा
        </button>
        {isAuthenticated && (
          <button onClick={() => navigate('profile')} className={navClass('profile')}>
            <UserRound className="h-4 w-4 shrink-0" /> व्यक्तिगत सेवा प्रोफाइल
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => navigate('admin')}
            className={`${navClass('admin')} ${
              currentView === 'admin' ? '' : 'text-purple-700 dark:text-purple-300'
            }`}
          >
            <Shield className="h-4 w-4 shrink-0" /> प्रशासक कक्ष
          </button>
        )}

        <div className="mb-2 mt-7 border-t border-slate-100 pt-5 dark:border-slate-800">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            छिटो पहुँच
          </p>
          <button onClick={onOpenSalaryCalc} className={navClass('employee')}>
            <Calculator className="h-4 w-4 shrink-0" /> तलब क्यालकुलेटर
          </button>
          <button onClick={onOpenLawSearch} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            <Search className="h-4 w-4 shrink-0" /> कानुन खोजी
          </button>
          <button onClick={onOpenDateConverter} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            <CalendarDays className="h-4 w-4 shrink-0" /> नेपाली मिति रूपान्तरण
          </button>
          <button onClick={onOpenDatabase} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            <Database className="h-4 w-4 shrink-0" /> डेटाबेस सेटअप
          </button>
        </div>
      </nav>

      <div className="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
        <div className="relative grid grid-cols-3 gap-1">
          <button
            onClick={() => setShowNotifications((shown) => !shown)}
            title="सूचनाहरू"
            aria-label={`सूचनाहरू, ${unreadCount} नपढिएका`}
            className="relative flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" /> सूचना
            {unreadCount > 0 && <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            थिम
          </button>
          <button
            onClick={() => setShowRoleSwitcher((shown) => !shown)}
            className="flex min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Layers className="h-4 w-4 shrink-0 text-[#173B63] dark:text-blue-400" />
            <span className="truncate">{role === 'admin' ? 'Admin' : role === 'verified_employee' ? 'कर्मचारी' : role === 'registered_user' ? 'प्रयोगकर्ता' : 'Guest'}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
          </button>

          {showNotifications && (
            <div className="absolute bottom-12 left-0 z-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">सरकारी सूचना तथा अलर्ट</span>
                <span className="text-[11px] text-slate-400">{unreadCount} नयाँ</span>
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {notifications.length === 0 && <p className="py-2 text-slate-500">अहिले कुनै सूचना छैन।</p>}
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                    className={`w-full rounded-lg p-2 text-left ${
                      notification.isRead
                        ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                        : 'bg-blue-50 text-slate-900 dark:bg-blue-950/40 dark:text-white'
                    }`}
                  >
                    <span className="mb-1 block text-[10px] text-slate-400">{notification.createdAt}</span>
                    <span className="block font-semibold">{notification.title}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{notification.message}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showRoleSwitcher && (
            <div className="absolute bottom-12 right-0 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <span className="block px-2 py-1 text-[10px] font-bold uppercase text-slate-400">भूमिका स्विच गर्नुहोस्</span>
              {([
                ['admin', '१. प्रशासक (Admin)'],
                ['verified_employee', '२. प्रमाणित कर्मचारी'],
                ['registered_user', '३. दर्ता प्रयोगकर्ता'],
                ['guest', '४. लगआउट (Guest)'],
              ] as const).map(([demoRole, label]) => (
                <button
                  key={demoRole}
                  onClick={() => {
                    switchDemoRole(demoRole);
                    setShowRoleSwitcher(false);
                  }}
                  className="w-full rounded-md px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#173B63] text-sm font-bold text-white">
              {user.fullName.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{user.fullName}</span>
              <span className="block truncate text-[10px] text-slate-500">{user.email}</span>
            </span>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              title="लगआउट गर्नुहोस्"
              aria-label="लगआउट गर्नुहोस्"
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onOpenAuth('login');
              onClose();
            }}
            className="w-full rounded-xl bg-[#173B63] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#122e4e]"
          >
            लगइन / दर्ता
          </button>
        )}
      </div>
    </aside>
  );
};

export const SidebarNavigation: React.FC<Props> = (props) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <button onClick={() => props.onNavigate('home')} className="flex items-center gap-2 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173B63] text-white">🇳🇵</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">NCSDH · निजामती हब</span>
        </button>
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="नेभिगेसन मेनु खोल्नुहोस्"
          aria-expanded={isMobileOpen}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden md:sticky md:top-0 md:block md:h-screen md:w-72 md:flex-none">
        <SidebarPanel {...props} onClose={() => undefined} />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="नेभिगेसन मेनु">
          <button
            className="absolute inset-0 bg-slate-950/50"
            aria-label="मेनु बन्द गर्नुहोस्"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <SidebarPanel {...props} onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
