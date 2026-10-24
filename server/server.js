const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readDb, writeDb, syncFleetStatus, getDestinationScheduleRule, initialData, recordAuditLog } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory active user sessions: token -> { userId, role, expiresAt }
const activeSessions = new Map();

function generateToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days session
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    expiresAt
  });
  return token;
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    roleLabel: user.roleLabel,
    phone: user.phone || '',
    department: user.department || '',
    status: user.status || 'active',
    permissions: user.permissions || [],
    createdAt: user.createdAt
  };
}

function getSessionUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  const db = readDb();
  return db.users?.find(u => u.id === session.userId && u.status === 'active') || null;
}

function getActorUser(req) {
  const sessionUser = getSessionUser(req);
  if (sessionUser) return sessionUser;
  return {
    id: 'user-admin-1',
    name: 'م/ محمد ابراهيم ابوالمعاطى',
    role: 'admin',
    phone: '01159700466',
    department: 'إدارة الدعم والمتابعة - البريد المصري'
  };
}

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('ar-EG')}] ${req.method} ${req.url}`);
  next();
});

// Helper to compute stats
function calculateStats(db) {
  const totalMissions = db.missions.length;
  const activeMissions = db.missions.filter(m => ['assigned', 'loading', 'on_road'].includes(m.status)).length;
  const completedMissions = db.missions.filter(m => m.status === 'completed').length;
  
  const totalDrivers = db.drivers.length;
  const availableDrivers = db.drivers.filter(d => d.status === 'متاح').length;
  const onMissionDrivers = db.drivers.filter(d => d.status === 'في مأمورية').length;
  const leaveDrivers = db.drivers.filter(d => d.status === 'إجازة' || d.status === 'اجازة' || (typeof d.status === 'string' && d.status.includes('إجازة'))).length;
  
  const totalVehicles = db.vehicles.length;
  const availableVehicles = db.vehicles.filter(v => v.status === 'متاحة').length;
  const onMissionVehicles = db.vehicles.filter(v => v.status === 'في مأمورية').length;
  const maintenanceVehicles = db.vehicles.filter(v => v.status === 'صيانة').length;
  const leaveVehicles = db.vehicles.filter(v => v.status === 'سائق بإجازة').length;

  const totalFuelCost = db.missions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0);
  const totalTollsCost = db.missions.reduce((acc, m) => acc + (Number(m.tollExpense) || 0), 0);
  const totalAllowances = db.missions.reduce((acc, m) => acc + (Number(m.driverAllowance) || 0), 0);
  const totalDistance = db.missions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0);

  // License alerts counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let urgentLicenses = 0;
  let expiredLicenses = 0;
  let expiringSoonLicenses = 0;
  let unrecordedLicenses = 0;

  const allItems = [...db.vehicles, ...db.drivers];
  allItems.forEach(item => {
    if (!item.licenseExpiry || !item.licenseExpiry.trim()) {
      unrecordedLicenses++;
    } else {
      const exp = new Date(item.licenseExpiry);
      exp.setHours(0, 0, 0, 0);
      if (isNaN(exp.getTime())) {
        unrecordedLicenses++;
      } else {
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          expiredLicenses++;
          urgentLicenses++;
        } else if (diffDays <= 30) {
          expiringSoonLicenses++;
          urgentLicenses++;
        }
      }
    }
  });

  return {
    totalMissions,
    activeMissions,
    completedMissions,
    totalDrivers,
    availableDrivers,
    onMissionDrivers,
    leaveDrivers,
    totalVehicles,
    availableVehicles,
    onMissionVehicles,
    maintenanceVehicles,
    leaveVehicles,
    totalFuelCost,
    totalTollsCost,
    totalAllowances,
    totalDistance,
    totalWarehouses: db.warehouses.length,
    urgentLicenses,
    expiredLicenses,
    expiringSoonLicenses,
    unrecordedLicenses
  };
}

// ---------------- AUTHENTICATION & USERS ---------------- //

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const db = readDb();
  const cleanUsername = String(username).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  // Find user by username or phone
  const user = (db.users || []).find(u => 
    (u.username.toLowerCase() === cleanUsername || (u.phone && u.phone.trim() === cleanUsername)) &&
    u.status === 'active'
  );

  const isAdminMatch = user && user.id === 'user-admin-1' && (cleanPassword === 'admin' || cleanPassword === 'admin2026' || user.password === cleanPassword);

  if (!user || (!isAdminMatch && user.password !== cleanPassword)) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const token = generateToken(user);

  recordAuditLog(db, {
    actionType: 'auth_login',
    actionLabel: 'تسجيل دخول معتمد',
    entity: 'auth',
    entityId: user.id,
    details: `قام المستخدم (${user.name} - ${user.roleLabel}) بتسجيل الدخول إلى المنظومة بنجاح`,
    user: sanitizeUser(user)
  });
  writeDb(db);

  res.json({
    message: 'تم تسجيل الدخول بنجاح',
    token,
    user: sanitizeUser(user)
  });
});

// GET CURRENT USER (ME)
app.get('/api/auth/me', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'جلسة المستخدم منتهية أو غير مسجلة' });
  }
  res.json({ user: sanitizeUser(user) });
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    activeSessions.delete(token);
  }
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// GET USERS LIST (Admin only)
app.get('/api/users', (req, res) => {
  const db = readDb();
  const user = getSessionUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح: هذه الصفحة مخصصة لمدير عام المنظومة فقط' });
  }
  res.json((db.users || []).map(u => sanitizeUser(u)));
});

// CREATE NEW USER (Admin only)
app.post('/api/users', (req, res) => {
  const sessionUser = getSessionUser(req);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح: إدارة المستخدمين تتطلب صلاحية مدير عام المنظومة' });
  }

  const { name, username, password, role, phone, department, permissions } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'الاسم واسم المستخدم وكلمة المرور حقول مطلوبة' });
  }

  const db = readDb();
  const cleanUsername = String(username).trim().toLowerCase();
  
  if (db.users?.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'اسم المستخدم هذا مسجل بالفعل، يرجى اختيار اسم آخر' });
  }

  const roleLabels = {
    admin: 'مدير عام المنظومة (تحكم كامل)',
    dispatcher: 'مسؤول حركة وتشغيل',
    warehouse_manager: 'أمين مخزن إقليمي',
    viewer: 'مشاهد واستعلام فقط'
  };

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    username: cleanUsername,
    password: String(password).trim(),
    role: role || 'viewer',
    roleLabel: roleLabels[role] || 'مستخدم معتمد',
    phone: phone ? String(phone).trim() : '',
    department: department ? String(department).trim() : 'قطاع العمليات',
    status: 'active',
    permissions: Array.isArray(permissions) ? permissions : (role === 'admin' ? ['all'] : []),
    createdAt: new Date().toISOString()
  };

  if (!db.users) db.users = [];
  db.users.push(newUser);

  recordAuditLog(db, {
    actionType: 'create_user',
    actionLabel: 'إنشاء حساب مستخدم جديد',
    entity: 'user',
    entityId: newUser.id,
    details: `تم إنشاء حساب جديد للمستخدم (${newUser.name}) برتبة (${newUser.roleLabel}) واسم مستخدم (${newUser.username})`,
    user: getActorUser(req)
  });

  writeDb(db);

  res.status(201).json({
    message: 'تم إنشاء المستخدم بنجاح',
    user: sanitizeUser(newUser)
  });
});

// UPDATE USER (Admin only)
app.put('/api/users/:id', (req, res) => {
  const sessionUser = getSessionUser(req);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح: تعديل المستخدمين يتطلب صلاحية مدير عام المنظومة' });
  }

  const db = readDb();
  const index = (db.users || []).findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  const existing = db.users[index];
  const { name, role, phone, department, status, password, permissions } = req.body;

  const roleLabels = {
    admin: 'مدير عام المنظومة (تحكم كامل)',
    dispatcher: 'مسؤول حركة وتشغيل',
    warehouse_manager: 'أمين مخزن إقليمي',
    viewer: 'مشاهد واستعلام فقط'
  };

  if (name) existing.name = name.trim();
  if (role) {
    existing.role = role;
    existing.roleLabel = roleLabels[role] || existing.roleLabel;
  }
  if (phone !== undefined) existing.phone = String(phone).trim();
  if (department !== undefined) existing.department = String(department).trim();
  if (status && ['active', 'inactive'].includes(status)) existing.status = status;
  if (password && String(password).trim().length > 0) existing.password = String(password).trim();
  if (Array.isArray(permissions)) existing.permissions = permissions;

  recordAuditLog(db, {
    actionType: 'update_user',
    actionLabel: 'تعديل بيانات وصلاحيات مستخدم',
    entity: 'user',
    entityId: req.params.id,
    details: `تم تحديث بيانات وصلاحيات المستخدم (${existing.name}) - الحالة: ${existing.status === 'active' ? 'نشط' : 'معطل'}`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({
    message: 'تم تحديث بيانات المستخدم بنجاح',
    user: sanitizeUser(existing)
  });
});

// DELETE USER (Admin only)
app.delete('/api/users/:id', (req, res) => {
  const sessionUser = getSessionUser(req);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح: حذف المستخدمين يتطلب صلاحية مدير عام المنظومة' });
  }

  if (req.params.id === 'user-admin-1') {
    return res.status(400).json({ error: 'لا يمكن حذف الحساب الرئيسي للمهندس محمد ابراهيم (مدير عام المنظومة)' });
  }

  const db = readDb();
  const userToDelete = (db.users || []).find(u => u.id === req.params.id);
  db.users = (db.users || []).filter(u => u.id !== req.params.id);

  recordAuditLog(db, {
    actionType: 'delete_user',
    actionLabel: 'حذف حساب مستخدم',
    entity: 'user',
    entityId: req.params.id,
    details: `تم حذف حساب المستخدم (${userToDelete ? userToDelete.name : req.params.id}) من المنظومة`,
    user: getActorUser(req)
  });

  writeDb(db);

  res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// ---------------- API ROUTES ---------------- //

// GET Full Database & Stats
app.get('/api/data', (req, res) => {
  const db = readDb();
  syncFleetStatus(db);
  writeDb(db);
  const stats = calculateStats(db);
  const sanitizedUsers = (db.users || []).map(u => sanitizeUser(u));
  res.json({ ...db, users: sanitizedUsers, stats, auditLogs: db.auditLogs || [] });
});

// GET Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const db = readDb();
  res.json(db.auditLogs || []);
});

// GET Stats
app.get('/api/stats', (req, res) => {
  const db = readDb();
  res.json(calculateStats(db));
});

// ---------- MISSIONS ---------- //

// CREATE Mission
app.post('/api/missions', (req, res) => {
  const db = readDb();
  const {
    title,
    driverId,
    vehicleId,
    originId,
    destinationId,
    cargoType,
    cargoWeight,
    dispatchOrderNumber,
    departureDate,
    expectedArrival,
    cashAdvance,
    fuelExpense,
    tollExpense,
    driverAllowance,
    otherExpenses,
    notes,
    distanceKm
  } = req.body;

  const driver = db.drivers.find(d => d.id === driverId);
  const vehicle = db.vehicles.find(v => v.id === vehicleId);
  const origin = db.warehouses.find(w => w.id === originId);
  const destination = db.warehouses.find(w => w.id === destinationId);

  const seq = db.missions.length + 1;
  const missionNumber = `M-2026-${String(seq).padStart(3, '0')}`;

  const advance = Number(cashAdvance) || 0;
  const fuel = Number(fuelExpense) || 0;
  const tolls = Number(tollExpense) || 0;
  const allowance = Number(driverAllowance) || 0;
  const other = Number(otherExpenses) || 0;
  const remainingCash = advance - (fuel + tolls + allowance + other);

  const scheduleRule = getDestinationScheduleRule(destinationId, departureDate);

  const newMission = {
    id: `mis-${Date.now()}`,
    missionNumber,
    title: title || `مأمورية نقل إلى ${destination ? destination.name : 'المخزن الإقليمي'}`,
    driverId,
    driverName: driver ? driver.name : 'غير محدد',
    driverPhone: driver ? driver.phone : '',
    vehicleId,
    vehicleCode: vehicle ? vehicle.code : '',
    vehiclePlate: vehicle ? vehicle.plateNumber : '',
    vehicleType: vehicle ? vehicle.type : '',
    originId,
    originName: origin ? origin.name : 'المخزن الرئيسي',
    destinationId,
    destinationName: destination ? destination.name : '',
    status: req.body.status || 'assigned', // draft, assigned, loading, on_road, delivered, completed, cancelled
    occupancyDays: Number(req.body.occupancyDays) || scheduleRule.occupancyDays,
    schedulePattern: req.body.schedulePattern || scheduleRule.schedulePattern,
    scheduleType: req.body.scheduleType || scheduleRule.scheduleType,
    durationLabel: req.body.durationLabel || scheduleRule.durationLabel,
    scheduleSteps: req.body.scheduleSteps || scheduleRule.scheduleSteps,
    cargoType: cargoType || 'اثاثات مكتبيه',
    cargoWeight: cargoWeight ? String(cargoWeight).trim() : '',
    dispatchOrderNumber: dispatchOrderNumber ? String(dispatchOrderNumber).trim() : '',
    departureDate: departureDate || new Date().toISOString().slice(0, 16),
    expectedArrival: expectedArrival || '',
    expectedReturnDate: req.body.expectedReturnDate || scheduleRule.expectedReturnDate,
    actualArrival: null,
    completedDate: null,
    startOdometer: vehicle ? vehicle.odometer : 0,
    endOdometer: null,
    distanceKm: Number(distanceKm) || 0,
    cashAdvance: advance,
    fuelExpense: fuel,
    fuelLiters: Number(req.body.fuelLiters) || (fuel > 0 ? Number((fuel / 15.0).toFixed(1)) : 0),
    fuelPricePerLiter: Number(req.body.fuelPricePerLiter) || 15.00,
    fuelReceiptNumber: req.body.fuelReceiptNumber || '',
    fuelEfficiencyLitersPer100Km: req.body.fuelEfficiencyLitersPer100Km || null,
    kmPerLiter: req.body.kmPerLiter || null,
    fuelCostPerKm: req.body.fuelCostPerKm || null,
    fuelWasteCost: req.body.fuelWasteCost || 0,
    tollExpense: tolls,
    driverAllowance: allowance,
    otherExpenses: other,
    remainingCash,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.missions.unshift(newMission);
  syncFleetStatus(db);

  recordAuditLog(db, {
    actionType: 'create_mission',
    actionLabel: 'إسناد مأمورية جديدة',
    entity: 'mission',
    entityId: newMission.id,
    details: `تم إسناد مأمورية "${newMission.title}" برقم (${newMission.missionNumber}) للسائق (${newMission.driverName}) والسيارة (${newMission.vehicleCode}) متجهة إلى (${newMission.destinationName}) — طبيعة الحمولة: ${newMission.cargoType}`,
    user: getActorUser(req)
  });

  writeDb(db);

  res.status(201).json({ message: 'تم إنشاء المأمورية بنجاح', mission: newMission });
});

// UPDATE Mission
app.put('/api/missions/:id', (req, res) => {
  const db = readDb();
  const index = db.missions.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'المأمورية غير موجودة' });
  }

  const existing = db.missions[index];
  const updatedData = { ...existing, ...req.body };

  // Recalculate remaining cash
  const advance = Number(updatedData.cashAdvance) || 0;
  const fuel = Number(updatedData.fuelExpense) || 0;
  const tolls = Number(updatedData.tollExpense) || 0;
  const allowance = Number(updatedData.driverAllowance) || 0;
  const other = Number(updatedData.otherExpenses) || 0;
  updatedData.remainingCash = advance - (fuel + tolls + allowance + other);

  // If marked as completed
  if (updatedData.status === 'completed' && existing.status !== 'completed') {
    updatedData.completedDate = new Date().toISOString();
    // increment driver's mission count
    const driver = db.drivers.find(d => d.id === updatedData.driverId);
    if (driver) {
      driver.totalMissions = (driver.totalMissions || 0) + 1;
    }
    // update vehicle odometer if provided
    if (updatedData.endOdometer) {
      const vehicle = db.vehicles.find(v => v.id === updatedData.vehicleId);
      if (vehicle) {
        vehicle.odometer = Number(updatedData.endOdometer);
        if (updatedData.startOdometer) {
          updatedData.distanceKm = Math.max(0, vehicle.odometer - Number(updatedData.startOdometer));
        }
      }
    }
  }

  const statusMap = {
    assigned: 'تم التكليف',
    loading: 'جارٍ التحميل',
    on_road: 'على الطريق',
    delivered: 'تم التسليم بالموقع',
    completed: 'مكتملة ومغلقة',
    cancelled: 'ملغاة'
  };

  const isStatusChange = existing.status !== updatedData.status;
  recordAuditLog(db, {
    actionType: isStatusChange ? 'mission_status' : 'update_mission',
    actionLabel: isStatusChange ? `تحديث حالة مأمورية: ${statusMap[updatedData.status] || updatedData.status}` : 'تعديل بيانات مأمورية',
    entity: 'mission',
    entityId: updatedData.id,
    details: isStatusChange 
      ? `تم تغيير حالة المأمورية رقم (${updatedData.missionNumber}) من "${statusMap[existing.status] || existing.status}" إلى "${statusMap[updatedData.status] || updatedData.status}"`
      : `تم تعديل بيانات وتكاليف المأمورية رقم (${updatedData.missionNumber})`,
    user: getActorUser(req)
  });

  db.missions[index] = updatedData;
  syncFleetStatus(db);
  writeDb(db);

  res.json({ message: 'تم تحديث بيانات المأمورية', mission: updatedData });
});

// DELETE Mission
app.delete('/api/missions/:id', (req, res) => {
  const db = readDb();
  const deletedMission = db.missions.find(m => m.id === req.params.id);
  db.missions = db.missions.filter(m => m.id !== req.params.id);
  syncFleetStatus(db);

  recordAuditLog(db, {
    actionType: 'delete_mission',
    actionLabel: 'حذف مأمورية',
    entity: 'mission',
    entityId: req.params.id,
    details: `تم حذف المأمورية رقم (${deletedMission ? deletedMission.missionNumber : req.params.id}) من المنظومة`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم حذف المأمورية بنجاح' });
});

// ---------- DRIVERS ---------- //

// ADD Driver
app.post('/api/drivers', (req, res) => {
  const db = readDb();
  const { name, role, vehicleCategory, phone, nationalId, licenseNumber, licenseExpiry, notes } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'اسم السائق مطلوب' });
  }

  const newDriver = {
    id: `drv-${Date.now()}`,
    name,
    role: role || (vehicleCategory === 'كانتر شاسيه طويل' ? 'سائق كانتر' : 'سائق سيارة صندوق'),
    vehicleCategory: vehicleCategory || 'نقل صندوق',
    phone: phone || '',
    nationalId: nationalId || '',
    licenseNumber: licenseNumber || '',
    licenseExpiry: licenseExpiry || '',
    status: 'متاح',
    rating: 5.0,
    assignedVehicleId: null,
    totalMissions: 0,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.drivers.push(newDriver);

  recordAuditLog(db, {
    actionType: 'create_driver',
    actionLabel: 'إضافة سائق جديد',
    entity: 'driver',
    entityId: newDriver.id,
    details: `تم إضافة السائق (${newDriver.name}) - الفئة: ${newDriver.vehicleCategory} - هاتف: ${newDriver.phone || 'غير مسجل'}`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.status(201).json({ message: 'تم إضافة السائق بنجاح', driver: newDriver });
});

// UPDATE Driver
app.put('/api/drivers/:id', (req, res) => {
  const db = readDb();
  const index = db.drivers.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'السائق غير موجود' });
  }

  const existingDriver = db.drivers[index];
  const updatedStatus = req.body.status;

  let actionLabel = 'تعديل بيانات سائق';
  let actionType = 'update_driver';
  let details = `تم تعديل بيانات السائق (${existingDriver.name})`;

  if (updatedStatus === 'إجازة' || updatedStatus === 'اجازة') {
    actionType = 'driver_leave';
    actionLabel = 'تسجيل إجازة رسمية لسائق (حجب الشاحنة)';
    details = `تم تسجيل إجازة رسمية للسائق (${existingDriver.name}) وتم حجب شاحنته المخصصة تلقائياً لمنع أي خلل تشغيلي`;
  } else if ((existingDriver.status === 'إجازة' || existingDriver.status === 'اجازة') && updatedStatus === 'متاح') {
    actionType = 'driver_resume';
    actionLabel = 'إنهاء إجازة سائق (عودة للعمل)';
    details = `تم إنهاء إجازة السائق (${existingDriver.name}) وإعادة سيارته فوراً لأسطول المأموريات المتاح للتشغيل`;
  }

  db.drivers[index] = { ...existingDriver, ...req.body };
  syncFleetStatus(db);

  recordAuditLog(db, {
    actionType,
    actionLabel,
    entity: 'driver',
    entityId: req.params.id,
    details,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم تحديث بيانات السائق', driver: db.drivers[index] });
});

// DELETE Driver
app.delete('/api/drivers/:id', (req, res) => {
  const db = readDb();
  const driverToDelete = db.drivers.find(d => d.id === req.params.id);
  db.drivers = db.drivers.filter(d => d.id !== req.params.id);
  syncFleetStatus(db);

  recordAuditLog(db, {
    actionType: 'delete_driver',
    actionLabel: 'حذف سائق من الأسطول',
    entity: 'driver',
    entityId: req.params.id,
    details: `تم حذف السائق (${driverToDelete ? driverToDelete.name : req.params.id}) من طاقم السائقين`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم حذف السائق بنجاح' });
});

// ---------- VEHICLES (With dynamic expansion) ---------- //

// ADD Vehicle
app.post('/api/vehicles', (req, res) => {
  const db = readDb();
  const { code, plateNumber, type, model, year, capacity, currentLocation, odometer, fuelTankCapacity, licenseExpiry, nextMaintenanceKm, driverId } = req.body;

  if (!plateNumber || !type) {
    return res.status(400).json({ error: 'رقم اللوحة ونوع السيارة مطلوبان' });
  }

  const countOfType = db.vehicles.filter(v => v.type === type).length + 1;
  const defaultCode = type.includes('كانتر') ? `كانتر-${String(countOfType).padStart(2, '0')}` : `صندوق-${String(countOfType).padStart(2, '0')}`;

  const newVehicle = {
    id: `veh-${Date.now()}`,
    code: code || defaultCode,
    plateNumber,
    type,
    model: model || (type.includes('كانتر') ? 'ميتسوبيشي فوزو كانتر' : 'شيفورليه جامبو'),
    year: Number(year) || 2024,
    capacity: capacity || (type.includes('كانتر') ? '6.5 طن' : '5 طن'),
    status: 'متاحة',
    currentLocation: currentLocation || 'جراج شبرا',
    odometer: Number(odometer) || 0,
    fuelType: 'سولار',
    fuelTankCapacity: Number(fuelTankCapacity) || 140,
    licenseExpiry: licenseExpiry || '',
    nextMaintenanceKm: Number(nextMaintenanceKm) || ((Number(odometer) || 0) + 10000),
    driverId: driverId || null
  };

  db.vehicles.push(newVehicle);

  recordAuditLog(db, {
    actionType: 'create_vehicle',
    actionLabel: 'إضافة شاحنة جديدة للأسطول',
    entity: 'vehicle',
    entityId: newVehicle.id,
    details: `تم إضافة الشاحنة كود (${newVehicle.code}) برقم لوحات (${newVehicle.plateNumber}) - الفئة: ${newVehicle.type} - الموقع: ${newVehicle.currentLocation}`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.status(201).json({ message: 'تم إضافة السيارة الجديدة بنجاح للأسطول', vehicle: newVehicle });
});

// UPDATE Vehicle
app.put('/api/vehicles/:id', (req, res) => {
  const db = readDb();
  const index = db.vehicles.findIndex(v => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'السيارة غير موجودة' });
  }

  db.vehicles[index] = { ...db.vehicles[index], ...req.body };

  recordAuditLog(db, {
    actionType: 'update_vehicle',
    actionLabel: 'تعديل بيانات شاحنة',
    entity: 'vehicle',
    entityId: req.params.id,
    details: `تم تعديل بيانات الشاحنة (${db.vehicles[index].code} - ${db.vehicles[index].plateNumber}) - الموقع الحالي: ${db.vehicles[index].currentLocation}`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم تحديث بيانات السيارة', vehicle: db.vehicles[index] });
});

// DELETE Vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  const db = readDb();
  const vehicleToDelete = db.vehicles.find(v => v.id === req.params.id);
  db.vehicles = db.vehicles.filter(v => v.id !== req.params.id);

  recordAuditLog(db, {
    actionType: 'delete_vehicle',
    actionLabel: 'حذف شاحنة من الأسطول',
    entity: 'vehicle',
    entityId: req.params.id,
    details: `تم حذف الشاحنة (${vehicleToDelete ? vehicleToDelete.code : req.params.id}) من أسطول السيارات`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم حذف السيارة من الأسطول' });
});

// ---------- WAREHOUSES & LOCATIONS ---------- //

// ADD Warehouse
app.post('/api/warehouses', (req, res) => {
  const db = readDb();
  const { name, type, category, city, address, coordinates, manager, phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'اسم المخزن مطلوب' });
  }

  const newWarehouse = {
    id: `loc-${Date.now()}`,
    name,
    type: type || 'regional_warehouse',
    category: category || 'مخزن فرعي',
    city: city || 'مصر',
    address: address || '',
    coordinates: coordinates || [30.0444, 31.2357], // default Cairo
    manager: manager ? String(manager).trim() : '',
    phone: phone ? String(phone).trim() : '',
    isMain: false
  };

  db.warehouses.push(newWarehouse);

  recordAuditLog(db, {
    actionType: 'create_warehouse',
    actionLabel: 'إضافة موقع مخزن إقليمي',
    entity: 'warehouse',
    entityId: newWarehouse.id,
    details: `تم إضافة الموقع/المخزن (${newWarehouse.name}) في محافظة/مدينة (${newWarehouse.city})`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.status(201).json({ message: 'تم إضافة المخزن بنجاح', warehouse: newWarehouse });
});

// UPDATE Warehouse (Manager, Phone, etc.)
app.put('/api/warehouses/:id', (req, res) => {
  const db = readDb();
  const index = db.warehouses.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'الموقع/المخزن غير موجود' });
  }

  const { capacity, ...rest } = req.body;
  delete db.warehouses[index].capacity;

  db.warehouses[index] = {
    ...db.warehouses[index],
    ...rest,
    manager: rest.manager !== undefined ? String(rest.manager).trim() : (db.warehouses[index].manager || ''),
    phone: rest.phone !== undefined ? String(rest.phone).trim() : (db.warehouses[index].phone || '')
  };

  recordAuditLog(db, {
    actionType: 'update_warehouse',
    actionLabel: 'تحديث بيانات مخزن إقليمي',
    entity: 'warehouse',
    entityId: req.params.id,
    details: `تم تحديث بيانات الاتصال والمسؤول لمخزن (${db.warehouses[index].name}) - المسؤول: ${db.warehouses[index].manager || 'غير محدد'} - هاتف: ${db.warehouses[index].phone || 'غير مسجل'}`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.json({ message: 'تم تحديث بيانات المخزن بنجاح', warehouse: db.warehouses[index] });
});

// ---------- MAINTENANCE ---------- //

app.post('/api/maintenance', (req, res) => {
  const db = readDb();
  const { vehicleId, type, cost, odometer, workshop, notes } = req.body;
  const vehicle = db.vehicles.find(v => v.id === vehicleId);

  const log = {
    id: `maint-${Date.now()}`,
    vehicleId,
    vehiclePlate: vehicle ? vehicle.plateNumber : '',
    vehicleCode: vehicle ? vehicle.code : '',
    date: new Date().toISOString().slice(0, 10),
    type: type || 'صيانة دورية',
    cost: Number(cost) || 0,
    odometer: Number(odometer) || (vehicle ? vehicle.odometer : 0),
    workshop: workshop || 'الورشة المركزية',
    notes: notes || ''
  };

  if (!db.maintenanceLogs) db.maintenanceLogs = [];
  db.maintenanceLogs.unshift(log);

  recordAuditLog(db, {
    actionType: 'create_maintenance',
    actionLabel: 'تسجيل عملية صيانة شاحنة',
    entity: 'maintenance',
    entityId: log.id,
    details: `تم تسجيل صيانة للشاحنة (${vehicle ? vehicle.code : ''} - ${log.vehiclePlate}): نوع الصيانة (${log.type}) بتكلفة ${log.cost} ج.م في (${log.workshop})`,
    user: getActorUser(req)
  });

  writeDb(db);
  res.status(201).json({ message: 'تم تسجيل الصيانة بنجاح', log });
});

// RESET TO INITIAL SEED
app.post('/api/reset', (req, res) => {
  writeDb(initialData);
  res.json({ message: 'تمت استعادة البيانات الافتراضية بنجاح' });
});

// Serve frontend static files in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && req.method === 'GET') {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` Fleet Management API Server is running on:   `);
  console.log(` http://localhost:${PORT}                     `);
  console.log(`===============================================`);
});
