import React, { useState } from 'react';
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
  Award, 
  LogOut, 
  UserCheck, 
  Sun, 
  Moon, 
  History,
  Menu,
  X,
  Phone,
  ChevronLeft,
  Sparkles
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
  onOpenLicenseAlerts,
  currentUser,
  onLogout,
  usersCount = 0,
  auditLogsCount = 0,
  theme = 'light',
  onToggleTheme
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Audit Logs Tab for Supervisors & Admins
  if (currentUser?.role === 'admin' || currentUser?.role === 'dispatcher') {
    tabs.push({
      id: 'audit-logs',
      label: 'سجل العمليات والرقابة',
      icon: History,
      count: auditLogsCount
    });
  }

  // Admin exclusive tab for users & permissions management
  if (currentUser?.role === 'admin') {
    tabs.push({
      id: 'users',
      label: 'المستخدمين والصلاحيات',
      icon: ShieldCheck,
      count: usersCount
    });
  }

  const canCreateMission = currentUser?.role === 'admin' || currentUser?.role === 'dispatcher';

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
        {/* Top Bar: Adaptive & Mobile Optimized */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Right: Egypt Post Official Logo & System Title */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <EgyptPostLogo 
                className="h-7 sm:h-8 lg:h-9" 
                variant="light" 
              />
              
              <div className="hidden sm:block h-6 sm:h-7 w-[1px] bg-slate-800 mx-1"></div>

              <div>
                <h1 className="text-xs sm:text-sm lg:text-base font-black text-white m-0 tracking-tight leading-tight line-clamp-1">
                  <span className="sm:hidden">أسطول البريد المصري</span>
                  <span className="hidden sm:inline">منظومة حركة وتوزيع أسطول النقل والمخازن</span>
                </h1>
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold block leading-none mt-0.5">
                  الهيئة القومية للبريد المصري
                </span>
              </div>
            </div>

            {/* Center: Supervision Signature (Desktop only) */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300 font-bold">إشراف:</span>
              <span className="font-bold text-white">م/ محمد ابراهيم ابوالمعاطى</span>
              <span className="text-slate-400 text-[11px]">| مدير ادارة الدعم والمتابعة</span>
            </div>

            {/* Left: Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Theme Toggle Button: Day / Night */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-amber-300 hover:text-amber-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title={theme === 'dark' ? 'التحويل إلى الوضع النهاري ☀️' : 'التحويل إلى الوضع الليلي 🌙'}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span className="hidden md:inline text-amber-300">النهاري</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-300" />
                      <span className="hidden md:inline text-slate-200">الليلي</span>
                    </>
                  )}
                </button>
              )}

              {/* License Expiry Bell Notification */}
              <button
                onClick={onOpenLicenseAlerts}
                className={`relative p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
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

              {/* New Mission Button (Only for authorized roles) */}
              {canCreateMission && (
                <button
                  onClick={onOpenNewMission}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-bold p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  title="إسناد مأمورية جديدة"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">مأمورية جديدة</span>
                </button>
              )}

              {/* Current Logged-in User Pill (Desktop) */}
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.role === 'admin' ? '👑' : '👤'}
                  </div>
                  <div className="hidden lg:block text-right leading-tight">
                    <span className="font-bold text-white block text-[11px] truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {currentUser.role === 'admin' ? 'مدير عام' : currentUser.roleLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                    title="تسجيل الخروج من المنظومة"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="القائمة الرئيسية"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-rose-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

            </div>

          </div>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <div className="hidden md:block bg-slate-900/90 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-reverse space-x-1 overflow-x-auto py-1.5 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
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

      {/* Mobile Full Navigation Drawer / Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          
          {/* Drawer Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EgyptPostLogo className="h-7" variant="light" />
              <div>
                <h3 className="text-sm font-black text-white m-0">قائمة المنظومة</h3>
                <span className="text-[10px] text-emerald-400">الهيئة القومية للبريد المصري</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* User Profile Card */}
            {currentUser && (
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                    {currentUser.role === 'admin' ? '👑' : '👤'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm m-0">{currentUser.name}</h4>
                    <span className="text-xs text-emerald-400 font-semibold">{currentUser.roleLabel || currentUser.role}</span>
                    {currentUser.phone && (
                      <span className="block text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.phone}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            )}

            {/* Supervision Card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                <span>إشراف وتصميم:</span>
              </div>
              <div className="text-white font-black text-sm">م/ محمد ابراهيم ابوالمعاطى</div>
              <div className="text-slate-400 text-[11px]">مدير ادارة الدعم والمتابعة — البريد المصري</div>
              <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] pt-1" dir="ltr">
                <Phone className="w-3 h-3" />
                <span>01159700466</span>
              </div>
            </div>

            {/* Navigation Tabs List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 px-2 block mb-1">
                أقسام وشاشات المنظومة:
              </span>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
                          {tab.badge} جارية
                        </span>
                      )}
                      {tab.count !== undefined && !tab.badge && (
                        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                          {tab.count}
                        </span>
                      )}
                      {tab.hasWarning && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                      <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Action: New Mission in Mobile Drawer */}
            {canCreateMission && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewMission();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 text-sm cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>إسناد مأمورية جديدة فوراً</span>
              </button>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="bg-slate-900 border-t border-slate-800 p-3.5 flex items-center justify-between text-xs text-slate-400">
            <span>منظومة إدارة الحركة والأسطول © 2026</span>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
                <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Persistent at bottom for fast thumb reach) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl"
        aria-label="شريط التنقل السريع للهاتف"
      >
        <button
          onClick={() => handleTabSelect('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">المؤشرات</span>
        </button>

        <button
          onClick={() => handleTabSelect('missions')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'missions' ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">المأموريات</span>
          {stats?.activeMissions > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => handleTabSelect('vehicles')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'vehicles' ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">الأسطول</span>
          {vehicleHasAlert && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => handleTabSelect('drivers')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'drivers' ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">السائقين</span>
          {driverHasAlert && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isMobileMenuOpen ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">المزيد ☰</span>
        </button>
      </nav>
    </>
  );
}
