import React from 'react';
import { Printer, X, Truck, ShieldCheck, Calendar, MapPin, User, FileText, CheckCircle } from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';

export default function PrintableTripSheet({ mission, drivers = [], vehicles = [], warehouses = [], onClose }) {
  if (!mission) return null;

  const driver = drivers.find(d => d.id === mission.driverId);
  const vehicle = vehicles.find(v => v.id === mission.vehicleId);
  const origin = warehouses.find(w => w.id === mission.originId);
  const destination = warehouses.find(w => w.id === mission.destinationId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">معاينة أمر التشغيل والمأمورية الرسمية للطباعة</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند الآن (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-trip-sheet" className="p-8 md:p-10 text-slate-900 bg-white font-sans">
          
          {/* Header */}
          <div className="border-b-2 border-emerald-900 pb-5 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <EgyptPostLogo 
                variant="dark"
                subtitle="قطاع الدعم والعمليات اللوجستية"
              />
              <div className="border-r-2 border-slate-300 pr-4 space-y-0.5">
                <h1 className="text-base font-black text-slate-900 m-0">الهيئة القومية للبريد المصري</h1>
                <p className="text-xs text-emerald-800 font-bold">إدارة الدعم والمتابعة — إدارة حركة وتوزيع الأسطول</p>
                <p className="text-[11px] text-slate-500">المخزن الرئيسي بالتجمع الخامس • جراج شبرا المركزي</p>
              </div>
            </div>

            <div className="text-left font-mono space-y-1">
              <div className="border-2 border-emerald-900 px-4 py-1.5 rounded-lg bg-emerald-50 text-center">
                <span className="text-[10px] text-emerald-800 font-bold block">رقم أمر التشغيل والمأمورية</span>
                <span className="text-base font-black text-slate-950">{mission.missionNumber}</span>
              </div>
              <span className="text-[11px] text-slate-600 block text-right mt-1 font-sans">
                تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center mb-6 bg-gradient-to-r from-emerald-50 via-slate-100 to-emerald-50 py-2.5 border-y-2 border-emerald-800">
            <h2 className="text-base font-black tracking-wide text-slate-900 m-0">
              أمر تشغيل ومأمورية سير شاحنة رسمية — بريد مصر
            </h2>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            
            {/* Truck Details */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 m-0 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-700" />
                بيانات الشاحنة والمركبة
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>كود السيارة: <strong>{mission.vehicleCode}</strong></div>
                <div>رقم اللوحة: <strong>{mission.vehiclePlate}</strong></div>
                <div>نوع السيارة: <strong>{mission.vehicleType}</strong></div>
                <div>الموديل: <strong>{vehicle ? vehicle.model : '---'}</strong></div>
                <div>قراءة العداد عند الانطلاق: <strong>{mission.startOdometer || 0} كم</strong></div>
                <div>حالة السيارة: <strong>تم الفحص الفني قبل التحرك</strong></div>
              </div>
            </div>

            {/* Driver Details */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 m-0 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-700" />
                بيانات السائق المكلف
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>اسم السائق: <strong>{mission.driverName}</strong></div>
                <div>رقم الهاتف: <strong>{mission.driverPhone}</strong></div>
                <div>الرقم القومي: <strong>{driver ? driver.nationalId : '---'}</strong></div>
                <div>رقم الرخصة: <strong>{driver ? driver.licenseNumber : '---'}</strong></div>
                <div>انتهاء الرخصة: <strong>{driver ? driver.licenseExpiry : '---'}</strong></div>
                <div>التصنيف: <strong>{driver ? driver.role : 'سائق معتمد'}</strong></div>
              </div>
            </div>

          </div>

          {/* Route & Warehouses */}
          <div className="border border-slate-300 rounded-xl p-4 mb-6 space-y-3">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 m-0 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-700" />
              بيانات خط السير ومحطات الوصول
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900">نقطة الانطلاق (جهة التحميل):</div>
                <div className="font-bold text-slate-900">{mission.originName}</div>
                <div className="text-[11px] text-slate-500">{origin ? origin.address : ''}</div>
                <div className="text-[11px] text-slate-600">المسؤول: {origin ? origin.manager : ''} ({origin ? origin.phone : ''})</div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-900">نقطة الوصول (المخزن الإقليمي):</div>
                <div className="font-bold text-slate-900">{mission.destinationName}</div>
                <div className="text-[11px] text-slate-500">{destination ? destination.address : ''}</div>
                <div className="text-[11px] text-slate-600">المسؤول: {destination ? destination.manager : ''} ({destination ? destination.phone : ''})</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1 text-slate-700">
              <div>تاريخ ووقت التحرك: <strong>{mission.departureDate ? new Date(mission.departureDate).toLocaleString('ar-EG') : '---'}</strong></div>
              <div>المسافة المقدرة: <strong>{mission.distanceKm || '---'} كم</strong></div>
              <div>موعد الوصول للمخزن: <strong>{mission.expectedArrival ? new Date(mission.expectedArrival).toLocaleString('ar-EG') : '---'}</strong></div>
            </div>

            {/* Official Operating Schedule */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>معادلة خط السير: <strong className="text-blue-900">{mission.schedulePattern || 'حسب التكليف'}</strong></span>
                <span>مدة إشغال الشاحنة: <strong className="text-slate-900">{mission.occupancyDays || 1} {mission.occupancyDays === 1 ? 'يوم' : mission.occupancyDays === 2 ? 'يومان' : 'أيام'}</strong></span>
                <span>تاريخ العودة المتوقع للجراج: <strong className="text-emerald-900">{mission.expectedReturnDate ? new Date(mission.expectedReturnDate).toLocaleString('ar-EG') : '---'}</strong></span>
              </div>
              <div className="text-[11px] text-slate-600">
                {mission.occupancyDays === 3 && '• خط سير سوهاج: اليوم الأول سفر وانتقال (495 كم) - اليوم الثاني راحة السائق وتفريغ بمخزن الكوثر - اليوم الثالث رحلة العودة.'}
                {mission.occupancyDays === 2 && '• خط سير المنيا الجديدة: اليوم الأول سفر وتفريغ ومبيت - اليوم الثاني رحلة العودة وتسليم السيارة.'}
                {mission.occupancyDays === 1 && '• خط سير الغربية (القرشية): ذهاب وتفريغ بالمخزن الإقليمي والعودة في نفس اليوم.'}
              </div>
            </div>
          </div>

          {/* Cargo & Financial Advance Table */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            
            {/* Cargo Box */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 m-0">
                بيانات الحمولة والبضاعة
              </h3>
              <div className="space-y-1.5 text-xs">
                <div>رقم إذن الصرف / البوليصة: <strong>{mission.dispatchOrderNumber}</strong></div>
                <div>وصف البضاعة: <strong>{mission.cargoType}</strong></div>
                <div>وزن / حجم الحمولة: <strong>{mission.cargoWeight}</strong></div>
                <div className="text-[11px] text-slate-500">حالة الشحنة: مغلفة ومطابقة لأمر التحميل المخزني</div>
              </div>
            </div>

            {/* Financial Advance Box */}
            <div className="border border-slate-300 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-black text-slate-800 border-b border-slate-200 pb-1 m-0">
                العهدة المالية المسلمة للسائق
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>إجمالي العهدة النقدية:</span>
                  <strong className="text-slate-900 font-mono">{mission.cashAdvance} جنيه مصري</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>سولار ووقود:</span>
                  <span className="font-mono">{mission.fuelExpense || 0} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>كارتات ورسوم طرق:</span>
                  <span className="font-mono">{mission.tollExpense || 0} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>بدل سفر وإعاشة:</span>
                  <span className="font-mono">{mission.driverAllowance || 0} ج.م</span>
                </div>
              </div>
            </div>

          </div>

          {/* Official Signatures Matrix & Approval Box */}
          <div className="border-t-2 border-emerald-900 pt-5 mt-8 space-y-6">
            <div className="text-xs font-bold text-slate-700 text-center">
              إقرار رسمي بالاستلام والتسليم ومطابقة الشروط واللوائح الفنية لحركة سيارات البريد المصري
            </div>

            {/* Operating Roles Signatures */}
            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              <div className="space-y-6 border-l border-slate-200 pl-2">
                <div className="font-bold text-slate-900">مسؤول الحركة والتشغيل</div>
                <div className="text-[11px] text-slate-400">التوقيع: .....................</div>
              </div>

              <div className="space-y-6 border-l border-slate-200 pl-2">
                <div className="font-bold text-slate-900">أمين المخزن الرئيسي (المسلّم)</div>
                <div className="text-[11px] text-slate-400">التوقيع: .....................</div>
              </div>

              <div className="space-y-6 border-l border-slate-200 pl-2">
                <div className="font-bold text-slate-900">السائق المستلم للحمولة</div>
                <div className="text-[11px] text-slate-400">التوقيع: .....................</div>
              </div>

              <div className="space-y-6">
                <div className="font-bold text-slate-900">أمين المخزن الإقليمي (المستلم)</div>
                <div className="text-[11px] text-slate-400">التوقيع: .....................</div>
              </div>
            </div>

            {/* High Level Approval & Endorsement by Director */}
            <div className="mt-6 p-4 rounded-xl border-2 border-emerald-800 bg-emerald-50/50 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  اعتماد ومتابعة أمر التشغيل:
                </span>
                <span className="text-sm font-black text-slate-950">
                  م/ محمد ابراهيم ابوالمعاطى
                </span>
                <span className="text-xs text-emerald-900 font-bold block">
                  مدير ادارة الدعم والمتابعة — الهيئة القومية للبريد المصري
                </span>
              </div>

              <div className="text-center font-mono text-xs border border-emerald-700/40 bg-white px-4 py-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">هاتف الدعم المباشر</span>
                <strong className="text-slate-900 font-bold text-sm">01159700466</strong>
              </div>

              <div className="text-left">
                <span className="text-[10px] text-slate-500 block">خاتم وتوقيع الاعتماد</span>
                <span className="text-xs text-slate-400 inline-block mt-3 border-b border-dashed border-slate-400 w-32 text-center">
                  ................................
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <span>
              وثيقة مأمورية رسمية صادرة آلياً من منظومة إدارة أسطول النقل والمخازن الإقليمية — الهيئة القومية للبريد المصري.
            </span>
            <span className="font-semibold text-slate-700">
              تصميم وإشراف: م/ محمد ابراهيم ابوالمعاطى
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
