// Admin Passcode Verification & Feature Granting APIs
app.post('/api/admin/verify-passcode', (req: Request, res: Response) => {
  const { uid = '', email = '', passcode = '' } = req.body || {};
  if (!isAdminEmail(String(email))) {
    return res.status(403).json({ verified: false, error: 'อีเมลนี้ไม่มีสิทธิ์ผู้ดูแลระบบ' });
  }
  const dbData = ensureAppDb();
  if (String(passcode).trim() !== dbData.admin_gate.passcode) {
    return res.status(401).json({
      verified: false,
      error: 'รหัสผ่านเฉพาะไม่ถูกต้อง กรุณากรอกรหัสผ่านให้ตรงกับฐานข้อมูล',
    });
  }
  const adminToken = signAdminToken(String(uid || 'admin'), String(email));
  return res.json({
    verified: true,
    adminToken,
    adminEmail: dbData.admin_gate.admin_email,
  });
});