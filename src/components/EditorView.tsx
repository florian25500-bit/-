import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Sparkles,
  RotateCcw,
  RotateCw,
  Send,
  AlertCircle,
  FileText,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Shuffle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  X,
  PenTool,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AssessmentMode,
  AttachedImagePayload,
  CEFRLevel,
  TargetLevelOption,
  TaskCategory,
  WritingSubmitOptions,
  WritingTask,
} from '../types';
import {
  countGermanWords,
  countGermanChars,
  countParagraphs,
  estimateReadingTimeMinutes,
} from '../utils/scoring';
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES } from '../utils/assessment-core';

interface EditorViewProps {
  tasks: WritingTask[];
  selectedTask: WritingTask;
  initialMode?: AssessmentMode;
  onModeChange?: (mode: AssessmentMode) => void;
  onSelectTask: (task: WritingTask) => void;
  onRollRandomTask: (levelFilter?: string) => void;
  onSubmit: (task: WritingTask, text: string, options?: WritingSubmitOptions) => Promise<void>;
  isSubmitting: boolean;
}

interface LocalAttachedImage extends AttachedImagePayload {
  previewUrl: string;
  sizeBytes: number;
}

const FREE_DRAFT_STORAGE_KEY = 'deutschschreiben_draft_free_writing';
const FREE_PROMPT_STORAGE_KEY = 'deutschschreiben_free_custom_prompt';

const FREE_CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'Freier Text', label: 'ทั่วไป / อิสระ (Freier Text)' },
  { id: 'E-Mail', label: 'อีเมล (E-Mail)' },
  { id: 'Brief', label: 'จดหมาย (Brief)' },
  { id: 'Stellungnahme', label: 'แสดงความคิดเห็น (Stellungnahme)' },
  { id: 'Erörterung', label: 'เรียงความโต้แย้ง (Erörterung)' },
  { id: 'Bericht', label: 'รายงาน (Bericht)' },
  { id: 'Beschwerde', label: 'ร้องเรียน (Beschwerde)' },
];

const TARGET_LEVEL_OPTIONS: { id: TargetLevelOption; label: string }[] = [
  { id: 'AUTO', label: 'อัตโนมัติ (ตามงานเขียนจริง)' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const EditorView: React.FC<EditorViewProps> = ({
  tasks,
  selectedTask,
  initialMode = 'exam',
  onModeChange,
  onRollRandomTask,
  onSubmit,
  isSubmitting,
}) => {
  const [mode, setMode] = useState<AssessmentMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const draftStorageKey =
    mode === 'free' ? FREE_DRAFT_STORAGE_KEY : `deutschschreiben_draft_${selectedTask.id}`;

  const [text, setText] = useState<string>(() => {
    try {
      return localStorage.getItem(draftStorageKey) || '';
    } catch {
      return '';
    }
  });

  // Free writing optional settings
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    try {
      return localStorage.getItem(FREE_PROMPT_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [freeTargetLevel, setFreeTargetLevel] = useState<TargetLevelOption>('AUTO');
  const [freeCategory, setFreeCategory] = useState<TaskCategory>('Freier Text');

  // Optional attached image (supported in both modes)
  const [attachedImage, setAttachedImage] = useState<LocalAttachedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);

  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [lastSaved, setLastSaved] = useState<string>('พร้อมสำหรับการเขียน');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Interactive Exam Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    selectedTask.time_limit_minutes * 60
  );
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when task or mode changes
  useEffect(() => {
    setCheckedRequirements({});
    setValidationError(null);
    setUndoStack([]);
    setRedoStack([]);
    try {
      const savedDraft = localStorage.getItem(draftStorageKey) || '';
      setText(savedDraft);
    } catch {
      setText('');
    }
    if (mode === 'exam') {
      setTimeRemainingSeconds(selectedTask.time_limit_minutes * 60);
      setIsTimerRunning(false);
    }
  }, [selectedTask, mode, draftStorageKey]);

  // Exam timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (mode === 'exam' && isTimerRunning && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeRemainingSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isTimerRunning, timeRemainingSeconds]);

  // Autosave text draft to localStorage
  useEffect(() => {
    if (!text.trim()) {
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}
      setLastSaved('พร้อมสำหรับการเขียน');
      return;
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftStorageKey, text);
      } catch (err) {
        console.warn('Draft save error:', err);
      }
      const now = new Date();
      setLastSaved(
        `บันทึกแบบร่างอัตโนมัติ ${now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        })} น.`
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [text, draftStorageKey]);

  // Autosave optional custom prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (customPrompt.trim()) {
          localStorage.setItem(FREE_PROMPT_STORAGE_KEY, customPrompt);
        } else {
          localStorage.removeItem(FREE_PROMPT_STORAGE_KEY);
        }
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [customPrompt]);

  const handleSwitchMode = (nextMode: AssessmentMode) => {
    setMode(nextMode);
    setValidationError(null);
    onModeChange?.(nextMode);
  };

  const words = countGermanWords(text);
  const chars = countGermanChars(text);
  const paragraphs = countParagraphs(text);
  const readingTime = estimateReadingTimeMinutes(words);

  const isExamMode = mode === 'exam';
  const isWordCountValid =
    isExamMode && words >= selectedTask.min_words && words <= selectedTask.max_words;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Insert German Umlauts / Eszett at cursor
  const insertGermanChar = (char: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.substring(0, start) + char + text.substring(end);
    setUndoStack((prev) => [...prev, text]);
    setText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUndoStack((prev) => [...prev.slice(-20), text]);
    setRedoStack([]);
    setText(val);
    if (validationError && (val.trim().length > 10 || attachedImage)) {
      setValidationError(null);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, text]);
    setUndoStack((u) => u.slice(0, -1));
    setText(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, text]);
    setRedoStack((r) => r.slice(0, -1));
    setText(next);
  };

  const handleLoadSampleDraft = () => {
    if (isExamMode && selectedTask.preset_draft) {
      setUndoStack((prev) => [...prev, text]);
      setText(selectedTask.preset_draft);
      setValidationError(null);
    }
  };

  const handleClear = () => {
    setUndoStack((prev) => [...prev, text]);
    setText('');
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {}
    setValidationError(null);
  };

  const handleRequirementToggle = (idx: number) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const processSelectedImageFile = (file: File) => {
    setImageError(null);
    const normalizedType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
    if (!(ALLOWED_IMAGE_MIMES as readonly string[]).includes(normalizedType)) {
      setImageError('รองรับเฉพาะไฟล์รูปภาพ PNG, JPG/JPEG หรือ WEBP เท่านั้น');
      return;
    }
    if (file.size === 0) {
      setImageError('ไฟล์รูปภาพนี้ว่างเปล่า');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('ไฟล์รูปภาพมีขนาดใหญ่เกิน 5 MB กรุณาย่อขนาดรูปก่อนแนบ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = dataUrl.indexOf(',');
      const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
      if (!base64Data) {
        setImageError('ไม่สามารถอ่านข้อมูลไฟล์รูปภาพได้');
        return;
      }
      setAttachedImage({
        name: file.name,
        mimeType: normalizedType as LocalAttachedImage['mimeType'],
        data: base64Data,
        previewUrl: dataUrl,
        sizeBytes: file.size,
      });
      setValidationError(null);
    };
    reader.onerror = () => {
      setImageError('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImageFile(file);
    }
    // Allow re-selecting the same file later
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImageError(null);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !attachedImage) {
      setValidationError(
        isExamMode
          ? 'กรุณาเขียนข้อความภาษาเยอรมันหรือแนบไฟล์รูปภาพงานเขียนก่อนกดส่งตรวจ'
          : 'กรุณาพิมพ์ข้อความภาษาเยอรมัน หรือแนบไฟล์รูปภาพงานเขียนก่อนกดส่งตรวจ'
      );
      return;
    }

    setValidationError(null);
    try {
      await onSubmit(selectedTask, text, {
        mode,
        customPrompt: mode === 'free' ? customPrompt.trim() : undefined,
        targetLevel: mode === 'free' ? freeTargetLevel : selectedTask.cefr_level,
        taskCategory: mode === 'free' ? freeCategory : selectedTask.category,
        attachedImage: attachedImage
          ? {
              name: attachedImage.name,
              mimeType: attachedImage.mimeType,
              data: attachedImage.data,
              sizeBytes: attachedImage.sizeBytes,
            }
          : null,
      });
    } catch (err: any) {
      setValidationError(err?.message || 'การประเมินผลไม่สำเร็จ กรุณาตรวจสอบข้อความ');
    }
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'A1':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'A2':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'B1':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'B2':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'C1':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const levelOptions = [
    { id: 'ALL', label: `ทั้งหมด (${tasks.length})` },
    ...(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => ({
      id: lvl,
      label: `${lvl} (${tasks.filter((t) => t.cefr_level === lvl).length})`,
    })),
  ];

  const renderImageUploader = (compact = false) => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5 text-blue-600" />
          <span>แนบไฟล์รูปภาพ (ไม่บังคับ)</span>
        </span>
        <span className="text-[10px] text-slate-400">PNG / JPG / WEBP • ≤ 5 MB</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInputChange}
        aria-label="แนบไฟล์รูปภาพโจทย์หรืองานเขียน"
        className="hidden"
      />

      {!attachedImage ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingImage(true);
          }}
          onDragLeave={() => setIsDraggingImage(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingImage(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) processSelectedImageFile(droppedFile);
          }}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
            compact ? 'p-3.5' : 'p-5'
          } ${
            isDraggingImage
              ? 'border-blue-500 bg-blue-50/70'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
          }`}
        >
          <ImagePlus className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-700">
            คลิกเพื่อเลือกรูป หรือลากไฟล์มาวาง
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            แนบรูปโจทย์ กราฟ/ตาราง (Grafik) หรือรูปถ่ายงานเขียนลายมือได้
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
          <div className="flex items-start gap-3">
            <img
              src={attachedImage.previewUrl}
              alt={`ตัวอย่างรูปภาพ ${attachedImage.name}`}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-bold text-slate-900 truncate" title={attachedImage.name}>
                {attachedImage.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {attachedImage.mimeType.replace('image/', '').toUpperCase()} •{' '}
                {formatFileSize(attachedImage.sizeBytes)}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  เปลี่ยนรูป
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>ลบไฟล์รูป</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {imageError && (
        <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          {imageError}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-5 py-6 animate-in fade-in duration-200">
      {/* Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:px-5 shadow-xs">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleSwitchMode('exam')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'exam'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ข้อสอบกลางมาตรฐาน (Exam)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('free')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'free'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>ตรวจงานเขียนอิสระ (ไม่กำหนดโจทย์)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 self-end sm:self-auto cursor-pointer ${
            isFocusMode
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title={isFocusMode ? 'ออกจากโหมดสมาธิ' : 'เปิดโหมดเขียนเต็มจอ (Focus Mode)'}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFocusMode ? 'มุมมองปกติ' : 'โหมดสมาธิ'}</span>
        </button>
      </div>

      {/* Mode Header Banner */}
      {isExamMode ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ข้อสอบกลางมาตรฐาน (Zentraler Prüfungstest)</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-xs border ${getLevelStyle(
                    selectedTask.cefr_level
                  )}`}
                >
                  Niveau {selectedTask.cefr_level}
                </span>

                <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedTask.category}
                </span>

                <span className="text-slate-400 text-xs font-mono font-semibold">
                  {selectedTask.task_id}
                </span>

                <span className="text-[11px] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/50">
                  คลังข้อสอบกลาง {tasks.length} ข้อ (A1–C1)
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {selectedTask.title}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                โจทย์ในการทำข้อสอบเป็นโจทย์กลางมาตรฐานสากล (Goethe/telc) ปรับความยาก จำนวนคำ และประเด็นคำถามตรงตามระดับที่สอบจริง (A1, A2, B1, B2, C1)
              </p>
            </div>

            {/* Random Task Draw Controller */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 shrink-0">
              <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200/80 gap-0.5">
                {levelOptions.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setSelectedLevelFilter(lvl.id);
                      onRollRandomTask(lvl.id === 'ALL' ? undefined : lvl.id);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedLevelFilter === lvl.id
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`สุ่มโจทย์เฉพาะระดับ ${lvl.id}`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  onRollRandomTask(selectedLevelFilter === 'ALL' ? undefined : selectedLevelFilter)
                }
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                title="สุ่มโจทย์ข้อสอบกลางชุดใหม่"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>สุ่มโจทย์ใหม่ (Draw Task)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold shadow-2xs">
                <PenTool className="w-3.5 h-3.5" />
                <span>ตรวจงานเขียนอิสระ (Freies Schreiben)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                ไม่กำหนดโจทย์ • แนบโจทย์หรือรูปภาพได้ตามต้องการ
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              ส่งตรวจงานเขียนภาษาเยอรมันแบบเปิด (ไม่จำกัดหัวข้อและจำนวนคำ)
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              วางหรือพิมพ์ข้อความภาษาเยอรมันของคุณได้ทันที หรือเลือกแนบโจทย์ของตนเองและไฟล์รูปภาพ (เช่น ภาพถ่ายโจทย์ กราฟ หรือลายมือเขียน) แบบไม่บังคับ ระบบจะตรวจภาษาและประเมินระดับ CEFR ตามหลักฐานที่ปรากฏจริง
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div
        className={`grid gap-6 items-start ${
          isFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
        }`}
      >
        {/* Left Column (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="lg:col-span-4 space-y-4">
            {isExamMode ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                {/* Task Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="font-bold text-sm text-slate-900">คำสั่งและข้อกำหนด</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        timeRemainingSeconds === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : isTimerRunning
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={isTimerRunning ? 'คลิกเพื่อหยุดเวลาชั่วคราว' : 'คลิกเพื่อเริ่มจับเวลาสอบ'}
                    >
                      <Clock
                        className={`w-3.5 h-3.5 ${
                          isTimerRunning ? 'text-emerald-600 animate-spin' : 'text-slate-400'
                        }`}
                      />
                      <span>{formatTimer(timeRemainingSeconds)}</span>
                      <span className="text-[10px] font-sans font-normal text-slate-400">
                        {isTimerRunning ? '(จับเวลา)' : '(เริ่ม)'}
                      </span>
                    </button>
                    {timeRemainingSeconds < selectedTask.time_limit_minutes * 60 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimeRemainingSeconds(selectedTask.time_limit_minutes * 60);
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="รีเซ็ตเวลา"
                      >
                        รีเซ็ต
                      </button>
                    )}
                  </div>
                </div>

                {/* Instructions text */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                  {selectedTask.instructions}
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      ประเด็นที่ต้องตอบ (Leitpunkte):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {Object.values(checkedRequirements).filter(Boolean).length} /{' '}
                      {selectedTask.requirements.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedTask.requirements.map((req, idx) => {
                      const isChecked = !!checkedRequirements[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => handleRequirementToggle(idx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer select-none transition-all border ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-snug">{req}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Outline Accordion */}
                {selectedTask.sample_outline && (
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowOutline(!showOutline)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1 cursor-pointer"
                    >
                      <span>แนวทางการวางโครงสร้าง (Gliederung)</span>
                      {showOutline ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {showOutline && (
                      <ul className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
                        {selectedTask.sample_outline.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-600 font-bold">{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Target Word Count Guide */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1 text-xs text-blue-950">
                  <div className="font-bold flex items-center justify-between">
                    <span>เกณฑ์จำนวนคำที่กำหนด:</span>
                    <span className="text-blue-700">
                      {selectedTask.min_words}–{selectedTask.max_words} คำ
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    * หากเขียนน้อยกว่า 50% ของเกณฑ์ ระบบจะลดคะแนนตามความเป็นจริง
                  </p>
                </div>

                {/* Optional image attachment in Exam Mode */}
                <div className="border-t border-slate-100 pt-3">
                  {renderImageUploader(true)}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">
                      ตัวเลือกเสริม (ไม่บังคับ)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      เว้นว่างทั้งหมดเพื่อตรวจภาษาเยอรมันแบบอิสระได้
                    </p>
                  </div>
                </div>

                {/* Optional Target CEFR Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    ระดับที่ต้องการใช้อ้างอิง (ไม่บังคับ):
                  </label>
                  <select
                    value={freeTargetLevel}
                    onChange={(e) => setFreeTargetLevel(e.target.value as TargetLevelOption)}
                    aria-label="ระดับที่ต้องการใช้อ้างอิง"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {TARGET_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Text Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    ประเภทงานเขียน (ไม่บังคับ):
                  </label>
                  <select
                    value={freeCategory}
                    onChange={(e) => setFreeCategory(e.target.value as TaskCategory)}
                    aria-label="ประเภทงานเขียน"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {FREE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="free-custom-prompt"
                      className="text-xs font-bold text-slate-700"
                    >
                      โจทย์หรือคำสั่งเพิ่มเติม (ไม่บังคับ):
                    </label>
                    {customPrompt && (
                      <button
                        type="button"
                        onClick={() => setCustomPrompt('')}
                        className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        ล้างโจทย์
                      </button>
                    )}
                  </div>
                  <textarea
                    id="free-custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                    placeholder="วางโจทย์จากหนังสือ คำถาม หรือประเด็นที่ต้องการให้ AI ตรวจความตรงประเด็น (เว้นว่างได้)"
                    className="w-full p-3 rounded-xl text-xs leading-relaxed bg-slate-50/70 border border-slate-200 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                  />
                </div>

                {/* Optional Image Uploader */}
                <div className="border-t border-slate-100 pt-3">
                  {renderImageUploader(false)}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Right Column: Writing Canvas (Editor) */}
        <section
          className={`${isFocusMode ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-8'} space-y-4`}
        >
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Toolbar: Special German Characters & Editing Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* German Letters Bar */}
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 px-1 font-semibold hidden sm:inline">
                  อักษรเยอรมัน:
                </span>
                {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertGermanChar(char)}
                    className="w-7 h-7 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-slate-200/80 shadow-2xs active:scale-95 cursor-pointer"
                    title={`แทรกตัวอักษร ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Tools: Undo / Redo / Sample / Clear */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  title="ย้อนกลับ (Undo)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                  title="ทำซ้ำ (Redo)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {isExamMode && selectedTask.preset_draft && !text && (
                  <button
                    type="button"
                    onClick={handleLoadSampleDraft}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="โหลดตัวอย่างข้อเขียนเพื่อทดสอบระบบประเมิน"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>ตัวอย่างทดสอบ</span>
                  </button>
                )}

                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    ล้างข้อความ
                  </button>
                )}
              </div>
            </div>

            {/* Active Attachment Badge on Canvas (useful in Focus Mode or quick visual confirmation) */}
            {attachedImage && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={attachedImage.previewUrl}
                    alt={attachedImage.name}
                    className="w-8 h-8 rounded object-cover border border-blue-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-blue-950 block truncate">
                      แนบไฟล์รูปภาพ: {attachedImage.name}
                    </span>
                    <span className="text-[11px] text-blue-700">
                      AI จะอ่านรูปภาพประกอบการตรวจ (ส่งตรวจได้แม้ไม่พิมพ์ข้อความหากรูปมีงานเขียนภาษาเยอรมัน)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 shrink-0 cursor-pointer"
                >
                  นำออก
                </button>
              </div>
            )}

            {/* Main Textarea Canvas */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder={
                  isExamMode
                    ? 'Schreiben Sie hier Ihren Text auf Deutsch... (เริ่มต้นพิมพ์ข้อความภาษาเยอรมันของคุณที่นี่)'
                    : 'Schreiben Sie hier Ihren deutschen Text... (พิมพ์งานเขียนภาษาเยอรมันของคุณที่นี่ หรือแนบรูปภาพงานเขียนลายมือในแถบด้านซ้าย)'
                }
                rows={isFocusMode ? 20 : 16}
                className="w-full p-4 rounded-xl text-sm leading-relaxed bg-slate-50/50 border border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans transition-all resize-y"
                style={{ minHeight: '320px' }}
              />

              {validationError && (
                <div
                  role="alert"
                  className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed">{validationError}</span>
                  </div>
                  {(text.trim().length > 0 || attachedImage) && !isSubmitting && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="self-end sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      ลองส่งตรวจอีกครั้ง
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Real-time Word & Character Counter */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-500">จำนวนคำที่เขียนจริง:</span>
                  <span
                    className={`text-sm font-bold ${
                      isExamMode
                        ? isWordCountValid
                          ? 'text-emerald-600'
                          : words > selectedTask.max_words
                          ? 'text-amber-600'
                          : 'text-slate-900'
                        : 'text-blue-700'
                    }`}
                  >
                    {words}
                  </span>
                  {isExamMode ? (
                    <span className="text-slate-400 font-normal">
                      / {selectedTask.min_words}–{selectedTask.max_words} คำ
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                      โหมดตรวจอิสระ • ไม่จำกัดจำนวนคำ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{chars} ตัวอักษร</span>
                  <span>•</span>
                  <span>{paragraphs} ย่อหน้า</span>
                  <span>•</span>
                  <span>เวลาอ่าน ~{readingTime} นาที</span>
                </div>

                <div className="text-[11px] text-slate-400 italic">{lastSaved}</div>
              </div>

              {/* Progress bar (Exam Mode only) */}
              {isExamMode && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      words >= selectedTask.min_words && words <= selectedTask.max_words
                        ? 'bg-emerald-500'
                        : words > selectedTask.max_words
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        selectedTask.min_words > 0 ? (words / selectedTask.min_words) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submission Section */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                {isSubmitting
                  ? 'AI ผู้เชี่ยวชาญกำลังอ่าน วิเคราะห์ข้อผิดพลาด และประเมินงานเขียนรายชิ้นตามเกณฑ์ CEFR...'
                  : 'ระบบ AI จะตรวจประเมินเฉพาะงานเขียนชิ้นนี้ และระบุระดับ CEFR เฉพาะเมื่อมีหลักฐานทางภาษาเพียงพอ'}
              </p>

              <button
                type="button"
                disabled={isSubmitting || (!text.trim() && !attachedImage)}
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังประมวลผลตรวจรายชิ้นงานด้วย AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งตรวจประเมินผลงานเขียน (Submit Writing)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
