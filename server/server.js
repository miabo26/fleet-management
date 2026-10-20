const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { readDb, writeDb, syncFleetStatus, getDestinationScheduleRule, initialData } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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
  
  const totalVehicles = db.vehicles.length;
  const availableVehicles = db.vehicles.filter(v => v.status === 'متاحة').length;
  const onMissionVehicles = db.vehicles.filter(v => v.status === 'في مأمورية').length;
  const maintenanceVehicles = db.vehicles.filter(v => v.status === 'صيانة').length;

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
    totalVehicles,
    availableVehicles,
    onMissionVehicles,
    maintenanceVehicles,
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

// ---------------- API ROUTES ---------------- //

// GET Full Database & Stats
app.get('/api/data', (req, res) => {
  const db = readDb();
  syncFleetStatus(db);
  writeDb(db);
  const stats = calculateStats(db);
  res.json({ ...db, stats });
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
    cargoType: cargoType || 'بضائع عامة ومهمات',
    cargoWeight: cargoWeight || 'حسب إذن التحميل',
    dispatchOrderNumber: dispatchOrderNumber || `إذن #${Math.floor(1000 + Math.random() * 9000)}`,
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

  db.missions[index] = updatedData;
  syncFleetStatus(db);
  writeDb(db);

  res.json({ message: 'تم تحديث بيانات المأمورية', mission: updatedData });
});

// DELETE Mission
app.delete('/api/missions/:id', (req, res) => {
  const db = readDb();
  db.missions = db.missions.filter(m => m.id !== req.params.id);
  syncFleetStatus(db);
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

  db.drivers[index] = { ...db.drivers[index], ...req.body };
  writeDb(db);
  res.json({ message: 'تم تحديث بيانات السائق', driver: db.drivers[index] });
});

// DELETE Driver
app.delete('/api/drivers/:id', (req, res) => {
  const db = readDb();
  db.drivers = db.drivers.filter(d => d.id !== req.params.id);
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
  writeDb(db);
  res.json({ message: 'تم تحديث بيانات السيارة', vehicle: db.vehicles[index] });
});

// DELETE Vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  const db = readDb();
  db.vehicles = db.vehicles.filter(v => v.id !== req.params.id);
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
  // Ensure capacity is removed completely
  delete db.warehouses[index].capacity;

  db.warehouses[index] = {
    ...db.warehouses[index],
    ...rest,
    manager: rest.manager !== undefined ? String(rest.manager).trim() : (db.warehouses[index].manager || ''),
    phone: rest.phone !== undefined ? String(rest.phone).trim() : (db.warehouses[index].phone || '')
  };

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
    date: new Date().toISOString().slice(0, 10),
    type: type || 'صيانة دورية',
    cost: Number(cost) || 0,
    odometer: Number(odometer) || (vehicle ? vehicle.odometer : 0),
    workshop: workshop || 'الورشة المركزية',
    notes: notes || ''
  };

  if (!db.maintenanceLogs) db.maintenanceLogs = [];
  db.maintenanceLogs.unshift(log);
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
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` Fleet Management API Server is running on:   `);
  console.log(` http://localhost:${PORT}                     `);
  console.log(`===============================================`);
});
