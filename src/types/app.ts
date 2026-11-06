/**
 * Team Hub - Application & Supabase Database Type Definitions
 */

export type LanguageCode = 'en' | 'bm' | 'cn' | 'ta';

export type LocalizedString = Record<LanguageCode, string>;

export type LocalizedStringArray = Record<LanguageCode, string[]>;

export type AccessPinRole = 'superadmin' | 'admin' | 'editor';

export type AccessPin = {
  id: string;
  label: string;
  pin_code: string;
  role: AccessPinRole;
  is_active: boolean;
  created_at: string;
};

export type UiDictionary = {
  key: string;
  en: string;
  bm: string;
  cn: string;
  ta: string;
  id?: string;
  created_at?: string;
};

export type Section = {
  id: string;
  slug: string;
  icon_name: string;
  sort_order: number;
  is_visible: boolean;
  title: LocalizedString;
  description: LocalizedString;
  created_at?: string;
  updated_at?: string;
};

export type ToolType = 'youtube' | 'soundcloud' | 'video' | 'pdf' | 'image' | 'link';

export type Tool = {
  id: string;
  section_id: string;
  type: ToolType;
  title: LocalizedString;
  description: LocalizedString;
  speaker_name: string;
  duration: string;
  available_languages: LanguageCode[];
  topics: LocalizedStringArray;
  url: LocalizedString;
  whatsapp_script: LocalizedString;
  thumbnail_url: string;
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  title: LocalizedString;
  speaker: string;
  venue?: string;
  location_or_link: string;
  description?: string;
  image_url?: string;
};

export type RecurringRule = {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly_nth_weekday';
  day_of_week?: number; // 0=Sun..6=Sat
  nth_week?: number; // 1..5 (for monthly_nth_weekday)
  time: string;
  venue: string;
  address_or_link: string;
  speaker?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
};

export type BlackoutDate = {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  rule_id?: string; // 'all' or specific rule id
};

export type TeamCalendar = {
  id: string;
  month_label: LocalizedString;
  image_url: LocalizedString;
  events: CalendarEvent[];
  recurring_rules?: RecurringRule[];
  blackout_dates?: BlackoutDate[];
  default_view?: 'flyer' | 'dynamic';
  last_reviewed_month?: string; // YYYY-MM
  created_at?: string;
  updated_at?: string;
};

/**
 * Supabase Database schema definitions
 */
export type Database = {
  public: {
    Tables: {
      access_pins: {
        Row: AccessPin;
        Insert: Omit<AccessPin, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AccessPin>;
        Relationships: [];
      };
      ui_dictionary: {
        Row: UiDictionary;
        Insert: UiDictionary;
        Update: Partial<UiDictionary>;
        Relationships: [];
      };
      sections: {
        Row: Section;
        Insert: Omit<Section, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Section>;
        Relationships: [];
      };
      tools: {
        Row: Tool;
        Insert: Omit<Tool, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Tool>;
        Relationships: [];
      };
      team_calendar: {
        Row: TeamCalendar;
        Insert: Omit<TeamCalendar, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<TeamCalendar>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

/**
 * Supported language metadata
 */
export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'bm', label: 'Malay', nativeLabel: 'Bahasa Melayu' },
  { code: 'cn', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const PIN_SESSION_COOKIE = 'teamhub_admin_session';

export interface AdminSession {
  id: string;
  label: string;
  role: AccessPinRole;
}

export type ActionResponse<T = unknown> =
  | { success: true; data?: T; session?: AdminSession | null; url?: string; path?: string; message?: string }
  | { success: false; error: string; session?: null; data?: null };

export interface AdminDashboardData {
  session: AdminSession;
  sections: Section[];
  tools: Tool[];
  calendar: TeamCalendar;
  dictionary: UiDictionary[];
  pins?: AccessPin[];
}

