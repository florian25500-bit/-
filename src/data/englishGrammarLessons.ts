import { GrammarLesson } from '../types';

export const ENGLISH_GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'en-lesson-svo-tense-a1',
    language: 'en',
    title: 'โครงสร้างประโยคพื้นฐาน SVO และ Present Simple สำหรับงานเขียน A1',
    german_title: 'Basic SVO Word Order & Present Simple (A1)',
    topic: 'Sentence Structure & Agreement',
    cefr_level: 'A1',
    explanation_th:
      'หัวใจของการเขียนภาษาอังกฤษระดับ A1 คือการเรียงลำดับ ประธาน + กริยา + กรรม (S-V-O) ให้ชัดเจน และผันกริยาเอกพจน์บุรุษที่ 3 (he/she/it + -s/-es) รวมถึงการใช้ a/an/the ให้ถูกต้อง',
    rules: [
      'โครงสร้างหลัก: Subject + Verb + Object + Place + Time (เช่น I meet my friend at the café on Saturday.)',
      'เมื่อประธานเป็น he / she / it หรือคำนามเอกพจน์ ต้องเติม -s/-es ที่กริยาใน Present Simple (เช่น The party starts at 6 pm.)',
      'ใช้ don’t / doesn’t ในประโยคปฏิเสธ (เช่น She doesn’t eat meat — ห้ามใช้ She no eat)',
      'ประโยคขอร้องสุภาพในอีเมล A1 ใช้ Can you...? หรือ Could you please...?',
    ],
    correct_examples: [
      {
        german: 'The birthday party starts at 6 pm at my house.',
        thai: 'งานวันเกิดเริ่มเวลา 18.00 น. ที่บ้านของฉัน (กริยา starts เติม s ตามประธานเอกพจน์)',
      },
      {
        german: 'We have pizza and orange juice, and you can bring some snacks.',
        thai: 'เรามีพิซซ่าและน้ำส้ม และคุณสามารถนำขนมมาได้',
      },
    ],
    incorrect_examples: [
      {
        german: 'It start at 6 pm and we has pizza.',
        thai: 'งานเริ่มตอน 6 โมงเย็นและเรามีพิซซ่า',
        correction: 'It starts at 6 pm, and we have pizza.',
        why_wrong_th: 'It เป็นเอกพจน์ต้องใช้ starts ส่วน we เป็นพหูพจน์ต้องใช้ have (ไม่ใช่ has)',
      },
    ],
    quiz: [
      {
        question: 'ข้อใดผันกริยาในอีเมลเชิญเพื่อนได้ถูกต้องที่สุด?',
        options: [
          'My sister make a chocolate cake every Sunday.',
          'My sister makes a chocolate cake every Sunday.',
          'My sister making a chocolate cake every Sunday.',
        ],
        correctIndex: 1,
        explanation_th: 'My sister เป็นประธานเอกพจน์บุรุษที่ 3 ใน Present Simple จึงต้องเติม -s เป็น makes',
      },
      {
        question: 'การวาง Place และ Time ท้ายประโยคข้อใดเป็นธรรมชาติที่สุด?',
        options: [
          'I study English every day at the library.',
          'I study English at the library every day.',
          'I every day study at the library English.',
        ],
        correctIndex: 1,
        explanation_th: 'ภาษาอังกฤษนิยมวาง Place (at the library) ก่อน Time (every day)',
      },
    ],
  },
  {
    id: 'en-lesson-past-connectors-a2',
    language: 'en',
    title: 'การเล่าเหตุการณ์อดีต (Past Simple) และคำเชื่อมพื้นฐาน A2',
    german_title: 'Past Simple Narration & Basic Connectors (A2)',
    topic: 'Tenses & Basic Linking',
    cefr_level: 'A2',
    explanation_th:
      'ในข้อสอบระดับ A2 มักให้เล่าประสบการณ์ที่ผ่านมา (เช่น ทริปวันหยุดหรือเหตุการณ์เมื่อสัปดาห์ก่อน) ผู้เรียนต้องใช้กริยาช่อง 2 (Past Simple) ให้สม่ำเสมอทั้งย่อหน้า และเชื่อมประโยคด้วย because, so, but, although',
    rules: [
      'เล่าเหตุการณ์ที่จบลงแล้วในอดีตพร้อมคำบอกเวลา (yesterday, last week, two days ago) ให้ใช้ Past Simple ทั้งเรื่อง (went, saw, was/were, ate)',
      'ระวังคำว่า because (บอกเหตุผล) กับ so (บอกผลลัพธ์) — ห้ามใช้คู่กันในประโยคเดียวเด็ดขาด (ห้ามเขียน "Because it rained, so we stayed home.")',
      'ใช้ Past Continuous (was/were + V-ing) กับเหตุการณ์ที่กำลังดำเนินอยู่เมื่อมีอีกเหตุการณ์แทรกเข้ามา',
    ],
    correct_examples: [
      {
        german: 'Last week I went to Chiang Mai, and the weather was sunny.',
        thai: 'สัปดาห์ที่แล้วฉันไปเชียงใหม่ และอากาศแจ่มใส',
      },
      {
        german: 'We stayed at the hotel because it rained heavily.',
        thai: 'เราพักอยู่ที่โรงแรมเพราะฝนตกหนัก',
      },
    ],
    incorrect_examples: [
      {
        german: 'Because I was tired, so I went to bed early.',
        thai: 'เพราะฉันเหนื่อย ดังนั้นฉันจึงเข้านอนเร็ว',
        correction: 'Because I was tired, I went to bed early. (หรือ I was tired, so I went to bed early.)',
        why_wrong_th: 'ภาษาอังกฤษห้ามใช้ because และ so ร่วมกันในประโยคเดียว ต้องเลือกใช้ตัวใดตัวหนึ่งเท่านั้น',
      },
    ],
    quiz: [
      {
        question: 'ประโยคใดถูกต้องตามหลักไวยากรณ์อังกฤษ?',
        options: [
          'Because the train was late, so I missed the meeting.',
          'Since the train was late, I missed the meeting.',
          'Last weekend I go to the beach with my friends.',
        ],
        correctIndex: 1,
        explanation_th: 'Since/Because ใช้เชื่อมประโยคเหตุผลโดยไม่ต้องใส่ so ซ้ำในประโยคหลัก',
      },
    ],
  },
  {
    id: 'en-lesson-clauses-conditionals-b1',
    language: 'en',
    title: 'อนุประโยคซ้อน (Complex Sentences) และ Conditionals ระดับ B1',
    german_title: 'Subordination & Conditionals (B1)',
    topic: 'Complex Sentences',
    cefr_level: 'B1',
    explanation_th:
      'การอัปเกรดงานเขียนจาก A2 เป็น B1 ต้องอาศัยประโยคความซ้อน เช่น although / even though, while / whereas และประโยคเงื่อนไข If-Clauses Type 1–2 เพื่ออธิบายเหตุผลและข้อเสนอแนะได้อย่างมีน้ำหนัก',
    rules: [
      'although / even though + Subject + Verb (ตามด้วยประโยค) ส่วน despite / in spite of + Noun / V-ing (ห้ามตามด้วยประโยคตรงๆ)',
      'First Conditional (เรื่องที่เป็นไปได้จริง): If + Present Simple, ... will/can + V.inf',
      'Second Conditional (สมมติ/เสนอแนะสุภาพ): If + Past Simple, ... would/could + V.inf (เช่น If students practiced more, they would feel confident.)',
      'คำเชื่อมระบุจุดประสงค์: in order to + V.inf / so that + Subject + can/will',
    ],
    correct_examples: [
      {
        german: 'Although online classes save time, many students prefer classroom interaction.',
        thai: 'แม้ว่าเรียนออนไลน์จะประหยัดเวลา แต่ผู้เรียนจำนวนมากชอบการโต้ตอบในห้องเรียน',
      },
      {
        german: 'Despite the heavy traffic, we arrived on time.',
        thai: 'แม้รถจะติดหนัก แต่เราก็มาถึงตรงเวลา (despite ตามด้วยนามวลี)',
      },
    ],
    incorrect_examples: [
      {
        german: 'Despite it was raining, we went out.',
        thai: 'แม้ฝนจะตก แต่เราก็ออกไปข้างนอก',
        correction: 'Although it was raining, we went out. (หรือ Despite the rain, we went out.)',
        why_wrong_th: 'despite เป็น Preposition ห้ามตามด้วยอนุประโยค (it was raining) ตรงๆ ต้องเปลี่ยนเป็น although หรือย่อนามวลี',
      },
    ],
    quiz: [
      {
        question: 'คำเชื่อมใดเติมในช่องว่างได้ถูกต้อง: "_____ the high price, the course was worth every baht."',
        options: ['Although', 'Despite', 'However'],
        correctIndex: 1,
        explanation_th: 'the high price เป็นนามวลี (Noun phrase) จึงต้องใช้ Preposition "Despite"',
      },
    ],
  },
  {
    id: 'en-lesson-academic-connectors-b2',
    language: 'en',
    title: 'คำเชื่อมเชิงโต้แย้ง (B2 Connectors) และการแบ่งย่อหน้าแบบ Essay',
    german_title: 'Academic Connectors & Essay Structure (B2)',
    topic: 'Cohesion & Punctuation',
    cefr_level: 'B2',
    explanation_th:
      'งานเขียนระดับ B2 (Argumentative Essay, Report, Formal Complaint) ต้องการคำเชื่อมระดับวิชาการและการใช้เครื่องหมายจุลภาค/อัฒภาค (Comma & Semicolon) อย่างแม่นยำ เพื่อไม่ให้เกิด Comma Splice',
    rules: [
      'Conjunctive Adverbs เช่น However, Nevertheless, Furthermore, Therefore, Consequently ต้องมี Semicolon (;) หรือขึ้นประโยคใหม่ แล้วตามด้วย Comma (,) เช่น ...; however, ...',
      'หลีกเลี่ยง Comma Splice (ห้ามคั่นสองประโยคอิสระด้วยจุลภาคตัวเดียว เช่น "Remote work saves time, however, it causes isolation.")',
      'ใช้คู่เปรียบเทียบ On the one hand, ... On the other hand, ... เสมอเมื่อนำเสนอสองด้านที่สมดุลกัน',
    ],
    correct_examples: [
      {
        german: 'Remote work eliminates commuting; however, it can blur work-life boundaries.',
        thai: 'การทำงานทางไกลช่วยตัดเวลาเดินทาง อย่างไรก็ตาม มันอาจทำให้เส้นแบ่งระหว่างงานกับชีวิตส่วนตัวเลือนราง',
      },
      {
        german: 'Furthermore, flexible schedules often lead to higher employee satisfaction.',
        thai: 'ยิ่งไปกว่านั้น ตารางเวลาที่ยืดหยุ่นมักนำไปสู่ความพึงพอใจของพนักงานที่สูงขึ้น',
      },
    ],
    incorrect_examples: [
      {
        german: 'Working from home is convenient, however, employees may feel lonely.',
        thai: 'ทำงานที่บ้านสะดวก อย่างไรก็ตาม พนักงานอาจรู้สึกเหงา',
        correction: 'Working from home is convenient; however, employees may feel lonely.',
        why_wrong_th: 'however ไม่ใช่ Coordinating Conjunction (FANBOYS) จึงไม่สามารถเชื่อม 2 ประโยคด้วย Comma เดียวได้ (Comma Splice) ต้องใช้ ; หรือขึ้นประโยคใหม่',
      },
    ],
    quiz: [
      {
        question: 'ข้อใดใช้เครื่องหมายวรรคตอนกับคำว่า however ได้ถูกต้องตามมาตรฐาน B2?',
        options: [
          'The plan looks promising, however, it requires a larger budget.',
          'The plan looks promising; however, it requires a larger budget.',
          'The plan looks promising however it requires a larger budget.',
        ],
        correctIndex: 1,
        explanation_th: 'ใช้ Semicolon (;) หน้า however และ Comma (,) หลัง however เพื่อเชื่อมสองประโยคสมบูรณ์ได้อย่างถูกต้อง',
      },
    ],
  },
  {
    id: 'en-lesson-c1-inversion-hedging',
    language: 'en',
    title: 'โครงสร้างระดับ C1: Inversion, Participle Clauses และ Hedging',
    german_title: 'Inversion, Participle Clauses & Academic Hedging (C1)',
    topic: 'Advanced Syntax & Register',
    cefr_level: 'C1',
    explanation_th:
      'ระดับ C1 วัดผลจากความซับซ้อนทางวากยสัมพันธ์และความระมัดระวังทางวิชาการ (Academic Hedging) เช่น การสลับตำแหน่งกริยาช่วยเพื่อเน้นย้ำ (Negative Inversion) และการลดรูปอนุประโยค',
    rules: [
      'Negative / Restrictive Inversion: เมื่อขึ้นต้นประโยคด้วย Not only, Seldom, Rarely, Under no circumstances ให้สลับกริยาช่วยไว้หน้าประธาน (เช่น Not only does AI accelerate drafting, but it also reshapes training.)',
      'Participle Clauses: ลดรูปอนุประโยคให้กระชับ (เช่น Driven by engagement metrics, algorithms often amplify polarizing content.)',
      'Academic Hedging: หลีกเลี่ยงคำกล่าวอ้างแบบสุดโต่ง (always, proves) โดยใช้ tends to, appears to, is likely to, arguably',
    ],
    correct_examples: [
      {
        german: 'Not only does automation boost output, but it also alters entry-level skill requirements.',
        thai: 'ระบบอัตโนมัติไม่เพียงเพิ่มผลผลิต แต่ยังเปลี่ยนทักษะที่จำเป็นสำหรับงานระดับเริ่มต้นอีกด้วย',
      },
      {
        german: 'Algorithmic feeds tend to prioritize emotional engagement over factual accuracy.',
        thai: 'ฟีดอัลกอริทึมมีแนวโน้มที่จะให้ความสำคัญกับการมีส่วนร่วมทางอารมณ์มากกว่าความถูกต้องของข้อมูล (Hedging)',
      },
    ],
    incorrect_examples: [
      {
        german: 'Not only AI reduces costs, but also it improves speed.',
        thai: 'AI ไม่เพียงลดต้นทุน แต่ยังเพิ่มความเร็วด้วย',
        correction: 'Not only does AI reduce costs, but it also improves speed.',
        why_wrong_th: 'เมื่อขึ้นต้นประโยคด้วย Not only ต้องสลับกริยาช่วย does มาไว้หน้าประธาน AI (Inversion)',
      },
    ],
    quiz: [
      {
        question: 'ประโยค C1 ใดใช้ Negative Inversion ได้ถูกต้อง?',
        options: [
          'Seldom governments enforce such strict transparency rules.',
          'Seldom do governments enforce such strict transparency rules.',
          'Seldom did governments enforced such strict transparency rules.',
        ],
        correctIndex: 1,
        explanation_th: 'ขึ้นต้นด้วย Seldom ต้องวางกริยาช่วย (do) หน้าประธาน (governments) ตามด้วยกริยาช่อง 1 ไม่ผัน (enforce)',
      },
    ],
  },
];
