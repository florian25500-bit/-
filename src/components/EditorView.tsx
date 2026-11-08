import React, { useState, useEffect, useRef } from 'react';
import {
  PenLine,
  Clock,
  Sparkles,
  RotateCcw,
  RotateCw,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Bookmark,
  BookOpen,
} from 'lucide-react';
import { WritingTask } from '../types';
import {
  countGermanWords,
  countGermanChars,
  countParagraphs,
  estimateReadingTimeMinutes,
} from '../utils/scoring';

interface EditorViewProps {
  tasks: WritingTask[];
  selectedTask: WritingTask;
  onSelectTask: (task: WritingTask) => void;
  onSubmit: (task: WritingTask, text: string) => Promise<void>;
  isSubmitting: boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onSubmit,
  isSubmitting,
}) => {
  const [text, setText] = useState<string>(selectedTask.preset_draft || '');
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [lastSaved, setLastSaved] = useState<string>('บันทึกแบบร่างอัตโนมัติแล้ว');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showOutline, setShowOutline] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize when task changes
  useEffect(() => {
    setText(selectedTask.preset_draft || '');
    setCheckedRequirements({});
    setValidationError(null);
  }, [selectedTask]);

  // Autosave simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      setLastSaved(`บันทึกแบบร่าง ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`);
    }, 1200);
    return () => clearTimeout(timer);
  }, [text]);

  const words = countGermanWords(text);
  const chars = countGermanChars(text);
  const paragraphs = countParagraphs(text);
  const readingTime = estimateReadingTimeMinutes(words);

  const isWordCountValid = words >= selectedTask.min_words && words <= selectedTask.max_words;
  const wordCountProgress = Math.min(100, Math.round((words / selectedTask.min_words) * 100));

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
    if (validationError && val.trim().length > 20) {
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
    if (selectedTask.preset_draft) {
      setUndoStack((prev) => [...prev, text]);
      setText(selectedTask.preset_draft);
      setValidationError(null);
    }
  };

  const handleClear = () => {
    if (window.confirm('คุณต้องการล้างข้อความที่เขียนทั้งหมดใช่หรือไม่?')) {
      setUndoStack((prev) => [...prev, text]);
      setText('');
    }
  };

  const handleRequirementToggle = (idx: number) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSubmit = async () => {
    if (!text || text.trim().length === 0) {
      setValidationError('กรุณาเขียนข้อความภาษาเยอรมันในช่องพิมพ์ก่อนกดส่งประเมิน');
      return;
    }

    if (words < 20) {
      setValidationError(`ข้อความสั้นเกินไป (${words} คำ) ควรมีอย่างน้อย 20–30 คำขึ้นไปเพื่อให้ระบบประเมินไวยากรณ์และโครงสร้างได้`);
      return;
    }

    setValidationError(null);
    await onSubmit(selectedTask, text);
  };

  // Level badge styling helper
  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'B1':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B2':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'C1':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 py-6">
      {/* Top Header Card: Task Switcher and Quick Meta */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${getLevelStyle(selectedTask.cefr_level)}`}>
                Niveau {selectedTask.cefr_level}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                {selectedTask.category}
              </span>
              <span className="text-xs text-slate-400">
                โจทย์ ID: {selectedTask.task_id}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {selectedTask.title}
            </h1>
          </div>

          {/* Task selector & Focus Mode Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <label htmlFor="task-select-dropdown" className="text-xs text-slate-500 font-medium">
                เลือกโจทย์:
              </label>
              <select
                id="task-select-dropdown"
                value={selectedTask.id}
                onChange={(e) => {
                  const found = tasks.find((t) => t.id === e.target.value);
                  if (found) onSelectTask(found);
                }}
                className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-colors max-w-[240px] truncate"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.cefr_level}] {t.category}: {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus Mode button */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isFocusMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isFocusMode ? 'ออกจากโหมดสมาธิ' : 'เปิดโหมดเขียนเต็มจอ (Focus Mode)'}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFocusMode ? 'มุมมองปกติ' : 'โหมดสมาธิ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`grid gap-6 items-start ${isFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Left Column: Guidelines & Checklist (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Task Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">
                    โจทย์และข้อกำหนด
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTask.time_limit_minutes} นาที</span>
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
                    ประเด็นที่ต้องเขียนตอบ (Checklist):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {Object.values(checkedRequirements).filter(Boolean).length} / {selectedTask.requirements.length}
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
                    onClick={() => setShowOutline(!showOutline)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1 cursor-pointer"
                  >
                    <span>แนวทางการวางโครงสร้าง (Gliederung)</span>
                    {showOutline ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showOutline && (
                    <div className="mt-2.5 p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-200">
                      {selectedTask.sample_outline.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Academic Exam Condition Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">คำแนะนำ:</span> พยายามเขียนโดยใช้สำนวนเชื่อมประโยค (Konnektoren) เช่น <em>deshalb, obwohl, meiner Meinung nach</em> เพื่อช่วยดันคะแนนในหมวด Kohärenz
              </div>
            </div>
          </aside>
        )}

        {/* Right Column: Writing Area */}
        <section className={`${isFocusMode ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-8'} space-y-4`}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            {/* Top Toolbar: Special German Characters & Draft Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* German Letters Bar */}
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 px-1 font-semibold">อักษรเยอรมัน:</span>
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

                {selectedTask.preset_draft && (
                  <button
                    type="button"
                    onClick={handleLoadSampleDraft}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="โหลดตัวอย่างงานเขียนเพื่อทดสอบระบบประเมิน"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>โหลดตัวอย่างข้อเขียนจริง</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  ล้างข้อความ
                </button>
              </div>
            </div>

            {/* Main Textarea Canvas */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="Schreiben Sie hier Ihren Text auf Deutsch... (เริ่มต้นพิมพ์ข้อความภาษาเยอรมันที่นี่)"
                rows={isFocusMode ? 20 : 16}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full p-5 rounded-xl text-base leading-relaxed font-sans text-slate-800 bg-[#fdfdfd] border border-slate-200/90 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/15 focus:border-blue-500 resize-y transition-all placeholder:text-slate-400 selection:bg-blue-100"
              />
            </div>

            {/* Live Progress & Statistics Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
              {/* Word Count Indicator with Visual Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">จำนวนคำ:</span>
                  <span
                    className={`font-bold text-sm ${
                      isWordCountValid
                        ? 'text-emerald-600'
                        : words < selectedTask.min_words
                        ? 'text-amber-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {words}
                  </span>
                  <span className="text-slate-400">
                    / {selectedTask.min_words}–{selectedTask.max_words} คำ
                  </span>
                </div>

                <div className="hidden sm:block w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      words >= selectedTask.min_words ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${wordCountProgress}%` }}
                  />
                </div>
              </div>

              {/* Characters & Reading Time */}
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>{chars} ตัวอักษร</span>
                <span>•</span>
                <span>{paragraphs} ย่อหน้า</span>
                <span>•</span>
                <span>เวลาอ่าน ~{readingTime} นาที</span>
              </div>

              {/* Autosave Note */}
              <div className="text-[11px] text-slate-400 font-medium">
                {lastSaved}
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                ระบบจะประเมินตามเกณฑ์มาตรฐาน CEFR 7 ด้าน พร้อมวิเคราะห์ข้อผิดพลาดและแสดงตัวอย่างแก้ไข
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังตรวจประเมิน 4 ขั้นตอน...</span>
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

      {/* Assessment Evaluation Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">
                ระบบกำลังตรวจประเมินงานเขียน
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                กำลังวิเคราะห์ตามมาตรฐาน CEFR Companion Volume 2020
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ขั้นที่ 1: ตรวจสอบจำนวนคำและความสอดคล้องกับโจทย์</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-700 font-semibold">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>ขั้นที่ 2: จำแนกข้อผิดพลาด (ไวยากรณ์, คำศัพท์, โครงสร้าง)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                <span>ขั้นที่ 3: คำนวณเกณฑ์ Rubric 100 คะแนน และเทียบระดับ CEFR</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                <span>ขั้นที่ 4: สร้างโมเดลงานเขียน B2/C1 และคำอธิบายภาษาไทย</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
