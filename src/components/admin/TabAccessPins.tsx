'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Crown,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { upsertPinAction, deletePinAction } from '@/app/actions/adminActions';
import type { AccessPin, AccessPinRole, AdminSession } from '@/types/app';

interface TabAccessPinsProps {
  pins: AccessPin[];
  setPins: React.Dispatch<React.SetStateAction<AccessPin[]>>;
  currentSession: AdminSession;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabAccessPins({
  pins,
  setPins,
  currentSession,
  onNotify,
}: TabAccessPinsProps) {
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<AccessPin | null>(null);

  // Form State
  const [label, setLabel] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [role, setRole] = useState<AccessPinRole>('editor');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingPin(null);
    setLabel('');
    setPinCode('');
    setRole('editor');
    setIsActive(true);
    setPinModalOpen(true);
  };

  const handleOpenEdit = (pin: AccessPin) => {
    setEditingPin(pin);
    setLabel(pin.label);
    setPinCode(pin.pin_code);
    setRole(pin.role);
    setIsActive(pin.is_active);
    setPinModalOpen(true);
  };

  const handleToggleActive = async (pin: AccessPin) => {
    if (pin.id === currentSession.id) {
      onNotify('You cannot deactivate your own active session PIN', true);
      return;
    }
    const newActive = !pin.is_active;
    const res = await upsertPinAction({
      id: pin.id,
      label: pin.label,
      pin_code: pin.pin_code,
      role: pin.role,
      is_active: newActive,
    });

    if (res.success && res.data) {
      setPins((prev) => prev.map((p) => (p.id === pin.id ? res.data! : p)));
      onNotify(`Access for "${pin.label}" is now ${newActive ? 'active' : 'deactivated'}`);
    } else {
      onNotify('Failed to update PIN status', true);
    }
  };

  const handleDelete = async (pin: AccessPin) => {
    if (pin.id === currentSession.id) {
      onNotify('Security restriction: You cannot delete your own active session PIN', true);
      return;
    }
    if (!confirm(`Are you sure you want to permanently revoke access for "${pin.label}"?`)) {
      return;
    }

    const res = await deletePinAction(pin.id);
    if (res.success) {
      setPins((prev) => prev.filter((p) => p.id !== pin.id));
      onNotify(`Access PIN for "${pin.label}" deleted`);
    } else {
      onNotify(!res.success ? res.error : 'Failed to delete PIN', true);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      onNotify('Team leader / editor label is required', true);
      return;
    }
    if (!pinCode.trim() || pinCode.trim().length < 4) {
      onNotify('PIN code must be at least 4 digits', true);
      return;
    }

    setSaving(true);
    const res = await upsertPinAction({
      ...(editingPin?.id ? { id: editingPin.id } : {}),
      label: label.trim(),
      pin_code: pinCode.trim(),
      role,
      is_active: isActive,
    });
    setSaving(false);

    if (res.success && res.data) {
      const saved = res.data;
      setPins((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev];
      });
      setPinModalOpen(false);
      onNotify(`PIN access for "${saved.label}" saved successfully`);
    } else {
      onNotify(!res.success ? res.error : 'Failed to save PIN', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>PIN & Team Access Control</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Super Admin Only: Provision, update roles, or revoke PIN access for leaders & editors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New PIN</span>
        </button>
      </div>

      {/* PINs Table */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Team Member / Label</th>
                <th className="py-3.5 px-4">PIN Code</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {pins.map((pin) => {
                const isCurrent = pin.id === currentSession.id;
                const isRevealed = revealedPins[pin.id];

                return (
                  <tr
                    key={pin.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 dark:text-zinc-50">
                          {pin.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            You (Active Session)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tracking-widest text-zinc-700 dark:text-zinc-300">
                          {isRevealed ? pin.pin_code : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(pin.id)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          pin.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                            : pin.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {pin.role === 'superadmin' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        <span className="capitalize">{pin.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(pin)}
                        disabled={isCurrent}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          pin.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                        title={isCurrent ? 'Cannot deactivate self' : 'Click to toggle status'}
                      >
                        <span>{pin.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pin)}
                          className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Edit PIN or Role"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(pin)}
                          disabled={isCurrent}
                          className="p-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          title={isCurrent ? 'Cannot delete own active PIN' : 'Delete PIN'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add / Edit PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  {editingPin ? 'Edit Team PIN' : 'Add New Team PIN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Team Leader / Editor Name *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Marcus Vance - Regional Lead"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  PIN Code (Digits) *
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="e.g. 654321"
                  className="w-full font-mono text-sm tracking-widest rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Numbers only, recommended 6 digits</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Role Permission Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['editor', 'admin', 'superadmin'] as AccessPinRole[]).map((r) => {
                    const selected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center capitalize ${
                          selected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {r === 'superadmin' ? 'Super Admin' : r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Access is Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPin ? 'Update PIN' : 'Create PIN'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
