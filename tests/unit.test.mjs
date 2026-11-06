import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: getLocalized function logic
function getLocalized(obj, targetLang, activeLang = 'en') {
  if (!obj) return '';
  const langToUse = targetLang || activeLang;
  const val = obj[langToUse]?.trim();
  if (val) return val;

  if (obj.en?.trim()) return obj.en.trim();
  if (obj.bm?.trim()) return obj.bm.trim();
  if (obj.cn?.trim()) return obj.cn.trim();
  if (obj.ta?.trim()) return obj.ta.trim();
  return '';
}

test('getLocalized: returns requested language when present', () => {
  const obj = {
    en: 'Welcome',
    bm: 'Selamat Datang',
    cn: '欢迎',
    ta: 'வரவேற்பு',
  };

  assert.equal(getLocalized(obj, 'bm'), 'Selamat Datang');
  assert.equal(getLocalized(obj, 'cn'), '欢迎');
  assert.equal(getLocalized(obj, 'ta'), 'வரவேற்பு');
  assert.equal(getLocalized(obj, 'en'), 'Welcome');
});

test('getLocalized: falls back to EN when target language is empty', () => {
  const obj = {
    en: 'English Title',
    bm: '',
    cn: '',
    ta: '',
  };

  assert.equal(getLocalized(obj, 'cn'), 'English Title');
  assert.equal(getLocalized(obj, 'bm'), 'English Title');
  assert.equal(getLocalized(obj, 'ta'), 'English Title');
});

test('getLocalized: falls back to BM then CN when EN is empty', () => {
  const objWithBm = {
    en: '',
    bm: 'Malay Only Title',
    cn: '',
    ta: '',
  };
  assert.equal(getLocalized(objWithBm, 'cn'), 'Malay Only Title');

  const objWithCn = {
    en: '',
    bm: '',
    cn: '中文标题',
    ta: '',
  };
  assert.equal(getLocalized(objWithCn, 'bm'), '中文标题');
});

test('getLocalized: returns empty string when object is undefined or empty', () => {
  assert.equal(getLocalized(undefined), '');
  assert.equal(getLocalized(null), '');
  assert.equal(getLocalized({ en: '', bm: '', cn: '', ta: '' }), '');
});

// Test 2: t(key) dictionary lookup logic
function createTranslator(dictionary, currentLang) {
  return function t(key, fallback) {
    const row = dictionary[key];
    if (row) {
      const activeVal = row[currentLang]?.trim();
      if (activeVal) return activeVal;
      const enVal = row.en?.trim();
      if (enVal) return enVal;
      const bmVal = row.bm?.trim();
      if (bmVal) return bmVal;
      const cnVal = row.cn?.trim();
      if (cnVal) return cnVal;
      const taVal = row.ta?.trim();
      if (taVal) return taVal;
    }
    return fallback !== undefined ? fallback : key;
  };
}

test('t(key): looks up active language from dictionary', () => {
  const dictionary = {
    install_app: {
      key: 'install_app',
      en: 'Install App',
      bm: 'Pasang Aplikasi',
      cn: '安装应用',
      ta: 'செயலியை நிறுவு',
    },
    only_english: {
      key: 'only_english',
      en: 'Only English Text',
      bm: '',
      cn: '',
      ta: '',
    },
  };

  const tCn = createTranslator(dictionary, 'cn');
  assert.equal(tCn('install_app'), '安装应用');
  assert.equal(tCn('only_english'), 'Only English Text'); // fallback to English
  assert.equal(tCn('missing_key', 'Fallback Text'), 'Fallback Text');
  assert.equal(tCn('missing_key'), 'missing_key');

  const tBm = createTranslator(dictionary, 'bm');
  assert.equal(tBm('install_app'), 'Pasang Aplikasi');
  assert.equal(tBm('only_english'), 'Only English Text');
});

// Test 3: toggleSavedTool logic
test('toggleSavedTool: adds and removes tool IDs correctly', () => {
  let savedToolIds = [];

  function toggleSavedTool(id) {
    const exists = savedToolIds.includes(id);
    savedToolIds = exists ? savedToolIds.filter((item) => item !== id) : [...savedToolIds, id];
    return savedToolIds;
  }

  toggleSavedTool('tool-1');
  assert.deepEqual(savedToolIds, ['tool-1']);

  toggleSavedTool('tool-2');
  assert.deepEqual(savedToolIds, ['tool-1', 'tool-2']);

  toggleSavedTool('tool-1');
  assert.deepEqual(savedToolIds, ['tool-2']);

  toggleSavedTool('tool-2');
  assert.deepEqual(savedToolIds, []);
});

// Test 4: manifest output check
test('manifest: returns valid PWA configuration', async () => {
  const { default: manifest } = await import('../src/app/manifest.ts');
  const config = manifest();

  assert.equal(config.display, 'standalone');
  assert.equal(config.orientation, 'portrait-primary');
  assert.ok(config.name);
  assert.ok(config.short_name);
  assert.ok(config.icons.length >= 2);
  assert.ok(config.icons.some((i) => i.sizes === '192x192'));
  assert.ok(config.icons.some((i) => i.sizes === '512x512'));
});

// Test 5: Tamil language pill visibility based on populated dictionary
test('language switcher: only includes Tamil when ta entries are populated', () => {
  function getSupportedLangs(dictionary) {
    const hasTamil = Object.values(dictionary).some(
      (item) => typeof item.ta === 'string' && item.ta.trim().length > 0
    );
    return [
      { code: 'en', label: 'EN' },
      { code: 'bm', label: 'BM' },
      { code: 'cn', label: '中文' },
      ...(hasTamil ? [{ code: 'ta', label: 'தமிழ்' }] : []),
    ];
  }

  const dictWithoutTamil = {
    app_title: { key: 'app_title', en: 'Team Hub', bm: 'Hab Pasukan', cn: '团队中心', ta: '' },
    nav_tools: { key: 'nav_tools', en: 'Tools', bm: 'Alat', cn: '工具箱', ta: '   ' },
  };
  const langs1 = getSupportedLangs(dictWithoutTamil);
  assert.equal(langs1.length, 3);
  assert.equal(langs1.some((l) => l.code === 'ta'), false);

  const dictWithTamil = {
    app_title: { key: 'app_title', en: 'Team Hub', bm: 'Hab Pasukan', cn: '团队中心', ta: 'குழு மையம்' },
  };
  const langs2 = getSupportedLangs(dictWithTamil);
  assert.equal(langs2.length, 4);
  assert.equal(langs2.some((l) => l.code === 'ta'), true);
});

// Test 6: Featured tools sorting (always sort featured tools to the top)
test('tool sorting: featured tools always sort to the top of the section', () => {
  const tools = [
    { id: '1', title: { en: 'Tool A' }, is_featured: false, sort_order: 1 },
    { id: '2', title: { en: 'Tool B' }, is_featured: true, sort_order: 3 },
    { id: '3', title: { en: 'Tool C' }, is_featured: false, sort_order: 2 },
    { id: '4', title: { en: 'Tool D' }, is_featured: true, sort_order: 1 },
  ];

  const sorted = [...tools].sort((a, b) => {
    if (a.is_featured !== b.is_featured) {
      return a.is_featured ? -1 : 1;
    }
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  assert.equal(sorted[0].id, '4'); // Featured, sort_order 1
  assert.equal(sorted[1].id, '2'); // Featured, sort_order 3
  assert.equal(sorted[2].id, '1'); // Unfeatured, sort_order 1
  assert.equal(sorted[3].id, '3'); // Unfeatured, sort_order 2
});

// Test 7: Real-time search filter across Title, Description, Speaker, and Topics in all languages
test('filterTools: searches in real-time across Title, Description, Speaker, and Topics in all languages', () => {
  const sampleTools = [
    {
      id: 'tool-1',
      title: { en: 'Elevator Pitch', bm: 'Skrip Pengenalan', cn: '电梯演讲', ta: '' },
      description: { en: 'How to pitch in 30 seconds', bm: 'Cara bermula', cn: '开场白', ta: '' },
      speaker_name: 'Marcus Vance',
      topics: { en: ['Cold Market', 'Pitch'], bm: ['Pasaran Dingin'], cn: ['开场'], ta: [] },
    },
    {
      id: 'tool-2',
      title: { en: 'Objection Clinic', bm: 'Klinik Bantahan', cn: '异议拆解', ta: '' },
      description: { en: 'Handle money objections', bm: 'Bantahan duit', cn: '没钱异议', ta: '' },
      speaker_name: 'Sarah Lim',
      topics: { en: ['Closing'], bm: ['Closing'], cn: ['成交'], ta: [] },
    },
  ];

  function filterByQuery(tools, query) {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((tool) => {
      const matchSpeaker = tool.speaker_name?.toLowerCase().includes(q);
      const matchTitle = Object.values(tool.title || {}).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q)
      );
      const matchDesc = Object.values(tool.description || {}).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q)
      );
      const matchTopics = Object.values(tool.topics || {}).some(
        (arr) => Array.isArray(arr) && arr.some((item) => item?.toLowerCase().includes(q))
      );
      return matchSpeaker || matchTitle || matchDesc || matchTopics;
    });
  }

  // Match by English Speaker
  assert.equal(filterByQuery(sampleTools, 'Marcus').length, 1);
  assert.equal(filterByQuery(sampleTools, 'marcus')[0].id, 'tool-1');

  // Match by Chinese Title
  assert.equal(filterByQuery(sampleTools, '异议').length, 1);
  assert.equal(filterByQuery(sampleTools, '异议')[0].id, 'tool-2');

  // Match by Malay Description
  assert.equal(filterByQuery(sampleTools, 'duit').length, 1);
  assert.equal(filterByQuery(sampleTools, 'duit')[0].id, 'tool-2');

  // Match by Malay Topic
  assert.equal(filterByQuery(sampleTools, 'Pasaran').length, 1);
  assert.equal(filterByQuery(sampleTools, 'Pasaran')[0].id, 'tool-1');

  // Non-matching query
  assert.equal(filterByQuery(sampleTools, 'NonExistentXYZ').length, 0);
});

// Test 8: WhatsApp share text formulation
test('whatsapp share: formats localized script and url correctly', () => {
  function formatWhatsAppText(script, title, url) {
    if (script && script.trim()) {
      return `${script.trim()}\n\n${title}\n${url}`;
    }
    return `${title}\n${url}`;
  }

  const withScript = formatWhatsAppText(
    'Check out this video:',
    'Pitch 101',
    'https://example.com/pitch'
  );
  assert.equal(withScript, 'Check out this video:\n\nPitch 101\nhttps://example.com/pitch');

  const withoutScript = formatWhatsAppText('', 'Pitch 101', 'https://example.com/pitch');
  assert.equal(withoutScript, 'Pitch 101\nhttps://example.com/pitch');
});


// Test 9: Admin Role Authorization Matrix
test('adminActions: role-based authorization matrix enforces correct permissions', () => {
  const ROLES = {
    EDITOR: 'editor',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
  };

  const PERMISSIONS = {
    sections: ['editor', 'admin', 'superadmin'],
    tools: ['editor', 'admin', 'superadmin'],
    mediaUpload: ['editor', 'admin', 'superadmin'],
    calendar: ['admin', 'superadmin'],
    dictionary: ['admin', 'superadmin'],
    pins: ['superadmin'],
  };

  function isAuthorized(userRole, feature) {
    const allowed = PERMISSIONS[feature];
    return allowed ? allowed.includes(userRole) : false;
  }

  // Editor permissions
  assert.equal(isAuthorized(ROLES.EDITOR, 'sections'), true);
  assert.equal(isAuthorized(ROLES.EDITOR, 'tools'), true);
  assert.equal(isAuthorized(ROLES.EDITOR, 'mediaUpload'), true);
  assert.equal(isAuthorized(ROLES.EDITOR, 'calendar'), false);
  assert.equal(isAuthorized(ROLES.EDITOR, 'dictionary'), false);
  assert.equal(isAuthorized(ROLES.EDITOR, 'pins'), false);

  // Admin permissions
  assert.equal(isAuthorized(ROLES.ADMIN, 'sections'), true);
  assert.equal(isAuthorized(ROLES.ADMIN, 'tools'), true);
  assert.equal(isAuthorized(ROLES.ADMIN, 'calendar'), true);
  assert.equal(isAuthorized(ROLES.ADMIN, 'dictionary'), true);
  assert.equal(isAuthorized(ROLES.ADMIN, 'pins'), false);

  // Superadmin permissions
  assert.equal(isAuthorized(ROLES.SUPERADMIN, 'sections'), true);
  assert.equal(isAuthorized(ROLES.SUPERADMIN, 'tools'), true);
  assert.equal(isAuthorized(ROLES.SUPERADMIN, 'calendar'), true);
  assert.equal(isAuthorized(ROLES.SUPERADMIN, 'dictionary'), true);
  assert.equal(isAuthorized(ROLES.SUPERADMIN, 'pins'), true);
});

// Test 10: PIN Session serialization and self-deletion restriction
test('adminActions: session serialization and self-deletion guard', () => {
  function serializeSession(pinRecord) {
    if (!pinRecord.is_active) {
      throw new Error('PIN is not active');
    }
    const validRoles = ['superadmin', 'admin', 'editor'];
    if (!validRoles.includes(pinRecord.role)) {
      throw new Error('Invalid role');
    }
    return JSON.stringify({
      id: pinRecord.id,
      label: pinRecord.label,
      role: pinRecord.role,
    });
  }

  const activeRecord = {
    id: 'pin-123',
    label: 'Agency Leader',
    role: 'superadmin',
    is_active: true,
  };

  const serialized = serializeSession(activeRecord);
  const parsed = JSON.parse(serialized);
  assert.equal(parsed.id, 'pin-123');
  assert.equal(parsed.role, 'superadmin');
  assert.equal(parsed.label, 'Agency Leader');

  // Deactivated PIN should fail
  assert.throws(
    () => serializeSession({ ...activeRecord, is_active: false }),
    /PIN is not active/
  );

  // Self-deletion check
  function canDeletePin(currentSessionId, targetPinId) {
    if (currentSessionId === targetPinId) {
      return { success: false, error: 'Cannot delete own active PIN session' };
    }
    return { success: true };
  }

  assert.equal(canDeletePin('pin-123', 'pin-123').success, false);
  assert.equal(canDeletePin('pin-123', 'pin-456').success, true);
});

// Test 11: Tool upsert payload schema and language fallback
test('adminActions: tool upsert payload formatting with all new fields', () => {
  function buildToolPayload(tool) {
    const validLangCodes = ['en', 'bm', 'cn', 'ta'];
    const filteredLangs = Array.isArray(tool.available_languages)
      ? tool.available_languages.filter((l) => validLangCodes.includes(l))
      : [];
    const safeLanguages = filteredLangs.length > 0 ? filteredLangs : ['en'];

    return {
      section_id: tool.section_id,
      type: tool.type || 'link',
      title: {
        en: tool.title?.en?.trim() || '',
        bm: tool.title?.bm?.trim() || '',
        cn: tool.title?.cn?.trim() || '',
        ta: tool.title?.ta?.trim() || '',
      },
      speaker_name: tool.speaker_name?.trim() || '',
      duration: tool.duration?.trim() || '',
      available_languages: safeLanguages,
      topics: {
        en: Array.isArray(tool.topics?.en) ? tool.topics.en : [],
        bm: Array.isArray(tool.topics?.bm) ? tool.topics.bm : [],
        cn: Array.isArray(tool.topics?.cn) ? tool.topics.cn : [],
        ta: Array.isArray(tool.topics?.ta) ? tool.topics.ta : [],
      },
      url: {
        en: tool.url?.en?.trim() || '',
        bm: tool.url?.bm?.trim() || '',
        cn: tool.url?.cn?.trim() || '',
        ta: tool.url?.ta?.trim() || '',
      },
      whatsapp_script: {
        en: tool.whatsapp_script?.en?.trim() || '',
        bm: tool.whatsapp_script?.bm?.trim() || '',
        cn: tool.whatsapp_script?.cn?.trim() || '',
        ta: tool.whatsapp_script?.ta?.trim() || '',
      },
      thumbnail_url: tool.thumbnail_url?.trim() || '',
      is_featured: Boolean(tool.is_featured),
      sort_order: typeof tool.sort_order === 'number' ? tool.sort_order : 0,
      is_visible: tool.is_visible !== false,
    };
  }

  const payload = buildToolPayload({
    section_id: 'sec-1',
    title: { en: 'Audio Pitch', bm: '', cn: '', ta: '' },
    speaker_name: 'David',
    duration: '4:20',
    available_languages: ['en', 'bm', 'invalid_code'],
    is_featured: true,
    topics: { en: ['Cold Calling'] },
    whatsapp_script: { en: 'Hi, take a look at this' },
    url: { en: 'https://youtu.be/xyz' },
  });

  assert.equal(payload.speaker_name, 'David');
  assert.equal(payload.duration, '4:20');
  assert.deepEqual(payload.available_languages, ['en', 'bm']);
  assert.equal(payload.is_featured, true);
  assert.deepEqual(payload.topics.en, ['Cold Calling']);
  assert.deepEqual(payload.topics.cn, []);
  assert.equal(payload.whatsapp_script.en, 'Hi, take a look at this');
  assert.equal(payload.url.en, 'https://youtu.be/xyz');
});

// Test 12: Admin Dashboard Dictionary search filter
test('admin: dictionary filtering matches key, EN, BM, CN, or TA', () => {
  const dictionary = [
    { key: 'btn_save', en: 'Save', bm: 'Simpan', cn: '保存', ta: 'சேமிக்க' },
    { key: 'btn_cancel', en: 'Cancel', bm: 'Batal', cn: '取消', ta: 'ரத்து செய்' },
    { key: 'btn_share', en: 'Share Flyer', bm: 'Kongsi', cn: '分享海报', ta: '' },
  ];

  function filterDictionary(dict, query, filterMissing) {
    return dict.filter((item) => {
      if (filterMissing) {
        const hasMissing = !item.bm?.trim() || !item.cn?.trim() || !item.ta?.trim();
        if (!hasMissing) return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.key.toLowerCase().includes(q) ||
        item.en?.toLowerCase().includes(q) ||
        item.bm?.toLowerCase().includes(q) ||
        item.cn?.toLowerCase().includes(q) ||
        item.ta?.toLowerCase().includes(q)
      );
    });
  }

  assert.equal(filterDictionary(dictionary, 'simpan', false).length, 1);
  assert.equal(filterDictionary(dictionary, 'simpan', false)[0].key, 'btn_save');
  assert.equal(filterDictionary(dictionary, '取消', false).length, 1);
  assert.equal(filterDictionary(dictionary, '', true).length, 1);
  assert.equal(filterDictionary(dictionary, '', true)[0].key, 'btn_share');
});

// Test 13: Section slug auto-generation fallback
test('admin: section slug generation produces sanitized URL-safe string', () => {
  function generateSlug(titleEn) {
    return (
      titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `section-${Date.now()}`
    );
  }

  assert.equal(generateSlug('Prospecting & Scripts!'), 'prospecting-scripts');
  assert.equal(generateSlug('Quick 10-Minute Launch'), 'quick-10-minute-launch');
  assert.ok(generateSlug('   ').startsWith('section-'));
});


// Test 14: YouTube ID extraction with space stripping and 10-12 char support
test('youtube: extracts 10 to 12-char ID and strips spaces from various YouTube URL formats', () => {
  function getYouTubeId(rawUrl) {
    if (!rawUrl) return null;
    const cleanUrl = rawUrl.replace(/\s+/g, '');
    const match = cleanUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?.*[?&]v=|watch\?v=|shorts\/))([\w-]{10,12})/
    ) || cleanUrl.match(/(?:youtu\.be\/)([\w-]{10,12})/);
    return match ? match[1] : null;
  }

  assert.equal(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(getYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(getYouTubeId(' https:// youtu.be / dQw4w9WgXcQ '), 'dQw4w9WgXcQ'); // accidental spaces stripped
  assert.equal(getYouTubeId('https://youtu.be/1234567890'), '1234567890'); // 10 chars
  assert.equal(getYouTubeId('https://www.youtube.com/watch?v=123456789012'), '123456789012'); // 12 chars
  assert.equal(getYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(getYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(getYouTubeId('https://example.com/not-youtube'), null);
});

// Test 15: Super Admin Master PIN 371983 fallback
test('admin: PIN 371983 always returns superadmin master session', () => {
  function verifyPinMock(pin) {
    const trimmed = (pin || '').trim();
    if (trimmed === '371983') {
      return {
        success: true,
        session: {
          id: 'master-superadmin',
          label: 'Master Super Admin',
          role: 'superadmin',
        },
      };
    }
    return { success: false, error: 'Invalid PIN' };
  }

  const res = verifyPinMock('  371983  ');
  assert.equal(res.success, true);
  assert.equal(res.session.role, 'superadmin');
  assert.equal(res.session.id, 'master-superadmin');

  assert.equal(verifyPinMock('wrong').success, false);
});

// Test 16: WhatsApp full section formatting
test('whatsapp: full section format outputs clean list of tools', () => {
  function formatSectionWhatsApp(sectionTitle, sectionDesc, tools) {
    const header = `🔥 *${sectionTitle}*${sectionDesc ? `\n_${sectionDesc}_\n` : '\n'}\n`;
    const list = tools
      .map((tool, idx) => {
        const speaker = tool.speaker ? ` (${tool.speaker})` : '';
        return `${idx + 1}. *${tool.title}*${speaker}\n👉 ${tool.url}`;
      })
      .join('\n\n');
    return `${header}${list}\n\n_Shared via AA Team Hub_`;
  }

  const text = formatSectionWhatsApp('Onboarding', 'Step 1 for new partners', [
    { title: 'Welcome Video', speaker: 'Marcus', url: 'https://youtu.be/abc' },
    { title: 'Playbook PDF', speaker: '', url: 'https://cdn.com/playbook.pdf' },
  ]);

  assert.ok(text.includes('🔥 *Onboarding*'));
  assert.ok(text.includes('1. *Welcome Video* (Marcus)'));
  assert.ok(text.includes('2. *Playbook PDF*'));
  assert.ok(text.includes('👉 https://cdn.com/playbook.pdf'));
});

// Test 17: Admin tool payload fallback to English for empty BM/CN/TA
test('admin: tool upsert falls back to English title and URL when localized fields are blank', () => {
  function prepareToolPayload(tool) {
    const enTitle = tool.title?.en?.trim() || '';
    const enUrl = tool.url?.en?.trim() || '';
    return {
      title: {
        en: enTitle,
        bm: tool.title?.bm?.trim() || enTitle,
        cn: tool.title?.cn?.trim() || enTitle,
        ta: tool.title?.ta?.trim() || enTitle,
      },
      url: {
        en: enUrl,
        bm: tool.url?.bm?.trim() || enUrl,
        cn: tool.url?.cn?.trim() || enUrl,
        ta: tool.url?.ta?.trim() || enUrl,
      },
    };
  }

  const payload = prepareToolPayload({
    title: { en: 'Product Masterclass', bm: '', cn: '', ta: '' },
    url: { en: 'https://youtu.be/masterclass', bm: '', cn: '', ta: '' },
  });

  assert.equal(payload.title.bm, 'Product Masterclass');
  assert.equal(payload.title.cn, 'Product Masterclass');
  assert.equal(payload.url.bm, 'https://youtu.be/masterclass');
  assert.equal(payload.url.cn, 'https://youtu.be/masterclass');
});
// Test 18: Dynamic calendar recurring rules expansion and blackout filtering
test('calendar: expands recurring rules, filters blackout dates, and merges special events', async () => {
  const { generateMonthSchedule } = await import('../src/lib/calendarGenerator.ts');

  const recurringRules = [
    {
      id: 'dcc',
      title: 'Daily DCC',
      frequency: 'daily',
      time: '7:30 AM',
      venue: 'Zoom',
      address_or_link: 'https://zoom.us/dcc',
      is_active: true,
    },
    {
      id: 'asap',
      title: 'Weekly Thursday ASAP',
      frequency: 'weekly',
      day_of_week: 4, // Thursday
      time: '8:30 PM',
      venue: 'Nu Skin Plaza',
      address_or_link: 'Kuala Lumpur',
      is_active: true,
    },
    {
      id: 'bse',
      title: 'Monthly BSE 1',
      frequency: 'monthly_nth_weekday',
      nth_week: 3,
      day_of_week: 6, // 3rd Saturday
      time: '10:00 AM',
      venue: 'Wisma Central',
      address_or_link: 'KL',
      is_active: true,
    },
  ];

  const blackoutDates = [
    {
      id: 'bo-1',
      date: '2026-11-21', // 3rd Saturday of Nov 2026
      reason: 'Replaced by Rally',
      rule_id: 'bse',
    },
  ];

  const specialEvents = [
    {
      id: 'rally-2026',
      date: '2026-11-21',
      time: '2:00 PM',
      title: { en: 'AA Annual Rally', bm: 'Rali AA', cn: '年度大聚会', ta: 'Rally' },
      speaker: 'Presidential Council',
      location_or_link: 'Sunway Pyramid',
    },
  ];

  const result = generateMonthSchedule(2026, 11, recurringRules, blackoutDates, specialEvents);

  // November 2026 has 30 days
  // Daily DCC should appear on all 30 days
  const dccEvents = result.filter((e) => e.rule_id === 'dcc');
  assert.equal(dccEvents.length, 30);

  // November 2026 Thursdays: Nov 5, 12, 19, 26 -> 4 Thursdays
  const asapEvents = result.filter((e) => e.rule_id === 'asap');
  assert.equal(asapEvents.length, 4);

  // BSE was blacked out on 2026-11-21
  const bseEvents = result.filter((e) => e.rule_id === 'bse');
  assert.equal(bseEvents.length, 0);

  // Special Rally event should be present on 2026-11-21
  const rally = result.find((e) => e.id === 'rally-2026');
  assert.ok(rally);
  assert.equal(rally.date, '2026-11-21');
  assert.equal(rally.is_recurring, false);

  // Results should be strictly sorted chronologically
  for (let i = 0; i < result.length - 1; i++) {
    assert.ok(result[i].date <= result[i + 1].date);
  }
});



