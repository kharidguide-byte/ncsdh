import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth/context';
import { SidebarNavigation } from './components/layout/SidebarNavigation';
import { Footer } from './components/layout/Footer';
import { PublicHomepage } from './components/public/PublicHomepage';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { UserProfileView } from './components/profile/UserProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SalaryCalculatorModal } from './components/tools/SalaryCalculatorModal';
import { LawSearchModal } from './components/tools/LawSearchModal';
import { LetterDraftingModal } from './components/tools/LetterDraftingModal';
import { NepaliDateConverterModal } from './components/tools/NepaliDateConverterModal';
import { SupabaseConfigModal } from './components/tools/SupabaseConfigModal';
import { AuthModal } from './components/auth/AuthModal';
import { LegalKnowledgeHub } from './components/legal/LegalKnowledgeHub';
import { LegalAIAssistantDrawer } from './components/legal/LegalAIAssistantDrawer';
import { GovernmentDraftingStudio } from './components/drafting/GovernmentDraftingStudio';
import { EmployeeServicePortal } from './components/employee/EmployeeServicePortal';
import { GovernmentModulesHub, ModuleTabKey } from './components/modules/GovernmentModulesHub';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, isPasswordRecovery } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'profile' | 'admin' | 'legal' | 'drafting' | 'employee' | 'modules'>('home');
  const [moduleTab, setModuleTab] = useState<ModuleTabKey>('procurement');

  // Modals state
  const [salaryCalcOpen, setSalaryCalcOpen] = useState(false);
  const [lawSearchOpen, setLawSearchOpen] = useState(false);
  const [lawSearchQuery, setLawSearchQuery] = useState('');
  const [draftingOpen, setDraftingOpen] = useState(false);
  const [dateConverterOpen, setDateConverterOpen] = useState(false);
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [aiLegalDrawerOpen, setAiLegalDrawerOpen] = useState(false);

  useEffect(() => {
    if (isPasswordRecovery) setAuthModalOpen(true);
  }, [isPasswordRecovery]);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleOpenLawSearch = (initialQuery?: string) => {
    setLawSearchQuery(initialQuery || '');
    setLawSearchOpen(true);
  };

  const handleNavigate = (view: 'home' | 'dashboard' | 'profile' | 'admin' | 'legal' | 'drafting' | 'employee' | 'modules') => {
    if ((view === 'dashboard' || view === 'profile') && !isAuthenticated) {
      handleOpenAuth('login');
      return;
    }
    if (view === 'admin' && !isAdmin) {
      handleOpenAuth('login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToModule = (tab: string = 'procurement') => {
    setModuleTab(tab as ModuleTabKey);
    setCurrentView('modules');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:flex">
      <SidebarNavigation
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenDatabase={() => setDatabaseModalOpen(true)}
        onOpenSalaryCalc={() => handleNavigate('employee')}
        onOpenLawSearch={() => handleOpenLawSearch()}
        onOpenDateConverter={() => setDateConverterOpen(true)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      {/* Main View Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {currentView === 'home' && (
          <PublicHomepage
            onOpenSalaryCalc={() => handleNavigate('employee')}
            onOpenLawSearch={handleOpenLawSearch}
            onOpenDrafting={() => handleNavigate('drafting')}
            onOpenDateConverter={() => setDateConverterOpen(true)}
            onOpenAuth={handleOpenAuth}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
            onNavigateToLegal={() => handleNavigate('legal')}
            onOpenAiAssistant={() => setAiLegalDrawerOpen(true)}
            onNavigateToModule={handleNavigateToModule}
          />
        )}

        {currentView === 'dashboard' && (
          <MainDashboard
            onOpenSalaryCalc={() => handleNavigate('employee')}
            onOpenLawSearch={() => handleOpenLawSearch()}
            onOpenDrafting={() => handleNavigate('drafting')}
            onOpenDateConverter={() => setDateConverterOpen(true)}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToLegal={() => handleNavigate('legal')}
            onNavigateToModule={handleNavigateToModule}
          />
        )}

        {currentView === 'employee' && <EmployeeServicePortal />}

        {currentView === 'modules' && <GovernmentModulesHub initialTab={moduleTab} />}

        {currentView === 'legal' && <LegalKnowledgeHub />}

        {currentView === 'drafting' && <GovernmentDraftingStudio />}

        {currentView === 'profile' && <UserProfileView onOpenAuth={() => handleOpenAuth('login')} />}

        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* AI Assistant Quick Drawer */}
      <LegalAIAssistantDrawer
        isOpen={aiLegalDrawerOpen}
        onClose={() => setAiLegalDrawerOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenSalaryCalc={() => handleNavigate('employee')}
        onOpenLawSearch={() => handleOpenLawSearch()}
        onOpenDrafting={() => handleNavigate('drafting')}
        onOpenDatabase={() => setDatabaseModalOpen(true)}
      />
      </div>

      {/* Interactive Tool Modals */}
      <SalaryCalculatorModal
        isOpen={salaryCalcOpen}
        onClose={() => setSalaryCalcOpen(false)}
      />

      <LawSearchModal
        isOpen={lawSearchOpen}
        initialQuery={lawSearchQuery}
        onClose={() => setLawSearchOpen(false)}
      />

      <LetterDraftingModal
        isOpen={draftingOpen}
        onClose={() => setDraftingOpen(false)}
      />

      <NepaliDateConverterModal
        isOpen={dateConverterOpen}
        onClose={() => setDateConverterOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={databaseModalOpen}
        onClose={() => setDatabaseModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen || isPasswordRecovery}
        defaultTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
