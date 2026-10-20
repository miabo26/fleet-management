import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  Printer, 
  Truck, 
  Users, 
  MapPin, 
  Fuel, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award, 
  ChevronLeft, 
  Filter, 
  ShieldCheck, 
  BarChart3,
  ArrowUpRight,
  Eye,
  FileText
} from 'lucide-react';

export default function ReportsCenter({ 
  missions = [], 
  drivers = [], 
  vehicles = [], 
  warehouses = [],
  onViewMission,
  onPrintMission 
}) {
  // Period filter: 'week' | 'month' | 'year' | 'all' | 'custom'
  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Active report tab: 'missions' | 'drivers' | 'financial'
  const [activeReportTab, setActiveReportTab] = useState('missions');

  // Selected driver for deep-dive
  const [selectedDriverId, setSelectedDriverId] = useState('all');

  // Destination filter in report
  const [selectedDestId, setSelectedDestId] = useState('all');

  // Compute Date Range Boundaries
  const dateRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date(now);

    if (period === 'week') {
      // Last 7 days
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      // Last 30 days
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
      // Last 365 days
      start.setDate(now.getDate() - 365);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'custom') {
      if (customStart) start = new Date(customStart);
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    } else {
      // 'all'
      start = new Date('2020-01-01');
    }

    return { start, end };
  }, [period, customStart, customEnd]);

  // Filter Missions by date range & destination
  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      const mDate = new Date(m.departureDate || m.createdAt || Date.now());
      const inRange = (period === 'all') || (mDate >= dateRange.start && mDate <= dateRange.end);
      const inDest = selectedDestId === 'all' || m.destinationId === selectedDestId;
      const inDriver = selectedDriverId === 'all' || m.driverId === selectedDriverId;
      return inRange && inDest && inDriver;
    });
  }, [missions, dateRange, period, selectedDestId, selectedDriverId]);

  // General Metrics
  const metrics = useMemo(() => {
    const total = filteredMissions.length;
    const completed = filteredMissions.filter(m => m.status === 'completed').length;
    const onRoad = filteredMissions.filter(m => m.status === 'on_road').length;
    const loading = filteredMissions.filter(m => m.status === 'loading').length;
    const assigned = filteredMissions.filter(m => m.status === 'assigned').length;

    const totalDistance = filteredMissions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0);
    const totalFuel = filteredMissions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0);
    const totalTolls = filteredMissions.reduce((acc, m) => acc + (Number(m.tollExpense) || 0), 0);
    const totalAllowances = filteredMissions.reduce((acc, m) => acc + (Number(m.driverAllowance) || 0), 0);
    const totalAdvance = filteredMissions.reduce((acc, m) => acc + (Number(m.cashAdvance) || 0), 0);
    const totalRemaining = filteredMissions.reduce((acc, m) => acc + (Number(m.remainingCash) || 0), 0);
    const totalExpenses = totalFuel + totalTolls + totalAllowances;

    // Breakdown by destination
    const gharbiaMissions = filteredMissions.filter(m => m.destinationId?.includes('gharbia') || m.destinationId?.includes('qarshiya'));
    const minyaMissions = filteredMissions.filter(m => m.destinationId?.includes('minya'));
    const sohagMissions = filteredMissions.filter(m => m.destinationId?.includes('sohag'));

    // Breakdown by vehicle type
    const boxMissions = filteredMissions.filter(m => m.vehicleType?.includes('صندوق'));
    const canterMissions = filteredMissions.filter(m => m.vehicleType?.includes('كانتر'));

    return {
      total,
      completed,
      active: onRoad + loading + assigned,
      totalDistance,
      totalFuel,
      totalTolls,
      totalAllowances,
      totalAdvance,
      totalExpenses,
      totalRemaining,
      destinations: {
        gharbia: {
          count: gharbiaMissions.length,
          name: 'الغربية (القرشية)',
          distance: gharbiaMissions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0),
          fuel: gharbiaMissions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0)
        },
        minya: {
          count: minyaMissions.length,
          name: 'مصر الوسطى (المنيا الجديدة)',
          distance: minyaMissions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0),
          fuel: minyaMissions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0)
        },
        sohag: {
          count: sohagMissions.length,
          name: 'مصر العليا (سوهاج الكوثر)',
          distance: sohagMissions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0),
          fuel: sohagMissions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0)
        }
      },
      vehicleTypes: {
        box: boxMissions.length,
        canter: canterMissions.length
      }
    };
  }, [filteredMissions]);

  // Drivers Performance Report Aggregation
  const driversReport = useMemo(() => {
    return drivers.map(d => {
      const dMissions = filteredMissions.filter(m => m.driverId === d.id);
      const completed = dMissions.filter(m => m.status === 'completed').length;
      const active = dMissions.filter(m => ['assigned', 'loading', 'on_road'].includes(m.status)).length;
      const distance = dMissions.reduce((acc, m) => acc + (Number(m.distanceKm) || 0), 0);
      const allowances = dMissions.reduce((acc, m) => acc + (Number(m.driverAllowance) || 0), 0);
      const advances = dMissions.reduce((acc, m) => acc + (Number(m.cashAdvance) || 0), 0);
      const fuel = dMissions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0);
      const assignedTruck = vehicles.find(v => v.id === d.assignedVehicleId);

      // Most visited destination
      const destCount = {};
      dMissions.forEach(m => {
        destCount[m.destinationName || 'وجهة أخرى'] = (destCount[m.destinationName || 'وجهة أخرى'] || 0) + 1;
      });
      const topDest = Object.entries(destCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '---';

      return {
        ...d,
        assignedTruck,
        periodMissionsCount: dMissions.length,
        periodCompleted: completed,
        periodActive: active,
        periodDistance: distance,
        periodAllowances: allowances,
        periodAdvances: advances,
        periodFuel: fuel,
        topDest,
        missions: dMissions
      };
    }).sort((a, b) => b.periodMissionsCount - a.periodMissionsCount);
  }, [drivers, filteredMissions, vehicles]);

  // Format date range text
  const getPeriodLabel = () => {
    if (period === 'week') return 'خلال الأسبوع الماضي (آخر 7 أيام)';
    if (period === 'month') return 'خلال الشهر الماضي (آخر 30 يوماً)';
    if (period === 'year') return 'خلال العام الحالي (آخر 365 يوماً)';
    if (period === 'all') return 'جميع الفترات الزمنية';
    return `فترة مخصصة (${customStart || '---'} إلى ${customEnd || 'الآن'})`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & Controls (Hidden in Print) */}
      <div className="no-print bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">مركز التقارير والإحصائيات التحليلية</h2>
              <p className="text-xs text-slate-500 mt-1">
                تقارير شاملة عن المأموريات، حركة السائقين، والمسافات والمصروفات خلال أسبوع وشهر وعام
              </p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>طباعة التقرير (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Time Period Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 ml-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            فترة التقرير:
          </span>

          {[
            { id: 'week', label: 'خلال أسبوع' },
            { id: 'month', label: 'خلال شهر' },
            { id: 'year', label: 'خلال عام' },
            { id: 'all', label: 'كافة الفترات' },
            { id: 'custom', label: 'فترة مخصصة' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === btn.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 font-bold">من:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
            />
            <label className="text-slate-500 font-bold">إلى:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
            />
          </div>
        )}

        {/* Current Active Period Badge */}
        <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          {getPeriodLabel()}
        </div>
      </div>

      {/* Sub Tabs: Missions vs Drivers vs Financials (Hidden in Print) */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportTab('missions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'missions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>تقرير المأموريات والتشغيل</span>
          <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full">
            {metrics.total}
          </span>
        </button>

        <button
          onClick={() => setActiveReportTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'drivers'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>تقرير أداء طاقم السائقين (6)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('financial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'financial'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>المصاريف والعهد والوقود</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PRINT HEADER (Shown ONLY when printing Ctrl+P)                 */}
      {/* ============================================================== */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900 m-0">برنامج حركة السيارات والمخازن الإقليمية</h1>
            <p className="text-xs text-slate-600 mt-1">إدارة التشغيل والنقل المركزي - جراج شبرا / المخزن الرئيسي بالتجمع</p>
            <p className="text-xs font-bold text-blue-700 mt-1">تقرير حركة: {getPeriodLabel()}</p>
          </div>
          <div className="text-left font-mono text-xs">
            <div>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</div>
            <div>الوقت: {new Date().toLocaleTimeString('ar-EG')}</div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Missions */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي المأموريات</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs text-slate-500 mr-1.5">مأمورية</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="text-emerald-700 font-bold">{metrics.completed} مكتملة</span>
            <span className="text-amber-700 font-bold">{metrics.active} جارية</span>
          </div>
        </div>

        {/* Total Distance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي المسافات</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.totalDistance.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-slate-500 mr-1.5">كم</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            طرق الدلتا والصعيد السريعة
          </div>
        </div>

        {/* Total Fuel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>إجمالي مصاريف الوقود</span>
            <Fuel className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.totalFuel.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-slate-500 mr-1.5">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            سولار الشاحنات لجميع الرحلات
          </div>
        </div>

        {/* Total Allowances & Tolls */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>البدلات والكارتات</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {(metrics.totalAllowances + metrics.totalTolls).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs text-slate-500 mr-1.5">ج.م</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
            <span>بدلات: {metrics.totalAllowances} ج.م</span>
            <span>كارتات: {metrics.totalTolls} ج.م</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* TAB 1: MISSIONS & DESTINATIONS BREAKDOWN REPORT                 */}
      {/* ============================================================== */}
      {(activeReportTab === 'missions' || activeReportTab === 'all') && (
        <div className="space-y-6">
          
          {/* Destination Breakdown Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">توزيع المأموريات على المخازن الإقليمية الثلاثة</h3>
                <p className="text-xs text-slate-500 mt-0.5">معدل التوريدات وحركة الشاحنات لكل فرع إقليمي {getPeriodLabel()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Gharbia */}
              <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">مخزن الغربية (القرشية)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    إشغال 1 يوم
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {metrics.destinations.gharbia.count} <span className="text-xs text-slate-500 font-normal">مأمورية</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>المسافة المقطوعة:</span>
                    <strong>{metrics.destinations.gharbia.distance} كم</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي وقود الخط:</span>
                    <strong>{metrics.destinations.gharbia.fuel} ج.م</strong>
                  </div>
                </div>
              </div>

              {/* Minya */}
              <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900">مخزن المنيا الجديدة (مركز الطويل)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    إشغال يومين
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {metrics.destinations.minya.count} <span className="text-xs text-slate-500 font-normal">مأمورية</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>المسافة المقطوعة:</span>
                    <strong>{metrics.destinations.minya.distance} كم</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي وقود الخط:</span>
                    <strong>{metrics.destinations.minya.fuel} ج.م</strong>
                  </div>
                </div>
              </div>

              {/* Sohag */}
              <div className="p-4 rounded-xl border border-slate-200 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-900">مخزن سوهاج (الكوثر / السلاموني)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    إشغال 3 أيام
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {metrics.destinations.sohag.count} <span className="text-xs text-slate-500 font-normal">مأمورية</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>المسافة المقطوعة:</span>
                    <strong>{metrics.destinations.sohag.distance} كم</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي وقود الخط:</span>
                    <strong>{metrics.destinations.sohag.fuel} ج.م</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Missions Detailed Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">بيان تفصيلي بالمأموريات المسجلة في الفترة</h3>
                <span className="text-xs text-slate-500">إجمالي {filteredMissions.length} مأمورية</span>
              </div>
            </div>

            {filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">لا توجد مأموريات مسجلة {getPeriodLabel()}</p>
                <p className="text-[11px] text-slate-400 mt-1">عند بدء إسناد المأموريات ستظهر تحليلاتها التلقائية هنا فوراً</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-3 px-4">رقم المأمورية</th>
                      <th className="py-3 px-4">الوجهة الإقليمية</th>
                      <th className="py-3 px-4">السائق المكلف</th>
                      <th className="py-3 px-4">الشاحنة</th>
                      <th className="py-3 px-4">مدة الإشغال</th>
                      <th className="py-3 px-4">المسافة</th>
                      <th className="py-3 px-4">الوقود</th>
                      <th className="py-3 px-4">العهدة</th>
                      <th className="py-3 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMissions.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.missionNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{m.destinationName}</td>
                        <td className="py-3 px-4 text-slate-800">{m.driverName}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{m.vehicleCode} ({m.vehiclePlate || '---'})</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.occupancyDays === 3 ? 'bg-purple-100 text-purple-800' : m.occupancyDays === 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {m.occupancyDays} {m.occupancyDays === 1 ? 'يوم' : m.occupancyDays === 2 ? 'يومين' : 'أيام'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{m.distanceKm || 0} كم</td>
                        <td className="py-3 px-4 font-mono">{m.fuelExpense || 0} ج.م</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{m.cashAdvance || 0} ج.م</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {m.status === 'completed' ? 'مكتملة' : 'جارية'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DRIVERS PERFORMANCE REPORT                              */}
      {/* ============================================================== */}
      {(activeReportTab === 'drivers' || activeReportTab === 'all') && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">تقرير أداء وإنتاجية طاقم السائقين الـ 6</h3>
                <p className="text-xs text-slate-500 mt-0.5">معدلات تنفيذ المهام، الكيلومترات المقطوعة، والبدلات المستحقة {getPeriodLabel()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">اسم السائق</th>
                    <th className="py-3.5 px-4">نوع الشاحنة</th>
                    <th className="py-3.5 px-4">الشاحنة المخصصة</th>
                    <th className="py-3.5 px-4 text-center">عدد المأموريات بالفترة</th>
                    <th className="py-3.5 px-4">إجمالي الكيلومترات</th>
                    <th className="py-3.5 px-4">إجمالي البدلات المصروفة</th>
                    <th className="py-3.5 px-4">إجمالي العهد المستلمة</th>
                    <th className="py-3.5 px-4">الخط الأكثر تكراراً</th>
                    <th className="py-3.5 px-4">حالة السائق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {driversReport.map((driver) => (
                    <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{driver.name}</div>
                        <span className="text-[11px] text-slate-400 font-mono">{driver.phone || 'الهاتف قيد الإدراج'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          driver.vehicleCategory.includes('كانتر') 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}>
                          {driver.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {driver.assignedTruck ? `${driver.assignedTruck.code} (${driver.assignedTruck.plateNumber || 'لوحة قيد التسجيل'})` : 'غير محدد'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full font-black text-sm bg-slate-100 text-slate-900 font-mono">
                          {driver.periodMissionsCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {driver.periodDistance.toLocaleString('ar-EG')} كم
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {driver.periodAllowances.toLocaleString('ar-EG')} ج.م
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {driver.periodAdvances.toLocaleString('ar-EG')} ج.م
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {driver.topDest}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          driver.status === 'متاح'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {driver.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FINANCIAL & EXPENSES REPORT                             */}
      {/* ============================================================== */}
      {(activeReportTab === 'financial' || activeReportTab === 'all') && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 mb-2">الملخص المالي ومصروفات التشغيل {getPeriodLabel()}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي العهد المنصرفة</span>
                <span className="text-2xl font-black text-blue-600 font-mono">{metrics.totalAdvance.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي المصروفات الفعلية</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{metrics.totalExpenses.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي السولار المستهلك</span>
                <span className="text-2xl font-black text-amber-600 font-mono">{metrics.totalFuel.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block mb-1">المتبقي المسوى بالخزينة</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">{metrics.totalRemaining.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* PRINT FOOTER SIGNATURES (Shown ONLY when printing Ctrl+P)       */}
      {/* ============================================================== */}
      <div className="hidden print:grid grid-cols-3 gap-6 pt-12 mt-12 border-t-2 border-slate-900 text-center text-xs">
        <div className="space-y-8">
          <span className="font-bold text-slate-900 block">مسؤول حركة السيارات والجراج</span>
          <span className="text-slate-400 block">......................................</span>
        </div>
        <div className="space-y-8">
          <span className="font-bold text-slate-900 block">مدير المخازن المركزية</span>
          <span className="text-slate-400 block">......................................</span>
        </div>
        <div className="space-y-8">
          <span className="font-bold text-slate-900 block">المدير المالي والاعتماد</span>
          <span className="text-slate-400 block">......................................</span>
        </div>
      </div>

    </div>
  );
}
