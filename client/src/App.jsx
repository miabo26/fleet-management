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

      {/* Official Egypt Post Footer & Executive Design Credits */}
      <footer className="no-print bg-slate-900 text-white border-t border-slate-800 pt-10 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-800">
            {/* Column 1: Egypt Post Logo & System Identity */}
            <div className="space-y-3 text-right">
              <EgyptPostLogo 
                variant="light"
                className="justify-start"
                subtitle="الهيئة القومية للبريد المصري"
              />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                المنظومة الرقمية المركزية لإدارة أسطول حركة وتوزيع سيارات النقل والمخازن الإقليمية وربط العمليات اللوجستية بين المركز الرئيسي والمحافظات.
              </p>
            </div>

            {/* Column 2: Executive Credits & Supervision (User's Exact Specification) */}
            <div className="bg-gradient-to-br from-emerald-950/80 via-slate-850 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-emerald-950/30 text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded-md bg-amber-400/20 text-amber-400">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  حقوق التصميم والإشراف الفني
                </span>
              </div>
              <h3 className="text-base font-black text-white m-0 tracking-tight flex items-center gap-2">
                <span>م/ محمد ابراهيم ابوالمعاطى</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  مهندس المنظومة
                </span>
              </h3>
              <p className="text-xs text-emerald-300 font-semibold mt-1">
                مدير ادارة الدعم والمتابعة
              </p>
              
              {/* Phone & WhatsApp Quick Connect */}
              <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-emerald-500/20 flex-wrap">
                <a
                  href="tel:01159700466"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>01159700466</span>
                </a>
                <a
                  href="https://wa.me/201159700466"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>محادثة واتساب</span>
                </a>
              </div>
            </div>

            {/* Column 3: Logistics Hubs & Data Operations */}
            <div className="space-y-3 text-right">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                المواقع اللوجستية المتصلة بالمنظومة
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>المخزن الرئيسي - مبنى المخازن بالتجمع الخامس</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>جراج السيارات المركزي - شبرا</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>المخازن الإقليمية: الغربية (القرشية) • المنيا الجديدة • سوهاج (الكوثر)</span>
                </li>
              </ul>
              
              <div className="pt-2">
                <button
                  onClick={async () => {
                    if (window.confirm('هل تريد استعادة البيانات الافتراضية للأسطول؟')) {
                      await resetDatabase();
                      await loadData();
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط البيانات الافتراضية</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p className="m-0">
              جميع الحقوق الفكرية والتنظيمية محفوظة © 2026 — الهيئة القومية للبريد المصري
            </p>
            <p className="m-0 font-medium text-slate-400">
              إشراف وتطوير: <strong className="text-slate-300">م/ محمد ابراهيم ابوالمعاطى</strong> — مدير ادارة الدعم والمتابعة
            </p>
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
