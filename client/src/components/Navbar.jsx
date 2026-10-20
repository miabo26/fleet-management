import React from 'react';
import { 
  Truck, 
  Users, 
  MapPin, 
  FileText, 
  BarChart3, 
  PlusCircle, 
  ShieldCheck, 
  Wrench,
  Clock,
  Compass,
  FileSpreadsheet,
  Bell,
  PhoneCall,
  UserCheck
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
    { id: 'missions', label: 'المأموريات والتوزيع', icon: FileText, badge: stats?.activeMissions },
    { id: 'vehicles', label: 'الأسطول والسيارات', icon: Truck, count: stats?.totalVehicles, hasWarning: vehicleHasAlert },
    { id: 'drivers', label: 'السائقين', icon: Users, count: stats?.totalDrivers, hasWarning: driverHasAlert },
    { id: 'warehouses', label: 'المخازن والخريطة', icon: Compass },
    { id: 'expenses', label: 'العهد والمصاريف', icon: ShieldCheck },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: FileSpreadsheet },
    { id: 'maintenance', label: 'الصيانة الدورية', icon: Wrench },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      {/* Top Bar with Branding & Quick Dispatch */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Egypt Post Official Logo & Title */}
          <div className="flex items-center space-x-reverse space-x-4">
            <EgyptPostLogo 
              variant="light" 
              subtitle="قطاع الدعم والعمليات اللوجستية"
            />
            
            <div className="hidden md:block h-10 w-[1px] bg-slate-800"></div>

            <div>
              <div className="flex items-center space-x-reverse space-x-2.5">
                <h1 className="text-lg lg:text-xl font-black tracking-tight text-white m-0">
                  منظومة حركة السيارات والمخازن الإقليمية
                </h1>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  إدارة الحركة والتشغيل
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>المخزن الرئيسي بالتجمع</span>
                <span>•</span>
                <span>جراج شبرا</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">المخازن الإقليمية (القرشية • المنيا الجديدة • سوهاج)</span>
              </p>
            </div>
          </div>

          {/* Supervisor Card, Quick Stats & Action Button */}
          <div className="flex items-center space-x-reverse space-x-3">
            {/* Design & Supervision Credit Pill */}
            <div className="hidden xl:flex items-center gap-2.5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl shadow-inner">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-right leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">إشراف وتصميم:</span>
                  <span className="text-xs font-black text-white">م/ محمد ابراهيم ابوالمعاطى</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-300 font-medium">مدير ادارة الدعم والمتابعة</span>
                  <a 
                    href="tel:01159700466" 
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.2 rounded hover:underline"
                    title="اتصال مباشر أو واتساب"
                  >
                    <PhoneCall className="w-2.5 h-2.5" />
                    <span>01159700466</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>سيارات جاهزة: <strong className="text-emerald-400 font-bold">{stats?.availableVehicles ?? 6}</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>مأموريات نشطة: <strong className="text-amber-400 font-bold">{stats?.activeMissions ?? 0}</strong></span>
              </div>
            </div>

            {/* License Expiry Bell Notification */}
            <button
              onClick={onOpenLicenseAlerts}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                urgentAlertsCount > 0
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="جرس تنبيهات انتهاء التراخيص (رخص تسيير السيارات ورخص القيادة)"
            >
              <Bell className={`w-5 h-5 ${urgentAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-300'}`} />
              <span className="hidden sm:inline text-xs font-bold">
                تنبيهات التراخيص
              </span>
              {urgentAlertsCount > 0 ? (
                <span className="bg-rose-600 text-white font-mono text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                  {urgentAlertsCount}
                </span>
              ) : alertsData.unrecordedCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              ) : null}
            </button>

            {/* New Mission Button */}
            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs sm:text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              <span>إسناد مأمورية جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-reverse space-x-1 sm:space-x-reverse sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-black text-xs px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && !tab.badge && (
                    <span className="text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                  {tab.hasWarning && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="يوجد تنبيه ترخيص"></span>
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
