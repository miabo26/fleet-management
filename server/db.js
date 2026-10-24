const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'fleet_database.json');
const BACKUP_FILE = path.join(__dirname, 'data', 'fleet_database.backup.json');
const BACKUPS_DIR = path.join(__dirname, 'data', 'backups');

// Ensure data and backups directory exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Optional Cloud Database Sync (MongoDB Atlas)
let mongoDbCollection = null;
let isMongoConnected = false;

async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;

  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('egypt_post_fleet');
    mongoDbCollection = db.collection('database_snapshots');
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas Cloud Database successfully!');

    // Fetch cloud data and sync to local if newer or present
    const cloudDoc = await mongoDbCollection.findOne({ _id: 'fleet_main_data' });
    if (cloudDoc && cloudDoc.data) {
      console.log('🔄 Synced fleet data from MongoDB Atlas cloud database.');
      writeDbLocal(cloudDoc.data, false);
    } else {
      const local = readDb();
      await mongoDbCollection.updateOne(
        { _id: 'fleet_main_data' },
        { $set: { data: local, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log('☁️ Initialized MongoDB Atlas cloud database from current fleet records.');
    }
  } catch (err) {
    console.error('⚠️ Could not connect to MongoDB Atlas (falling back to local file storage):', err.message);
    isMongoConnected = false;
  }
}

if (process.env.MONGODB_URI) {
  initMongo();
}

// Google Cloud Firebase Firestore Integration
let firestoreDb = null;
let isFirebaseConnected = false;

async function initFirebase() {
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length === 0) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {
          serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT));
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Connected to Google Cloud Firestore via service account!');
      } else if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        console.log(`🔥 Connected to Google Cloud Firestore (Project: ${process.env.FIREBASE_PROJECT_ID})`);
      }
    }

    if (admin.apps.length > 0) {
      firestoreDb = admin.firestore();
      isFirebaseConnected = true;

      // Sync cloud data to local on startup if available
      try {
        const docSnap = await firestoreDb.collection('fleet_database').doc('main').get();
        if (docSnap.exists && docSnap.data() && docSnap.data().data) {
          console.log('🔄 Synced fleet database from Google Cloud Firestore.');
          writeDbLocal(docSnap.data().data, false);
        } else {
          const local = readDb();
          await firestoreDb.collection('fleet_database').doc('main').set({
            data: local,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log('☁️ Initialized Google Cloud Firestore from current fleet records.');
        }
      } catch (syncErr) {
        console.warn('Firestore initial sync notice:', syncErr.message);
      }
    }
  } catch (err) {
    console.warn('Firebase initialization notice:', err.message);
    isFirebaseConnected = false;
  }
}

if (process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_SERVICE_ACCOUNT) {
  initFirebase();
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

  drivers: [],

  vehicles: [],

  missions: [],

  maintenanceLogs: [],

  users: [
    {
      id: "user-admin-1",
      name: "م/ محمد ابراهيم ابوالمعاطى",
      username: "admin",
      password: "15987",
      role: "admin",
      roleLabel: "مدير عام المنظومة (تحكم كامل)",
      phone: "01159700466",
      department: "إدارة الدعم والمتابعة - البريد المصري",
      status: "active",
      permissions: ["all"],
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "user-dispatch-1",
      name: "مسؤول تشغيل وحركة",
      username: "operations",
      password: "op123456",
      role: "dispatcher",
      roleLabel: "مسؤول حركة وتشغيل",
      phone: "",
      department: "جراج السيارات المركزي - شبرا",
      status: "active",
      permissions: ["missions_create", "missions_manage", "fleet_view", "drivers_view", "print_trips"],
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "user-ahmed-1",
      name: "أحمد",
      username: "ahmed",
      password: "123456",
      role: "dispatcher",
      roleLabel: "مسؤول حركة وتشغيل",
      phone: "",
      department: "جراج السيارات المركزي - شبرا",
      status: "active",
      permissions: ["missions_create", "missions_manage", "fleet_view", "drivers_view", "print_trips"],
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "user-warehouse-1",
      name: "مسؤول استلام المخازن",
      username: "warehouse",
      password: "wh123456",
      role: "warehouse_manager",
      roleLabel: "أمين مخزن إقليمي",
      phone: "",
      department: "المخازن الإقليمية (القرشية / المنيا / سوهاج)",
      status: "active",
      permissions: ["missions_view", "mission_deliver", "warehouses_view"],
      createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
      id: "user-viewer-1",
      name: "مشاهد ومتابع",
      username: "viewer",
      password: "view1234",
      role: "viewer",
      roleLabel: "مشاهد واستعلام فقط",
      phone: "",
      department: "المتابعة والتقارير",
      status: "active",
      permissions: ["dashboard_view", "reports_view"],
      createdAt: "2026-01-01T08:00:00.000Z"
    }
  ]
};

const initialUsers = initialData.users;

// Function to read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content);
    if (!db.users || !Array.isArray(db.users) || db.users.length === 0) {
      db.users = initialUsers;
      writeDb(db);
    }
    if (!db.auditLogs || !Array.isArray(db.auditLogs) || db.auditLogs.length === 0) {
      db.auditLogs = initialAuditLogs;
      writeDb(db);
    }
    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    return initialData;
  }
}

// Save a named timestamped snapshot backup
function saveSnapshot(data, prefix = 'snapshot') {
  try {
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `fleet_${prefix}_${dateStr}.json`;
    const filepath = path.join(BACKUPS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    // Keep last 30 snapshots automatically
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('fleet_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length > 30) {
      files.slice(30).forEach(oldFile => {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, oldFile));
        } catch (e) {}
      });
    }

    return filename;
  } catch (err) {
    console.error('Error creating snapshot backup:', err);
    return null;
  }
}

let lastSnapshotTime = 0;

// Internal Atomic Write with Backup Mirror & Snapshot
function writeDbLocal(data, syncToCloud = true) {
  try {
    const content = JSON.stringify(data, null, 2);

    // 1. Mirror previous backup file if existing DB exists
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch (e) {}
    }

    // 2. Safe Atomic Write: write to .tmp then rename
    const tmpFile = DB_FILE + '.tmp';
    fs.writeFileSync(tmpFile, content, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);

    // 3. Periodic rotating snapshot every 30 minutes of active changes
    const now = Date.now();
    if (now - lastSnapshotTime > 30 * 60 * 1000) {
      lastSnapshotTime = now;
      saveSnapshot(data, 'auto');
    }

    // 4. Sync to MongoDB Atlas Cloud if connected
    if (syncToCloud && isMongoConnected && mongoDbCollection) {
      mongoDbCollection.updateOne(
        { _id: 'fleet_main_data' },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      ).catch(err => {
        console.error('Error syncing to MongoDB Atlas:', err.message);
      });
    }

    // 5. Sync to Google Cloud Firestore if connected
    if (syncToCloud && isFirebaseConnected && firestoreDb) {
      firestoreDb.collection('fleet_database').doc('main').set({
        data,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.error('Error syncing to Google Cloud Firestore:', err.message);
      });
    }

    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

// Function to write DB
function writeDb(data) {
  return writeDbLocal(data, true);
}

// List available server snapshots
function listAvailableBackups() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    return fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        const filepath = path.join(BACKUPS_DIR, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          sizeKb: (stats.size / 1024).toFixed(1),
          createdAt: stats.mtime.toISOString(),
          timeAgo: Math.round((Date.now() - stats.mtimeMs) / 60000)
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    return [];
  }
}

// Restore whole database safely from backup data
function restoreFromData(newDbData) {
  if (!newDbData || typeof newDbData !== 'object') {
    throw new Error('بيانات النسخة الاحتياطية غير صالحة');
  }

  // Pre-restore backup snapshot
  const current = readDb();
  saveSnapshot(current, 'pre_restore');

  const valid = {
    ...current,
    ...newDbData,
    warehouses: Array.isArray(newDbData.warehouses) ? newDbData.warehouses : current.warehouses,
    drivers: Array.isArray(newDbData.drivers) ? newDbData.drivers : current.drivers,
    vehicles: Array.isArray(newDbData.vehicles) ? newDbData.vehicles : current.vehicles,
    missions: Array.isArray(newDbData.missions) ? newDbData.missions : current.missions,
    maintenanceLogs: Array.isArray(newDbData.maintenanceLogs) ? newDbData.maintenanceLogs : current.maintenanceLogs,
    users: Array.isArray(newDbData.users) && newDbData.users.length > 0 ? newDbData.users : current.users,
    auditLogs: Array.isArray(newDbData.auditLogs) ? newDbData.auditLogs : current.auditLogs,
  };

  writeDb(valid);
  return valid;
}

// Database stats & security info
function getDatabaseStats() {
  const db = readDb();
  let fileSize = 0;
  let lastModified = new Date().toISOString();

  try {
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      fileSize = stats.size;
      lastModified = stats.mtime.toISOString();
    }
  } catch (e) {}

  const backups = listAvailableBackups();

  return {
    isCloudConnected: isMongoConnected || isFirebaseConnected,
    isFirebaseConnected,
    isMongoConnected,
    storageType: isFirebaseConnected 
      ? 'Google Cloud Firestore (سحابي معتمد من Google) 🔥' 
      : isMongoConnected 
      ? 'قاعدة بيانات سحابية متزامنة (MongoDB Atlas) ☁️' 
      : 'تخزين آمن محلي مع لقطات نسخ احتياطي دورية 💾',
    fileSizeKb: (fileSize / 1024).toFixed(1),
    lastModified,
    totalRecords: {
      missions: db.missions?.length || 0,
      drivers: db.drivers?.length || 0,
      vehicles: db.vehicles?.length || 0,
      warehouses: db.warehouses?.length || 0,
      maintenanceLogs: db.maintenanceLogs?.length || 0,
      users: db.users?.length || 0,
      auditLogs: db.auditLogs?.length || 0
    },
    backupsCount: backups.length,
    latestBackups: backups.slice(0, 5)
  };
}

// Initial Audit Trail Seeds
const initialAuditLogs = [
  {
    id: "log-seed-1",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    actionType: "auth_login",
    actionLabel: "تسجيل دخول معتمد للمنظومة",
    entity: "auth",
    entityId: "user-admin-1",
    details: "قام م/ محمد ابراهيم ابوالمعاطى بتسجيل الدخول إلى منظومة إدارة الحركة وتوزيع الأسطول",
    userId: "user-admin-1",
    userName: "م/ محمد ابراهيم ابوالمعاطى",
    userRole: "admin",
    userPhone: "01159700466",
    userDepartment: "إدارة الدعم والمتابعة - البريد المصري"
  },
  {
    id: "log-seed-2",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    actionType: "update_vehicle",
    actionLabel: "تحديث موقع شاحنة بالأسطول",
    entity: "vehicle",
    entityId: "veh-box-3",
    details: "تم تعديل موقع الشاحنة (صندوق-03) إلى جراج سوهاج وإسنادها للسائق السيد عيد",
    userId: "user-admin-1",
    userName: "م/ محمد ابراهيم ابوالمعاطى",
    userRole: "admin",
    userPhone: "01159700466",
    userDepartment: "إدارة الدعم والمتابعة - البريد المصري"
  },
  {
    id: "log-seed-3",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actionType: "create_mission",
    actionLabel: "إسناد مأمورية جديدة",
    entity: "mission",
    entityId: "ms-1",
    details: "تم إسناد مأمورية شحن مهمات بريدية رقم (مأمورية-101) إلى مخزن مصر العليا (سوهاج الكوثر) بواسطة السائق محمد رمضان والشاحنة كانتر-01",
    userId: "user-dispatch-1",
    userName: "مسؤول تشغيل وحركة",
    userRole: "dispatcher",
    userPhone: "",
    userDepartment: "جراج السيارات المركزي - شبرا"
  },
  {
    id: "log-seed-4",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    actionType: "mission_status",
    actionLabel: "تحديث حالة مأمورية إلى: على الطريق",
    entity: "mission",
    entityId: "ms-1",
    details: "تم تحريك المأمورية رقم (مأمورية-101) وانطلاق الشاحنة كانتر-01 على طريق سوهاج الصحراوي",
    userId: "user-dispatch-1",
    userName: "مسؤول تشغيل وحركة",
    userRole: "dispatcher",
    userPhone: "",
    userDepartment: "جراج السيارات المركزي - شبرا"
  }
];

// Helper to record audit activity
function recordAuditLog(db, { actionType, actionLabel, entity, entityId, details, user }) {
  if (!db.auditLogs) db.auditLogs = [];

  const entry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actionType: actionType || 'general_action',
    actionLabel: actionLabel || 'إجراء بالمنظومة',
    entity: entity || 'general',
    entityId: entityId || null,
    details: details || '',
    userId: user?.id || 'unknown',
    userName: user?.name || 'مستخدم المنظومة',
    userRole: user?.role || 'viewer',
    userPhone: user?.phone || '',
    userDepartment: user?.department || 'قطاع العمليات'
  };

  db.auditLogs.unshift(entry);

  if (db.auditLogs.length > 2000) {
    db.auditLogs = db.auditLogs.slice(0, 2000);
  }

  return entry;
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
  const leaveDriversList = db.drivers.filter(d => 
    d.status === 'إجازة' || d.status === 'اجازة' || (typeof d.status === 'string' && d.status.includes('إجازة'))
  );
  const leaveDriverIds = new Set(leaveDriversList.map(d => d.id));
  const leaveVehicleIds = new Set(leaveDriversList.map(d => d.assignedVehicleId).filter(Boolean));

  db.drivers.forEach(driver => {
    if (activeDriverMap.has(driver.id)) {
      driver.status = "في مأمورية";
      driver.activeMission = activeDriverMap.get(driver.id);
    } else if (leaveDriverIds.has(driver.id)) {
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
    } else if ((vehicle.driverId && leaveDriverIds.has(vehicle.driverId)) || leaveVehicleIds.has(vehicle.id)) {
      vehicle.status = "متاحة (سائقها بإجازة)";
      vehicle.activeMission = null;
    } else {
      if (vehicle.status === "في مأمورية" || vehicle.status.includes("إجازة")) {
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
  initialData,
  initialUsers,
  initialAuditLogs,
  recordAuditLog,
  saveSnapshot,
  listAvailableBackups,
  restoreFromData,
  getDatabaseStats
};
