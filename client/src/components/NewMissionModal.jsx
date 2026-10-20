import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Truck, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Navigation,
  Info,
  Sparkles,
  Star,
  Target,
  Award,
  Filter
} from 'lucide-react';
import { getVehicleDispatchRecommendations } from '../utils/dispatchRecommendations';

export const operationalRules = {
  'loc-gharbia-qarshiya': {
    name: 'مخزن إقليمي الغربية - القرشية',
    occupancyDays: 1,
    schedulePattern: 'ذهاب وعودة نفس اليوم',
    scheduleType: 'same_day',
    durationLabel: 'يوم واحد (ذهاب وعودة نفس اليوم)',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    headerColor: 'bg-emerald-600',
    iconEmoji: '🟢',
    description: 'السيارة مشغولة اليوم فقط، وتعود لجراج شبرا مساء نفس اليوم.',
    steps: [
      'انطلاق صباحاً من التجمع/شبرا إلى القرشية بالغربية (165 كم)',
      'تفريغ الشحنة بمخزن القرشية واستلام المرتجعات',
      'رحلة العودة ومبيت السيارة بجراج شبرا نفس اليوم'
    ],
    km: 165,
    fuel: 750,
    tolls: 100,
    allowance: 350,
    arrivalHours: 4,
    returnDaysOffset: 0
  },
  'loc-minya-mustaqbal': {
    name: 'مخزن إقليمي مصر الوسطى - المنيا الجديدة (مركز الطويل الإداري)',
    occupancyDays: 2,
    schedulePattern: 'ذهاب اليوم وعودة الغد',
    scheduleType: 'two_days',
    durationLabel: 'يومان (ذهاب اليوم + مبيت وعودة الغد)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    headerColor: 'bg-amber-600',
    iconEmoji: '🟡',
    description: 'السيارة مشغولة يومين (اليوم والغد) مع مبيت السائق بالمنيا والعودة غداً.',
    steps: [
      'اليوم 1: التحرك من التجمع لمركز الطويل بالمنيا الجديدة (260 كم) وتفريغ البضائع والمبيت',
      'اليوم 2: رحلة العودة للقاهرة ومبيت السيارة بجراج شبرا'
    ],
    km: 260,
    fuel: 1100,
    tolls: 180,
    allowance: 450,
    arrivalHours: 5,
    returnDaysOffset: 1
  },
  'loc-sohag-kawthar': {
    name: 'مخزن إقليمي مصر العليا - سوهاج (الكوثر / السلاموني)',
    occupancyDays: 3,
    schedulePattern: 'يوم ذهاب + يوم راحة وتفريغ + يوم عودة',
    scheduleType: 'three_days',
    durationLabel: '3 أيام (يوم ذهاب + يوم راحة وتفريغ + يوم عودة)',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    headerColor: 'bg-purple-600',
    iconEmoji: '🟣',
    description: 'السيارة مشغولة 3 أيام متتالية (يوم انتقال + يوم راحة وتفريغ + يوم عودة).',
    steps: [
      'اليوم 1: السفر والانتقال لمصر العليا - سوهاج (حي الكوثر والسلاموني 495 كم)',
      'اليوم 2: يوم راحة كاملة للسائق وتفريغ الشحنة بمخزن الكوثر / السلاموني',
      'اليوم 3: رحلة العودة من سوهاج إلى جراج شبرا / التجمع'
    ],
    km: 495,
    fuel: 1900,
    tolls: 280,
    allowance: 700,
    arrivalHours: 8,
    returnDaysOffset: 2
  }
};

function calculateReturnDate(depDateStr, daysOffset) {
  const d = depDateStr ? new Date(depDateStr) : new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(18, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function calculateArrivalDate(depDateStr, hoursOffset) {
  const d = depDateStr ? new Date(depDateStr) : new Date();
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString().slice(0, 16);
}

export default function NewMissionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  drivers = [], 
  vehicles = [], 
  warehouses = [],
  missions = []
}) {
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('box'); // 'box', 'canter', 'all'

  const [formData, setFormData] = useState({
    title: '',
    driverId: '',
    vehicleId: '',
    originId: 'loc-main-tagamoa',
    destinationId: 'loc-gharbia-qarshiya',
    cargoType: 'بضائع ومهمات تموينية معبأة',
    cargoWeight: '4.5 طن',
    dispatchOrderNumber: `إذن صرف #${Math.floor(4000 + Math.random() * 5000)}/2026`,
    departureDate: new Date().toISOString().slice(0, 16),
    expectedArrival: '',
    expectedReturnDate: '',
    occupancyDays: 1,
    schedulePattern: 'ذهاب وعودة نفس اليوم',
    scheduleType: 'same_day',
    durationLabel: 'يوم واحد (ذهاب وعودة نفس اليوم)',
    scheduleSteps: [],
    distanceKm: 165,
    cashAdvance: 1500,
    fuelExpense: 750,
    tollExpense: 100,
    driverAllowance: 350,
    otherExpenses: 0,
    status: 'assigned',
    notes: ''
  });

  const rule = operationalRules[formData.destinationId] || operationalRules['loc-gharbia-qarshiya'];

  // Destination Display Name
  const destWarehouse = warehouses.find(w => w.id === formData.destinationId);
  const destName = destWarehouse ? destWarehouse.name : (rule ? rule.name : 'الوجهة المحددة');
  const shortDestName = destName.includes('القرشية') ? 'القرشية' 
    : destName.includes('المنيا') ? 'المنيا الجديدة' 
    : destName.includes('سوهاج') ? 'سوهاج' 
    : destName;

  // Active drivers excluding those on official leave (إجازة) to prevent operational conflict
  const activeDrivers = drivers.filter(d => {
    if (!d || !d.status) return true;
    const s = String(d.status).trim();
    return s !== 'إجازة' && s !== 'اجازة' && !s.includes('إجازة') && !s.includes('اجازة');
  });

  const onLeaveDrivers = drivers.filter(d => {
    if (!d || !d.status) return false;
    const s = String(d.status).trim();
    return s === 'إجازة' || s === 'اجازة' || s.includes('إجازة') || s.includes('اجازة');
  });

  // Compute Smart Dispatch Recommendations
  const dispatchRecs = getVehicleDispatchRecommendations({
    vehicles,
    missions,
    drivers,
    destinationId: formData.destinationId,
    destinationName: shortDestName,
    vehicleTypeFilter,
    excludeDriversOnLeave: true,
    onlyAvailable: true
  });

  // Handle Destination Change
  const handleDestinationChange = (destId) => {
    const r = operationalRules[destId] || operationalRules['loc-gharbia-qarshiya'];
    const destW = warehouses.find(w => w.id === destId);
    const dep = formData.departureDate || new Date().toISOString().slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      destinationId: destId,
      distanceKm: r.km,
      fuelExpense: r.fuel,
      tollExpense: r.tolls,
      driverAllowance: r.allowance,
      cashAdvance: r.fuel + r.tolls + r.allowance + 300,
      occupancyDays: r.occupancyDays,
      schedulePattern: r.schedulePattern,
      scheduleType: r.scheduleType,
      durationLabel: r.durationLabel,
      scheduleSteps: r.steps,
      expectedArrival: calculateArrivalDate(dep, r.arrivalHours),
      expectedReturnDate: calculateReturnDate(dep, r.returnDaysOffset),
      title: `مأمورية شحن إلى ${destW ? destW.name : r.name}`
    }));
  };

  // Handle Departure Date Change
  const handleDepartureDateChange = (dateVal) => {
    const r = operationalRules[formData.destinationId] || operationalRules['loc-gharbia-qarshiya'];
    setFormData(prev => ({
      ...prev,
      departureDate: dateVal,
      expectedArrival: calculateArrivalDate(dateVal, r.arrivalHours),
      expectedReturnDate: calculateReturnDate(dateVal, r.returnDaysOffset)
    }));
  };

  // Select recommended vehicle and auto-pair driver (guaranteeing non-leave driver)
  const handleSelectRecommendedVehicle = (vehId) => {
    const veh = vehicles.find(v => v.id === vehId);
    if (!veh) return;

    let matchingDriver = null;
    if (veh.driverId) {
      matchingDriver = activeDrivers.find(d => d.id === veh.driverId);
    }
    if (!matchingDriver) {
      matchingDriver = activeDrivers.find(d => d.assignedVehicleId === veh.id);
    }
    if (!matchingDriver) {
      matchingDriver = activeDrivers.find(d => d.vehicleCategory === veh.type && d.status === 'متاح');
    }
    if (!matchingDriver) {
      matchingDriver = activeDrivers.find(d => d.status === 'متاح') || activeDrivers[0];
    }

    setFormData(prev => ({
      ...prev,
      vehicleId: vehId,
      driverId: matchingDriver ? matchingDriver.id : prev.driverId
    }));
  };

  // When driver is selected, auto-select matching vehicle
  const handleDriverChange = (drvId) => {
    const driver = activeDrivers.find(d => d.id === drvId);
    if (!driver) return;

    let matchingVeh = null;
    if (driver.assignedVehicleId) {
      matchingVeh = dispatchRecs.filteredVehicles.find(v => v.id === driver.assignedVehicleId);
    }
    if (!matchingVeh) {
      matchingVeh = dispatchRecs.filteredVehicles.find(v => v.type === driver.vehicleCategory && v.isAvailable);
    }

    setFormData(prev => ({
      ...prev,
      driverId: drvId,
      vehicleId: matchingVeh ? matchingVeh.id : prev.vehicleId
    }));
  };

  // Set defaults on modal open
  useEffect(() => {
    if (isOpen) {
      const defaultDest = 'loc-gharbia-qarshiya';
      const r = operationalRules[defaultDest];
      const dep = new Date().toISOString().slice(0, 16);

      // Analyze best initial vehicle for default destination (Box truck recommended)
      const initialRecs = getVehicleDispatchRecommendations({
        vehicles,
        missions,
        drivers,
        destinationId: defaultDest,
        destinationName: 'القرشية',
        vehicleTypeFilter: 'box',
        excludeDriversOnLeave: true,
        onlyAvailable: true
      });
      const bestVeh = initialRecs.filteredVehicles.find(v => v.destCountThisWeek === 0 && v.isAvailable)
        || initialRecs.filteredVehicles.find(v => v.isAvailable)
        || initialRecs.filteredVehicles[0];

      let matchingDriver = null;
      if (bestVeh) {
        if (bestVeh.driverId) matchingDriver = activeDrivers.find(d => d.id === bestVeh.driverId);
        if (!matchingDriver) matchingDriver = activeDrivers.find(d => d.assignedVehicleId === bestVeh.id);
        if (!matchingDriver) matchingDriver = activeDrivers.find(d => d.vehicleCategory === bestVeh.type && d.status === 'متاح');
      }
      if (!matchingDriver) matchingDriver = activeDrivers.find(d => d.status === 'متاح') || activeDrivers[0];

      setFormData(prev => ({
        ...prev,
        driverId: matchingDriver ? matchingDriver.id : '',
        vehicleId: bestVeh ? bestVeh.id : (dispatchRecs.filteredVehicles[0]?.id || ''),
        destinationId: defaultDest,
        departureDate: dep,
        expectedArrival: calculateArrivalDate(dep, r.arrivalHours),
        expectedReturnDate: calculateReturnDate(dep, r.returnDaysOffset),
        occupancyDays: r.occupancyDays,
        schedulePattern: r.schedulePattern,
        scheduleType: r.scheduleType,
        durationLabel: r.durationLabel,
        scheduleSteps: r.steps,
        distanceKm: r.km,
        fuelExpense: r.fuel,
        tollExpense: r.tolls,
        driverAllowance: r.allowance,
        cashAdvance: r.fuel + r.tolls + r.allowance + 300,
        title: 'مأمورية نقل بضائع لمخزن الغربية (القرشية)'
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.driverId || !formData.vehicleId) {
      alert('يرجى اختيار السائق والسيارة لإتمام التكليف');
      return;
    }

    const chosenDriver = drivers.find(d => d.id === formData.driverId);
    if (chosenDriver && (chosenDriver.status === 'إجازة' || chosenDriver.status?.includes('إجازة'))) {
      alert(`عفواً: السائق (${chosenDriver.name}) مسجل في إجازة حالياً، يرجى اختيار سائق متاح.`);
      return;
    }

    const chosenVeh = vehicles.find(v => v.id === formData.vehicleId);
    if (chosenVeh && (chosenVeh.status === 'سائق بإجازة' || chosenVeh.status === 'صيانة')) {
      alert(`عفواً: الشاحنة غير متاحة لخروج مأمورية (سائقها في إجازة أو بحالة صيانة).`);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const selectedDriver = drivers.find(d => d.id === formData.driverId);
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black m-0">إسناد وتكليف مأمورية جديدة</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبيق معادلة خطوط السير وإشغال الشاحنات تلقائياً
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Mission Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان أو بيان المأمورية
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            />
          </div>

          {/* Departure & Destination Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                نقطة التحميل والانطلاق (المركز الرئيسي)
              </label>
              <select
                value={formData.originId}
                onChange={e => setFormData({ ...formData, originId: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                {warehouses.filter(w => w.type !== 'regional_warehouse').map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                المخزن الإقليمي المستلم (الوجهة)
              </label>
              <select
                value={formData.destinationId}
                onChange={e => handleDestinationChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="loc-gharbia-qarshiya">مخزن الغربية (القرشية) - ذهاب وعودة نفس اليوم</option>
                <option value="loc-minya-mustaqbal">مخزن مصر الوسطى (المنيا الجديدة - مركز الطويل الإداري) - يومان</option>
                <option value="loc-sohag-kawthar">مخزن مصر العليا (سوهاج الكوثر) - 3 أيام</option>
              </select>
            </div>
          </div>

          {/* DURATION & OCCUPANCY HIGHLIGHT BOX (معادلة خط السير وإشغال الشاحنة) */}
          <div className={`p-4 rounded-2xl border ${rule.badgeColor} space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{rule.iconEmoji}</span>
                <div>
                  <h4 className="font-black text-sm m-0">
                    معادلة خط السير: {rule.schedulePattern}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black bg-white/80 px-2.5 py-1 rounded-lg border border-current/20 shadow-xs font-mono">
                  مدة الإشغال: {rule.occupancyDays} {rule.occupancyDays === 1 ? 'يوم' : rule.occupancyDays === 2 ? 'يومان' : 'أيام'}
                </span>
              </div>
            </div>

            {/* Step by Step Plan */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold opacity-80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>الجدول الزمني للرحلة والجاهزية:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-white/90 p-2 rounded-xl border border-current/10">
                  <span className="block font-bold text-slate-700">تاريخ الانطلاق:</span>
                  <span className="font-mono text-slate-900 font-bold">{formData.departureDate ? new Date(formData.departureDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-current/10">
                  <span className="block font-bold text-slate-700">تاريخ العودة للجراج:</span>
                  <span className="font-mono text-blue-700 font-bold">{formData.expectedReturnDate ? new Date(formData.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-current/10">
                  <span className="block font-bold text-slate-700">جاهزية السيارة والسائق:</span>
                  <span className="font-bold text-emerald-700">
                    {rule.occupancyDays === 1 ? 'نفس اليوم ليلاً / صباح الغد' : rule.occupancyDays === 2 ? 'صباح اليوم الثالث' : 'صباح اليوم الرابع'}
                  </span>
                </div>
              </div>
            </div>

            {/* Steps list */}
            <div className="pt-1 border-t border-current/10 text-[11px] space-y-1 opacity-90">
              {rule.steps.map((st, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SMART DISPATCH RECOMMENDATION PANEL (نظام الترشيح الذكي الأسبوعي) */}
          {/* ============================================================== */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-indigo-900/40 space-y-4">
            
            {/* Panel Header & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black m-0 text-white flex items-center gap-2 flex-wrap">
                    <span>نظام الترشيح الذكي للسيارات (عدالة توزيع المأموريات الأسبوعية)</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 m-0">
                    متابعة حركة الأسطول إلى <strong className="text-amber-300 underline underline-offset-2">[{shortDestName}]</strong> خلال هذا الأسبوع (السبت - اليوم)
                  </p>
                </div>
              </div>

              {/* Vehicle Category Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setVehicleTypeFilter('box')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vehicleTypeFilter === 'box'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  📦 نقل صندوق (3)
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleTypeFilter('canter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vehicleTypeFilter === 'canter'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  🚛 كانتر (3)
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleTypeFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vehicleTypeFilter === 'all'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  الكل (6)
                </button>
              </div>
            </div>

            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300 block font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                    مرشحة ذات أولوية:
                  </span>
                  <span className="text-[10px] text-slate-300">لم تخرج لـ {shortDestName} هذا الأسبوع</span>
                </div>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {dispatchRecs.recommendedCount}
                </span>
              </div>

              <div className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-purple-300 block font-bold flex items-center gap-1">
                    <Target className="w-3 h-3 text-purple-300" />
                    حققت شرط الحد الأدنى:
                  </span>
                  <span className="text-[10px] text-slate-300">مأموريتين أو أكثر لـ {shortDestName}</span>
                </div>
                <span className="text-2xl font-black font-mono text-purple-300">
                  {dispatchRecs.achievedCount}
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
                <div>
                  <span className="text-[11px] text-slate-300 block font-bold">جاهزية الأسطول:</span>
                  <span className="text-[10px] text-slate-400">شاحنات متاحة حالياً</span>
                </div>
                <span className="text-2xl font-black font-mono text-blue-400">
                  {dispatchRecs.filteredVehicles.filter(v => v.isAvailable).length}
                </span>
              </div>
            </div>

            {/* Operational Protection Alert if Drivers are on Leave */}
            {onLeaveDrivers.length > 0 && (
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    🛡️ حماية تشغيلية لمنع الخلل: تم حجب السائقين في إجازة وشاحناتهم تلقائياً من خيارات المأمورية
                  </span>
                  <span className="text-[11px] text-slate-300">
                    في إجازة حالياً: {onLeaveDrivers.map(d => `${d.name} (${d.role})`).join(' • ')} — ولا تظهر شاحناتهم لمنع أي تضارب تشغيلي.
                  </span>
                </div>
              </div>
            )}

            {/* Interactive Vehicle Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {dispatchRecs.filteredVehicles.map(veh => {
                const isSelected = formData.vehicleId === veh.id;
                const isRecZero = veh.destCountThisWeek === 0;
                const isAchievedMin2 = veh.hasAchievedMinTwo;

                return (
                  <div
                    key={veh.id}
                    onClick={() => handleSelectRecommendedVehicle(veh.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-right ${
                      isSelected
                        ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-400 shadow-lg'
                        : isRecZero
                        ? 'bg-slate-800/80 border-emerald-500/50 hover:bg-slate-800 hover:border-emerald-400'
                        : isAchievedMin2
                        ? 'bg-slate-800/80 border-purple-500/50 hover:bg-slate-800 hover:border-purple-400'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      {/* Top Row: Code & Status */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-sm text-white">
                          {veh.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          veh.isAvailable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {veh.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-semibold mb-2">
                        {veh.plateNumber || 'لوحات قيد التسجيل'} • <span className="text-[11px] text-slate-400">{veh.type}</span>
                      </div>

                      {/* Destination Specific Tag */}
                      <div className="mb-3">
                        {isRecZero ? (
                          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-2 rounded-xl text-[11px] font-bold flex items-start gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5 fill-amber-300" />
                            <div>
                              <span>⭐ موصى بها: لم تخرج لـ {shortDestName} هذا الأسبوع</span>
                              <span className="block text-[10px] text-emerald-300/80 font-normal">الأحق بالخروج لعدالة التوزيع</span>
                            </div>
                          </div>
                        ) : isAchievedMin2 ? (
                          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-200 p-2 rounded-xl text-[11px] font-bold flex items-start gap-1.5">
                            <Target className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
                            <div>
                              <span>🎯 حققت شرط مأموريتين لـ {shortDestName} كحد أدنى</span>
                              <span className="block text-[10px] text-purple-300/80 font-normal">نفذت {veh.destCountThisWeek} مأموريات هذا الأسبوع</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-700/60 border border-slate-600/60 text-slate-200 p-2 rounded-xl text-[11px] font-medium flex items-center justify-between">
                            <span>مأموريات {shortDestName}:</span>
                            <span className="font-mono font-bold text-amber-300">مأمورية واحدة هذا الأسبوع</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Pill */}
                    <button
                      type="button"
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-slate-700/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم اختيار هذه الشاحنة</span>
                        </>
                      ) : (
                        <span>اختيار وتكليف الشاحنة</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver & Vehicle Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Driver */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  السائق المكلف بالرحلة
                </span>
                {selectedDriver && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedDriver.status === 'متاح' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedDriver.status}
                  </span>
                )}
              </label>
              <select
                required
                value={formData.driverId}
                onChange={e => handleDriverChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- اختر السائق من الطاقم المتاح --</option>
                {activeDrivers.map(d => {
                  const drvDestCount = missions.filter(m => 
                    m.driverId === d.id && 
                    m.destinationId === formData.destinationId &&
                    m.status !== 'cancelled' &&
                    new Date(m.departureDate || m.createdAt) >= dispatchRecs.weekStart
                  ).length;

                  return (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.role} - {d.status}) {drvDestCount === 0 ? `— (0 مأموريات لـ ${shortDestName})` : `— (${drvDestCount} مأمورية لـ ${shortDestName})`}
                    </option>
                  );
                })}
              </select>
              {onLeaveDrivers.length > 0 && (
                <span className="text-[10px] text-amber-700 font-bold block mt-1">
                  🏖️ تم استبعاد {onLeaveDrivers.length} سائقين بسبب الإجازة الرسمية لمنع الخلل التشغيلي
                </span>
              )}
              {selectedDriver && (() => {
                const drvDestCount = missions.filter(m => 
                  m.driverId === selectedDriver.id && 
                  m.destinationId === formData.destinationId &&
                  m.status !== 'cancelled' &&
                  new Date(m.departureDate || m.createdAt) >= dispatchRecs.weekStart
                ).length;
                return (
                  <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>هاتف: {selectedDriver.phone || 'قيد الإدراج'}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      drvDestCount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {drvDestCount === 0 ? `لم يخرج لـ ${shortDestName} هذا الأسبوع` : `${drvDestCount} مأموريات لـ ${shortDestName} هذا الأسبوع`}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  السيارة المخصصة (صندوق / كانتر)
                </span>
                {selectedVehicle && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedVehicle.status === 'متاحة' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                )}
              </label>
              <select
                required
                value={formData.vehicleId}
                onChange={e => handleSelectRecommendedVehicle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- اختر السيارة المتاحة من الأسطول --</option>
                <optgroup label="سيارات نقل صندوق المتاحة">
                  {dispatchRecs.filteredVehicles.filter(v => v.isBox).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.plateNumber || 'بدون لوحة'} ({v.status}) — {
                        v.destCountThisWeek === 0 
                          ? `⭐ موصى بها (0 مأموريات لـ ${shortDestName})` 
                          : v.destCountThisWeek >= 2 
                          ? `🎯 حققت شرط مأموريتين كحد أدنى (${v.destCountThisWeek} لـ ${shortDestName})` 
                          : `(مأمورية واحدة لـ ${shortDestName})`
                      }
                    </option>
                  ))}
                </optgroup>
                <optgroup label="سيارات كانتر شاسيه طويل المتاحة">
                  {dispatchRecs.filteredVehicles.filter(v => v.isCanter).map(v => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.plateNumber || 'بدون لوحة'} ({v.status}) — {
                        v.destCountThisWeek === 0 
                          ? `⭐ موصى بها (0 مأموريات لـ ${shortDestName})` 
                          : v.destCountThisWeek >= 2 
                          ? `🎯 حققت شرط مأموريتين كحد أدنى (${v.destCountThisWeek} لـ ${shortDestName})` 
                          : `(مأمورية واحدة لـ ${shortDestName})`
                      }
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Dynamic Callout based on selected vehicle recommendation */}
              {selectedVehicle && (() => {
                const vehRec = dispatchRecs.allVehicles.find(v => v.id === selectedVehicle.id);
                const destCount = vehRec ? vehRec.destCountThisWeek : 0;
                if (destCount === 0) {
                  return (
                    <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span>⭐ ترشيح ممتاز: هذه السيارة لم تخرج إلى [{shortDestName}] خلال هذا الأسبوع، مما يحقق عدالة توزيع الرحلات على الأسطول.</span>
                    </div>
                  );
                } else if (destCount >= 2) {
                  return (
                    <div className="mt-2 p-2 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-800 flex items-center gap-1.5 font-bold">
                      <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>🎯 تنبيه الحصة: هذه السيارة حققت بالفعل شرط مأموريتين كحد أدنى إلى [{shortDestName}] هذا الأسبوع (نفذت {destCount} مأموريات).</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-2 p-2 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>نفذت هذه السيارة مأمورية واحدة سابقة إلى [{shortDestName}] خلال هذا الأسبوع.</span>
                    </div>
                  );
                }
              })()}
            </div>

          </div>

          {/* Timing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                تاريخ ووقت الانطلاق
              </label>
              <input
                type="datetime-local"
                value={formData.departureDate}
                onChange={e => handleDepartureDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                تاريخ الوصول للمخزن
              </label>
              <input
                type="datetime-local"
                value={formData.expectedArrival}
                onChange={e => setFormData({ ...formData, expectedArrival: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1 text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                تاريخ عودة السيارة وجاهزيتها
              </label>
              <input
                type="datetime-local"
                value={formData.expectedReturnDate}
                onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full px-3 py-2 bg-blue-50/60 border border-blue-300 rounded-xl text-xs font-sans font-bold text-blue-900"
              />
            </div>
          </div>

          {/* Cargo & Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                طبيعة الحمولة / البضاعة
              </label>
              <input
                type="text"
                value={formData.cargoType}
                onChange={e => setFormData({ ...formData, cargoType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                وزن أو حجم الشحنة
              </label>
              <input
                type="text"
                value={formData.cargoWeight}
                onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم إذن الصرف أو الفاتورة
              </label>
              <input
                type="text"
                value={formData.dispatchOrderNumber}
                onChange={e => setFormData({ ...formData, dispatchOrderNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Financials & Cash Advance */}
          <div className="bg-amber-500/10 border border-amber-200 p-4 rounded-2xl">
            <h4 className="text-xs font-black text-amber-900 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              التقديرات المالية والعهدة النقدية للمأمورية (ج.م)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  العهدة المصروفة للسائق
                </label>
                <input
                  type="number"
                  value={formData.cashAdvance}
                  onChange={e => setFormData({ ...formData, cashAdvance: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  سولار تقديري
                </label>
                <input
                  type="number"
                  value={formData.fuelExpense}
                  onChange={e => setFormData({ ...formData, fuelExpense: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  كارتات ورسوم طرق
                </label>
                <input
                  type="number"
                  value={formData.tollExpense}
                  onChange={e => setFormData({ ...formData, tollExpense: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  بدل سفر وإعاشة السائق
                </label>
                <input
                  type="number"
                  value={formData.driverAllowance}
                  onChange={e => setFormData({ ...formData, driverAllowance: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات أو تعليمات خاصة للسائق ومسؤولي الاستلام
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="تسجيل أي تعليمات أو ترتيبات مبيت وتفريغ..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إصدار وتكليف المأمورية الآن</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
