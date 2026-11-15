# คู่มือการ Deploy ระบบทั้งหมดบน Cloudflare (Workers & Pages)

ระบบ **DeutschSchreiben AI** รองรับการทำงานแบบ Full-Stack บน **Cloudflare Edge** อย่างสมบูรณ์ทั้งสองรูปแบบ:
1. **Cloudflare Workers + Static Assets (แนะนำ)** — ใช้ไฟล์ `wrangler.jsonc` และ `worker/index.ts`
2. **Cloudflare Pages + Pages Functions** — ใช้ `dist/` และ `functions/api/[[path]].ts`

---

## วิธีที่ 1: Deploy ด้วย Cloudflare Workers (แนะนำ)

### 1. เตรียม Secrets
ตั้งค่า `GEMINI_API_KEY` สำหรับใช้ประมวลผล Gemini AI ฝั่ง Worker:
```bash
npx wrangler secret put GEMINI_API_KEY
```

สำหรับการรันทดสอบในเครื่อง (Local Wrangler Dev):
```bash
cp .dev.vars.example .dev.vars
# ใส่ GEMINI_API_KEY ในไฟล์ .dev.vars
npm run cf:dev
```

### 2. ตรวจสอบและ Deploy ขึ้น Production
```bash
# ตรวจสอบการ bundle Worker + Static Assets
npm run cf:check

# Build และ Deploy ขึ้น Cloudflare Workers
npm run cf:deploy
```

### 3. (ไม่บังคับ) เปิดใช้ Cloudflare KV สำหรับเก็บคำศัพท์/โจทย์ที่สร้างเพิ่ม
หากต้องการให้คำศัพท์ที่เพิ่มผ่าน API (`/api/vocabulary`) และโจทย์ที่ AI สร้าง (`/api/tasks/generate`) ถูกเก็บถาวรข้าม Edge Isolate:
```bash
npx wrangler kv namespace create DEUTSCHSCHREIBEN_KV
```
จากนั้นนำ `id` ที่ได้ไปใส่ในบล็อก `kv_namespaces` ของไฟล์ `wrangler.jsonc`

---

## วิธีที่ 2: Deploy ด้วย Cloudflare Pages (Git Integration หรือ CLI)

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Functions directory:** `functions` (ระบบสร้าง `functions/api/[[path]].ts` ไว้พร้อมแล้ว)
- **Environment Variable / Secret (Production & Preview):** เพิ่ม `GEMINI_API_KEY` ใน Cloudflare Pages > Settings > Variables and Secrets

หรือ Deploy ผ่าน CLI:
```bash
npm run cf:pages:deploy
```

---

## การตั้งค่า Firebase Auth สำหรับโดเมน Cloudflare

ประวัติงานเขียนและคลังคำศัพท์ส่วนตัวของผู้ใช้ถูกจัดเก็บบน **Firebase Firestore** (`ai-studio-deutschschreiben-1c1f57aa-b91a-4d96-98a4-d1ea89fa3fbb`) ร่วมกับ Local Storage:
1. ไปที่ **Firebase Console > Authentication > Settings > Authorized domains**
2. กด **Add domain** แล้วเพิ่มโดเมน Cloudflare ของคุณ (เช่น `deutschschreiben-ai.<subdomain>.workers.dev`, `<project>.pages.dev` หรือ Custom Domain ของคุณ) เพื่อให้ **Sign in with Google (`signInWithPopup`)** ทำงานได้สมบูรณ์
