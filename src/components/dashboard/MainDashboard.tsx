import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/context';
import { db } from '../../lib/supabase/client';
import { TaskItem } from '../../types';
import {
  Calculator,
  Scale,
  FileText,
  Calendar,
  CheckSquare,
  BellRing,
  Clock,
  Bookmark,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Building,
  Users,
  FolderOpen,
  Box,
  PieChart,
  MessageSquare
} from 'lucide-react';

interface Props {
  onOpenSalaryCalc: () => void;
  onOpenLawSearch: () => void;
  onOpenDrafting: () => void;
  onOpenDateConverter: () => void;
  onNavigateToProfile: () => void;
  onNavigateToLegal?: () => void;
  onNavigateToModule?: (tab: string) => void;
}

export const MainDashboard: React.FC<Props> = ({
  onOpenSalaryCalc,
  onOpenLawSearch,
  onOpenDrafting,
  onOpenDateConverter,
  onNavigateToProfile,
  onNavigateToLegal,
  onNavigateToModule,
}) => {
  const { user, profile, isVerifiedEmployee } = useAuth();

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(db.getTasksByUserId(user?.id || 'guest'));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('२०८१/०७/३०');

  // Circulars
  const circulars = db.getCirculars().slice(0, 4);

  // Handle task adding
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created = db.addTask({
      userId: user?.id || 'guest',
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'PENDING',
      dueDateBs: newTaskDueDate,
      category: 'प्रशासनिक कार्य',
    });

    setTasks([created, ...tasks]);
    setNewTaskTitle('');
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: TaskItem['status']) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    db.updateTaskStatus(taskId, nextStatus);
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    db.deleteTask(taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Personalized Greeting & Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#173B63] to-[#3478B9] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user ? user.fullName.charAt(0) : 'नि'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                आजको सरकारी मिति: वि.सं. २०८१ कार्तिक २५ गते (आइतबार)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              नमस्ते, {user ? user.fullName : 'निजामती सेवा सहकर्मी'}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{profile?.currentOffice || 'नेपाल सरकार प्रशासनिक सेवा'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#173B63] dark:text-blue-400">
                {profile?.currentLevel || 'शाखा अधिकृत'}
              </span>
              <span aria-hidden="true">·</span>
              {isVerifiedEmployee ? (
                <span className="text-emerald-700 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded border border-emerald-200">
                  प्रमाणित निजामती कर्मचारी
                </span>
              ) : (
                <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.2 rounded border border-slate-200">
                  प्रमाणीकरण हुन बाँकी
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToProfile}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            व्यक्तिगत सेवा अभिलेख हेर्नुहोस्
          </button>
        </div>
      </div>

      {/* QUICK ACCESS TOOLS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            द्रुत पहुँच औजारहरू (Quick Access Digital Tools)
          </h2>
          <span className="text-xs text-slate-400">आधिकारिक दर तथा कानुनमा आधारित</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: Salary & Tax Calculator */}
          <div
            onClick={onOpenSalaryCalc}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] dark:hover:border-blue-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#173B63] dark:text-blue-400 group-hover:bg-[#173B63] group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              तलब तथा कर गणना (२०८१/८२)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              सुरु तलब, ग्रेड, महङ्गी भत्ता, सञ्चय कोष, CIT र आयकर (TDS) स्ल्याब गणना
            </p>
          </div>

          {/* Tool 2: Law & Section Search */}
          <div
            onClick={() => onNavigateToLegal ? onNavigateToLegal() : onOpenLawSearch()}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] dark:hover:border-blue-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#0F766E] dark:text-teal-400 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              कानुन तथा दफा खोजी
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              निजामती सेवा ऐन, सार्वजनिक खरिद ऐन र सुशासन ऐनका दफा तथा सरल व्याख्या
            </p>
          </div>

          {/* Tool 3: Letter & Tippani Drafting */}
          <div
            onClick={onOpenDrafting}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] dark:hover:border-blue-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              सरकारी टिप्पणी र पत्र मस्यौदा
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              निर्णयार्थ टिप्पणी, परिपत्र, स्पष्टीकरण तथा सिफारिस पत्रको प्रशासनिक ढाँचा
            </p>
          </div>

          {/* Tool 4: Date Converter */}
          <div
            onClick={onOpenDateConverter}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-[#173B63] dark:hover:border-blue-400 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              नेपाली मिति रूपान्तरक
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              वि.सं. (BS) र ई.सं. (AD) बीचको सरकारी कागजात प्रयोजनका लागि मिति रूपान्तरण
            </p>
          </div>
        </div>
      </div>

      {/* Quick Module Launchpad (13 Modules) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#173B63] dark:text-blue-400" />
              <span>प्रशासनिक कार्य सञ्चालन मोड्युलहरू (NCSDH Modules)</span>
            </h3>
            <p className="text-xs text-slate-500">
              खरिद, बैठक, निर्णय, दर्ता चलानी, जिन्सी, बजेट, RTI तथा ज्ञान चौतारी
            </p>
          </div>
          {onNavigateToModule && (
            <button
              onClick={() => onNavigateToModule('procurement')}
              className="text-xs text-[#173B63] dark:text-blue-400 font-semibold hover:underline"
            >
              सबै मोड्युलहरू हेर्नुहोस् &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {[
            { id: 'procurement', label: 'सार्वजनिक खरिद', icon: Building, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
            { id: 'meetings', label: 'बैठक व्यवस्थापन', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
            { id: 'decisions', label: 'निर्णय ट्र्याकर', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
            { id: 'files', label: 'दर्ता चलानी/फाइल', icon: FolderOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
            { id: 'inventory', label: 'PAMS जिन्सी', icon: Box, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
            { id: 'budget', label: 'बजेट योजना', icon: PieChart, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
            { id: 'community', label: 'ज्ञान चौतारी', icon: MessageSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToModule?.(item.id)}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all hover:scale-[1.02] flex flex-col gap-1.5"
              >
                <div className={`p-1.5 rounded-md ${item.color} w-fit`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Tasks & Planner + Circulars & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Task Manager */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#173B63] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  मेरो कार्य योजना (Personal Tasks & Deadlines)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {tasks.filter((t) => t.status === 'COMPLETED').length} / {tasks.length} सम्पन्न
              </span>
            </div>

            {/* Add Task input */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="नयाँ प्रशासनिक कार्य थप्नुहोस् (उदा: त्रैमासिक बजेट समीक्षा तयार गर्ने)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#173B63]"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="LOW">सामान्य</option>
                <option value="MEDIUM">मध्यम</option>
                <option value="HIGH">उच्च</option>
                <option value="URGENT">जरुरी</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e] flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> थप्नुहोस्
              </button>
            </form>

            {/* Tasks list */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  कुनै कार्य बाँकी छैन। नयाँ कार्य थप्न सक्नुहुन्छ।
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {task.status === 'COMPLETED' && <Check className="w-3 h-3" />}
                      </button>

                      <div>
                        <p
                          className={`text-xs font-medium ${
                            task.status === 'COMPLETED'
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>म्याद: {task.dueDateBs}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              task.priority === 'URGENT'
                                ? 'text-red-600 font-semibold'
                                : task.priority === 'HIGH'
                                ? 'text-amber-600 font-medium'
                                : 'text-slate-500'
                            }
                          >
                            {task.priority === 'URGENT'
                              ? 'अति जरुरी'
                              : task.priority === 'HIGH'
                              ? 'उच्च'
                              : 'सामान्य'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Circulars & Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Government Circulars Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ताजा सरकारी परिपत्र तथा सूचना
                </h3>
              </div>
              <span className="text-xs text-slate-400">अद्यावधिक</span>
            </div>

            <div className="space-y-3">
              {circulars.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium text-[#173B63] dark:text-blue-400 truncate max-w-[200px]">
                      {c.issuingAuthority}
                    </span>
                    <span>{c.issuedDateBs}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {c.titleNe}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.summaryNe}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Government Deadlines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#173B63]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                महत्त्वपूर्ण प्रशासनिक समयसीमा (Deadlines)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between p-2.5 rounded-lg border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    सम्पत्ति विवरण पेश गर्ने म्याद
                  </span>
                  <span className="text-[11px] text-slate-500">
                    आर्थिक वर्ष समाप्त भएको ६० दिनभित्र (भदौ २८ गते)
                  </span>
                </div>
                <span className="text-red-700 font-bold shrink-0">अनिवार्य</span>
              </div>

              <div className="flex items-start justify-between p-2.5 rounded-lg border border-amber-100 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    कार्यसम्पादन मूल्याङ्कन (का.स.मू.) फाराम
                  </span>
                  <span className="text-[11px] text-slate-500">
                    साउन महिनाभित्र सुपरिवेक्षक समक्ष पेश गर्नुपर्ने
                  </span>
                </div>
                <span className="text-amber-700 font-bold shrink-0">नियमित</span>
              </div>

              <div className="flex items-start justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800/40 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    PIS वैयक्तिक विवरण रुजु
                  </span>
                  <span className="text-[11px] text-slate-500">
                    राष्ट्रिय किताबखाना (निजामती) मा अनिवार्य रुजु
                  </span>
                </div>
                <span className="text-slate-600 font-medium shrink-0">सञ्चालित</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
