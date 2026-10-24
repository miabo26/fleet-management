const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('fleet_auth_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('fleet_auth_token', token);
  } else {
    localStorage.removeItem('fleet_auth_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('fleet_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('fleet_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('fleet_auth_user');
  }
}

export function clearAuthSession() {
  localStorage.removeItem('fleet_auth_token');
  localStorage.removeItem('fleet_auth_user');
}

function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------- AUTH API ---------------- //

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
  setAuthToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    clearAuthSession();
    return null;
  }
  const data = await res.json();
  setStoredUser(data.user);
  return data.user;
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) {
    // ignore
  } finally {
    clearAuthSession();
  }
}

// ---------------- USERS MANAGEMENT API (Admin only) ---------------- //

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل جلب المستخدمين');
  return data;
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل إضافة المستخدم');
  return data;
}

export async function updateUser(id, userData) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل تحديث بيانات المستخدم');
  return data;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'فشل حذف المستخدم');
  return data;
}

// ---------------- AUDIT LOGS API ---------------- //

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل جلب سجل العمليات والرقابة');
  return res.json();
}

// ---------------- FLEET & DATA API ---------------- //

export async function fetchFullData() {
  const res = await fetch(`${API_BASE}/data`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل جلب البيانات من الخادم');
  return res.json();
}

export async function createMission(data) {
  const res = await fetch(`${API_BASE}/missions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إنشاء المأمورية');
  return res.json();
}

export async function updateMission(id, data) {
  const res = await fetch(`${API_BASE}/missions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات المأمورية');
  return res.json();
}

export async function deleteMission(id) {
  const res = await fetch(`${API_BASE}/missions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف المأمورية');
  return res.json();
}

export async function addDriver(data) {
  const res = await fetch(`${API_BASE}/drivers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة السائق');
  return res.json();
}

export async function updateDriver(id, data) {
  const res = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات السائق');
  return res.json();
}

export async function deleteDriver(id) {
  const res = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف السائق');
  return res.json();
}

export async function addVehicle(data) {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة السيارة للأسطول');
  return res.json();
}

export async function updateVehicle(id, data) {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات السيارة');
  return res.json();
}

export async function deleteVehicle(id) {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف السيارة');
  return res.json();
}

export async function addWarehouse(data) {
  const res = await fetch(`${API_BASE}/warehouses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة المخزن');
  return res.json();
}

export async function updateWarehouse(id, data) {
  const res = await fetch(`${API_BASE}/warehouses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات المخزن');
  return res.json();
}

export async function addMaintenanceLog(data) {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تسجيل الصيانة');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل استعادة البيانات');
  return res.json();
}

// Backup & Disaster Recovery APIs
export async function fetchBackupStats() {
  const res = await fetch(`${API_BASE}/backup/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل جلب إحصائيات النسخ الاحتياطي');
  return res.json();
}

export async function createManualSnapshot() {
  const res = await fetch(`${API_BASE}/backup/snapshot`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل إنشاء لقطة احتياطية');
  return res.json();
}

export async function restoreBackupData(backupData) {
  const res = await fetch(`${API_BASE}/backup/restore`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backupData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشلت عملية استعادة النسخة الاحتياطية');
  }
  return res.json();
}

export async function downloadBackupFile() {
  const res = await fetch(`${API_BASE}/backup/download`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('فشل تحميل ملف النسخة الاحتياطية');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `fleet_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ---------- DRIVER SMART PORTAL APIS ---------- //

export async function fetchDriversPortalList() {
  const res = await fetch(`${API_BASE}/driver/list`);
  if (!res.ok) throw new Error('فشل جلب قائمة السائقين');
  return res.json();
}

export async function driverLogin(driverId, phone) {
  const res = await fetch(`${API_BASE}/driver/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, phone })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل تسجيل الدخول لبوابة السائق');
  }
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('fleet_driver_token', data.token);
    localStorage.setItem('fleet_driver_id', data.driver.id);
  }
  return data;
}

export async function fetchDriverPortalMe(driverId) {
  const res = await fetch(`${API_BASE}/driver/me/${driverId}`);
  if (!res.ok) throw new Error('فشل جلب بيانات السائق');
  return res.json();
}

export async function updateDriverMissionStatus(missionId, driverId, newStatus, notes = '') {
  const res = await fetch(`${API_BASE}/driver/update-mission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId, driverId, newStatus, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل تحديث حالة المأمورية');
  }
  return res.json();
}

export async function reportDriverEmergency(driverId, vehicleId, missionId, issueType, description, location) {
  const res = await fetch(`${API_BASE}/driver/report-issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, vehicleId, missionId, issueType, description, location })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل إرسال البلاغ الطارئ');
  }
  return res.json();
}

// One-Click Free WhatsApp Mission Dispatcher Generator
export function generateWhatsAppMissionUrl(mission, customPhone = '') {
  if (!mission) return '#';
  const targetPhone = customPhone || mission.driverPhone || '';
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const egPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone.startsWith('20') ? cleanPhone : '20' + cleanPhone;

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://fleet-management-jmuu.onrender.com';
  const driverDirectLink = `${origin}/?driver=${mission.driverId || ''}`;

  const text = `السلام عليكم ورحمة الله يا أسطى ${mission.driverName || ''} 🚚
الهيئة القومية للبريد المصري — إدارة تشغيل وحركة الأسطول
تم إسناد مأمورية بريدية جديدة لسيادتكم:

📋 رقم المأمورية: ${mission.missionNumber || ''}
📦 نوع الحمولة: ${mission.cargoType || 'مهمات بريدية'}
🚛 الشاحنة: ${mission.vehicleCode || ''} (لوحات: ${mission.vehiclePlate || ''})
📍 خط السير: من ${mission.originName || 'المخزن الرئيسي بالتجمع'} إلى ${mission.destinationName || ''}
💰 العهدة النقدية: ${mission.cashAdvance || 0} ج.م
⏱️ مدة الإشغال المقررة: ${mission.occupancyDays || 1} أيام (${mission.schedulePattern || ''})

🔗 اضغط هنا لفتح بوابتك الذكية والملاحة في Google Maps فوراً:
${driverDirectLink}

رافقكم السلامة — إدارة الدعم والحركة (م/ محمد ابراهيم ابوالمعاطى: 01159700466)`;

  return `https://wa.me/${egPhone}?text=${encodeURIComponent(text)}`;
}
