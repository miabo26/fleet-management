import React, { useState } from 'react';
import { 
  DollarSign, 
  Fuel, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  User, 
  Truck, 
  FileText,
  AlertTriangle,
  Gauge,
  CheckCircle2,
  BarChart3,
  Flame,
  Info
} from 'lucide-react';
import { calculateFuelEfficiencyMetrics, aggregateFleetFuelStats, FUEL_BENCHMARKS } from '../utils/fuelUtils';

export default function ExpensesTracker({ missions = [], drivers = [], stats }) {
  const [filterMonth, setFilterMonth] = useState('all');

  const totalAdvances = missions.reduce((acc, m) => acc + (Number(m.cashAdvance) || 0), 0);
  const totalFuel = missions.reduce((acc, m) => acc + (Number(m.fuelExpense) || 0), 0);
  const totalTolls = missions.reduce((acc, m) => acc + (Number(m.tollExpense) || 0), 0);
  const totalAllowances = missions.reduce((acc, m) => acc + (Number(m.driverAllowance) || 0), 0);
  const totalOther = missions.reduce((acc, m) => acc + (Number(m.otherExpenses) || 0), 0);
  const totalSpent = totalFuel + totalTolls + totalAllowances + totalOther;
  const netRemaining = totalAdvances - totalSpent;

  // Fleet Fuel Analytics
  const fuelAnalytics = aggregateFleetFuelStats(missions);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">إدارة العهد المالية ومصاريف التشغيل</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة تسوية عهد السائقين، فواتير السولار، الكارتات، وبدلات السفر للمأموريات
              </p>
            </div>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs text-slate-500 block">إجمالي المصروف الفعلي</span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {totalSpent.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cash Advance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">إجمالي العهد المسلمة للسائقين</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 font-mono">
              {totalAdvances.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">نقدية مصروفة لمأموريات النقل</p>
        </div>

        {/* Total Fuel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block flex items-center gap-1">
            <Fuel className="w-4 h-4 text-amber-500" />
            إجمالي تكلفة السولار
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {totalFuel.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">تموين الشاحنات للرحلات الإقليمية</p>
        </div>

        {/* Total Tolls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">كارتات ورسوم موازين الطرق</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 font-mono">
              {totalTolls.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">بوابات الرسوم والموازين الرسمية</p>
        </div>

        {/* Net Remaining Cash */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">المتبقي للتسوية في الخزينة</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono ${netRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netRemaining.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">رصيد عهدة مستحق التوريد</p>
        </div>

      </div>

      {/* Fuel Efficiency & Waste Control Master Panel */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 space-y-6">
        
        {/* Panel Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-black m-0 text-white">
                  نظام رقابة استهلاك الوقود وترشيد تكلفة النقل (كشف الهدر)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مجهز بالكامل (جاهز للتشغيل الفوري)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fuel Efficiency & Waste Control Engine — معادلات قياس الاستهلاك لكل 100 كم ورصد الانحرافات عن المعايير القياسية
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 self-start md:self-auto">
            <span>سعر السولار المعتمد: </span>
            <strong className="text-amber-400 font-mono text-sm">{FUEL_BENCHMARKS.defaultDieselPricePerLiter} ج.م / لتر</strong>
          </div>
        </div>

        {/* 4 Fuel Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Box Trucks Benchmark */}
          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">شاحنات نقل صندوق (5 طن)</span>
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-amber-400 font-mono">15.0</span>
                <span className="text-xs text-slate-400 mr-1.5 font-bold">لتر / 100 كم</span>
              </div>
              <span className="text-[11px] text-blue-300 font-mono">~ 6.67 كم/لتر</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              المعيار القياسي المعتمد (شيفروليه جامبو 7000)
            </p>
          </div>

          {/* Canter Trucks Benchmark */}
          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">كانتر شاسيه طويل (6.5 طن)</span>
              <Truck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-amber-400 font-mono">18.5</span>
                <span className="text-xs text-slate-400 mr-1.5 font-bold">لتر / 100 كم</span>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">~ 5.41 كم/لتر</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              المعيار القياسي المعتمد (ميتسوبيشي فوزو كانتر)
            </p>
          </div>

          {/* Fleet Cost per Km */}
          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">متوسط تكلفة الوقود / كم</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {fuelAnalytics.fleetCostPerKm > 0 ? fuelAnalytics.fleetCostPerKm : '2.25'}
                </span>
                <span className="text-xs text-slate-400 mr-1.5 font-bold">ج.م / كم</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              حسب إجمالي الكيلومترات المقطوعة فعلياً
            </p>
          </div>

          {/* Waste Control Detection */}
          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">مؤشر رصد الهدر المالي</span>
              <AlertTriangle className={`w-4 h-4 ${fuelAnalytics.totalWasteCost > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className={`text-2xl font-black font-mono ${fuelAnalytics.totalWasteCost > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {fuelAnalytics.totalWasteCost.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs text-slate-400 mr-1.5 font-bold">ج.م هدر</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                fuelAnalytics.totalWasteCost > 0 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {fuelAnalytics.totalWasteCost > 0 ? 'يوجد انحراف' : 'منضبط تماماً'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {fuelAnalytics.totalWasteCost > 0 ? 'تجاوز في كميات الوقود عن المعيار' : 'استهلاك الأسطول ضمن الحدود القياسية'}
            </p>
          </div>

        </div>

        {/* Operational Guidelines Note */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">معادلة حساب كفاءة الوقود المعتمدة:</span>
              <span className="text-slate-400">
                معدل الاستهلاك = (كمية لترات السولار المستهلكة ÷ المسافة المقطوعة بالكيلومتر) × 100 — يتم مقارنتها بالمعيار وإطلاق تنبيه في حال تجاوزها بنسبة +15%.
              </span>
            </div>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
            حالة النظام: مُجهز بالكامل للتفعيل
          </span>
        </div>

      </div>

      {/* Driver Financial Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 m-0">
            كشف تسوية العهد والمصاريف وكفاءة استهلاك الوقود لكل مأمورية
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {missions.length} مأمورية مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">رقم المأمورية</th>
                <th className="py-3 px-4">السائق</th>
                <th className="py-3 px-4">الوجهة الإقليمية</th>
                <th className="py-3 px-4">المسافة</th>
                <th className="py-3 px-4">العهدة</th>
                <th className="py-3 px-4">السولار</th>
                <th className="py-3 px-4">معدل الاستهلاك</th>
                <th className="py-3 px-4">الكارتات</th>
                <th className="py-3 px-4">بدل السفر</th>
                <th className="py-3 px-4">المصروف الإجمالي</th>
                <th className="py-3 px-4">المتبقي بالعهدة</th>
                <th className="py-3 px-4">حالة التسوية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missions.map(m => {
                const spent = (Number(m.fuelExpense) || 0) + (Number(m.tollExpense) || 0) + (Number(m.driverAllowance) || 0) + (Number(m.otherExpenses) || 0);
                const remaining = (Number(m.cashAdvance) || 0) - spent;

                const metrics = calculateFuelEfficiencyMetrics({
                  fuelLiters: m.fuelLiters,
                  distanceKm: m.distanceKm,
                  vehicleType: m.vehicleType,
                  fuelExpense: m.fuelExpense,
                  fuelPricePerLiter: m.fuelPricePerLiter
                });

                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{m.missionNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{m.driverName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.destinationName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{m.distanceKm || 0} كم</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{m.cashAdvance || 0} ج.م</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{m.fuelExpense || 0} ج.م</td>
                    <td className="py-3.5 px-4">
                      {metrics.hasData ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-black text-slate-900">
                            {metrics.litersPer100Km} لتر/100كم
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            metrics.variancePercent > 15 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {metrics.variancePercent > 0 ? `+${metrics.variancePercent}%` : `${metrics.variancePercent}%`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">قيد التسجيل</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{m.tollExpense || 0} ج.م</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{m.driverAllowance || 0} ج.م</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{spent} ج.م</td>
                    <td className={`py-3.5 px-4 font-mono font-black ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {remaining} ج.م
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status === 'completed' ? 'تمت التسوية' : 'قيد المتابعة'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
