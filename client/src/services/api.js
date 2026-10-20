const API_BASE = '/api';

export async function fetchFullData() {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error('فشل جلب البيانات من الخادم');
  return res.json();
}

export async function createMission(data) {
  const res = await fetch(`${API_BASE}/missions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إنشاء المأمورية');
  return res.json();
}

export async function updateMission(id, data) {
  const res = await fetch(`${API_BASE}/missions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات المأمورية');
  return res.json();
}

export async function deleteMission(id) {
  const res = await fetch(`${API_BASE}/missions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل حذف المأمورية');
  return res.json();
}

export async function addDriver(data) {
  const res = await fetch(`${API_BASE}/drivers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة السائق');
  return res.json();
}

export async function updateDriver(id, data) {
  const res = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات السائق');
  return res.json();
}

export async function deleteDriver(id) {
  const res = await fetch(`${API_BASE}/drivers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل حذف السائق');
  return res.json();
}

export async function addVehicle(data) {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة السيارة للأسطول');
  return res.json();
}

export async function updateVehicle(id, data) {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات السيارة');
  return res.json();
}

export async function deleteVehicle(id) {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل حذف السيارة');
  return res.json();
}

export async function addWarehouse(data) {
  const res = await fetch(`${API_BASE}/warehouses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل إضافة المخزن');
  return res.json();
}

export async function updateWarehouse(id, data) {
  const res = await fetch(`${API_BASE}/warehouses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تحديث بيانات المخزن');
  return res.json();
}

export async function addMaintenanceLog(data) {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل تسجيل الصيانة');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('فشل استعادة البيانات');
  return res.json();
}
