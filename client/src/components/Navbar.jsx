import React from 'react';
import { 
  Truck, 
  Users, 
  FileText, 
  BarChart3, 
  PlusCircle, 
  ShieldCheck, 
  Wrench,
  Compass,
  FileSpreadsheet,
  Bell,
  Award
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';
import { getFleetLicenseAlerts } from '../utils/licenseUtils';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenNewMission, 
  stats,
  vehicles = [],
  drivers = [],
  onOpenLicenseAlerts
}) {
  const alertsData = getFleetLicenseAlerts(vehicles, drivers);
  const urgentAlertsCount = alertsData.urgentCount;

  const vehicleHasAlert = alertsData.vehicleAlerts.some(v => v.statusInfo.status === 'expired' || v.statusInfo.status === 'expiring_soon');
  const driverHasAlert = alertsData.driverAlerts.some(d => d.statusInfo.status === 'expired' || d.statusInfo.status === 'expiring_soon');

  const tabs = [
    { id: 'dashboard', label: 'لوحة المؤشرات', icon: BarChart3 },
    { id: 'missions', label: 'المأموريات', icon: FileText, badge: stats?.activeMissions },
    { id: 'vehicles', label: 'الأسطول', icon: Truck, count: stats?.totalVehicles, hasWarning: vehicleHasAlert },
    { id: 'drivers', label: 'السائقين', icon: Users, count: stats?.totalDrivers, hasWarning: driverHasAlert },
    { id: 'warehouses', label: 'المخازن والخريطة', icon: Compass },
    { id: 'expenses', label: 'العهد والمصاريف', icon: ShieldCheck },
    { id: 'reports', label: 'التقارير', icon: FileSpreadsheet },
    { id: 'maintenance', label: 'الصيانة', icon: Wrench },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Bar: Clean & Uncrowded */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Right: Egypt Post Official Logo & System Title */}
          <div className="flex items-center gap-3">
            <EgyptPostLogo 
              className="h-8 lg:h-9" 
              variant="light" 
            />
            
            <div className="hidden sm:block h-7 w-[1px] bg-slate-800 mx-1"></div>

            <div>
              <h1 className="text-sm lg:text-base font-black text-white m-0 tracking-tight leading-tight">
                منظومة حركة وتوزيع أسطول النقل والمخازن
              </h1>
              <span className="text-[11px] text-emerald-400 font-semibold block leading-none mt-0.5">
                الهيئة القومية للبريد المصري
              </span>
            </div>
          </div>

          {/* Center: Elegant & Compact Supervision Credit */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-bold">إشراف:</span>
            <span className="font-bold text-white">م/ محمد ابراهيم ابوالمعاطى</span>
            <span className="text-slate-400 text-[11px]">| مدير ادارة الدعم والمتابعة</span>
          </div>

          {/* Left: Quick Actions (Bell + New Mission Button) */}
          <div className="flex items-center gap-2.5">
            {/* License Expiry Bell Notification */}
            <button
              onClick={onOpenLicenseAlerts}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                urgentAlertsCount > 0
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="تنبيهات انتهاء التراخيص"
            >
              <Bell className={`w-4 h-4 ${urgentAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-300'}`} />
              <span className="hidden md:inline">التراخيص</span>
              {urgentAlertsCount > 0 && (
                <span className="bg-rose-600 text-white font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {urgentAlertsCount}
                </span>
              )}
            </button>

            {/* New Mission Button */}
            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>مأمورية جديدة</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs Bar: Compact & Full Visibility without cutting off */}
      <div className="bg-slate-900/90 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-reverse space-x-1 overflow-x-auto py-1.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tab.count}
                    </span>
                  )}
                  {tab.hasWarning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
