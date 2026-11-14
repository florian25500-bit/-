import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, LogOut, ArrowRight } from 'lucide-react';

interface AdminPasscodeModalProps {
  adminEmail: string;
  onVerifyPasscode: (passcode: string) => Promise<{ verified: boolean; error?: string }>;
  onSignOut: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  adminEmail,
  onVerifyPasscode,
  onSignOut,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('กรุณากรอกรหัสผ่านเฉพาะผู้ดูแลระบบ');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await onVerifyPasscode(passcode);
      if (!result.verified) {
        setError(result.error || 'รหัสผ่านเฉพาะไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-gate-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
            ตรวจพบบัญชีผู้ดูแลระบบ (Admin Gate)
          </span>
          <h2 id="admin-gate-title" className="text-xl font-bold text-slate-900 tracking-tight">
            กรุณากรอกรหัสผ่านเฉพาะผู้ดูแลระบบ
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            บัญชี <strong className="text-slate-800">{adminEmail}</strong> มีสิทธิ์เข้าถึงแผงควบคุมพิเศษ กรุณายืนยันรหัสผ่านเฉพาะจากฐานข้อมูลก่อนเข้าใช้งานระบบ
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-gate-passcode"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              รหัสผ่านเฉพาะ (Admin Passcode)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="admin-gate-passcode"
                type={showPasscode ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="กรอกรหัสผ่านเฉพาะผู้ดูแลระบบ..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasscode((prev) => !prev)}
                aria-label={showPasscode ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>ยืนยันรหัสผ่านและเข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">ตรวจสอบสิทธิ์กับฐานข้อมูลโดยตรง</span>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
