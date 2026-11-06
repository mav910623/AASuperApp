import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Section, Tool, TeamCalendar } from '@/types/app';
import {
  DEFAULT_SECTIONS,
  DEFAULT_TOOLS,
  DEFAULT_CALENDAR,
} from '@/lib/mockData';
import { MainView } from '@/components/MainView';

async function getAppData(): Promise<{
  sections: Section[];
  tools: Tool[];
  calendar: TeamCalendar;
}> {
  "use cache";
  let sections: Section[] = DEFAULT_SECTIONS;
  let tools: Tool[] = DEFAULT_TOOLS;
  let calendar: TeamCalendar = DEFAULT_CALENDAR;

  try {
    const client = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;

    const [secRes, toolsRes, calRes] = await Promise.all([
      client.from('sections').select('*').order('sort_order', { ascending: true }),
      client.from('tools').select('*').order('sort_order', { ascending: true }),
      client.from('team_calendar').select('*').limit(1),
    ]);

    if (!secRes.error && secRes.data && secRes.data.length > 0) {
      sections = secRes.data as Section[];
    }

    if (!toolsRes.error && toolsRes.data && toolsRes.data.length > 0) {
      tools = toolsRes.data as Tool[];
    }

    if (!calRes.error && calRes.data && calRes.data.length > 0) {
      calendar = calRes.data[0] as TeamCalendar;
    }
  } catch (err) {
    console.warn('[Home page] Error loading Supabase data, using default seeds:', err);
  }

  return { sections, tools, calendar };
}

export default async function Home() {
  const { sections, tools, calendar } = await getAppData();

  return (
    <MainView
      initialSections={sections}
      initialTools={tools}
      initialCalendar={calendar}
    />
  );
}

