import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Truck, 
  User, 
  Calendar, 
  ExternalLink,
  ChevronLeft,
  ShieldAlert,
  Phone
} from 'lucide-react';
import { getFleetLicenseAlerts } from '../utils/licenseUtils';

export default function LicenseAlertsModal({ 
  isOpen, 
  onClose, 
  vehicles = [], 
  drivers = [],
  onNavigateToTab,
  onEditVehicle,
  onEditDriver
}) {
  const [filter, setFilter] = useState('urgent'); // 'urgent', 'all', 'vehicles', 'drivers', 'unrecorded'

  if (!isOpen) return null;

  const alertsData = getFleetLicenseAlerts(vehicles, drivers);
  const { 
    allAlerts, 
    vehicleAlerts, 
    driverAlerts, 
    expiredCount, 
    expiringSoonCount, 
    unrecordedCount, 
    validCount,
    urgentCount 
  } = alertsData;

  // Filter items
  const filteredItems = allAlerts.filter(item => {
    if (filter === 'urgent') return item.statusInfo.status === 'expired' || item.statusInfo.status === 'expiring_soon';
    if (filter === 'vehicles') return item.type === 'vehicle';
    if (filter === 'drivers') return item.type === 'driver';
    if (filter === 'unrecorded') return item.statusInfo.status === 'unrecorded';
    return true; // 'all'
  });

  const handleItemAction = (item) => {
    onClose();
    if (item.type === 'vehicle') {
      if (onNavigateToTab) onNavigateToTab('vehicles');
      if (onEditVehicle) onEditVehicle(item.rawItem);
    } else {
      if (onNavigateToTab) onNavigateToTab('drivers');
      if (onEditDriver) onEditDriver(item.rawItem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black m-0">جرس تنبيهات التراخيص (رخص السيارات والسائقين)</h3>
                {urgentCount > 0 ? (
                  <span className="bg-rose-500 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    {urgentCount} تنبيه عاجل
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                    جميع الرخص سارية
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نظام الإنذار المبكر لانتهاء رخص التسيير للشاحنات ورخص قيادة السائقين قبل موعدها بـ 30 يوماً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-5 bg-slate-50 border-b border-slate-200">
          
          <button
            onClick={() => setFilter('urgent')}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
              filter === 'urgent'
                ? 'bg-rose-50 border-rose-300 shadow-sm ring-2 ring-rose-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">منتهية فوراً</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-1">
              {expiredCount}
            </div>
            <span className="text-[10px] text-rose-600">تتطلب تجديد فوري</span>
          </button>

          <button
            onClick={() => setFilter('urgent')}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
              filter === 'urgent' && expiringSoonCount > 0
                ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">تنتهي خلال 30 يوم</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-700 mt-1">
              {expiringSoonCount}
            </div>
            <span className="text-[10px] text-amber-600">مهلة التجديد الاستباقي</span>
          </button>

          <button
            onClick={() => setFilter('unrecorded')}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
              filter === 'unrecorded'
                ? 'bg-slate-200 border-slate-400 shadow-sm ring-2 ring-slate-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">غير مسجل تاريخ</span>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-700 mt-1">
              {unrecordedCount}
            </div>
            <span className="text-[10px] text-slate-500">بحاجة لإدخال التاريخ</span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-50 border-emerald-300 shadow-sm ring-2 ring-emerald-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">سارية وصالحة</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {validCount}
            </div>
            <span className="text-[10px] text-emerald-600">أكثر من شهر صلاحية</span>
          </button>

        </div>

        {/* Filter Navigation */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'urgent'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>التنبيهات العاجلة ({urgentCount})</span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>جميع السجلات ({allAlerts.length})</span>
            </button>

            <button
              onClick={() => setFilter('vehicles')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'vehicles'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>رخص تسيير السيارات ({vehicleAlerts.length})</span>
            </button>

            <button
              onClick={() => setFilter('drivers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filter === 'drivers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>رخص قيادة السائقين ({driverAlerts.length})</span>
            </button>

            <button
              onClick={() => setFilter('unrecorded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'unrecorded'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>غير مسجلة ({unrecordedCount})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            عرض {filteredItems.length} سجل
          </span>
        </div>

        {/* Alerts List */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-base font-bold text-slate-800 m-0">لا توجد تنبيهات لهذه الفئة حالياً</h4>
              <p className="text-xs text-slate-500 mt-1">
                {filter === 'urgent'
                  ? 'رائع! لا توجد رخص تسيير أو قيادة منتهية أو أوشكت على الانتهاء خلال 30 يوماً.'
                  : 'لا توجد بيانات مطابقة لخيارات الفلترة المحددة.'}
              </p>
            </div>
          ) : (
            filteredItems.map(item => {
              const isVehicle = item.type === 'vehicle';
              const isExpired = item.statusInfo.status === 'expired';
              const isExpiringSoon = item.statusInfo.status === 'expiring_soon';
              const isUnrecorded = item.statusInfo.status === 'unrecorded';

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isExpired 
                      ? 'bg-rose-50/80 border-rose-200' 
                      : isExpiringSoon 
                      ? 'bg-amber-50/70 border-amber-200' 
                      : isUnrecorded
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isVehicle ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {isVehicle ? <Truck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusInfo.badgeClass}`}>
                          {item.statusInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {isVehicle ? 'رخصة تسيير سيارة' : 'رخصة قيادة سائق'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span>{item.subtitle}</span>
                        <span>•</span>
                        <span className="font-mono">{item.identifier}</span>
                        {item.licenseExpiry && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              تاريخ الانتهاء: {item.licenseExpiry}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleItemAction(item)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isExpired
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                          : isExpiringSoon
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>{isVehicle ? 'تعديل رخصة السيارة' : 'تعديل رخصة السائق'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Advice */}
        <div className="bg-slate-900 p-4 px-6 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>تعليمات إدارة الحركة:</strong> يرجى بدء إجراءات التجديد والفحص الفني قبل 30 يوماً من انتهاء الرخصة لتفادي سحب اللوحات أو الغرامات على بوابات الطرق السريعة.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-xs shrink-0"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
}
