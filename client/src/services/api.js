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
