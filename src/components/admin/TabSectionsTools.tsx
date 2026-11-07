'use client';

import React, { useState } from 'react';
import {
  Folder,
  Wrench,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  Search,
  Check,
  AlertCircle,
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { SectionModal } from './SectionModal';
import { ToolModal } from './ToolModal';
import { ToolAdminCard } from './ToolAdminCard';
import {
  upsertSectionAction,
  deleteSectionAction,
  reorderSectionsAction,
  upsertToolAction,
  deleteToolAction,
  reorderToolsAction,
} from '@/app/actions/adminActions';
import type { Section, Tool } from '@/types/app';

interface TabSectionsToolsProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  tools: Tool[];
  setTools: React.Dispatch<React.SetStateAction<Tool[]>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabSectionsTools({
  sections,
  setSections,
  tools,
  setTools,
  onNotify,
}: TabSectionsToolsProps) {
  const [subTab, setSubTab] = useState<'sections' | 'tools'>('sections');

  // Modals state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // Tools filter state
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reorder sections
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((sec, idx) => ({ ...sec, sort_order: idx + 1 }));
    setSections(updated);

    const res = await reorderSectionsAction(updated.map((s) => ({ id: s.id, sort_order: s.sort_order })));
    if (res.success) {
      onNotify('Sections reordered successfully');
    } else {
      onNotify(!res.success ? res.error : 'Failed to save order in database', true);
    }
  };

  // Reorder tools within their section (Gap 1)
  const handleMoveTool = async (tool: Tool, direction: 'up' | 'down') => {
    const sectionTools = tools
      .filter((t) => t.section_id === tool.section_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const index = sectionTools.findIndex((t) => t.id === tool.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionTools.length) return;

    const reordered = [...sectionTools];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedSectionTools = reordered.map((t, idx) => ({ ...t, sort_order: idx + 1 }));

    setTools((prev) =>
      prev.map((t) => {
        const found = updatedSectionTools.find((u) => u.id === t.id);
        return found || t;
      })
    );

    const res = await reorderToolsAction(
      updatedSectionTools.map((t) => ({ id: t.id, sort_order: t.sort_order }))
    );
    if (res.success) {
      onNotify('Tool reordered successfully');
    } else {
      onNotify(!res.success ? res.error : 'Failed to save tool order', true);
    }
  };

  // Toggle section visibility
  const handleToggleSectionVisibility = async (sec: Section) => {
    const newVis = !sec.is_visible;
    const updated = sections.map((s) => (s.id === sec.id ? { ...s, is_visible: newVis } : s));
    setSections(updated);

    const res = await upsertSectionAction({ ...sec, is_visible: newVis });
    if (res.success) {
      onNotify(`Section is now ${newVis ? 'visible' : 'hidden'}`);
    } else {
      onNotify(!res.success ? res.error : 'Failed to update visibility', true);
    }
  };

  // Delete section
  const handleDeleteSection = async (sec: Section) => {
    if (!confirm(`Are you sure you want to delete section "${sec.title.en}"? All associated tools will also be deleted.`)) {
      return;
    }

    const res = await deleteSectionAction(sec.id);
    if (res.success) {
      setSections((prev) => prev.filter((s) => s.id !== sec.id));
      setTools((prev) => prev.filter((t) => t.section_id !== sec.id));
      onNotify('Section and tools deleted successfully');
    } else {
      onNotify(!res.success ? res.error : 'Failed to delete section', true);
    }
  };

  // Save section
  const handleSaveSection = async (payload: Partial<Section>): Promise<boolean> => {
    const res = await upsertSectionAction(payload);
    if (res.success && res.data) {
      const saved = res.data;
      setSections((prev) => {
        const exists = prev.some((s) => s.id === saved.id);
        if (exists) {
          return prev.map((s) => (s.id === saved.id ? saved : s));
        }
        return [...prev, saved];
      });
      onNotify('Section saved successfully');
      return true;
    }
    const errMsg = !res.success ? res.error : 'Failed to save section';
    onNotify(errMsg, true);
    return false;
  };

  // Toggle tool featured
  const handleToggleToolFeatured = async (tool: Tool) => {
    const newFeatured = !tool.is_featured;
    setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, is_featured: newFeatured } : t)));

    const res = await upsertToolAction({ ...tool, is_featured: newFeatured });
    if (res.success) {
      onNotify(`Tool ${newFeatured ? 'featured on top' : 'unfeatured'}`);
    } else {
      onNotify(!res.success ? res.error : 'Failed to update tool', true);
    }
  };

  // Toggle tool visibility
  const handleToggleToolVisibility = async (tool: Tool) => {
    const newVis = !tool.is_visible;
    setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, is_visible: newVis } : t)));

    const res = await upsertToolAction({ ...tool, is_visible: newVis });
    if (res.success) {
      onNotify(`Tool is now ${newVis ? 'visible' : 'hidden'}`);
    } else {
      onNotify(!res.success ? res.error : 'Failed to update tool visibility', true);
    }
  };

  // Delete tool
  const handleDeleteTool = async (tool: Tool) => {
    if (!confirm(`Delete tool "${tool.title.en}"?`)) return;

    const res = await deleteToolAction(tool.id);
    if (res.success) {
      setTools((prev) => prev.filter((t) => t.id !== tool.id));
      onNotify('Tool deleted successfully');
    } else {
      onNotify(!res.success ? res.error : 'Failed to delete tool', true);
    }
  };

  // Save tool
  const handleSaveTool = async (payload: Partial<Tool>): Promise<boolean> => {
    const res = await upsertToolAction(payload);
    if (res.success && res.data) {
      const saved = res.data;
      setTools((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        const list = exists
          ? prev.map((t) => (t.id === saved.id ? saved : t))
          : [...prev, saved];
        return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      });
      onNotify('Tool saved successfully');
      return true;
    }
    const errMsg = !res.success ? res.error : 'Failed to save tool';
    onNotify(errMsg, true);
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Subtab Toggle & Global Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setSubTab('sections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'sections'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Folder className="w-4 h-4 text-amber-500" />
            <span>Manage Sections ({sections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'tools'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-500" />
            <span>Manage Tools ({tools.length})</span>
          </button>
        </div>

        <div>
          {subTab === 'sections' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSection(null);
                setSectionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingTool(null);
                setToolModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tool</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'sections' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Drag or use arrows to reorder sections. Changes save immediately.</span>
            <span>{sections.length} total sections</span>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => {
              const secToolsCount = tools.filter((t) => t.section_id === sec.id).length;
              return (
                <div
                  key={sec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="flex flex-col gap-0.5 items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        aria-label="Move Up"
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        aria-label="Move Down"
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {sec.title?.en || 'Untitled'}
                        </span>
                        <span className="text-xs text-zinc-400">/{sec.slug}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {secToolsCount} {secToolsCount === 1 ? 'tool' : 'tools'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 flex-wrap">
                        {sec.title?.bm && <span>BM: {sec.title.bm}</span>}
                        {sec.title?.cn && <span>• 中文: {sec.title.cn}</span>}
                        {sec.title?.ta && <span>• தமிழ்: {sec.title.ta}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleSectionVisibility(sec)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        sec.is_visible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                      }`}
                    >
                      {sec.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{sec.is_visible ? 'Visible' : 'Hidden'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(sec);
                        setSectionModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit Section"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec)}
                      className="p-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools by title or speaker..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                />
              </div>

              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                <option value="all">All Sections ({tools.length})</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title?.en || sec.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tools Grid */}
          {(() => {
            const filteredTools = tools.filter((tool) => {
              if (selectedSectionFilter !== 'all' && tool.section_id !== selectedSectionFilter) {
                return false;
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchSpeaker = tool.speaker_name?.toLowerCase().includes(q);
                const matchTitle = Object.values(tool.title || {}).some(
                  (v) => typeof v === 'string' && v.toLowerCase().includes(q)
                );
                return matchSpeaker || matchTitle;
              }
              return true;
            });

            if (filteredTools.length === 0) {
              return (
                <div className="text-center py-12 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6">
                  <p className="text-sm font-semibold text-zinc-500">No tools match your criteria.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTools.map((tool) => {
                  const section = sections.find((s) => s.id === tool.section_id);
                  const sectionTools = tools
                    .filter((t) => t.section_id === tool.section_id)
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                  const sIdx = sectionTools.findIndex((t) => t.id === tool.id);
                  const canMoveUp = sIdx > 0;
                  const canMoveDown = sIdx !== -1 && sIdx < sectionTools.length - 1;

                  return (
                    <ToolAdminCard
                      key={tool.id}
                      tool={tool}
                      sectionName={section?.title?.en || 'Section'}
                      onToggleFeatured={handleToggleToolFeatured}
                      onToggleVisibility={handleToggleToolVisibility}
                      onEdit={(t) => {
                        setEditingTool(t);
                        setToolModalOpen(true);
                      }}
                      onDelete={handleDeleteTool}
                      onMoveUp={() => handleMoveTool(tool, 'up')}
                      onMoveDown={() => handleMoveTool(tool, 'down')}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Modals */}
      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onSave={handleSaveSection}
        section={editingSection}
      />

      <ToolModal
        isOpen={toolModalOpen}
        onClose={() => setToolModalOpen(false)}
        onSave={handleSaveTool}
        tool={editingTool}
        sections={sections}
      />
    </div>
  );
}
