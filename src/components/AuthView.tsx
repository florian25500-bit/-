import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  X,
  Copy,
  Check,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginAsGuest,
  createInstantProfile,
  syncUserProfile,
} from '../lib/firebase';

interface AuthViewProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const [mode, setMode] = useState<'instant' | 'login' | 'register'>('instant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [instantName, setInstantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';
    
    if (code.includes('unauthorized-domain') || message.includes('auth/unauthorized-domain')) {
      setIsDomainError(true);
      return 'โดเมนสภาพแวดล้อมพรีวิวนี้ยังไม่ได้ถูกเพิ่มใน Authorized Domains ของ Firebase Console (คุณสามารถใช้ปุ่ม "สร้างโปรไฟล์ผู้เรียนทันที" เพื่อใช้งานและบันทึกประวัติคะแนนได้ทันที)';
    }
    if (code.includes('admin-restricted-operation') || message.includes('admin-restricted-operation')) {
      return 'บริการนี้ยังไม่ได้เปิดใช้งานใน Firebase Console กรุณาใช้ "สร้างโปรไฟล์ผู้เรียนทันที" หรือปุ่ม Google';
    }
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบใหม่อีกครั้ง';
    }
    if (code.includes('email-already-in-use')) {
      return 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ';
    }
    if (code.includes('weak-password')) {
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }
    if (code.includes('invalid-email')) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'หน้าต่างเข้าสู่ระบบด้วย Google ถูกปิดก่อนทำรายการเสร็จ';
    }
    return err?.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน โปรดลองอีกครั้ง';
  };

  const handleCopyDomain = () => {
    if (navigator?.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 3000);
    }
  };

  const handleInstantProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = instantName.trim() || 'ผู้เรียนภาษาเยอรมัน';
    const profile = createInstantProfile(name);
    syncUserProfile(profile);
    onSuccess?.();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsDomainError(false);
      const result = await signInWithGoogle();
      if (result.user) {
        await syncUserProfile(result.user);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setIsDomainError(false);
      if (mode === 'login') {
        const result = await loginWithEmail(email, password);
        if (result.user) {
          await syncUserProfile(result.user);
        }
      } else {
        const result = await registerWithEmail(email, password, displayName || undefined);
        if (result.user) {
          await syncUserProfile(result.user);
        }
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setErrorMessage(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsDomainError(false);
      const user = await loginAsGuest();
      if (user) {
        await syncUserProfile(user);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      setErrorMessage(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-md max-w-md w-full relative">
      {isModal && onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand & Title */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {mode === 'instant'
            ? 'เข้าสู่ระบบโปรไฟล์ผู้เรียน'
            : mode === 'login'
            ? 'เข้าสู่ระบบ DeutschSchreiben'
            : 'สร้างบัญชีผู้เรียนใหม่'}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {mode === 'instant'
            ? 'ตั้งชื่อโปรไฟล์เพื่อเริ่มทำข้อสอบ บันทึกคะแนน CEFR และคลังคำศัพท์ได้ทันที'
            : mode === 'login'
            ? 'เข้าสู่ระบบเพื่อเข้าถึงประวัติงานเขียน คะแนน CEFR และคลังคำศัพท์ส่วนตัวของคุณ'
            : 'บันทึกประวัติการส่งงานเขียนและพัฒนาการทางภาษาเยอรมันของคุณอย่างปลอดภัย'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl mb-5 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => {
            setMode('instant');
            setErrorMessage(null);
            setIsDomainError(false);
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
            mode === 'instant'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ด่วน (Instant)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
            setIsDomainError(false);
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMessage(null);
            setIsDomainError(false);
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          สมัครใหม่
        </button>
      </div>

      {/* Domain Error Notice with Copy button & Instant Fallback */}
      {isDomainError && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold">ตรวจพบข้อจำกัดโดเมนของ Firebase:</span>
              <p className="mt-1 text-[11px] text-amber-800">
                เนื่องจากเบราว์เซอร์อยู่ในสภาพแวดล้อมพรีวิว Cloud Run (<code className="bg-amber-100 px-1 py-0.5 rounded text-[10px] break-all">{currentHostname}</code>) ซึ่ง Firebase จะบล็อก Google Sign-In จนกว่าจะเพิ่มโดเมนนี้ใน Console
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyDomain}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              {domainCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{domainCopied ? 'คัดลอกแล้ว!' : 'คัดลอกชื่อโดเมน'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('instant');
                setIsDomainError(false);
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>ใช้โปรไฟล์ทันที (ไม่ต้องตั้งค่า)</span>
            </button>
          </div>
        </div>
      )}

      {/* General Error Notice */}
      {errorMessage && !isDomainError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Instant Profile Mode Form */}
      {mode === 'instant' ? (
        <form onSubmit={handleInstantProfile} className="space-y-4">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 text-xs leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 text-blue-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              พร้อมใช้งานทันที ไม่ติดปัญหา Authorized Domain
            </span>
            พิมพ์ชื่อของคุณเพื่อสร้างโปรไฟล์ผู้เรียน ระบบจะจัดเก็บประวัติผลการตรวจข้อสอบ คะแนน CEFR และคลังคำศัพท์ของคุณอย่างถาวร
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อผู้เรียนของคุณ (Learner Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={instantName}
                onChange={(e) => setInstantName(e.target.value)}
                placeholder="เช่น Florian Schmidt หรือ Alex"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Zap className="w-4 h-4" />
            <span>เริ่มเรียนและเก็บประวัติทันที 🚀</span>
          </button>
        </form>
      ) : (
        <>
          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl border-2 border-blue-600 bg-blue-50/40 hover:bg-blue-50 text-blue-900 text-xs font-bold flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50 mb-4"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วยบัญชี Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">หรือใช้อีเมล</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้เรียน (Display Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น Alex Schmidt"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล (Email Address)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ยืนยันสร้างบัญชีใหม่</span>
                </>
              )}
            </button>
          </form>
        </>
      )}

      {/* Guest Mode */}
      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          disabled={loading}
          onClick={handleGuestSignIn}
          className="text-xs text-slate-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>ทดลองใช้งานแบบ Guest (ไม่ต้องระบุชื่อ)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[11px] text-slate-400 mt-1">
          * ข้อมูลจะถูกจัดเก็บเฉพาะในอุปกรณ์และเบราว์เซอร์นี้
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>ระบบความปลอดภัย Firebase Authentication มาตรฐานสากล</span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      {cardContent}
    </div>
  );
};
