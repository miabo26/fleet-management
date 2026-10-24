import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MissionsList from './components/MissionsList';
import VehiclesManagement from './components/VehiclesManagement';
import DriversManagement from './components/DriversManagement';
import WarehousesMap from './components/WarehousesMap';
import ExpensesTracker from './components/ExpensesTracker';
import ReportsCenter from './components/ReportsCenter';
import MaintenanceLogs from './components/MaintenanceLogs';
import UsersManagement from './components/UsersManagement';
import AuditLogs from './components/AuditLogs';
import DriverPortal from './components/DriverPortal';
import LoginScreen from './components/LoginScreen';
import NewMissionModal from './components/NewMissionModal';
import MissionDetailsModal from './components/MissionDetailsModal';
import PrintableTripSheet from './components/PrintableTripSheet';
import LicenseAlertsModal from './components/LicenseAlertsModal';
import EgyptPostLogo from './components/EgyptPostLogo';

import { 
  fetchFullData, 
  createMission, 
  updateMission, 
  deleteMission,
  addDriver,
  updateDriver,
  deleteDriver,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  updateWarehouse,
  addMaintenanceLog,
  resetDatabase,
  getStoredUser,
  setStoredUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  fetchDriverPortalMe,
  driverLogin,
  createUser,
  updateUser,
  deleteUser
} from './services/api';

import { Loader2, RefreshCw, Phone, MessageCircle, ShieldCheck, Award } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authChecking, setAuthChecking] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('fleet_theme') || 'light');

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fleet_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [data, setData] = useState({
    drivers: [],
    vehicles: [],
    warehouses: [],
    missions: [],
    maintenanceLogs: [],
    users: [],
    auditLogs: [],
    stats: null
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [isLicenseAlertsOpen, setIsLicenseAlertsOpen] = useState(false);
  const [selectedMissionDetails, setSelectedMissionDetails] = useState(null);
  const [selectedMissionToPrint, setSelectedMissionToPrint] = useState(null);

  // Load data from backend
  const loadData = async () => {
    try {
      const res = await fetchFullData();
      setData(res);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Verify auth session on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check URL parameters for direct driver link with PIN (?driver=drv-1&pin=1234)
        const urlParams = new URLSearchParams(window.location.search);
        const urlDriverId = urlParams.get('driver');
        const urlDriverPhone = urlParams.get('phone');
        const urlDriverPin = urlParams.get('pin');
        if (urlDriverPin && (urlDriverId || urlDriverPhone)) {
          try {
            const driverRes = await driverLogin(urlDriverId || null, urlDriverPhone || null, urlDriverPin);
            if (driverRes && driverRes.driver) {
              handleDriverLogin(driverRes);
              window.history.replaceState({}, document.title, window.location.pathname);
              setAuthChecking(false);
              return;
            }
          } catch (paramErr) {
            console.error('URL Driver login failed:', paramErr);
          }
        }

        // 2. Check stored session
        const stored = getStoredUser();
        if (stored) {
          // If stored user is a driver, refresh their portal data and keep them logged in permanently!
          if (stored.role === 'driver') {
            try {
              const driverPortal = await fetchDriverPortalMe(stored.id);
              if (driverPortal && driverPortal.driver) {
                const refreshedDriver = {
                  id: driverPortal.driver.id,
                  name: driverPortal.driver.name,
                  role: 'driver',
                  roleLabel: 'سائق بالأسطول',
                  phone: driverPortal.driver.phone,
                  driverData: driverPortal
                };
                setStoredUser(refreshedDriver);
                setCurrentUser(refreshedDriver);
                setAuthChecking(false);
                return;
              }
            } catch (dErr) {
              console.warn('Driver portal refresh failed, using cached session:', dErr);
              setCurrentUser(stored);
              setAuthChecking(false);
              return;
            }
          }

          // Otherwise staff / admin user
          const verified = await fetchCurrentUser();
          if (verified) {
            setCurrentUser(verified);
            await loadData();
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  // Auth Handlers
  const handleLogin = async (credentials) => {
    const res = await loginUser(credentials);
    setCurrentUser(res.user);
    await loadData();
  };

  const handleDriverLogin = (driverRes) => {
    const driverUser = {
      id: driverRes.driver.id,
      name: driverRes.driver.name,
      role: 'driver',
      roleLabel: 'سائق بالأسطول',
      phone: driverRes.driver.phone,
      driverData: driverRes
    };
    localStorage.setItem('fleet_auth_user', JSON.stringify(driverUser));
    setCurrentUser(driverUser);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('fleet_driver_token');
      localStorage.removeItem('fleet_driver_id');
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  // Handlers for Users (Admin only)
  const handleAddUser = async (userData) => {
    try {
      const res = await createUser(userData);
      await loadData();
      return res;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleUpdateUser = async (id, updatedData) => {
    try {
      const res = await updateUser(id, updatedData);
      await loadData();
      return res;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      await loadData();
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  // Handlers for Missions
  const handleCreateMission = async (missionData) => {
    try {
      await createMission(missionData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateMission = async (id, updatedData) => {
    try {
      await updateMission(id, updatedData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMission = async (id) => {
    try {
      await deleteMission(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await updateMission(id, { status: newStatus });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Drivers
  const handleAddDriver = async (driverData) => {
    try {
      await addDriver(driverData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateDriver = async (id, updatedData) => {
    try {
      await updateDriver(id, updatedData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDriver = async (id) => {
    try {
      await deleteDriver(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Vehicles
  const handleAddVehicle = async (vehicleData) => {
    try {
      await addVehicle(vehicleData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateVehicle = async (id, updatedData) => {
    try {
      await updateVehicle(id, updatedData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await deleteVehicle(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Warehouse Update Handler (Manager & Phone)
  const handleUpdateWarehouse = async (id, updatedData) => {
    try {
      await updateWarehouse(id, updatedData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Maintenance Log Handler
  const handleAddMaintenanceLog = async (logData) => {
    try {
      await addMaintenanceLog(logData);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Auth checking spinner screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white" dir="rtl">
        <EgyptPostLogo variant="light" className="h-12 w-auto mb-6 animate-pulse" />
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <h3 className="text-base font-bold text-slate-200">التحقق من جلسة الدخول المعتمدة...</h3>
        <p className="text-xs text-slate-400 mt-1">الهيئة القومية للبريد المصري • قطاع النقل والمخازن</p>
      </div>
    );
  }

  // Gatekeeper: Protected Link — Unauthenticated users must log in
  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLogin}
        onDriverLoginSuccess={handleDriverLogin}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // If logged in as driver, display the dedicated Driver Smart Portal
  if (currentUser.role === 'driver') {
    return (
      <DriverPortal
        driverData={currentUser.driverData}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white" dir="rtl">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <h3 className="text-lg font-black font-sans">جاري تحميل بيانات أسطول النقل والمأموريات...</h3>
        <p className="text-xs text-slate-400 mt-1">المخزن الرئيسي بالتجمع • جراج شبرا • المخازن الإقليمية</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white transition-colors duration-200" dir="rtl">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMission={() => setIsNewMissionOpen(true)}
        stats={data.stats}
        vehicles={data.vehicles}
        drivers={data.drivers}
        onOpenLicenseAlerts={() => setIsLicenseAlertsOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        usersCount={data.users?.length || 0}
        auditLogsCount={data.auditLogs?.length || 0}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            onOpenNewMission={() => setIsNewMissionOpen(true)}
            onViewMission={(m) => setSelectedMissionDetails(m)}
            onPrintMission={(m) => setSelectedMissionToPrint(m)}
            onQuickStatusChange={handleQuickStatusChange}
            onUpdateDriver={handleUpdateDriver}
            setActiveTab={setActiveTab}
            onOpenLicenseAlerts={() => setIsLicenseAlertsOpen(true)}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsList
            missions={data.missions}
            onOpenNewMission={() => setIsNewMissionOpen(true)}
            onViewMission={(m) => setSelectedMissionDetails(m)}
            onPrintMission={(m) => setSelectedMissionToPrint(m)}
            onDeleteMission={handleDeleteMission}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesManagement
            vehicles={data.vehicles}
            drivers={data.drivers}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversManagement
            drivers={data.drivers}
            vehicles={data.vehicles}
            onAddDriver={handleAddDriver}
            onUpdateDriver={handleUpdateDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {activeTab === 'warehouses' && (
          <WarehousesMap
            warehouses={data.warehouses}
            missions={data.missions}
            onUpdateWarehouse={handleUpdateWarehouse}
            onOpenNewMissionWithDest={(destId) => {
              setIsNewMissionOpen(true);
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTracker
            missions={data.missions}
            drivers={data.drivers}
            stats={data.stats}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsCenter
            missions={data.missions}
            drivers={data.drivers}
            vehicles={data.vehicles}
            warehouses={data.warehouses}
            onViewMission={(m) => setSelectedMissionDetails(m)}
            onPrintMission={(m) => setSelectedMissionToPrint(m)}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceLogs
            maintenanceLogs={data.maintenanceLogs}
            vehicles={data.vehicles}
            onAddLog={handleAddMaintenanceLog}
          />
        )}

        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <UsersManagement
            users={data.users || []}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'audit-logs' && currentUser?.role === 'admin' && (
          <AuditLogs
            auditLogs={data.auditLogs || []}
            currentUser={currentUser}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Sleek, Clean, Official Footer */}
      <footer className="no-print bg-slate-900 text-white border-t border-slate-800 py-6 mb-16 md:mb-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            
            {/* Right: Egypt Post Logo & System */}
            <div className="flex items-center gap-3">
              <EgyptPostLogo 
                variant="light"
                className="h-7"
              />
              <span className="text-slate-400 font-medium">
                منظومة إدارة أسطول النقل والمخازن الإقليمية
              </span>
            </div>

            {/* Center: Supervision Credit */}
            <div className="flex items-center gap-2 text-slate-300 flex-wrap justify-center">
              <span className="text-amber-400 font-bold">إشراف وتصميم:</span>
              <strong className="text-white">م/ محمد ابراهيم ابوالمعاطى</strong>
              <span className="text-slate-400">— مدير ادارة الدعم والمتابعة</span>
              <a 
                href="https://wa.me/201159700466"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-mono font-bold mr-1 hover:underline flex items-center gap-1"
                dir="ltr"
              >
                01159700466
              </a>
            </div>

          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewMissionModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onSubmit={handleCreateMission}
        drivers={data.drivers}
        vehicles={data.vehicles}
        warehouses={data.warehouses}
        missions={data.missions}
      />

      <MissionDetailsModal
        mission={selectedMissionDetails}
        isOpen={Boolean(selectedMissionDetails)}
        onClose={() => setSelectedMissionDetails(null)}
        onUpdate={handleUpdateMission}
        onPrint={(m) => {
          setSelectedMissionDetails(null);
          setSelectedMissionToPrint(m);
        }}
      />

      <PrintableTripSheet
        mission={selectedMissionToPrint}
        drivers={data.drivers}
        vehicles={data.vehicles}
        warehouses={data.warehouses}
        onClose={() => setSelectedMissionToPrint(null)}
      />

      <LicenseAlertsModal
        isOpen={isLicenseAlertsOpen}
        onClose={() => setIsLicenseAlertsOpen(false)}
        vehicles={data.vehicles}
        drivers={data.drivers}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsLicenseAlertsOpen(false);
        }}
      />

    </div>
  );
}
