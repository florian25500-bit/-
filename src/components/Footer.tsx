import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              DeutschSchreiben AI
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              ระบบประเมินงานเขียนภาษาเยอรมันเชิงวิชาการตามกรอบอ้างอิงความสามารถทางภาษาของสหภาพยุโรป (CEFR Companion Volume 2020) ระดับ B1, B2 และ C1 พร้อมเกณฑ์การให้คะแนน 100 คะแนนเต็ม และคำอธิบายข้อผิดพลาดอย่างละเอียดเป็นภาษาไทย
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ประเมินเฉพาะงานเขียนต้นฉบับของผู้เรียนอย่างเป็นกลางและเที่ยงตรง</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              มาตรฐานอ้างอิง
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 hover:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Council of Europe – CEFR 2020</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Goethe-Zertifikat B1 / B2 Schreiben</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Cambridge Writing Rubric Structure</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Duden Grammatikreferenz</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              ข้อกำหนดทางวิชาการ
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              เว็บไซต์นี้เป็นระบบประเมินเพื่อการฝึกฝนและพัฒนาทักษะ (Formative Assessment Platform) ที่อ้างอิงมาตรฐาน CEFR ไม่ใช่ระบบตรวจข้อสอบทางการของ Goethe-Institut หรือสถาบันสอบใด ๆ
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 DeutschSchreiben AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">German Writing Assessment & Learning Platform • B1 / B2 / C1</p>
        </div>
      </div>
    </footer>
  );
};
