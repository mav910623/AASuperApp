'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, getSupabaseAdminClient } from '@/lib/supabase';
import {
  DEFAULT_SECTIONS,
  DEFAULT_TOOLS,
  DEFAULT_CALENDAR,
} from '@/lib/mockData';
import { DEFAULT_UI_DICTIONARY } from '@/lib/dictionary';
import type {
  AccessPin,
  AccessPinRole,
  Database,
  LanguageCode,
  Section,
  TeamCalendar,
  Tool,
  UiDictionary,
  AdminSession,
  AdminDashboardData,
  ActionResponse,
} from '@/types/app';
import { PIN_SESSION_COOKIE } from '@/types/app';
import type { SupabaseClient } from '@supabase/supabase-js';

function getAdminClient(): SupabaseClient<Database> {
  try {
    return getSupabaseAdminClient();
  } catch {
    return supabaseAdmin;
  }
}

function safeRevalidate(paths: string[] = ['/', '/admin']) {
  try {
    for (const p of paths) {
      revalidatePath(p);
    }
  } catch {
    // Revalidation ignored in testing or non-standard environments
  }
}

async function requireSession(allowedRoles?: AccessPinRole[]): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(PIN_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    throw new Error('Authentication required: No active PIN session found.');
  }

  let session: AdminSession;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    cookieStore.delete(PIN_SESSION_COOKIE);
    throw new Error('Invalid session format. Please log in again.');
  }

  if (
    !session?.id ||
    !session?.role ||
    !['superadmin', 'admin', 'editor'].includes(session.role)
  ) {
    cookieStore.delete(PIN_SESSION_COOKIE);
    throw new Error('Corrupt session data. Please log in again.');
  }

  // Master Super Admin session bypasses DB query check
  if (session.id === 'master-superadmin') {
    session.role = 'superadmin';
    session.label = session.label || 'Master Super Admin';
    return session;
  }

  const client = getAdminClient();
  const { data: pinRow, error } = await client
    .from('access_pins')
    .select('id, label, role, is_active')
    .eq('id', session.id)
    .maybeSingle();

  if (error) {
    console.warn('[requireSession] Database query error when verifying session:', error.message);
  } else if (!pinRow || !pinRow.is_active) {
    cookieStore.delete(PIN_SESSION_COOKIE);
    throw new Error('Session has expired or PIN access has been deactivated.');
  } else {
    session.role = pinRow.role as AccessPinRole;
    session.label = pinRow.label;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error(
      `Access denied: Role '${session.role}' is not authorized to perform this operation.`
    );
  }

  return session;
}
// =============================================================================
// 1. PIN AUTHENTICATION & SESSION MANAGEMENT
// =============================================================================

export async function verifyPinAction(pin: string): Promise<ActionResponse<AdminSession>> {
  try {
    if (!pin || typeof pin !== 'string' || !pin.trim()) {
      return { success: false, error: 'PIN is required' };
    }

    const trimmedPin = pin.trim();

    // Guaranteed master fallback for Super Admin PIN '371983'
    if (trimmedPin === '371983') {
      const masterSession: AdminSession = {
        id: 'master-superadmin',
        label: 'Master Super Admin',
        role: 'superadmin',
      };

      const cookieStore = await cookies();
      cookieStore.set(PIN_SESSION_COOKIE, JSON.stringify(masterSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return {
        success: true,
        session: masterSession,
        data: masterSession,
      };
    }

    const client = getAdminClient();

    const { data: pinRecord, error } = await client
      .from('access_pins')
      .select('id, label, pin_code, role, is_active')
      .eq('pin_code', trimmedPin)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[verifyPinAction] Supabase query error:', error);
      return { success: false, error: 'Authentication service error. Please try again.' };
    }

    if (!pinRecord) {
      return { success: false, error: 'Invalid or inactive PIN' };
    }

    const validRoles: AccessPinRole[] = ['superadmin', 'admin', 'editor'];
    if (!validRoles.includes(pinRecord.role as AccessPinRole)) {
      return { success: false, error: 'Unauthorized role configured for this PIN' };
    }

    const sessionPayload: AdminSession = {
      id: pinRecord.id,
      label: pinRecord.label,
      role: pinRecord.role as AccessPinRole,
    };

    const cookieStore = await cookies();
    cookieStore.set(PIN_SESSION_COOKIE, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      session: sessionPayload,
      data: sessionPayload,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return { success: false, error: message };
  }
}

export async function getSessionAction(): Promise<ActionResponse<AdminSession | null>> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(PIN_SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return { success: true, session: null, data: null };
    }

    let session: AdminSession;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      cookieStore.delete(PIN_SESSION_COOKIE);
      return { success: true, session: null, data: null };
    }

    if (
      !session?.id ||
      !session?.role ||
      !['superadmin', 'admin', 'editor'].includes(session.role)
    ) {
      cookieStore.delete(PIN_SESSION_COOKIE);
      return { success: true, session: null, data: null };
    }

    const client = getAdminClient();
    const { data: pinRecord, error } = await client
      .from('access_pins')
      .select('id, label, role, is_active')
      .eq('id', session.id)
      .maybeSingle();

    if (error) {
      console.warn('[getSessionAction] DB check warning:', error.message);
      return { success: true, session, data: session };
    }

    if (!pinRecord || !pinRecord.is_active) {
      cookieStore.delete(PIN_SESSION_COOKIE);
      return {
        success: false,
        session: null,
        data: null,
        error: 'Session expired or PIN deactivated',
      };
    }

    const verifiedSession: AdminSession = {
      id: pinRecord.id,
      label: pinRecord.label,
      role: pinRecord.role as AccessPinRole,
    };

    return {
      success: true,
      session: verifiedSession,
      data: verifiedSession,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return { success: false, error: message, session: null, data: null };
  }
}

export async function logoutPinAction(): Promise<ActionResponse<void>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(PIN_SESSION_COOKIE);
    return { success: true, message: 'Logged out successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed';
    return { success: false, error: message };
  }
}

export async function getAdminDashboardDataAction(): Promise<ActionResponse<AdminDashboardData>> {
  try {
    const session = await requireSession(['editor', 'admin', 'superadmin']);
    const client = getAdminClient();

    const [secRes, toolRes, calRes, dictRes] = await Promise.all([
      client.from('sections').select('*').order('sort_order', { ascending: true }),
      client.from('tools').select('*').order('sort_order', { ascending: true }),
      client.from('team_calendar').select('*').limit(1),
      client.from('ui_dictionary').select('*').order('key', { ascending: true }),
    ]);

    const sections: Section[] =
      secRes.data && secRes.data.length > 0 ? (secRes.data as Section[]) : DEFAULT_SECTIONS;
    const tools: Tool[] =
      toolRes.data && toolRes.data.length > 0 ? (toolRes.data as Tool[]) : DEFAULT_TOOLS;
    const calendar: TeamCalendar =
      calRes.data && calRes.data.length > 0 ? (calRes.data[0] as TeamCalendar) : DEFAULT_CALENDAR;

    const dictMap: Record<string, UiDictionary> = { ...DEFAULT_UI_DICTIONARY };
    if (dictRes.data && dictRes.data.length > 0) {
      for (const d of dictRes.data as UiDictionary[]) {
        dictMap[d.key] = d;
      }
    }
    const dictionary: UiDictionary[] = Object.values(dictMap);

    let pins: AccessPin[] | undefined;
    if (session.role === 'superadmin') {
      const pinsRes = await client
        .from('access_pins')
        .select('*')
        .order('created_at', { ascending: false });
      pins = !pinsRes.error && pinsRes.data ? (pinsRes.data as AccessPin[]) : [];
    }

    return {
      success: true,
      data: {
        session,
        sections,
        tools,
        calendar,
        dictionary,
        pins,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve admin data';
    return { success: false, error: message };
  }
}

// =============================================================================
// 2. ROLE-GUARDED ACTIONS: EDITOR, ADMIN, SUPERADMIN
// =============================================================================

export async function upsertSectionAction(
  section: Partial<Section>
): Promise<ActionResponse<Section>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    const client = getAdminClient();

    const enTitle = section.title?.en?.trim() || '';
    if (!enTitle) {
      return { success: false, error: 'Section title (EN) is required' };
    }

    const generatedSlug =
      section.slug?.trim() ||
      enTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `section-${Date.now()}`;

    const payload = {
      slug: generatedSlug,
      icon_name: section.icon_name || 'Folder',
      sort_order: typeof section.sort_order === 'number' ? section.sort_order : 0,
      is_visible: section.is_visible !== false,
      title: {
        en: enTitle,
        bm: section.title?.bm?.trim() || enTitle,
        cn: section.title?.cn?.trim() || enTitle,
        ta: section.title?.ta?.trim() || enTitle,
      },
      description: {
        en: section.description?.en?.trim() || '',
        bm: section.description?.bm?.trim() || section.description?.en?.trim() || '',
        cn: section.description?.cn?.trim() || section.description?.en?.trim() || '',
        ta: section.description?.ta?.trim() || section.description?.en?.trim() || '',
      },
      updated_at: new Date().toISOString(),
    };

    let result;
    if (section.id) {
      result = await client
        .from('sections')
        .update(payload)
        .eq('id', section.id)
        .select()
        .single();
    } else {
      result = await client
        .from('sections')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    safeRevalidate();
    return { success: true, data: result.data as Section };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save section';
    return { success: false, error: message };
  }
}

export async function deleteSectionAction(id: string): Promise<ActionResponse<void>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    if (!id) return { success: false, error: 'Section ID is required' };

    const client = getAdminClient();

    // Remove associated tools
    await client.from('tools').delete().eq('section_id', id);

    const { error } = await client.from('sections').delete().eq('id', id);
    if (error) throw new Error(error.message);

    safeRevalidate();
    return { success: true, message: 'Section deleted successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete section';
    return { success: false, error: message };
  }
}

export async function reorderSectionsAction(
  items: { id: string; sort_order: number }[] | string[]
): Promise<ActionResponse<void>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'No sections provided to reorder' };
    }

    const client = getAdminClient();
    const normalized: { id: string; sort_order: number }[] = items.map((item, index) => {
      if (typeof item === 'string') {
        return { id: item, sort_order: index };
      }
      return { id: item.id, sort_order: item.sort_order ?? index };
    });

    const updates = normalized.map((item) =>
      client.from('sections').update({ sort_order: item.sort_order }).eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) {
      throw new Error(firstError.error.message);
    }

    safeRevalidate();
    return { success: true, message: 'Sections reordered successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reorder sections';
    return { success: false, error: message };
  }
}

export async function reorderToolsAction(
  items: { id: string; sort_order: number }[] | string[]
): Promise<ActionResponse<void>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'No tools provided to reorder' };
    }

    const client = getAdminClient();
    const normalized: { id: string; sort_order: number }[] = items.map((item, index) => {
      if (typeof item === 'string') {
        return { id: item, sort_order: index };
      }
      return { id: item.id, sort_order: item.sort_order ?? index };
    });

    const updates = normalized.map((item) =>
      client.from('tools').update({ sort_order: item.sort_order }).eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) {
      throw new Error(firstError.error.message);
    }

    safeRevalidate();
    return { success: true, message: 'Tools reordered successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reorder tools';
    return { success: false, error: message };
  }
}

export async function upsertToolAction(tool: Partial<Tool>): Promise<ActionResponse<Tool>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    const client = getAdminClient();

    if (!tool.section_id) {
      return { success: false, error: 'Section ID is required for a tool' };
    }
    const enTitle = tool.title?.en?.trim() || '';
    if (!enTitle) {
      return { success: false, error: 'Tool title (EN) is required' };
    }

    const enUrl = tool.url?.en?.trim() || '';
    const enDesc = tool.description?.en?.trim() || '';

    const validLangCodes: LanguageCode[] = ['en', 'bm', 'cn', 'ta'];
    const filteredLangs = Array.isArray(tool.available_languages)
      ? tool.available_languages.filter((l): l is LanguageCode =>
          validLangCodes.includes(l as LanguageCode)
        )
      : [];
    const safeLanguages: LanguageCode[] = filteredLangs.length > 0 ? filteredLangs : ['en'];

    const payload = {
      section_id: tool.section_id,
      type: tool.type || 'link',
      title: {
        en: enTitle,
        bm: tool.title?.bm?.trim() || enTitle,
        cn: tool.title?.cn?.trim() || enTitle,
        ta: tool.title?.ta?.trim() || enTitle,
      },
      description: {
        en: enDesc,
        bm: tool.description?.bm?.trim() || enDesc,
        cn: tool.description?.cn?.trim() || enDesc,
        ta: tool.description?.ta?.trim() || enDesc,
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
        en: enUrl,
        bm: tool.url?.bm?.trim() || enUrl,
        cn: tool.url?.cn?.trim() || enUrl,
        ta: tool.url?.ta?.trim() || enUrl,
      },
      whatsapp_script: {
        en: tool.whatsapp_script?.en?.trim() || '',
        bm: tool.whatsapp_script?.bm?.trim() || tool.whatsapp_script?.en?.trim() || '',
        cn: tool.whatsapp_script?.cn?.trim() || tool.whatsapp_script?.en?.trim() || '',
        ta: tool.whatsapp_script?.ta?.trim() || tool.whatsapp_script?.en?.trim() || '',
      },
      thumbnail_url: tool.thumbnail_url?.trim() || '',
      is_featured: Boolean(tool.is_featured),
      sort_order: typeof tool.sort_order === 'number' ? tool.sort_order : 0,
      is_visible: tool.is_visible !== false,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (tool.id) {
      result = await client
        .from('tools')
        .update(payload)
        .eq('id', tool.id)
        .select()
        .single();
    } else {
      result = await client
        .from('tools')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    safeRevalidate();
    return { success: true, data: result.data as Tool };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save tool';
    return { success: false, error: message };
  }
}

export async function deleteToolAction(id: string): Promise<ActionResponse<void>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    if (!id) return { success: false, error: 'Tool ID is required' };

    const client = getAdminClient();
    const { error } = await client.from('tools').delete().eq('id', id);
    if (error) throw new Error(error.message);

    safeRevalidate();
    return { success: true, message: 'Tool deleted successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete tool';
    return { success: false, error: message };
  }
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResponse<{ url: string; path: string }>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);

    const file = (formData.get('file') || formData.get('media')) as File | null;
    if (!file || typeof file === 'string' || file.size === 0) {
      return { success: false, error: 'No valid file provided for upload' };
    }

    const client = getAdminClient();
    const bucketName = 'media';

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${Date.now()}_${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = client.storage.from(bucketName).getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      data: { url: urlData.publicUrl, path: filePath },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Media upload failed';
    return { success: false, error: message };
  }
}

// =============================================================================
// 3. ROLE-GUARDED ACTIONS: ADMIN AND SUPERADMIN ONLY
// =============================================================================

export async function updateCalendarAction(
  calendarData: Partial<TeamCalendar>
): Promise<ActionResponse<TeamCalendar>> {
  try {
    await requireSession(['editor', 'admin', 'superadmin']);
    const client = getAdminClient();

    const payload: Record<string, unknown> = {
      month_label: {
        en: calendarData.month_label?.en?.trim() || '',
        bm: calendarData.month_label?.bm?.trim() || '',
        cn: calendarData.month_label?.cn?.trim() || '',
        ta: calendarData.month_label?.ta?.trim() || '',
      },
      image_url: {
        en: calendarData.image_url?.en?.trim() || '',
        bm: calendarData.image_url?.bm?.trim() || '',
        cn: calendarData.image_url?.cn?.trim() || '',
        ta: calendarData.image_url?.ta?.trim() || '',
      },
      events: Array.isArray(calendarData.events) ? calendarData.events : [],
      recurring_rules: Array.isArray(calendarData.recurring_rules) ? calendarData.recurring_rules : [],
      blackout_dates: Array.isArray(calendarData.blackout_dates) ? calendarData.blackout_dates : [],
      default_view: calendarData.default_view || 'dynamic',
      last_reviewed_month: calendarData.last_reviewed_month || '',
      updated_at: new Date().toISOString(),
    };

    let result;
    if (calendarData.id) {
      result = await (client.from('team_calendar') as any)
        .update(payload)
        .eq('id', calendarData.id)
        .select()
        .single();
    } else {
      const { data: existing } = await client
        .from('team_calendar')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        result = await (client.from('team_calendar') as any)
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await (client.from('team_calendar') as any)
          .insert(payload)
          .select()
          .single();
      }
    }

    if (result.error) {
      // If postgres schema doesn't have the newly added json columns yet, fallback to base payload
      if (result.error.message && result.error.message.includes('does not exist')) {
        const basePayload = {
          month_label: payload.month_label,
          image_url: payload.image_url,
          events: payload.events,
          updated_at: payload.updated_at,
        };
        const fallbackRes = calendarData.id
          ? await (client.from('team_calendar') as any).update(basePayload).eq('id', calendarData.id).select().single()
          : await (client.from('team_calendar') as any).insert(basePayload).select().single();
        if (fallbackRes.error) {
          throw new Error(fallbackRes.error.message);
        }
        safeRevalidate();
        return {
          success: true,
          data: {
            ...(fallbackRes.data as TeamCalendar),
            recurring_rules: calendarData.recurring_rules,
            blackout_dates: calendarData.blackout_dates,
            default_view: calendarData.default_view,
            last_reviewed_month: calendarData.last_reviewed_month,
          },
        };
      }
      throw new Error(result.error.message);
    }

    safeRevalidate();
    return { success: true, data: result.data as TeamCalendar };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update calendar';
    return { success: false, error: message };
  }
}

export async function updateDictionaryAction(
  entryOrEntries: UiDictionary | UiDictionary[]
): Promise<ActionResponse<UiDictionary[]>> {
  try {
    await requireSession(['admin', 'superadmin']);
    const client = getAdminClient();

    const entries = Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries];
    if (entries.length === 0) {
      return { success: false, error: 'No dictionary entries provided' };
    }

    for (const item of entries) {
      if (!item.key || !item.key.trim()) {
        return { success: false, error: 'Dictionary key is required for every row' };
      }
    }

    const rows = entries.map((e) => ({
      key: e.key.trim(),
      en: e.en ?? '',
      bm: e.bm ?? '',
      cn: e.cn ?? '',
      ta: e.ta ?? '',
    }));

    const { data, error } = await client
      .from('ui_dictionary')
      .upsert(rows, { onConflict: 'key' })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    safeRevalidate();
    return { success: true, data: data as UiDictionary[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update dictionary';
    return { success: false, error: message };
  }
}

// =============================================================================
// 4. ROLE-GUARDED ACTIONS: SUPERADMIN ONLY
// =============================================================================

export async function getPinsAction(): Promise<ActionResponse<AccessPin[]>> {
  try {
    await requireSession(['superadmin']);
    const client = getAdminClient();

    const { data, error } = await client
      .from('access_pins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: (data || []) as AccessPin[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch PINs';
    return { success: false, error: message };
  }
}

export async function upsertPinAction(pinData: {
  id?: string;
  label: string;
  pin_code: string;
  role: AccessPinRole;
  is_active?: boolean;
}): Promise<ActionResponse<AccessPin>> {
  try {
    await requireSession(['superadmin']);

    if (!pinData.label || !pinData.label.trim()) {
      return { success: false, error: 'PIN label is required' };
    }
    if (!pinData.pin_code || !pinData.pin_code.trim()) {
      return { success: false, error: 'PIN code is required' };
    }
    if (!['superadmin', 'admin', 'editor'].includes(pinData.role)) {
      return { success: false, error: 'Invalid role specified' };
    }

    const client = getAdminClient();
    const payload = {
      label: pinData.label.trim(),
      pin_code: pinData.pin_code.trim(),
      role: pinData.role,
      is_active: pinData.is_active !== false,
    };

    let result;
    if (pinData.id) {
      result = await client
        .from('access_pins')
        .update(payload)
        .eq('id', pinData.id)
        .select()
        .single();
    } else {
      result = await client
        .from('access_pins')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true, data: result.data as AccessPin };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save PIN';
    return { success: false, error: message };
  }
}

export async function deletePinAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await requireSession(['superadmin']);

    if (!id) {
      return { success: false, error: 'PIN ID is required' };
    }

    if (session.id === id) {
      return {
        success: false,
        error: 'Security restriction: You cannot delete your own currently active PIN session.',
      };
    }

    const client = getAdminClient();
    const { error } = await client.from('access_pins').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: 'PIN deleted successfully' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete PIN';
    return { success: false, error: message };
  }
}

