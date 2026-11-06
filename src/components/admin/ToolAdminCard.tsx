'use client';

import React from 'react';
import { Star, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import type { Tool } from '@/types/app';

interface ToolAdminCardProps {
  tool: Tool;
  sectionName: string;
  onToggleFeatured: (tool: Tool) => void;
  onToggleVisibility: (tool: Tool) => void;
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolAdminCard({
  tool,
  sectionName,
  onToggleFeatured,
  onToggleVisibility,
  onEdit,
  onDelete,
}: ToolAdminCardProps) {
  return (
    <div className="flex flex-col justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all gap-3">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {sectionName}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 uppercase">
              {tool.type}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFeatured(tool)}
              className={`p-1.5 rounded-lg border transition-all ${
                tool.is_featured
                  ? 'bg-amber-50 text-amber-500 border-amber-300 dark:bg-amber-950/50 dark:border-amber-800'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:text-amber-500'
              }`}
              title={tool.is_featured ? 'Featured on top' : 'Click to feature'}
            >
              <Star className={`w-3.5 h-3.5 ${tool.is_featured ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onToggleVisibility(tool)}
              className={`p-1.5 rounded-lg border transition-all ${
                tool.is_visible
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
              }`}
              title={tool.is_visible ? 'Visible' : 'Hidden'}
            >
              {tool.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 line-clamp-1">
          {tool.title?.en || 'Untitled'}
        </h4>

        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
          {tool.speaker_name && <span>{tool.speaker_name}</span>}
          {tool.duration && <span>• {tool.duration}</span>}
        </div>

        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
          {tool.available_languages?.map((lang) => (
            <span
              key={lang}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => onEdit(tool)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(tool)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
