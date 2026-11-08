import React from 'react';
import { Award, BookOpen, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

export const RubricView: React.FC = () => {
  return (
    <div className="space-y-6 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Akademischer Bewertungsrahmen
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
          เกณฑ์การประเมิน 100 คะแนนเต็ม (Assessment Rubric)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          พัฒนาขึ้นตามกรอบมาตรฐาน CEFR Companion Volume 2020 และแนวทางการประเมินของ Goethe-Zertifikat และ Cambridge Writing Assessment โดยแยกเกณฑ์คำเชื่อมเป็นส่วนหนึ่งของ Cohesion เพื่อป้องกันการหักคะแนนซ้ำซ้อน
        </p>
      </div>

      {/* 7 Category Details Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900">
          โครงสร้างคะแนนทั้ง 7 หมวด (Die 7 Bewertungskategorien)
        </h2>

        <div className="space-y-3.5">
          {/* Cat 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                1. Aufgabenbewältigung (Task Fulfillment)
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                20 คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>ความเข้าใจคำสั่งและวัตถุประสงค์ของโจทย์อย่างถ่องแท้</li>
              <li>การตอบคำถามและครอบคลุมทุกประเด็นที่กำหนด (Leitpunkte)</li>
              <li>การเขียนสอดคล้องกับประเภทข้อความ (Textsortenadäquatheit: อีเมล, จดหมาย, แสดงความเห็น)</li>
              <li>การควบคุมเนื้อหาให้อยู่ในขอบเขต ไม่ออกนอกประเด็น</li>
            </ul>
          </div>

          {/* Cat 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                2. Inhalt & Entwicklung (Content Development)
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                15 คะแนน
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>คุณภาพและความลึกซึ้งของข้อคิดเห็น (Inhaltliche Qualität)</li>
              <li>ความสมเหตุสมผลของข้อโต้แย้ง (Plausibilität der Argumentation)</li>
              <li>การอธิบายและขยายความแนวคิดอย่างกระจ่างชัด</li>
              <li>การยกตัวอย่างประกอบที่สอดคล้องกับบริบทจริง</li>
            </ul>
          </div>

          {/* Cat 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                3. Wortschatz (Vocabulary)
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                20 คะแนน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Range</span>
                <span>5 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Accuracy</span>
                <span>5 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Collocations</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Context</span>
                <span>3 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Paraphrase</span>
                <span>3 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Cat 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                4. Grammatik (Grammar)
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                20 คะแนน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Verb & Tense</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Word Order</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Cases & Articles</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Structure</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Accuracy</span>
                <span>4 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Cat 5 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900">
                5. Kohärenz & Kohäsion (Cohesion & Coherence)
              </span>
              <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                15 คะแนน
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Organisation</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Paragraphs</span>
                <span>3 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Connectors</span>
                <span>4 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Transitions</span>
                <span>2 คะแนน</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-900">Flow</span>
                <span>2 คะแนน</span>
              </div>
            </div>
          </div>

          {/* Cat 6 & 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900">
                  6. Register & Stil (Register & Style)
                </span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  5 คะแนน
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>ระดับความเป็นทางการ (Formalität) เหมาะสมกับผู้รับ</li>
                <li>ความสม่ำเสมอของระดับภาษาตลอดทั้งข้อความ</li>
                <li>การหลีกเลี่ยงภาษาพูดที่ไม่เหมาะสมในงานเขียนวิชาการ</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-slate-900">
                  7. Rechtschreibung & Zeichen (Mechanics)
                </span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  5 คะแนน
                </span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>การสะกดคำตามหลักอักขรวิธีเยอรมัน (Rechtschreibung)</li>
                <li>การเขียนตัวพิมพ์ใหญ่-เล็ก (Groß- und Kleinschreibung)</li>
                <li>การใส่เครื่องหมายจุลภาค (Kommasetzung) ในอนุประโยค</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Scale Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          เกณฑ์การตัดเกรดมาตรฐาน (Grade Scale A–F)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="font-black text-lg text-emerald-700 block">Grade A</span>
            <span className="text-slate-500 font-semibold">90–100 คะแนน</span>
            <span className="text-[10px] text-emerald-800 block mt-1">ยอดเยี่ยม (Sehr gut)</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="font-black text-lg text-blue-700 block">Grade B</span>
            <span className="text-slate-500 font-semibold">80–89 คะแนน</span>
            <span className="text-[10px] text-blue-800 block mt-1">ดีมาก (Gut)</span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <span className="font-black text-lg text-indigo-700 block">Grade C</span>
            <span className="text-slate-500 font-semibold">70–79 คะแนน</span>
            <span className="text-[10px] text-indigo-800 block mt-1">น่าพอใจ (Befriedigend)</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="font-black text-lg text-amber-700 block">Grade D</span>
            <span className="text-slate-500 font-semibold">60–69 คะแนน</span>
            <span className="text-[10px] text-amber-800 block mt-1">พอใช้ (Ausreichend)</span>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
            <span className="font-black text-lg text-orange-700 block">Grade E</span>
            <span className="text-slate-500 font-semibold">50–59 คะแนน</span>
            <span className="text-[10px] text-orange-800 block mt-1">ต้องพัฒนา (Mangelhaft)</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="font-black text-lg text-rose-700 block">Grade F</span>
            <span className="text-slate-500 font-semibold">0–49 คะแนน</span>
            <span className="text-[10px] text-rose-800 block mt-1">ไม่ผ่านเกณฑ์ (Ungenügend)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
