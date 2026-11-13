import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Download, Eye, FileText, LoaderCircle, LockKeyhole, Printer, Trash2, Upload, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/context';

const BUCKET = 'service-documents-private';
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const CATEGORIES = [
  'सुरु नियुक्ति पत्र',
  'बढुवा / स्तरवृद्धि / समायोजन पत्र',
  'सरुवा पत्र',
  'पदस्थापन पत्र',
  'रमाना पत्र',
  'विशेष जिम्मेवारी पत्र',
  'काज पत्र',
  'सिटरोल / वैयक्तिक विवरण',
  'नागरिकता',
  'राहदानी',
  'शैक्षिक योग्यताका प्रमाणपत्र',
  'स्थायी लेखा नम्बर (PAN)',
  'कर्मचारी सञ्चय कोष परिचयपत्र',
  'नागरिक लगानी कोष परिचयपत्र',
  'तलब / कर / बैंकसम्बन्धी कागजात',
  'बिदा / तालिमसम्बन्धी कागजात',
  'अन्य सेवा वा व्यक्तिगत कागजात',
];

interface ServiceDocument {
  id: string;
  owner_id: string;
  category: string;
  original_name: string;
  object_path: string;
  mime_type: 'application/pdf' | 'image/jpeg';
  file_size: number;
  created_at: string;
}

export const ServiceDocumentsVault: React.FC<{ onOpenAuth?: () => void }> = ({ onOpenAuth }) => {
  const { cloudAuthUserId } = useAuth();
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<{ document: ServiceDocument; url: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const loadDocuments = useCallback(async () => {
    if (!supabase || !cloudAuthUserId) return;
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('user_service_documents')
      .select('id, owner_id, category, original_name, object_path, mime_type, file_size, created_at')
      .eq('owner_id', cloudAuthUserId)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (queryError) {
      setError(`कागजात सूची लोड भएन। Migration 003 चलाइएको छ कि जाँच गर्नुहोस्। ${queryError.message}`);
      return;
    }
    setDocuments((data || []) as ServiceDocument[]);
  }, [cloudAuthUserId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview?.url]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setNotice('');
    if (!file) return;
    if (!supabase || !cloudAuthUserId) {
      setError('कागजात upload गर्न Supabase Auth खाताबाट लगइन गर्नुहोस्।');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const expectedMime = extension === 'pdf'
      ? 'application/pdf'
      : extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : null;
    if (!expectedMime || (file.type && file.type !== expectedMime)) {
      setError('PDF, JPG वा JPEG फाइल मात्र upload गर्न मिल्छ।');
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError('फाइल खाली हुनुहुँदैन र आकार १५ MB भन्दा बढी हुन मिल्दैन।');
      return;
    }
    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const isPdf = expectedMime === 'application/pdf'
      && signature[0] === 0x25
      && signature[1] === 0x50
      && signature[2] === 0x44
      && signature[3] === 0x46
      && signature[4] === 0x2d;
    const isJpeg = expectedMime === 'image/jpeg'
      && signature[0] === 0xff
      && signature[1] === 0xd8
      && signature[2] === 0xff;
    if (!isPdf && !isJpeg) {
      setError('फाइलको वास्तविक सामग्री PDF वा JPEG सँग मेल खाएन।');
      return;
    }

    const objectPath = `${cloudAuthUserId}/${crypto.randomUUID()}.${extension === 'pdf' ? 'pdf' : 'jpg'}`;
    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, file, { contentType: expectedMime, upsert: false });
    if (uploadError) {
      setUploading(false);
      setError(`फाइल upload भएन। Migration 003 र private bucket सेटअप जाँच गर्नुहोस्। ${uploadError.message}`);
      return;
    }

    const { error: insertError } = await supabase.from('user_service_documents').insert({
      owner_id: cloudAuthUserId,
      category,
      original_name: file.name,
      object_path: objectPath,
      mime_type: expectedMime,
      file_size: file.size,
    });
    if (insertError) {
      const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([objectPath]);
      setUploading(false);
      setError(
        cleanupError
          ? `फाइलको विवरण सुरक्षित भएन (${insertError.message}) र अस्थायी फाइल हटाउन पनि सकिएन (${cleanupError.message})।`
          : `फाइलको विवरण सुरक्षित भएन; upload गरिएको फाइल हटाइएको छ। ${insertError.message}`,
      );
      return;
    }

    setUploading(false);
    setNotice('कागजात निजी रूपमा सुरक्षित गरियो।');
    await loadDocuments();
  };

  const openDocument = async (document: ServiceDocument) => {
    if (!supabase) return;
    setError('');
    setPreviewLoading(document.id);
    const { data, error: downloadError } = await supabase.storage.from(BUCKET).download(document.object_path);
    setPreviewLoading(null);
    if (downloadError) {
      setError(`कागजात खोल्न सकिएन। ${downloadError.message}`);
      return;
    }
    setPreview({ document, url: URL.createObjectURL(data) });
  };

  const deleteDocument = async (document: ServiceDocument) => {
    if (!supabase || !window.confirm(`"${document.original_name}" कागजात स्थायी रूपमा मेटाउने?`)) return;
    setError('');
    setNotice('');
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([document.object_path]);
    if (storageError) {
      setError(`फाइल मेटाउन सकिएन। ${storageError.message}`);
      return;
    }
    const { error: rowError } = await supabase
      .from('user_service_documents')
      .delete()
      .eq('id', document.id)
      .eq('owner_id', cloudAuthUserId);
    if (rowError) {
      setError(`फाइल हटाइयो, तर सूचीको विवरण मेटाउन सकिएन। ${rowError.message}`);
      await loadDocuments();
      return;
    }
    setDocuments((existing) => existing.filter((item) => item.id !== document.id));
    if (preview?.document.id === document.id) setPreview(null);
    setNotice('कागजात मेटाइयो।');
  };

  const printDocument = () => {
    const frame = printFrameRef.current;
    if (!frame?.contentWindow) {
      setError('कागजात print गर्न सकिएन। फेरि खोल्ने प्रयास गर्नुहोस्।');
      return;
    }
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-[#173B63] dark:bg-blue-950/50 dark:text-blue-300">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">मेरो सेवा तथा व्यक्तिगत कागजात</h2>
            <p className="mt-1 text-xs text-slate-500">तपाईंको निजी Supabase भण्डारणमा मात्र उपलब्ध</p>
          </div>
        </div>
        {cloudAuthUserId && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="कागजातको प्रकार"
              className="max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              className="hidden"
              onChange={(event) => void handleUpload(event)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#173B63] px-3 py-2 text-xs font-semibold text-white hover:bg-[#122e4e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'अपलोड हुँदैछ…' : 'कागजात अपलोड'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>यो सुविधा खोल्न `.env` मा Supabase URL र anon key राखी development server पुनः सुरु गर्नुहोस्, त्यसपछि Supabase Auth खाताबाट लगइन गर्नुहोस्।</p>
          </div>
        )}
        {isSupabaseConfigured && !cloudAuthUserId && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <p>कागजात निजी राख्न Supabase Auth खाताबाट लगइन गर्नुहोस्।</p>
              {onOpenAuth && (
                <button onClick={onOpenAuth} className="shrink-0 rounded-lg bg-[#173B63] px-3 py-2 font-semibold text-white hover:bg-[#122e4e]">
                  Supabase बाट लगइन
                </button>
              )}
            </div>
          </div>
        )}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <p>स्वीकार्य फाइल: PDF, JPG/JPEG; अधिकतम १५ MB। कागजात सार्वजनिक URL बाट उपलब्ध हुँदैन र तपाईंको Supabase खाताले मात्र हेर्न, खोल्न वा हटाउन सक्छ। साझा वा सार्वजनिक उपकरणमा लगआउट गर्नुहोस्।</p>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p>}

        {cloudAuthUserId && (
          loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> कागजात लोड हुँदैछन्…
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center dark:border-slate-700">
              <FileText className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs text-slate-500">अहिलेसम्म कागजात अपलोड गरिएको छैन।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">कागजात</th>
                    <th className="px-3 py-2 font-semibold">प्रकार</th>
                    <th className="px-3 py-2 font-semibold">आकार</th>
                    <th className="px-3 py-2 font-semibold">मिति</th>
                    <th className="px-3 py-2 text-right font-semibold">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td className="max-w-56 px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <span className="block truncate" title={document.original_name}>{document.original_name}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{document.category}</td>
                      <td className="px-3 py-3 text-slate-500">{(document.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                      <td className="px-3 py-3 text-slate-500">{new Date(document.created_at).toLocaleDateString('ne-NP')}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => void openDocument(document)}
                            disabled={previewLoading === document.id}
                            title="कागजात हेर्नुहोस्"
                            aria-label={`${document.original_name} हेर्नुहोस्`}
                            className="rounded-md p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                          >
                            {previewLoading === document.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => void deleteDocument(document)}
                            title="कागजात मेटाउनुहोस्"
                            aria-label={`${document.original_name} मेटाउनुहोस्`}
                            className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{preview.document.original_name}</h3>
                <p className="text-[11px] text-slate-500">{preview.document.category}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={preview.url}
                  download={preview.document.original_name}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="कागजात डाउनलोड गर्नुहोस्"
                  title="डाउनलोड"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button onClick={printDocument} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="कागजात प्रिन्ट गर्नुहोस्" title="प्रिन्ट">
                  <Printer className="h-4 w-4" />
                </button>
                <button onClick={() => setPreview(null)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="कागजात बन्द गर्नुहोस्">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3 dark:bg-slate-950">
              <iframe
                ref={printFrameRef}
                title={preview.document.original_name}
                src={preview.url}
                className="h-full w-full rounded border-0 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
