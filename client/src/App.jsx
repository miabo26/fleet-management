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
  resetDatabase
} from './services/api';

import { Loader2, RefreshCw, Phone, MessageCircle, ShieldCheck, Award } from 'lucide-react';

export default function App() {
  const [data, setData] = useState({
    drivers: [],
    vehicles: [],
    warehouses: [],
    missions: [],
    maintenanceLogs: [],
    stats: null
  });

  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-black font-sans">جاري تحميل بيانات أسطول النقل والمأموريات...</h3>
        <p className="text-xs text-slate-400 mt-1">المخزن الرئيسي بالتجمع • جراج شبرا • المخازن الإقليمية</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMission={() => setIsNewMissionOpen(true)}
        stats={data.stats}
        vehicles={data.vehicles}
        drivers={data.drivers}
        onOpenLicenseAlerts={() => setIsLicenseAlertsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            onOpenNewMission={() => setIsNewMissionOpen(true)}
            onViewMission={(m) => setSelectedMissionDetails(m)}
            onPrintMission={(m) => setSelectedMissionToPrint(m)}
            onQuickStatusChange={handleQuickStatusChange}
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
      </main>

      {/* Sleek, Clean, Official Footer */}
      <footer className="no-print bg-slate-900 text-white border-t border-slate-800 py-6 mt-auto">
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

            {/* Left: Reset Database */}
            <div>
              <button
                onClick={async () => {
                  if (window.confirm('هل تريد استعادة البيانات الافتراضية للأسطول؟')) {
                    await resetDatabase();
                    await loadData();
                  }
                }}
                className="text-slate-500 hover:text-slate-400 cursor-pointer flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة ضبط البيانات</span>
              </button>
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
