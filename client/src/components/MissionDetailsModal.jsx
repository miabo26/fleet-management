import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  MapPin, 
  Truck, 
  User, 
  Phone, 
  Fuel, 
  FileText, 
  Printer, 
  Save, 
  DollarSign, 
  Gauge, 
  TrendingUp, 
  AlertTriangle, 
  Flame,
  MessageCircle
} from 'lucide-react';
import { calculateFuelEfficiencyMetrics, FUEL_BENCHMARKS } from '../utils/fuelUtils';
import { generateWhatsAppMissionUrl } from '../services/api';

export default function MissionDetailsModal({ 
  mission, 
  isOpen, 
  onClose, 
  onUpdate, 
  onPrint 
}) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (mission) {
      setFormData({
        ...mission,
        cashAdvance: mission.cashAdvance || 0,
        fuelExpense: mission.fuelExpense || 0,
        fuelLiters: mission.fuelLiters || '',
        fuelPricePerLiter: mission.fuelPricePerLiter || FUEL_BENCHMARKS.defaultDieselPricePerLiter,
        fuelReceiptNumber: mission.fuelReceiptNumber || '',
        tollExpense: mission.tollExpense || 0,
        driverAllowance: mission.driverAllowance || 0,
        otherExpenses: mission.otherExpenses || 0,
        startOdometer: mission.startOdometer || 0,
        endOdometer: mission.endOdometer || '',
        notes: mission.notes || '',
        status: mission.status || 'assigned'
      });
    }
  }, [mission]);

  if (!isOpen || !formData) return null;

  // Calculate live remaining cash
  const totalSpent = 
    Number(formData.fuelExpense || 0) + 
    Number(formData.tollExpense || 0) + 
    Number(formData.driverAllowance || 0) + 
    Number(formData.otherExpenses || 0);

  const remainingCash = Number(formData.cashAdvance || 0) - totalSpent;

  // Calculate distance if end odometer is entered
  const calculatedDistance = formData.endOdometer && formData.startOdometer
    ? Math.max(0, Number(formData.endOdometer) - Number(formData.startOdometer))
    : (Number(formData.distanceKm) || 0);

  // Live Fuel Efficiency & Waste Calculation
  const fuelMetrics = calculateFuelEfficiencyMetrics({
    fuelLiters: formData.fuelLiters,
    distanceKm: calculatedDistance,
    vehicleType: formData.vehicleType,
    fuelExpense: formData.fuelExpense,
    fuelPricePerLiter: formData.fuelPricePerLiter
  });

  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate(formData.id, {
      ...formData,
      distanceKm: calculatedDistance,
      remainingCash,
      fuelLiters: formData.fuelLiters ? Number(formData.fuelLiters) : (fuelMetrics.hasData ? fuelMetrics.effectiveLiters : 0),
      fuelPricePerLiter: Number(formData.fuelPricePerLiter) || FUEL_BENCHMARKS.defaultDieselPricePerLiter,
      fuelReceiptNumber: formData.fuelReceiptNumber || '',
      fuelEfficiencyLitersPer100Km: fuelMetrics.litersPer100Km,
      kmPerLiter: fuelMetrics.kmPerLiter,
      fuelCostPerKm: fuelMetrics.costPerKm,
      fuelWasteCost: fuelMetrics.wasteCostEgp
    });
    onClose();
  };

  const statusSteps = [
    { key: 'draft', label: 'مسودة' },
    { key: 'assigned', label: 'تم التكليف' },
    { key: 'loading', label: 'جار التحميل' },
    { key: 'on_road', label: 'على الطريق' },
    { key: 'delivered', label: 'تم التسليم' },
    { key: 'completed', label: 'مكتملة ومغلقة' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === formData.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg">
              {formData.missionNumber}
            </span>
            <div>
              <h3 className="text-lg font-black m-0">{formData.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{formData.dispatchOrderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={generateWhatsAppMissionUrl(formData)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              title="إرسال بيانات المأمورية للسائق عبر واتساب 📲"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال واتساب للسائق</span>
            </a>
            <button
              onClick={() => onPrint(formData)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة إذن التشغيل</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Stepper */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-700 mb-3">مرحلة ومسار المأمورية</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {statusSteps.map((step, idx) => {
                const isSelected = formData.status === step.key;
                const isPassed = currentStepIndex >= idx;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleStatusChange(step.key)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-2'
                        : isPassed
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route & Driver Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
              {/* Route Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">خط السير والمخازن</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  formData.occupancyDays === 3 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : formData.occupancyDays === 2 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {formData.occupancyDays === 3 ? '🟣 إشغال 3 أيام' : formData.occupancyDays === 2 ? '🟡 إشغال يومين' : '🟢 إشغال نفس اليوم'}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    الانطلاق: {formData.originName}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    الوجهة: {formData.destinationName}
                  </span>
                </div>
              </div>

              {/* Schedule Formula Bar */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>نظام الرحلة: {formData.schedulePattern || 'حسب التكليف'}</span>
                  <span className="text-blue-700">المسافة: {calculatedDistance} كم</span>
                </div>
                <div className="text-slate-500 flex items-center justify-between">
                  <span>تاريخ الانطلاق: {formData.departureDate ? new Date(formData.departureDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}</span>
                  <span>العودة المتوقعة للجراج: <strong className="text-slate-800">{formData.expectedReturnDate ? new Date(formData.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}</strong></span>
                </div>
              </div>
            </div>

            {/* Driver & Truck Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">بيانات السائق والشاحنة</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">{formData.driverName}</span>
                  </div>
                  <a href={`tel:${formData.driverPhone}`} className="text-blue-600 font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {formData.driverPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">{formData.vehicleCode} - {formData.vehiclePlate}</span>
                  </div>
                  <span className="text-slate-500 font-semibold">{formData.vehicleType}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                الحمولة: <strong>{formData.cargoType}</strong> ({formData.cargoWeight})
              </div>
            </div>

          </div>

          {/* Odometer Tracker Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-blue-600" />
              قراءات العداد والمسافة المقطوعة (كيلومتر)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  عداد الانطلاق (بداية المأمورية)
                </label>
                <input
                  type="number"
                  value={formData.startOdometer}
                  onChange={e => setFormData({ ...formData, startOdometer: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  عداد العودة (نهاية المأمورية)
                </label>
                <input
                  type="number"
                  placeholder="سجل قراءة العداد عند العودة"
                  value={formData.endOdometer}
                  onChange={e => setFormData({ ...formData, endOdometer: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  إجمالي الكيلومترات المستهلكة
                </label>
                <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900">
                  {calculatedDistance} كم
                </div>
              </div>
            </div>
          </div>

          {/* Financials & Settlement Section */}
          <div className="bg-amber-500/10 border border-amber-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" />
                تسوية العهدة المالية والمصاريف الفعلية للرحلة (ج.م)
              </h4>
              <div className="text-xs font-bold">
                <span className="text-slate-600 ml-2">صافي المتبقي بالعهدة:</span>
                <span className={`px-2.5 py-1 rounded-lg font-mono font-black ${
                  remainingCash >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {remainingCash} ج.م
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  العهدة الأصلية المسلمة
                </label>
                <input
                  type="number"
                  value={formData.cashAdvance}
                  onChange={e => setFormData({ ...formData, cashAdvance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  سولار ووقود فعلي
                </label>
                <input
                  type="number"
                  value={formData.fuelExpense}
                  onChange={e => setFormData({ ...formData, fuelExpense: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  كارتات ورسوم موازين
                </label>
                <input
                  type="number"
                  value={formData.tollExpense}
                  onChange={e => setFormData({ ...formData, tollExpense: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  بدل سفر وإعاشة
                </label>
                <input
                  type="number"
                  value={formData.driverAllowance}
                  onChange={e => setFormData({ ...formData, driverAllowance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  نثريات وطوارئ
                </label>
                <input
                  type="number"
                  value={formData.otherExpenses}
                  onChange={e => setFormData({ ...formData, otherExpenses: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fuel Efficiency & Waste Control Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black m-0 text-white flex items-center gap-2 flex-wrap">
                    <span>رقابة استهلاك الوقود وترشيد تكلفة النقل</span>
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full">
                      جاهز للتفعيل (مجهز بالكامل)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                    حساب معدل الاستهلاك الفعلي (لتر / 100 كم) ومقارنته بالمعيار القياسي للشاحنة لكشف أي هدر
                  </p>
                </div>
              </div>

              {/* Benchmark Badge */}
              <div className="text-xs text-slate-300 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 self-start sm:self-auto">
                <span>المعيار القياسي ({formData.vehicleType || 'الشاحنة'}):</span>
                <strong className="text-amber-400 font-mono text-sm">
                  {fuelMetrics.standardRate} لتر / 100 كم
                </strong>
              </div>
            </div>

            {/* Inputs: Fuel Liters, Fuel Price, Receipt # */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  كمية السولار الفعلية (باللتر)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder={fuelMetrics.effectiveLiters ? `تلقائي: ~${fuelMetrics.effectiveLiters} لتر` : "أدخل اللترات"}
                  value={formData.fuelLiters || ''}
                  onChange={e => setFormData({ ...formData, fuelLiters: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-mono font-bold text-white placeholder:text-slate-500 focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {formData.fuelExpense > 0 && !formData.fuelLiters 
                    ? `محسوبة تقديرياً: ~${fuelMetrics.effectiveLiters} لتر من قيمة الفاتورة (${formData.fuelExpense} ج.م)` 
                    : 'حسب بونة ومضخة محطة الوقود'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  سعر لتر السولار المعتمد (ج.م)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.fuelPricePerLiter || FUEL_BENCHMARKS.defaultDieselPricePerLiter}
                  onChange={e => setFormData({ ...formData, fuelPricePerLiter: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-mono font-bold text-white focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">السعر الرسمي الحالي للسولار</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  رقم إيصال / بونة تموين المحطة
                </label>
                <input
                  type="text"
                  placeholder="رقم الفاتورة أو البونة"
                  value={formData.fuelReceiptNumber || ''}
                  onChange={e => setFormData({ ...formData, fuelReceiptNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">للأرشفة والمطابقة المحاسبية</span>
              </div>
            </div>

            {/* Live Efficiency & Waste Control Result */}
            {fuelMetrics.hasData ? (
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">تحليل كفاءة الاستهلاك:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${fuelMetrics.badgeClass}`}>
                      {fuelMetrics.statusLabel}
                    </span>
                  </div>

                  {fuelMetrics.wasteCostEgp > 0 && (
                    <div className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>هدر وقود مقدر: <strong className="font-mono">{fuelMetrics.wasteLiters} لتر</strong> (~{fuelMetrics.wasteCostEgp} ج.م)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">معدل الاستهلاك</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {fuelMetrics.litersPer100Km} لتر
                    </span>
                    <span className="text-[10px] text-slate-500 block">لكل 100 كم</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">المسافة لكل 1 لتر</span>
                    <span className="text-base font-black text-blue-400 font-mono">
                      {fuelMetrics.kmPerLiter} كم
                    </span>
                    <span className="text-[10px] text-slate-500 block">كيلومتر / لتر سولار</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">تكلفة الكيلومتر</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {fuelMetrics.costPerKm} ج.م
                    </span>
                    <span className="text-[10px] text-slate-500 block">وقود / كم</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">الانحراف عن المعيار</span>
                    <span className={`text-base font-black font-mono ${
                      fuelMetrics.variancePercent > 10 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {fuelMetrics.variancePercent > 0 ? `+${fuelMetrics.variancePercent}%` : `${fuelMetrics.variancePercent}%`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">المعيار ({fuelMetrics.standardRate} لتر)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>سيتم احتساب معدل الاستهلاك ونسبة الهدر فور إدخال مسافة الرحلة ومصروف السولار.</span>
                <span className="font-mono text-amber-400 text-[11px] font-bold">المعيار القياسي: {fuelMetrics.standardRate} لتر / 100 كم</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات المأمورية وتقرير السائق
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              placeholder="تسجيل أي ملاحظات متعلقة بالطريق، حالة الاستلام والتسليم بالمخزن الإقليمي..."
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onPrint(formData)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>طباعة إذن وسير المأمورية</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات والتسوية</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
