import React from 'react';
import { 
  Truck, 
  Users, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowUpRight, 
  Fuel, 
  AlertCircle,
  Plus,
  Printer,
  ChevronLeft,
  Calendar,
  FileSpreadsheet,
  Bell,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { getFleetLicenseAlerts } from '../utils/licenseUtils';

export default function Dashboard({ 
  data, 
  onOpenNewMission, 
  onViewMission, 
  onPrintMission, 
  onQuickStatusChange,
  setActiveTab,
  onOpenLicenseAlerts
}) {
  const { stats, missions = [], vehicles = [], drivers = [], warehouses = [] } = data;
  const licenseAlerts = getFleetLicenseAlerts(vehicles, drivers);

  const activeMissions = missions.filter(m => ['assigned', 'loading', 'on_road'].includes(m.status));
  const completedMissions = missions.filter(m => m.status === 'completed');

  // Breakdown of vehicles
  const boxVehicles = vehicles.filter(v => v.type.includes('صندوق'));
  const canterVehicles = vehicles.filter(v => v.type.includes('كانتر'));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on_road':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-200"><span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>على الطريق</span>;
      case 'loading':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-200"><Clock className="w-3 h-3 animate-spin" />جارٍ التحميل</span>;
      case 'assigned':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-200">تم التكليف</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200"><CheckCircle2 className="w-3 h-3" />تم التسليم بالموقع</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">مكتملة ومغلقة</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">مسودة</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              النظام اللوجستي يعمل بكفاءة تامة
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
              برنامج حركة السيارات والمخازن الإقليمية
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              إدارة حركة <strong>{vehicles.length} سيارات</strong> (3 نقل صندوق + 3 كانتر شاسيه طويل) و <strong>{drivers.length} سائقين</strong> مع الربط بين المخزن الرئيسي بالتجمع وجراج شبرا والمخازن الإقليمية الثلاثة (الغربية، المنيا الجديدة، سوهاج الكوثر).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewMission}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>إسناد مأمورية سريعة</span>
            </button>
            <button
              onClick={() => setActiveTab('warehouses')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>خريطة المخازن والمسارات</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-3 rounded-xl backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>التقارير والإحصائيات</span>
            </button>
          </div>
        </div>
      </div>

      {/* License Expiry Urgent Alert Banner */}
      {licenseAlerts.urgentCount > 0 ? (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 animate-bounce">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-rose-950 m-0">
                  تنبيه عاجل لإدارة الحركة: يوجد {licenseAlerts.urgentCount} رخص بحاجة للتجديد والمتابعة
                </h4>
                {licenseAlerts.expiredCount > 0 && (
                  <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {licenseAlerts.expiredCount} منتهية فوراً
                  </span>
                )}
                {licenseAlerts.expiringSoonCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {licenseAlerts.expiringSoonCount} تنتهي خلال 30 يوماً
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-800/80 mt-1 m-0">
                تفادي مخالفات الطرق السريعة وسحب اللوحات من خلال استخراج وتجديد رخص الشاحنات والسائقين قبل انتهاء المهلة.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLicenseAlerts}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer shrink-0"
          >
            <span>فتح مركز تنبيهات التراخيص</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : licenseAlerts.unrecordedCount > 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>ملاحظة التراخيص:</strong> يوجد <strong>{licenseAlerts.unrecordedCount}</strong> سجلات لشاحنات أو سائقين لم يتم تسجيل تاريخ انتهاء رخصتها بعد.
            </span>
          </div>
          <button
            onClick={onOpenLicenseAlerts}
            className="text-blue-600 font-bold hover:underline cursor-pointer text-xs flex items-center gap-1 shrink-0"
          >
            <span>استعراض وتحديث التواريخ</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Vehicles KPI */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الأسطول والسيارات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">{stats?.totalVehicles ?? vehicles.length}</span>
              <span className="text-xs text-slate-500 mr-1.5">شاحنة إجمالية</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {stats?.availableVehicles ?? 0} متاحة
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>📦 3 سيارات صندوق</span>
            <span>🚛 3 كانتر شاسيه طويل</span>
          </div>
        </div>

        {/* Drivers KPI */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">طاقم السائقين</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">{stats?.totalDrivers ?? drivers.length}</span>
              <span className="text-xs text-slate-500 mr-1.5">سائقين معتمدين</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {stats?.onMissionDrivers ?? 0} في الطريق
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>جاهزون للانطلاق: <strong className="text-emerald-600">{stats?.availableDrivers ?? 0}</strong></span>
            <button 
              onClick={() => setActiveTab('drivers')}
              className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
            >
              عرض الطاقم
            </button>
          </div>
        </div>

        {/* Active Missions KPI */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المأموريات النشطة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">{activeMissions.length}</span>
              <span className="text-xs text-slate-500 mr-1.5">مأمورية جارية</span>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              متابعة حية
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>مكتملة هذا الشهر: <strong>{stats?.completedMissions ?? 0}</strong></span>
            <button 
              onClick={() => setActiveTab('missions')}
              className="text-amber-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
            >
              عرض الكل
            </button>
          </div>
        </div>

        {/* Hubs & Warehouses KPI */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">شبكة المخازن</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900">5</span>
              <span className="text-xs text-slate-500 mr-1.5">مواقع ومحطات</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              3 إقليمية + 2 رئيسية
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>الغربية • المنيا • سوهاج</span>
            <span>التجمع • شبرا</span>
          </div>
        </div>

      </div>

      {/* Active Missions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-lg font-black text-slate-900 m-0">المأموريات النشطة حالياً على الطريق والمخازن</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              متابعة حية لحالة التحميل، مسار الطريق، والتسليم اللوجستي للمخازن
            </p>
          </div>
          <button
            onClick={() => setActiveTab('missions')}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
          >
            <span>عرض كل المأموريات والأرشيف</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {activeMissions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h4 className="text-base font-bold text-slate-800">لا توجد مأموريات نشطة حالياً</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              جميع السيارات متوقفة بالجراج أو المخزن الرئيسي وجاهزة لتكليف مهام جديدة
            </p>
            <button
              onClick={onOpenNewMission}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              إسناد مأمورية الآن
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeMissions.map((mission) => (
              <div key={mission.id} className="p-5 md:p-6 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Mission Summary */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-md">
                        {mission.missionNumber}
                      </span>
                      {getStatusBadge(mission.status)}
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        {mission.vehicleType}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                        mission.occupancyDays === 3 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : mission.occupancyDays === 2 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {mission.occupancyDays === 3 ? '🟣 إشغال 3 أيام (ذهاب + راحة + عودة)' : mission.occupancyDays === 2 ? '🟡 إشغال يومين (ذهاب وعودة الغد)' : '🟢 إشغال نفس اليوم'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {mission.dispatchOrderNumber}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 m-0">
                      {mission.title}
                    </h4>

                    {/* Route Line & Expected Return */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {mission.originName}
                      </span>
                      <span className="text-slate-400 font-bold">←</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {mission.destinationName}
                      </span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span className="text-slate-600">
                        المسافة: <strong>{mission.distanceKm || '---'} كم</strong>
                      </span>
                      <span className="text-slate-400 mx-1">|</span>
                      <span className="text-blue-800 font-bold">
                        العودة المتوقعة: {mission.expectedReturnDate ? new Date(mission.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                      </span>
                    </div>

                    {/* Crew & Truck Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>السائق: <strong className="text-slate-900">{mission.driverName}</strong></span>
                        <a href={`tel:${mission.driverPhone}`} className="text-blue-600 hover:underline">({mission.driverPhone})</a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        <span>السيارة: <strong className="text-slate-900">{mission.vehicleCode}</strong> ({mission.vehiclePlate})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-500" />
                        <span>العهدة: <strong>{mission.cashAdvance} ج.م</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Action Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    {/* Status Changer Shortcuts */}
                    {mission.status === 'assigned' && (
                      <button
                        onClick={() => onQuickStatusChange(mission.id, 'loading')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>بدء التحميل بالمخزن</span>
                      </button>
                    )}

                    {mission.status === 'loading' && (
                      <button
                        onClick={() => onQuickStatusChange(mission.id, 'on_road')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>الانطلاق على الطريق</span>
                      </button>
                    )}

                    {mission.status === 'on_road' && (
                      <button
                        onClick={() => onQuickStatusChange(mission.id, 'delivered')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد التسليم بالمخزن</span>
                      </button>
                    )}

                    {mission.status === 'delivered' && (
                      <button
                        onClick={() => onQuickStatusChange(mission.id, 'completed')}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>إغلاق وتسوية المأمورية</span>
                      </button>
                    )}

                    {/* View Details Modal */}
                    <button
                      onClick={() => onViewMission(mission)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <span>التفاصيل والتسوية</span>
                    </button>

                    {/* Print Slip */}
                    <button
                      onClick={() => onPrintMission(mission)}
                      title="طباعة إذن تشغيل المأمورية"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Readiness Matrix: 3 Box + 3 Canter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box Trucks Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                📦
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">سيارات نقل صندوق ({boxVehicles.length} شاحنات)</h3>
                <p className="text-xs text-slate-500">مخصصة للبضائع العامة والطرود والتوزيع المحكم</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('vehicles')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              إدارة
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {boxVehicles.map(veh => {
              const assignedDriver = drivers.find(d => d.id === veh.driverId);
              return (
                <div key={veh.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {veh.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{veh.plateNumber}</span>
                        <span className="text-[11px] text-slate-500">({veh.model})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>الموقع: <strong>{veh.currentLocation}</strong></span>
                        <span>•</span>
                        <span>السائق: <strong>{assignedDriver ? assignedDriver.name : 'غير محدد'}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      veh.status === 'متاحة' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : veh.status === 'في مأمورية' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {veh.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canter Long Chassis Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                🚛
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">سيارات كانتر شاسيه طويل ({canterVehicles.length} شاحنات)</h3>
                <p className="text-xs text-slate-500">مخصصة للأطوال والأوزان الثقيلة ومسافات الصعيد والدلتا</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('vehicles')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              إدارة
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {canterVehicles.map(veh => {
              const assignedDriver = drivers.find(d => d.id === veh.driverId);
              return (
                <div key={veh.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {veh.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{veh.plateNumber}</span>
                        <span className="text-[11px] text-slate-500">({veh.model})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>الموقع: <strong>{veh.currentLocation}</strong></span>
                        <span>•</span>
                        <span>السائق: <strong>{assignedDriver ? assignedDriver.name : 'غير محدد'}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      veh.status === 'متاحة' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : veh.status === 'في مأمورية' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {veh.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Warehouses Snapshot */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white m-0">المخازن الرئيسية والإقليمية المعتمدة</h3>
            <p className="text-xs text-slate-400 mt-0.5">نقاط الانطلاق والوصول لأسطول النقل</p>
          </div>
          <button
            onClick={() => setActiveTab('warehouses')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الخريطة التفاعلية</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {warehouses.map(w => (
            <div key={w.id} className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${
                  w.type === 'garage'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : w.type === 'main_warehouse'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {w.category}
                </span>
                <h4 className="text-sm font-bold text-white m-0">{w.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{w.address}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>المسؤول: {w.manager.split('-')[0]}</span>
                <a href={`tel:${w.phone}`} className="text-blue-400 hover:underline">اتصال</a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
