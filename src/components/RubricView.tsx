import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RUBRIC_WEIGHTS, RUBRIC_WEIGHTS_A1_A2 } from '../utils/scoring';
import { AppLanguage } from '../types';

type RubricTier = 'A1_A2' | 'B1_C1';

interface RubricViewProps {
  activeLanguage?: AppLanguage;
}

export const RubricView: React.FC<RubricViewProps> = ({ activeLanguage = 'de' }) => {
  const isEn = activeLanguage === 'en';
  const [selectedTier, setSelectedTier] = useState<RubricTier>('A1_A2');
  const isBasic = selectedTier === 'A1_A2';
  const weights = isBasic ? RUBRIC_WEIGHTS_A1_A2 : RUBRIC_WEIGHTS;
  const maxTotal = isBasic ? 25 : 100;
  const passThreshold = isBasic ? 15 : 60;

  const gradeScale = isBasic
    ? [
        { grade: 'Grade A', range: '23–25 คะแนน', label: isEn ? 'ยอดเยี่ยม (Distinction)' : 'ยอดเยี่ยม (Sehr gut)', box: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-700', sub: 'text-emerald-800' },
        { grade: 'Grade B', range: '20–22 คะแนน', label: isEn ? 'ดีมาก (Merit)' : 'ดีมาก (Gut)', box: 'bg-blue-50 border-blue-200', title: 'text-blue-700', sub: 'text-blue-800' },
        { grade: 'Grade C', range: '18–19 คะแนน', label: isEn ? 'น่าพอใจ (Solid Pass)' : 'น่าพอใจ (Befriedigend)', box: 'bg-indigo-50 border-indigo-200', title: 'text-indigo-700', sub: 'text-indigo-800' },
        { grade: 'Grade D', range: '15–17 คะแนน', label: isEn ? 'พอใช้/ผ่าน (Pass)' : 'พอใช้/ผ่าน (Ausreichend)', box: 'bg-amber-50 border-amber-200', title: 'text-amber-700', sub: 'text-amber-800' },
        { grade: 'Grade E', range: '13–14 คะแนน', label: isEn ? 'ต้องพัฒนา (Below Pass)' : 'ต้องพัฒนา (Mangelhaft)', box: 'bg-orange-50 border-orange-200', title: 'text-orange-700', sub: 'text-orange-800' },
        { grade: 'Grade F', range: '0–12 คะแนน', label: isEn ? 'ไม่ผ่านเกณฑ์ (Fail)' : 'ไม่ผ่านเกณฑ์ (Ungenügend)', box: 'bg-rose-50 border-rose-200', title: 'text-rose-700', sub: 'text-rose-800' },
      ]
    : [
        { grade: 'Grade A', range: '90–100 คะแนน', label: isEn ? 'ยอดเยี่ยม (Distinction)' : 'ยอดเยี่ยม (Sehr gut)', box: 'bg-emerald-50 border-emerald-200', title: 'text-emerald-700', sub: 'text-emerald-800' },
        { grade: 'Grade B', range: '80–89 คะแนน', label: isEn ? 'ดีมาก (Merit)' : 'ดีมาก (Gut)', box: 'bg-blue-50 border-blue-200', title: 'text-blue-700', sub: 'text-blue-800' },
        { grade: 'Grade C', range: '70–79 คะแนน', label: isEn ? 'น่าพอใจ (Solid Pass)' : 'น่าพอใจ (Befriedigend)', box: 'bg-indigo-50 border-indigo-200', title: 'text-indigo-700', sub: 'text-indigo-800' },
        { grade: 'Grade D', range: '60–69 คะแนน', label: isEn ? 'พอใช้/ผ่าน (Pass)' : 'พอใช้/ผ่าน (Ausreichend)', box: 'bg-amber-50 border-amber-200', title: 'text-amber-700', sub: 'text-amber-800' },
        { grade: 'Grade E', range: '50–59 คะแนน', label: isEn ? 'ต้องพัฒนา (Below Pass)' : 'ต้องพัฒนา (Mangelhaft)', box: 'bg-orange-50 border-orange-200', title: 'text-orange-700', sub: 'text-orange-800' },
        { grade: 'Grade F', range: '0–49 คะแนน', label: isEn ? 'ไม่ผ่านเกณฑ์ (Fail)' : 'ไม่ผ่านเกณฑ์ (Ungenügend)', box: 'bg-rose-50 border-rose-200', title: 'text-rose-700', sub: 'text-rose-800' },
      ];

  const officialCriteria = isEn
    ? [
        {
          de: 'Task Achievement',
          th: 'การตอบโจทย์ครบถ้วน เนื้อหา และระดับความสุภาพ (Formal/Informal)',
          max: weights.task_fulfillment + weights.content_development + weights.register,
          breakdown: `Task Fulfillment (${weights.task_fulfillment}) + Content (${weights.content_development}) + Register (${weights.register})`,
        },
        {
          de: 'Coherence & Cohesion',
          th: 'โครงสร้างย่อหน้า การลำดับความคิด และคำเชื่อม (Linking Words)',
          max: weights.cohesion,
          breakdown: `Cohesion & Coherence (${weights.cohesion})`,
        },
        {
          de: 'Lexical Resource',
          th: 'ขอบเขตและความแม่นยำในการเลือกใช้คำศัพท์และ Collocations',
          max: weights.vocabulary,
          breakdown: `Vocabulary (${weights.vocabulary})`,
        },
        {
          de: 'Grammatical Range & Accuracy',
          th: 'ไวยากรณ์ โครงสร้างประโยค การสะกดคำ และเครื่องหมายวรรคตอน',
          max: weights.grammar + weights.mechanics,
          breakdown: `Grammar (${weights.grammar}) + Mechanics (${weights.mechanics})`,
        },
      ]
    : [
        {
          de: 'Aufgabenerfüllung',
          th: 'การตอบโจทย์ครบถ้วน เนื้อหา และระดับความสุภาพ (Sie/du)',
          max: weights.task_fulfillment + weights.content_development + weights.register,
          breakdown: `Aufgabenbewältigung (${weights.task_fulfillment}) + Inhalt (${weights.content_development}) + Register (${weights.register})`,
        },
        {
          de: 'Kohärenz',
          th: 'โครงสร้าง การลำดับความคิด และความเชื่อมโยง',
          max: weights.cohesion,
          breakdown: `Kohärenz & Kohäsion (${weights.cohesion})`,
        },
        {
          de: 'Wortschatz',
          th: 'ขอบเขตและความแม่นยำในการเลือกใช้คำศัพท์',
          max: weights.vocabulary,
          breakdown: `Wortschatz (${weights.vocabulary})`,
        },
        {
          de: 'Strukturen',
          th: 'ไวยากรณ์ โครงสร้างประโยค และการสะกด/วรรคตอน',
          max: weights.grammar + weights.mechanics,
          breakdown: `Grammatik (${weights.grammar}) + Rechtschreibung (${weights.mechanics})`,
        },
      ];

  return (
    <div className="space-y-6 py-6">
      {/* Header Banner + Tier Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {isEn ? 'Academic English Writing Rubric' : 'Akademischer Bewertungsrahmen'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              เกณฑ์การประเมินตามระดับสอบ CEFR (Assessment Rubric)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {isEn
                ? 'ใช้โครงสร้างคะแนนมาตรฐานเดียวกับระบบหลัก: ระดับเริ่มต้น '
                : 'ปรับเกณฑ์คะแนนให้ตรงตามโครงสร้างสอบจริงของ Goethe-Institut และ telc: ระดับเริ่มต้น '}
              <strong>A1–A2 ใช้เกณฑ์ 25 คะแนนเต็ม</strong> (ผ่าน 15/25) และระดับกลางถึงสูง{' '}
              <strong>B1–C1 ใช้เกณฑ์ 100 คะแนนเต็ม</strong> (ผ่าน 60/100)
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shrink-0 self-start">
            <button
              type="button"
              onClick={() => setSelectedTier('A1_A2')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isBasic ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ระดับ A1–A2 (25 คะแนน)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTier('B1_C1')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isBasic ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ระดับ B1–C1 (100 คะแนน)
            </button>
          </div>
        </div>

        {/* Summary highlight for active tier */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950 block">
                {isBasic
                  ? `เกณฑ์พาร์ท Writing ระดับ A1–A2${isEn ? ' (EN)' : ''}: คะแนนเต็ม 25 คะแนน`
                  : `เกณฑ์พาร์ท Writing ระดับ B1–C1${isEn ? ' (EN)' : ''}: คะแนนเต็ม 100 คะแนน`}
              </span>
              <span className="text-blue-800">
                {isEn
                  ? isBasic
                    ? 'เน้นการสื่อสารครบทุกประเด็นคำถามด้วยประโยค SVO ชัดเจน ใช้ Tense พื้นฐาน (Present/Past Simple) ถูกต้อง และเลือกใช้คำทักทายเหมาะสม'
                    : 'ประเมินการให้เหตุผลเชิงวิเคราะห์ ความหลากหลายของ Linking Words โครงสร้างประโยคซับซ้อน (Clauses/Conditionals/Inversion) และสำนวนวิชาการ'
                  : isBasic
                  ? 'เน้นการสื่อสารครบทุก Leitpunkte ด้วยประโยคสั้นชัดเจน ผันกริยา V2 ถูกต้อง และใช้ระดับภาษา (du/Sie) เหมาะสม — ไม่หักคะแนนเพราะขาดประโยคซับซ้อนระดับสูง'
                  : 'ประเมินความสามารถในการให้เหตุผล ชั่งน้ำหนักข้อดี-ข้อเสีย ความหลากหลายของคำเชื่อม (Konnektoren) โครงสร้างประโยคซับซ้อน และสำนวนระดับวิชาการ'}
              </span>
            </div>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg px-3.5 py-2 text-center shrink-0">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">เกณฑ์สอบผ่าน (60%)</span>
            <span className="text-base font-black text-blue-700">
              {passThreshold} / {maxTotal} คะแนน
            </span>
          </div>
        </div>
      </div>

      {/* 4 Official Criteria Mapping */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">
            {isEn
              ? `เกณฑ์มาตรฐานสากล 4 ด้าน (CEFR / Cambridge Writing Criteria — ${maxTotal} Points)`
              : `เกณฑ์ทางการ 4 ด้านของ Goethe-Institut (${maxTotal} Punkte)`}
          </h2>
          <span className="text-xs text-slate-500">
            รวม {officialCriteria.reduce((acc, c) => acc + c.max, 0)} / {maxTotal} คะแนนเต็ม
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {officialCriteria.map((crit) => (
            <div key={crit.de} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-slate-900">{crit.de}</span>
                <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                  {crit.max} คะแนน
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{crit.th}</p>
              <p className="text-[11px] text-blue-700 font-medium pt-1">{crit.breakdown}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Category Details Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {isEn
              ? `โครงสร้างคะแนนทั้ง 7 หมวดย่อย (The 7 Assessment Categories — รวม ${maxTotal} คะแนน)`
              : `โครงสร้างคะแนนทั้ง 7 หมวดย่อย (Die 7 Bewertungskategorien — รวม ${maxTotal} คะแนน)`}
          </h2>
        </div>

        <div className="space-y-3.5">
          {/* Cat 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                {isEn ? '1. Task Fulfillment' : '1. Aufgabenbewältigung (Task Fulfillment)'}
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {weights.task_fulfillment} คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>ความเข้าใจคำสั่งและวัตถุประสงค์ของโจทย์อย่างถ่องแท้</li>
              <li>การตอบคำถามและครอบคลุมทุกประเด็นที่กำหนด ({isEn ? 'Required Task Points' : 'Leitpunkte'})</li>
              <li>การเขียนสอดคล้องกับประเภทข้อความ (อีเมล, จดหมาย, เรียงความแสดงความเห็น, รายงาน)</li>
              <li>การควบคุมเนื้อหาและจำนวนคำให้อยู่ในขอบเขตที่ระดับสอบกำหนด</li>
            </ul>
          </div>

          {/* Cat 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                {isEn ? '2. Content & Development' : '2. Inhalt & Entwicklung (Content Development)'}
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {weights.content_development} คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>ความชัดเจนของสาระสำคัญและการลำดับข้อมูลตามบริบทระดับ {isBasic ? 'A1–A2' : 'B1–C1'}</li>
              <li>ความสมเหตุสมผลของการอธิบายและการยกตัวอย่างประกอบ</li>
              <li>ความสามารถในการขยายความแนวคิดให้ผู้อ่านเข้าใจได้ตรงประเด็น</li>
            </ul>
          </div>

          {/* Cat 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                {isEn ? '3. Lexical Resource (Vocabulary)' : '3. Wortschatz (Vocabulary)'}
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {weights.vocabulary} คะแนน
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isBasic
                ? 'ประเมินความถูกต้องและเพียงพอของคำศัพท์พื้นฐานในชีวิตประจำวัน (การนัดหมาย เวลา สถานที่ การทักทาย/ขอโทษ) ตามระดับ A1–A2'
                : 'ประเมินขอบเขตคำศัพท์ (Range), ความแม่นยำ (Accuracy), คู่คำร่วม (Collocations), บริบท และการใช้คำพ้องความหมาย (Paraphrase)'}
            </p>
          </div>

          {/* Cat 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                {isEn ? '4. Grammatical Range & Accuracy' : '4. Grammatik (Grammar)'}
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {weights.grammar} คะแนน
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isEn
                ? isBasic
                  ? 'ประเมินลำดับคำ SVO, Subject-Verb Agreement, Present/Past Simple, Modal Verbs และ Prepositions พื้นฐาน'
                  : 'ประเมินความแม่นยำของ Tenses, Complex Clauses, Conditionals, Passive Voice, Inversion และ Hedging ตามระดับสอบ'
                : isBasic
                ? 'ประเมินการผันกริยา Präsens/Perfekt, ตำแหน่งกริยา V2, Trennbare Verben, Modalverben และการใช้ Artikel/Kasus พื้นฐาน'
                : 'ประเมินการผันกริยาและกาล, ตำแหน่งคำในประโยคหลักและอนุประโยค (V2/Verbletzt), Kasus & Artikel, Passiv/Konjunktiv II และความแม่นยำรวม'}
            </p>
          </div>

          {/* Cat 5 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                {isEn ? '5. Coherence & Cohesion' : '5. Kohärenz & Kohäsion (Cohesion & Coherence)'}
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {weights.cohesion} คะแนน
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isEn
                ? isBasic
                  ? 'ประเมินการเชื่อมประโยคด้วยคำเชื่อมพื้นฐาน (and, but, because, so) และความต่อเนื่องของเนื้อความในจดหมายสั้น'
                  : 'ประเมินการจัดโครงสร้างย่อหน้า (Introduction–Body–Conclusion), การใช้ Linking Words เชิงตรรกะ (However, Furthermore, Although) และความลื่นไหลของข้อความ'
                : isBasic
                ? 'ประเมินการเชื่อมประโยคด้วยคำเชื่อมพื้นฐาน (und, aber, oder, denn, deshalb, weil) และความต่อเนื่องของเนื้อความในจดหมายสั้น'
                : 'ประเมินการจัดโครงสร้างย่อหน้า (Einleitung–Hauptteil–Schluss), การใช้คำเชื่อมเชิงตรรกะ (Konnektoren) และความลื่นไหลในการเปลี่ยนประเด็น'}
            </p>
          </div>

          {/* Cat 6 & 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900">
                  {isEn ? '6. Register & Tone' : '6. Register & Stil (Register & Style)'}
                </span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {weights.register} คะแนน
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>
                  {isEn
                    ? 'ระดับความเป็นทางการ (Formal vs. Semi-formal/Informal) สอดคล้องกับผู้รับ'
                    : 'ระดับความเป็นทางการ (du/ihr vs. Sie) สอดคล้องกับผู้รับ'}
                </li>
                <li>
                  {isEn
                    ? 'คำขึ้นต้น (Salutation) และคำลงท้าย (Sign-off) ถูกต้องตามประเภทจดหมาย'
                    : 'คำขึ้นต้น (Anrede) และคำลงท้าย (Grußformel) ถูกต้อง'}
                </li>
                <li>ความสม่ำเสมอของระดับภาษาตลอดทั้งข้อความ</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900">
                  {isEn ? '7. Spelling & Punctuation (Mechanics)' : '7. Rechtschreibung & Zeichen (Mechanics)'}
                </span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {weights.mechanics} คะแนน
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {isEn ? (
                  <>
                    <li>ความถูกต้องของการสะกดคำภาษาอังกฤษ (UK/US consistency)</li>
                    <li>การใช้ตัวพิมพ์ใหญ่ขึ้นต้นประโยค ชื่อเฉพาะ และสรรพนาม I</li>
                    <li>เครื่องหมายวรรคตอน (. , ; —) และการหลีกเลี่ยง Comma Splice</li>
                  </>
                ) : (
                  <>
                    <li>การสะกดคำและตัวอักษร Umlaut (ä, ö, ü, ß)</li>
                    <li>การเขียนตัวพิมพ์ใหญ่คำนาม (Großschreibung)</li>
                    <li>การใช้เครื่องหมายวรรคตอน (Kommasetzung & Satzzeichen)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Scale Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            เกณฑ์การตัดเกรดมาตรฐาน (Grade Scale A–F • เต็ม {maxTotal} คะแนน)
          </h3>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              เกณฑ์สอบผ่าน {isEn ? 'CEFR Writing' : 'Goethe'}: ≥ {passThreshold}/{maxTotal} (Grade D ขึ้นไป)
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          {gradeScale.map((g) => (
            <div key={g.grade} className={`p-3 rounded-xl border ${g.box}`}>
              <span className={`font-black text-lg block ${g.title}`}>{g.grade}</span>
              <span className="text-slate-600 font-semibold">{g.range}</span>
              <span className={`text-[10px] block mt-1 ${g.sub}`}>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
