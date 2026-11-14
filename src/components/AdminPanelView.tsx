import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Languages,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { UserEntitlement } from '../types';
import { DirectoryUserItem } from '../lib/firebase';
import { isValidPublicUserId, normalizePublicUserId } from '../utils/user-id';

interface AdminPanelViewProps {
  adminEmail: string;
  adminPublicId: string;
  onLoadEntitlements: () => Promise<{
    entitlements: UserEntitlement[];
    directory: DirectoryUserItem[];
  }>;
  onSetUserEnglishAccess: (
    targetPublicId: string,
    enabled: boolean,
    note?: string
  ) => Promise<UserEntitlement>;
  onUpdatePasscode: (newPasscode: string) => Promise<void>;
  onSwitchToEnglishMode?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  adminEmail,
  adminPublicId,
  onLoadEntitlements,
  onSetUserEnglishAccess,
  onUpdatePasscode,
  onSwitchToEnglishMode,
}) => {
  const [entitlements, setEntitlements] = useState<UserEntitlement[]>([]);
  const [directory, setDirectory] = useState<DirectoryUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetIdInput, setTargetIdInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [submittingGrant, setSubmittingGrant] = useState(false);
  const [grantMessage, setGrantMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [newPasscode, setNewPasscode] = useState('');
  const [updatingPasscode, setUpdatingPasscode] = useState(false);
  const [passcodeMessage, setPasscodeMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await onLoadEntitlements();
      setEntitlements(data.entitlements);
      setDirectory(data.directory);
    } catch (err) {
      console.error('Failed to load admin entitlements:', err);
    } finally {
      setLoading(false);
    }
  }, [onLoadEntitlements]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const directoryById = new Map(directory.map((d) => [d.publicId, d]));

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePublicUserId(targetIdInput);
    if (!isValidPublicUserId(normalized)) {
      setGrantMessage({
        type: 'err',
        text: 'รูปแบบ User ID ไม่ถูกต้อง กรุณากรอกในรูปแบบ DS-XXXXXXXX (เช่น DS-7F9A2C1B)',
      });
      return;
    }

    setSubmittingGrant(true);
    setGrantMessage(null);
    try {
      await onSetUserEnglishAccess(normalized, true, noteInput);
      setGrantMessage({
        type: 'ok',
        text: `เปิดสิทธิ์โหมดการเขียนภาษาอังกฤษให้ ID ${normalized} เรียบร้อยแล้ว`,
      });
      setTargetIdInput('');
      setNoteInput('');
      await refreshList();
    } catch (err: any) {
      setGrantMessage({
        type: 'err',
        text: err?.message || 'ไม่สามารถบันทึกสิทธิ์ได้',
      });
    } finally {
      setSubmittingGrant(false);
    }
  };

  const handleToggleAccess = async (ent: UserEntitlement) => {
    try {
      await onSetUserEnglishAccess(ent.publicId, !ent.english_writing_enabled, ent.note);
      await refreshList();
    } catch (err: any) {
      setGrantMessage({
        type: 'err',
        text: err?.message || 'ไม่สามารถอัปเดตสถานะได้',
      });
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 6) {
      setPasscodeMessage({ type: 'err', text: 'รหัสผ่านเฉพาะต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    setUpdatingPasscode(true);
    setPasscodeMessage(null);
    try {
      await onUpdatePasscode(newPasscode.trim());
      setNewPasscode('');
      setPasscodeMessage({
        type: 'ok',
        text: 'อัปเดตรหัสผ่านเฉพาะของแอดมินลงในฐานข้อมูลเรียบร้อยแล้ว',
      });
    } catch (err: any) {
      setPasscodeMessage({
        type: 'err',
        text: err?.message || 'ไม่สามารถอัปเดตรหัสผ่านได้',
      });
    } finally {
      setUpdatingPasscode(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const enabledCount = entitlements.filter((e) => e.english_writing_enabled).length;
  const adminHasEnglish = entitlements.some(
    (e) => e.publicId === adminPublicId && e.english_writing_enabled
  );

  return (
    <div className="space-y-6 py-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>แผงควบคุมพิเศษ (Admin Control Panel)</span>
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {adminEmail}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              จัดการสิทธิ์ User ID และเปิดโหมดการเขียนภาษาอังกฤษ (DE / EN)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              เพิ่มเลข User ID ของผู้เรียน (เช่น <span className="font-mono font-semibold text-slate-700">DS-XXXXXXXX</span>) เพื่อปลดล็อกโหมดการเขียนภาษาอังกฤษ A1–C1 ที่ถอดโครงสร้างมาตรฐานจากระบบเยอรมันหลัก
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTargetIdInput(adminPublicId);
                setNoteInput('บัญชีผู้ดูแลระบบ (Admin)');
              }}
              className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
            >
              ใส่ ID ของฉัน ({adminPublicId})
            </button>

            {adminHasEnglish && onSwitchToEnglishMode && (
              <button
                type="button"
                onClick={onSwitchToEnglishMode}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>เปิดโหมดเขียนภาษาอังกฤษ</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void refreshList()}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Grant Access Form + Entitlements Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Add User ID Form + Admin Passcode Update (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grant Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">
                  เพิ่ม ID ผู้ใช้เพื่อเปิดโหมดการเขียนภาษาอังกฤษ
                </h2>
                <p className="text-[11px] text-slate-500">
                  เมื่อเพิ่มแล้ว ผู้ใช้ที่ใช้ ID นั้นจะเห็นปุ่มสลับภาษา DE / EN ทันที
                </p>
              </div>
            </div>

            {grantMessage && (
              <div
                role="alert"
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  grantMessage.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {grantMessage.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{grantMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleGrantSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="admin-target-user-id"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  เลข User ID เฉพาะของผู้ใช้ *
                </label>
                <input
                  id="admin-target-user-id"
                  type="text"
                  required
                  value={targetIdInput}
                  onChange={(e) => setTargetIdInput(e.target.value.toUpperCase())}
                  placeholder="เช่น DS-7F9A2C1B"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-target-note"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  หมายเหตุ / ชื่ออ้างอิง (ไม่บังคับ)
                </label>
                <input
                  id="admin-target-note"
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="เช่น นักเรียนคอร์ส IELTS / B2 English"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingGrant}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Languages className="w-4 h-4" />
                <span>
                  {submittingGrant ? 'กำลังบันทึกสิทธิ์...' : 'เพิ่ม ID และเปิดโหมดการเขียนภาษาอังกฤษ'}
                </span>
              </button>
            </form>

            {/* Quick-pick from registered user directory */}
            {directory.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  ผู้ใช้ที่เคยเข้าสู่ระบบล่าสุด ({directory.length} บัญชี):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {directory.slice(0, 8).map((u) => (
                    <button
                      key={u.publicId}
                      type="button"
                      onClick={() => {
                        setTargetIdInput(u.publicId);
                        if (!noteInput) setNoteInput(u.displayName);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      <span className="font-mono font-bold">{u.publicId}</span>{' '}
                      <span className="text-slate-500">({u.displayName})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DB Admin Passcode Management */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">รหัสผ่านเฉพาะแอดมินในฐานข้อมูล</h2>
                <p className="text-[11px] text-slate-500">
                  ตั้งค่าเริ่มต้นไว้ที่ <span className="font-mono">Ff0872559580</span> และเปลี่ยนใหม่ได้ทุกเมื่อ
                </p>
              </div>
            </div>

            {passcodeMessage && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  passcodeMessage.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {passcodeMessage.text}
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="flex gap-2">
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="ตั้งรหัสผ่านเฉพาะใหม่ (อย่างน้อย 6 ตัว)..."
                className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={updatingPasscode}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
              >
                {updatingPasscode ? 'กำลังบันทึก...' : 'อัปเดตรหัส'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Entitlements List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="font-bold text-sm text-slate-900">
                  รายชื่อ User ID ที่ได้รับสิทธิ์โหมดการเขียนภาษาอังกฤษ ({enabledCount} เปิดใช้งาน)
                </h2>
                <p className="text-[11px] text-slate-500">
                  โหมดภาษาอังกฤษมีคลังข้อสอบ CEFR A1–C1, AI Examiner, บทเรียนไวยากรณ์ และคลังคำเชื่อมครบชุด
                </p>
              </div>
            </div>
          </div>

          {entitlements.length === 0 ? (
            <div className="py-12 px-6 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Languages className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">ยังไม่มี User ID ที่ได้รับสิทธิ์</p>
              <p className="text-[11px] text-slate-500">
                กรอกเลข ID ของผู้ใช้ (เช่น <span className="font-mono">DS-XXXXXXXX</span>) ในช่องด้านซ้ายเพื่อเพิ่มสิทธิ์โหมดการเขียนภาษาอังกฤษ
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">ชื่ออ้างอิง</th>
                    <th className="py-2.5 px-3">สถานะโหมดอังกฤษ</th>
                    <th className="py-2.5 px-3">วันที่บันทึก</th>
                    <th className="py-2.5 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entitlements.map((ent) => {
                    const dirUser = directoryById.get(ent.publicId);
                    return (
                      <tr key={ent.publicId} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{ent.publicId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(ent.publicId)}
                              className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="คัดลอก User ID"
                            >
                              {copiedId === ent.publicId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {ent.note || dirUser?.displayName || '—'}
                        </td>
                        <td className="py-3 px-3">
                          {ent.english_writing_enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>เปิดใช้งาน (DE + EN)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[10px]">
                              <XCircle className="w-3 h-3" />
                              <span>ปิดสิทธิ์อยู่ (DE เท่านั้น)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500">
                          {ent.granted_at
                            ? new Date(ent.granted_at).toLocaleDateString('th-TH')
                            : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => void handleToggleAccess(ent)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              ent.english_writing_enabled
                                ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {ent.english_writing_enabled ? 'ปิดสิทธิ์' : 'เปิดสิทธิ์'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
