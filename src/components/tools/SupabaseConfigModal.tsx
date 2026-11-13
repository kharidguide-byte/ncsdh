import React, { useState } from 'react';
import { isSupabaseConfigured, db } from '../../lib/supabase/client';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'migrations' | 'tables'>('status');
  const [copiedMigration, setCopiedMigration] = useState<boolean>(false);

  if (!isOpen) return null;

  const usersCount = db.getUsers().length;
  const docsCount = db.getLegalDocs().length;
  const sectionsCount = db.getLegalSections().length;
  const circularsCount = db.getCirculars().length;
  const salaryScalesCount = db.getSalaryScales().length;
  const tasksCount = db.getTasksByUserId('all').length;

  const migrationSummarySQL = `-- NCSDH PostgreSQL Migration Quick Script
-- Run this in your Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    nepali_label VARCHAR(100) NOT NULL,
    hierarchy_level INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(20),
    role_id UUID REFERENCES public.roles(id),
    is_verified_employee BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ne VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

-- Full migrations available at /supabase/migrations/001_initial_schema.sql
-- RLS policies available at /supabase/migrations/002_rls_policies.sql`;

  const copySQL = () => {
    navigator.clipboard.writeText(migrationSummarySQL);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#173B63] text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase & PostgreSQL Database Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                डेटाबेस आर्किटेक्चर, माइग्रेसन तथा RLS सुरक्षा नीतिहरू
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
              activeTab === 'status'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            जडान स्थिति (Connection Status)
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
              activeTab === 'tables'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            तालिका संरचना (Tables & Schema)
          </button>
          <button
            onClick={() => setActiveTab('migrations')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'migrations'
                ? 'border-[#173B63] text-[#173B63] dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            माइग्रेसन स्क्रिप्ट (SQL Migrations)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    {isSupabaseConfigured
                      ? 'Live Supabase Cloud Connected'
                      : 'Resilient Local PostgreSQL/Supabase Engine Active'}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    {isSupabaseConfigured
                      ? 'आधिकारिक Supabase Endpoint मार्फत डेटाबेस जडान सक्रिय छ।'
                      : 'डेटाबेस स्थानीय रूपमा पूर्ण रूपमा सक्रिय छ। प्रयोगकर्ता, प्रमाणीकरण, कानुन, तलबमान र कार्यहरू वास्तविक रूपमा सेभ हुन्छन्।'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">कुल दर्ता खाता</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                    {usersCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">कानुन तथा ऐनहरू</span>
                  <p className="text-lg font-bold text-[#173B63] dark:text-blue-400 tabular-nums mt-1">
                    {docsCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">कानुनी दफाहरू</span>
                  <p className="text-lg font-bold text-[#0F766E] dark:text-teal-400 tabular-nums mt-1">
                    {sectionsCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">सरकारी परिपत्र</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                    {circularsCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">तलबमान (तहहरू)</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                    {salaryScalesCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">सक्रिय कार्यहरू (Tasks)</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                    {tasksCount}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Remote Supabase Configuration Instructions:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  आफ्नो Supabase प्रोजेक्ट जडान गर्न <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">.env</code> फाइलमा निम्न चरहरू प्रविष्ट गर्नुहोस्:
                </p>
                <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300">
                  VITE_SUPABASE_URL="https://your-project.supabase.co"<br />
                  VITE_SUPABASE_ANON_KEY="your-anon-key"
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                NCSDH प्रणालीका लागि कार्यान्वयन गरिएका मुख्य १० वटा डेटाबेस तालिकाहरू:
              </p>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">तालिका (Table)</th>
                      <th className="p-2.5">विवरण</th>
                      <th className="p-2.5">RLS नीति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">users</td>
                      <td className="p-2.5">प्रयोगकर्ता खाता तथा प्रमाणीकरण</td>
                      <td className="p-2.5 text-emerald-600">User Isolation</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">user_profiles</td>
                      <td className="p-2.5">कर्मचारी सेवा, तह, मन्त्रालय तथा सिटरोल</td>
                      <td className="p-2.5 text-emerald-600">User Isolation</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">signup_requests</td>
                      <td className="p-2.5">Auth trigger बाट नयाँ खाता अनुरोध र प्रशासनिक समीक्षा</td>
                      <td className="p-2.5 text-amber-600">Self Read / Admin Review</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">employee_verifications</td>
                      <td className="p-2.5">सङ्केत नं तथा परिचयपत्र प्रमाणीकरण निवेदन</td>
                      <td className="p-2.5 text-amber-600">Admin Review</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">legal_documents</td>
                      <td className="p-2.5">नेपालका मुख्य ऐन, नियमावली र कार्यविधि</td>
                      <td className="p-2.5 text-blue-600">Public Read</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">salary_scales</td>
                      <td className="p-2.5">आ.व. २०८१/८२ लागू तलबमान तथा ग्रेड दर</td>
                      <td className="p-2.5 text-blue-600">Public Read</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">tasks</td>
                      <td className="p-2.5">दैनिक प्रशासनिक कार्य तथा समयसीमा</td>
                      <td className="p-2.5 text-emerald-600">User Isolation</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">audit_logs</td>
                      <td className="p-2.5">प्रणाली लगइन, सम्पादन तथा प्रशासनिक अडिट</td>
                      <td className="p-2.5 text-red-600">Admin Only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'migrations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  प्रोजेक्ट रिपोजिटरीमा तयार गरिएका माइग्रेसन फाइलहरू:
                </span>
                <button
                  onClick={copySQL}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#173B63] text-white rounded-lg hover:bg-[#122e4e] flex items-center gap-1.5"
                >
                  {copiedMigration ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMigration ? 'कपी भयो' : 'SQL कपी गर्नुहोस्'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56">
                <pre>{migrationSummarySQL}</pre>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• <strong>001_initial_schema.sql</strong>: पूर्ण टेबल स्किमा (Tables, Keys, Indexes)</p>
                <p>• <strong>002_rls_policies.sql</strong>: Row Level Security (RLS) सुरक्षा नीतिहरू</p>
                <p>• <strong>003_private_service_documents.sql</strong>: निजी कागजात तालिका, non-public Storage bucket र user-only RLS नीतिहरू</p>
                <p>• <strong>004_supabase_signup_requests.sql</strong>: Auth मा बनेका सबै खाताको दर्ता-अनुरोध अभिलेख र प्रशासकका लागि मात्र समीक्षा नीतिहरू</p>
                <p>• <strong>005_sync_auth_users_and_audit.sql</strong>: Supabase Auth प्रयोगकर्तालाई users/user_profiles मा सुरक्षित रूपमा sync गर्ने र दर्ता audit log लेख्ने</p>
                <p>• <strong>seed.sql</strong>: निजामती सेवाको आधिकारिक प्रारम्भिक डेटा</p>
                <p>001 देखि 004 सम्म क्रमशः र त्यसपछि seed.sql अनि 005 चलाउनुहोस्। 005 ले हालका Auth खाताहरूलाई पनि backfill गर्छ। Supabase Auth मा Email provider र localhost:3000/production URL redirect allowlist मिलाउनुहोस्। Supabase Authentication → Users बाट तोकेको प्रशासकको app_metadata मा <code>ncsdh_role: admin</code> राखेर logout/login गर्नुहोस्; user_metadata वा demo भूमिका admin सुरक्षा/कागजात पहुँचका लागि मान्य हुँदैन।</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
