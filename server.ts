import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

const getSupabaseAdminClient = (): SupabaseClient | null => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

const isAdminRole = (role: unknown): role is 'admin' | 'super_admin' =>
  role === 'admin' || role === 'super_admin';

const requireSupabaseAdmin = async (req: express.Request, res: express.Response) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Supabase login आवश्यक छ।' });
    return null;
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    res.status(503).json({
      error: 'Server मा SUPABASE_SERVICE_ROLE_KEY सेट गरिएको छैन। यसलाई .env/server secrets मा मात्र राख्नुहोस्, VITE_ prefix नराख्नुहोस्।',
    });
    return null;
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Supabase login session अमान्य वा म्याद सकिएको छ। फेरि login गर्नुहोस्।' });
    return null;
  }
  if (!isAdminRole(data.user.app_metadata?.ncsdh_role)) {
    res.status(403).json({ error: 'यो कामका लागि Supabase app_metadata मा admin भूमिका आवश्यक छ।' });
    return null;
  }
  return { adminClient, user: data.user };
};

app.get('/api/admin/users', async (req, res) => {
  const authorization = await requireSupabaseAdmin(req, res);
  if (!authorization) return;

  const users: Array<{
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
    created_at: string;
    email_confirmed_at?: string;
    banned_until?: string;
  }> = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await authorization.adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('Supabase admin listUsers failed:', error.message);
      return res.status(502).json({ error: `Supabase प्रयोगकर्ता सूची लोड भएन। ${error.message}` });
    }
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  return res.json({
    users: users.map((listedUser) => ({
      id: listedUser.id,
      email: listedUser.email || '',
      mobile: listedUser.phone || (typeof listedUser.user_metadata?.mobile === 'string' ? listedUser.user_metadata.mobile : ''),
      fullName: typeof listedUser.user_metadata?.full_name === 'string'
        ? listedUser.user_metadata.full_name
        : listedUser.email?.split('@')[0] || 'प्रयोगकर्ता',
      role: listedUser.app_metadata?.ncsdh_role || 'registered_user',
      createdAt: listedUser.created_at,
      emailConfirmed: Boolean(listedUser.email_confirmed_at),
      isActive: !listedUser.banned_until || new Date(listedUser.banned_until).getTime() <= Date.now(),
    })),
  });
});

app.patch('/api/admin/users/:userId', async (req, res) => {
  const authorization = await requireSupabaseAdmin(req, res);
  if (!authorization) return;

  const { userId } = req.params;
  const { role, isActive } = req.body as { role?: unknown; isActive?: unknown };
  const allowedRoles = ['registered_user', 'verified_employee', 'content_contributor', 'content_editor', 'admin', 'super_admin'];
  if (typeof role !== 'string' || !allowedRoles.includes(role) || typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'मान्य role र isActive विवरण आवश्यक छ।' });
  }
  if (userId === authorization.user.id) {
    return res.status(400).json({ error: 'आफ्नै admin भूमिका वा खाता स्थिति परिवर्तन गर्न मिल्दैन।' });
  }

  const { data: targetResult, error: targetError } = await authorization.adminClient.auth.admin.getUserById(userId);
  if (targetError || !targetResult.user) {
    return res.status(404).json({ error: 'प्रयोगकर्ता भेटिएन।' });
  }
  const targetUser = targetResult.user;

  if (isAdminRole(targetUser.app_metadata?.ncsdh_role) && !isAdminRole(role)) {
    let remainingAdmins = 0;
    let page = 1;
    const perPage = 100;
    while (true) {
      const { data, error } = await authorization.adminClient.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error('Supabase admin listUsers failed while protecting admin role:', error.message);
        return res.status(502).json({ error: 'Admin खाता सुरक्षित गर्न हाल प्रयोगकर्ता सूची जाँच गर्न सकिएन। फेरि प्रयास गर्नुहोस्।' });
      }
      remainingAdmins += data.users.filter((listedUser) =>
        isAdminRole(listedUser.app_metadata?.ncsdh_role) && listedUser.id !== targetUser.id
      ).length;
      if (data.users.length < perPage) break;
      page += 1;
    }
    if (remainingAdmins === 0) {
      return res.status(400).json({ error: 'अन्तिम admin को भूमिका हटाउन मिल्दैन। पहिले अर्को admin नियुक्त गर्नुहोस्।' });
    }
  }

  const { error: updateError } = await authorization.adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { ...targetUser.app_metadata, ncsdh_role: role },
    ban_duration: isActive ? 'none' : '876000h',
  });
  if (updateError) {
    console.error('Supabase admin updateUserById failed:', updateError.message);
    return res.status(502).json({ error: `प्रयोगकर्ता अद्यावधिक भएन। ${updateError.message}` });
  }

  return res.json({ success: true });
});

// Initialize Google GenAI if API key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------------------------
// RAG Legal Assistant API Endpoint
// ----------------------------------------------------------------------
app.post('/api/legal/ai-assistant', async (req, res) => {
  const { question, retrievedContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // If Gemini API is available on server, synthesize through Gemini 3.8 Flash
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `तपाईं नेपाल सरकारको निजामती सेवा, सार्वजनिक प्रशासन तथा कानुनका उच्चस्तरीय कानुनी विशेषज्ञ हुनुहुन्छ (Senior Nepal Civil Service Legal AI Assistant)।

तपाईंले प्रयोगकर्ताको प्रश्नको उत्तर दिँदा केवल तल दिइएका आधिकारिक कानुनी दफा र स्रोतहरू (Grounding Context) को आधारमा मात्र पूर्ण सत्य र प्रमाणसहित उत्तर दिनुपर्छ।

उत्तर दिँदा अनिवार्य रूपमा निम्न ७ वटा बुँदाहरू खुलाउनु पर्छ:
१. सम्बन्धित ऐन वा नियमावलीको पूरा नाम
२. सम्बन्धित दफा, नियम तथा उपदफा
३. मूल कानुनी पाठ (Verbatim Statutory Text) को उद्धरण
४. सरल नेपाली भाषामा स्पष्टीकरण र व्यावहारिक प्रयोग
५. आधिकारिक स्रोतको लिङ्क (उदा: https://lawcommission.gov.np)
६. संशोधन तथा संस्करण स्थिति (लागू मिति)
७. पर्याप्त प्रमाण नभए कुनै मनगढन्ते उत्तर नदिने

यदि उपलब्ध सन्दर्भमा प्रश्नको उत्तर छैन भने: "उपलब्ध कानुनी आधारमा यस सम्बन्धी स्पष्ट दफा फेला परेन। कृपया आधिकारिक निकायसँग परामर्श गर्नुहोस्।" भनेर स्पष्ट भन्नुहोस्।`;

      const prompt = `प्रयोगकर्ताको कानुनी प्रश्न: "${question}"

उपलब्ध कानुनी सन्दर्भ सामग्रीहरू (Retrieved Statutory Context):
${JSON.stringify(retrievedContext, null, 2)}

कृपया माथिको सन्दर्भ सामग्रीमा आधारित रही प्रमाणसहित जवाफ तयार गर्नुहोस्।`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        answerText: response.text,
        source: 'GEMINI_SERVER_SYNTHESIS',
      });
    } catch (err: any) {
      console.warn('Gemini API query failed or quota exceeded, falling back to local RAG synthesis:', err?.message);
    }
  }

  // Fallback response signaling client to use local deterministic RAG synthesis
  return res.json({
    success: false,
    useLocalRAG: true,
    message: 'Server Gemini API not configured or fallback required',
  });
});

// ----------------------------------------------------------------------
// Government Office AI Drafting Endpoint
// ----------------------------------------------------------------------
app.post('/api/drafting/ai-generate', async (req, res) => {
  const { docType, subject, contextDetails, officeName, department, action, existingContent } = req.body;

  if (!docType && !contextDetails) {
    return res.status(400).json({ error: 'docType and details are required' });
  }

  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `तपाईं नेपाल सरकारको निजामती सेवा, सार्वजनिक प्रशासन तथा मन्त्रालयहरूको अति वरिष्ठ प्रशासनिक मस्यौदाविज्ञ (Chief Administrative Drafting Officer of Government of Nepal) हुनुहुन्छ।

तपाईंको मुख्य जिम्मेवारी नेपाल सरकारको प्रचलित कानुनी व्यवस्था, कार्यसञ्चालन नियमावली र आधिकारिक सरकारी भाषाशैली (Nepali Bureaucratic & Legal Register) अनुसार शिष्ट, त्रुटिरहित र पूर्ण ढाँचामा प्रशासनिक मस्यौदा तयार गर्नु हो।

कागजातका प्रकार अनुसार पालना गर्नुपर्ने अनिवार्य ढाँचाहरू:
१. 'tippani' (टिप्पणी):
   - सम्बोधन: "श्रीमान्,"
   - १. तथ्य र पृष्ठभूमि (प्रस्तुत विषयमा...)
   - २. कानुनी तथा नीतिगत आधार (ऐन, नियमावलीको दफा/नियम उद्धरण)
   - ३. औचित्य र विश्लेषण
   - ४. निर्णयार्थ पेश व्यहोरा (अतः ... निर्णयार्थ श्रीमान् समक्ष सादर पेश गर्दछु।)

२. 'order' (कार्यालय आदेश):
   - पदस्थापन, काज खटन वा आन्तरिक जिम्मेवारी
   - "उपरोक्त विषयमा ... अधिकार प्रयोग गरी देहाय बमोजिम आदेश जारी गरिएको छ।"
   - सर्तहरू, समयावधि र कार्यान्वयन प्रक्रिया

३. 'letter' (कार्यालय पत्र):
   - विषय: [विषय] सम्बन्धमा।
   - श्री [पद/निकाय]
   - "उपरोक्त सम्बन्धमा..."
   - "तसर्थ ... निर्णयानुसार सादर अनुरोध छ।"

४. 'circular' (परिपत्र):
   - मातहतका सम्पूर्ण विभाग/कार्यालयहरू
   - नीतिगत निर्देशन बुँदागत रूपमा (१, २, ३...)

५. 'minute' (बैठकको माइन्युट):
   - बैठक मिति, समय, स्थान र अध्यक्षता
   - कार्यसूची (Agendas - प्रस्तावहरू)
   - गरिएका निर्णयहरू ("प्रस्ताव नं. १ माथि छलफल हुँदा ... सर्वसम्मत निर्णय गरियो।")

६. 'report' (सरकारी प्रतिवेदन):
   - पृष्ठभूमि, उद्देश्य, कानुनी आधार, प्रमुख निष्कर्षहरू (Findings) र सिफारिसहरू (Recommendations)

भाषाशैली नियमहरू:
- पूर्ण रूपमा शुद्ध नेपाली भाषा, शिष्ट प्रशासनिक शैली (उदा: "अनुरोध गरिन्छ", "सादर पेश गर्दछु", "स्वीकृतिका लागि पेश छ")।
- अनावश्यक अंग्रेजी वा अनौपचारिक शब्दको प्रयोग नगर्नुहोस्।`;

      const prompt = `कागजातको प्रकार: ${docType}
कार्यालय: ${officeName || 'सङ्घीय मामिला तथा सामान्य प्रशासन मन्त्रालय'}
महाशाखा/शाखा: ${department || 'प्रशासन महाशाखा'}
विषय: ${subject || 'कार्यालय व्यवस्थापन सम्बन्धमा'}
प्रयोगकर्ताको निर्देशन/सन्दर्भ विवरण:
${contextDetails || existingContent || 'सरकारी कार्यालयको नियमित कार्य सञ्चालन'}

${action === 'enhance' ? 'कृपया माथिको व्यहोरालाई सरकारी प्रशासनिक भाषाशैलीमा थप शिष्ट, कानुनी दफा र मानक ढाँचामा परिमार्जन गर्नुहोस्।' : 'कृपया माथिको विषय र सन्दर्भका आधारमा नेपाल सरकारको मानक ढाँचामा पूर्ण मस्यौदा तयार गर्नुहोस्।'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        success: true,
        generatedContent: response.text,
        source: 'GEMINI_GOV_DRAFTING',
      });
    } catch (err: any) {
      console.warn('Gemini Drafting API query failed, falling back to local drafting template generator:', err?.message);
    }
  }

  return res.json({
    success: false,
    useLocalGenerator: true,
    message: 'Server Gemini API not configured or fallback required',
  });
});

// ----------------------------------------------------------------------
// Mount Vite middlewares in development
// ----------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NCSDH Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
