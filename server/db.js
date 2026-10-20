const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'fleet_database.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data based exactly on User Specifications
const initialData = {
  warehouses: [
    {
      id: "loc-garage-shubra",
      name: "جراج السيارات - شبرا",
      type: "garage",
      category: "مقر الأسطول والجراج الرئيسي",
      city: "القاهرة - شبرا",
      address: "شارع شبرا الرئيسي، بجوار محطة المظلات، القاهرة",
      coordinates: [30.1085, 31.2464],
      manager: "",
      phone: "",
      isMain: true
    },
    {
      id: "loc-main-tagamoa",
      name: "المخزن الرئيسي - مبنى المخازن بالتجمع",
      type: "main_warehouse",
      category: "المخزن المركزي للتحميل والتوزيع",
      city: "القاهرة الجديدة",
      address: "XG82+V63، المنطقة الصناعية، قسم ثالث القاهره الجديده، محافظة القاهرة 4716144",
      plusCode: "XG82+V63",
      googleMapsUrl: "https://maps.app.goo.gl/i8zGcBE8E9N4phpF6",
      coordinates: [29.96714, 31.50055],
      manager: "",
      phone: "",
      isMain: true
    },
    {
      id: "loc-gharbia-qarshiya",
      name: "مخزن إقليمي الغربية - القرشية",
      type: "regional_warehouse",
      category: "مخزن إقليمي (الدلتا)",
      city: "الغربية - السنطة",
      address: "R4X9+VQP، القرشية، السنطه، محافظة الغربية 6656420",
      plusCode: "R4X9+VQP",
      postalCode: "6656420",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=30.84963,31.11938",
      coordinates: [30.84963, 31.11938],
      manager: "",
      phone: "",
      isMain: false
    },
    {
      id: "loc-minya-mustaqbal",
      name: "مخزن إقليمي مصر الوسطى - المنيا الجديدة (مركز الطويل الإداري)",
      type: "regional_warehouse",
      category: "مخزن إقليمي (مصر الوسطى)",
      city: "المنيا - المنيا الجديدة",
      address: "مركز الطويل الادارى، مدينة المنيا الجديدة، محافظة المنيا 2460586",
      postalCode: "2460586",
      landmark: "الحي الرابع - أمام مسجد علي بن أبي طالب",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%D9%85%D8%B1%D9%83%D8%B2+%D8%A7%D9%84%D8%B7%D9%88%D9%8A%D9%84+%D8%A7%D9%84%D8%A7%D8%AF%D8%A7%D8%B1%D9%89%D8%8C+%D9%85%D8%AF%D9%8A%D9%86%D8%A9+%D8%A7%D9%84%D9%85%D9%86%D9%8A%D8%A7+%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9",
      coordinates: [28.0865, 30.7985],
      manager: "",
      phone: "",
      isMain: false
    },
    {
      id: "loc-sohag-kawthar",
      name: "مخزن إقليمي مصر العليا - سوهاج (الكوثر / السلاموني)",
      type: "regional_warehouse",
      category: "مخزن إقليمي (مصر العليا)",
      city: "سوهاج - الكوثر (أخميم)",
      address: "JQ7J+5G7، السلاموني، مركز أخميم،، السلاموني، الكوثر، سوهاج،، El Kawthar، 1841027",
      plusCode: "JQ7J+5G7",
      postalCode: "1841027",
      landmark: "السلاموني - بجوار حي الكوثر - مركز أخميم",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=26.61288,31.78125",
      coordinates: [26.61288, 31.78125],
      manager: "",
      phone: "",
      isMain: false
    }
  ],

  drivers: [
    {
      id: "drv-1",
      name: "محمد رمضان",
      role: "سائق كانتر",
      vehicleCategory: "كانتر شاسيه طويل",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-canter-1",
      totalMissions: 0,
      notes: "",
      activeMission: null
    },
    {
      id: "drv-2",
      name: "اسامة طلعت",
      role: "سائق سيارة صندوق",
      vehicleCategory: "نقل صندوق",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-box-1",
      totalMissions: 0,
      notes: "",
      activeMission: null
    },
    {
      id: "drv-3",
      name: "محمد سمير",
      role: "سائق سيارة صندوق",
      vehicleCategory: "نقل صندوق",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-box-2",
      totalMissions: 0,
      notes: "",
      activeMission: null
    },
    {
      id: "drv-4",
      name: "محمد عيد",
      role: "سائق كانتر",
      vehicleCategory: "كانتر شاسيه طويل",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-canter-2",
      totalMissions: 0,
      notes: "",
      activeMission: null
    },
    {
      id: "drv-5",
      name: "السيد عيد",
      role: "سائق سيارة صندوق",
      vehicleCategory: "نقل صندوق",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-box-3",
      totalMissions: 0,
      notes: "",
      activeMission: null
    },
    {
      id: "drv-6",
      name: "محمد ادب",
      role: "سائق كانتر",
      vehicleCategory: "كانتر شاسيه طويل",
      phone: "",
      nationalId: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "متاح",
      rating: 5.0,
      assignedVehicleId: "veh-canter-3",
      totalMissions: 0,
      notes: "",
      activeMission: null
    }
  ],

  vehicles: [
    // 3 Box trucks (3 سيارات نقل صندوق)
    {
      id: "veh-box-1",
      code: "صندوق-01",
      plateNumber: "",
      type: "نقل صندوق",
      model: "شاحنة نقل صندوق",
      year: null,
      capacity: "5 طن",
      status: "متاحة",
      currentLocation: "جراج شبرا",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 120,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-2",
      activeMission: null
    },
    {
      id: "veh-box-2",
      code: "صندوق-02",
      plateNumber: "",
      type: "نقل صندوق",
      model: "شاحنة نقل صندوق",
      year: null,
      capacity: "5 طن",
      status: "متاحة",
      currentLocation: "جراج شبرا",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 120,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-3",
      activeMission: null
    },
    {
      id: "veh-box-3",
      code: "صندوق-03",
      plateNumber: "",
      type: "نقل صندوق",
      model: "شاحنة نقل صندوق",
      year: null,
      capacity: "5 طن",
      status: "متاحة",
      currentLocation: "جراج سوهاج",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 120,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-5",
      activeMission: null
    },

    // 3 Canter Long Chassis trucks (3 سيارات كانتر شاسيه طويل)
    {
      id: "veh-canter-1",
      code: "كانتر-01",
      plateNumber: "",
      type: "كانتر شاسيه طويل",
      model: "شاحنة كانتر شاسيه طويل",
      year: null,
      capacity: "6.5 طن",
      status: "متاحة",
      currentLocation: "جراج شبرا",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 150,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-1",
      activeMission: null
    },
    {
      id: "veh-canter-2",
      code: "كانتر-02",
      plateNumber: "",
      type: "كانتر شاسيه طويل",
      model: "شاحنة كانتر شاسيه طويل",
      year: null,
      capacity: "6.5 طن",
      status: "متاحة",
      currentLocation: "جراج شبرا",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 150,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-4",
      activeMission: null
    },
    {
      id: "veh-canter-3",
      code: "كانتر-03",
      plateNumber: "",
      type: "كانتر شاسيه طويل",
      model: "شاحنة كانتر شاسيه طويل",
      year: null,
      capacity: "6.5 طن",
      status: "متاحة",
      currentLocation: "جراج شبرا",
      odometer: 0,
      fuelType: "سولار",
      fuelTankCapacity: 150,
      licenseExpiry: "",
      nextMaintenanceKm: 10000,
      driverId: "drv-6",
      activeMission: null
    }
  ],

  missions: [],

  maintenanceLogs: []
};

// Function to read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database:", err);
    return initialData;
  }
}

// Function to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// Operational formula for regional trips duration & occupancy
function getDestinationScheduleRule(destinationId, departureDateStr) {
  const dep = departureDateStr ? new Date(departureDateStr) : new Date();

  if (destinationId === 'loc-gharbia-qarshiya' || destinationId?.includes('gharbia') || destinationId?.includes('qarshiya')) {
    // القرشية: ذهاب وعودة نفس اليوم (إشغال 1 يوم)
    const expectedReturn = new Date(dep);
    expectedReturn.setHours(20, 0, 0, 0);

    return {
      destinationName: 'مخزن إقليمي الغربية - القرشية',
      occupancyDays: 1,
      schedulePattern: 'ذهاب وعودة نفس اليوم',
      scheduleType: 'same_day',
      durationLabel: 'يوم واحد (ذهاب وعودة نفس اليوم)',
      scheduleSteps: [
        'انطلاق صباحاً من التجمع/شبرا إلى القرشية بالغربية (165 كم)',
        'تفريغ الشحنة بمخزن القرشية واستلام المرتجعات',
        'رحلة العودة ومبيت السيارة بجراج شبرا نفس اليوم'
      ],
      expectedReturnDate: expectedReturn.toISOString().slice(0, 16),
      summaryBadge: 'إشغال 1 يوم (نفس اليوم)'
    };
  }

  if (destinationId === 'loc-minya-mustaqbal' || destinationId?.includes('minya')) {
    // المنيا: ذهاب اليوم وعودة الغد (إشغال 2 يوم)
    const expectedReturn = new Date(dep);
    expectedReturn.setDate(expectedReturn.getDate() + 1);
    expectedReturn.setHours(18, 0, 0, 0);

    return {
      destinationName: 'مخزن إقليمي مصر الوسطى - المنيا الجديدة (مركز الطويل الإداري)',
      occupancyDays: 2,
      schedulePattern: 'ذهاب اليوم وعودة الغد',
      scheduleType: 'two_days',
      durationLabel: 'يومان (ذهاب اليوم + مبيت وعودة الغد)',
      scheduleSteps: [
        'اليوم 1: التحرك من التجمع لمركز الطويل بالمنيا الجديدة (260 كم) وتفريغ الشحنة والمبيت',
        'اليوم 2: رحلة العودة للقاهرة ومبيت السيارة بجراج شبرا'
      ],
      expectedReturnDate: expectedReturn.toISOString().slice(0, 16),
      summaryBadge: 'إشغال يومين (ذهاب ومبيت وعودة)'
    };
  }

  if (destinationId === 'loc-sohag-kawthar' || destinationId?.includes('sohag')) {
    // سوهاج: يوم ذهاب + يوم راحة وتفريغ + يوم عودة (إشغال 3 أيام)
    const expectedReturn = new Date(dep);
    expectedReturn.setDate(expectedReturn.getDate() + 2);
    expectedReturn.setHours(18, 0, 0, 0);

    return {
      destinationName: 'مخزن إقليمي مصر العليا - سوهاج (الكوثر / السلاموني)',
      occupancyDays: 3,
      schedulePattern: 'يوم ذهاب + يوم راحة وتفريغ + يوم عودة',
      scheduleType: 'three_days',
      durationLabel: '3 أيام (يوم ذهاب + يوم راحة وتفريغ + يوم عودة)',
      scheduleSteps: [
        'اليوم 1: السفر والانتقال لمصر العليا - سوهاج (حي الكوثر والسلاموني 495 كم)',
        'اليوم 2: يوم راحة كاملة للسائق وتفريغ الشحنة بمخزن الكوثر / السلاموني',
        'اليوم 3: رحلة العودة من سوهاج إلى جراج شبرا / التجمع'
      ],
      expectedReturnDate: expectedReturn.toISOString().slice(0, 16),
      summaryBadge: 'إشغال 3 أيام (ذهاب + راحة + عودة)'
    };
  }

  // Fallback
  const defReturn = new Date(dep);
  defReturn.setDate(defReturn.getDate() + 1);
  return {
    destinationName: 'مخزن إقليمي',
    occupancyDays: 1,
    schedulePattern: 'مأمورية مخصصة',
    scheduleType: 'custom',
    durationLabel: 'مأمورية مخصصة',
    scheduleSteps: ['انطلاق وتسليم وعودة'],
    expectedReturnDate: defReturn.toISOString().slice(0, 16),
    summaryBadge: 'إشغال 1 يوم'
  };
}

// Helper to update driver & vehicle statuses based on missions and leave
function syncFleetStatus(db) {
  const activeMissions = db.missions.filter(m => ['assigned', 'loading', 'on_road'].includes(m.status));
  const activeDriverMap = new Map();
  const activeVehicleMap = new Map();

  activeMissions.forEach(m => {
    const info = {
      missionId: m.id,
      missionNumber: m.missionNumber,
      destinationName: m.destinationName,
      occupancyDays: m.occupancyDays || 1,
      schedulePattern: m.schedulePattern || 'مأمورية جارية',
      expectedReturnDate: m.expectedReturnDate || m.expectedArrival,
      departureDate: m.departureDate,
      status: m.status
    };
    activeDriverMap.set(m.driverId, info);
    activeVehicleMap.set(m.vehicleId, info);
  });

  // Track drivers on leave
  const leaveDriverIds = new Set(
    db.drivers
      .filter(d => d.status === 'إجازة' || d.status === 'اجازة' || (typeof d.status === 'string' && d.status.includes('إجازة')))
      .map(d => d.id)
  );

  db.drivers.forEach(driver => {
    if (activeDriverMap.has(driver.id)) {
      driver.status = "في مأمورية";
      driver.activeMission = activeDriverMap.get(driver.id);
    } else if (driver.status === 'إجازة' || driver.status === 'اجازة' || (typeof driver.status === 'string' && driver.status.includes('إجازة'))) {
      driver.status = "إجازة";
      driver.activeMission = null;
    } else {
      if (driver.status === "في مأمورية") driver.status = "متاح";
      driver.activeMission = null;
    }
  });

  db.vehicles.forEach(vehicle => {
    if (activeVehicleMap.has(vehicle.id)) {
      vehicle.status = "في مأمورية";
      vehicle.activeMission = activeVehicleMap.get(vehicle.id);
    } else if (vehicle.status === "صيانة") {
      vehicle.activeMission = null;
    } else if (vehicle.driverId && leaveDriverIds.has(vehicle.driverId)) {
      vehicle.status = "سائق بإجازة";
      vehicle.activeMission = null;
    } else {
      if (vehicle.status === "في مأمورية" || vehicle.status === "سائق بإجازة") {
        vehicle.status = "متاحة";
      }
      vehicle.activeMission = null;
    }
  });
}

module.exports = {
  readDb,
  writeDb,
  syncFleetStatus,
  getDestinationScheduleRule,
  initialData
};
