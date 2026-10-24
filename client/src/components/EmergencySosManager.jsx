import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  MessageCircle, 
  Locate, 
  X, 
  Truck, 
  User, 
  MapPin, 
  Package, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  BatteryMedium, 
  Clock, 
  Navigation
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';

const EMERGENCY_ISSUES = [
  'انفجار إطار الشاحنة (كاوتش) وتوقف بالكامل',
  'عطل ميكانيكي مفاجئ بالمحرك أو ناقل الحركة (الفتيس)',
  'نفاد الوقود أو عطل بطلمبة السولار',
  'سخونة زائدة أو كسر خرطوم الردياتير',
  'حادث سير أو تصادم على الطريق',
  'عطل كهربائي كامل بالمركبة',
  'توقف مفاجئ للفرامل أو عطل منظومة الهواء'
];

export default function EmergencySosManager({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // GPS State - Automatic & Mandatory
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'detecting' | 'success' | 'error'
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');

  // Form State
  const [issueType, setIssueType] = useState(EMERGENCY_ISSUES[0]);
  const [driverSafety, setDriverSafety] = useState('safe'); // 'safe' | 'injured'
  const [locationLandmark, setLocationLandmark] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(null);

  // Supervisor Contact Information
  const supervisorPhone = '01159700466';
  const supervisorName = 'م/ محمد ابراهيم ابوالمعاطى';
  const supervisorTitle = 'مدير ادارة الدعم والمتابعة';

  // Read driver & mission data automatically from active session / local storage
  const isDriver = currentUser?.role === 'driver';
  const driverObj = isDriver ? (currentUser?.driverData?.driver || currentUser) : null;
  const vehicleObj = currentUser?.driverData?.assignedVehicle || null;
  const activeMission = currentUser?.driverData?.activeMission || null;

  const driverName = driverObj?.name || (typeof window !== 'undefined' && localStorage.getItem('fleet_saved_driver_name')) || 'سائق بالأسطول';
  const driverPhone = driverObj?.phone || (typeof window !== 'undefined' && localStorage.getItem('fleet_saved_driver_phone')) || '';
  const vehicleCode = vehicleObj?.code || 'شاحنة أسطول النقل';
  const vehiclePlate = vehicleObj?.plateNumber || 'لوحات جاري قيدها';
  const vehicleType = vehicleObj?.type || 'شاحنة نقل بريدي';
  const missionNumber = activeMission?.missionNumber || 'مأمورية جارية';
  const missionRoute = activeMission?.destinationName ? `من المخزن الرئيسي إلى: ${activeMission.destinationName}` : 'خط سير بريدي رسمي';
  const cargoDescription = activeMission?.cargoDescription || activeMission?.cargoType || (activeMission ? 'طرود ومهمات بريدية مؤمنة' : 'شحنة بريدية رسمية');

  // Listen for open-emergency-sos events triggered from anywhere in the app
  useEffect(() => {
    const handleOpenSos = () => setIsOpen(true);
    window.addEventListener('open-emergency-sos', handleOpenSos);
    return () => window.removeEventListener('open-emergency-sos', handleOpenSos);
  }, []);

  // Trigger Automatic GPS detection whenever modal opens
  useEffect(() => {
    if (isOpen) {
      triggerAutomaticGps();
      detectBattery();
    } else {
      setGpsStatus('idle');
      setGpsCoords(null);
      setGpsAccuracy(null);
      setGpsErrorMsg('');
    }
  }, [isOpen]);

  // Battery detection if supported
  const detectBattery = () => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then(batt => {
        setBatteryLevel(Math.round(batt.level * 100));
      }).catch(() => {});
    }
  };

  // Immediate, Mandatory GPS Detection
  const triggerAutomaticGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsErrorMsg('خدمة تحديد المواقع (GPS) غير مدعومة على هذا الجهاز.');
      return;
    }

    setGpsStatus('detecting');
    setGpsErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const acc = Math.round(position.coords.accuracy || 0);

        setGpsCoords({ lat, lng });
        setGpsAccuracy(acc);
        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('error');
        let msg = 'تعذر التقاط الموقع. يرجى تفعيل الموقع (Location) في إعدادات الهاتف.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'تم رفض إذن تحديد الموقع. يرجى السماح للمتصفح بالوصول لموقعك بالـ GPS.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'استغرق تحديد الموقع وقتاً طويلاً. يرجى التأكد من تشغيل الـ GPS.';
        }
        setGpsErrorMsg(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Build Comprehensive Automated WhatsApp Distress URL
  const buildWhatsAppUrl = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const mapsLink = gpsCoords 
      ? `https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}` 
      : 'جاري التقاط الإحداثيات';

    const safetyText = driverSafety === 'safe' 
      ? '🟢 السائق وطاقم الشاحنة بحالة سليمة وبخير ولله الحمد' 
      : '🔴 تنبيه: يوجد مصابين أو حاجة ماسة لطوارئ طبية (إسعاف)';

    const msg = `🚨 *بلاغ استغاثة وطوارئ طريق عاجل — أسطول البريد المصري*
━━━━━━━━━━━━━━━━━━━━━
👤 *بيانات السائق (مسجلة آلياً):*
• الاسم: الأسطى / ${driverName}
• الهاتف: ${driverPhone || 'مسجل على المنظومة'}
• الحالة الصحية: ${safetyText}
${batteryLevel !== null ? `• شحن بطارية هاتف السائق: ${batteryLevel}% 🔋` : ''}

🚛 *بيانات الشاحنة والحمولة (مسجلة آلياً):*
• كود الشاحنة: *${vehicleCode}*
• رقم اللوحة المعدنية: *${vehiclePlate}*
• نوع المركبة: ${vehicleType}
• المأمورية الحالية: *${missionNumber}*
• خط السير: ${missionRoute}
• طبيعة الحمولة: ${cargoDescription}

⚠️ *تفاصيل العطل الطارئ:*
• نوع المشكلة: *${issueType}*
${locationLandmark ? `• علامة مميزة بالطريق: ${locationLandmark}\n` : ''}
📍 *الموقع الجغرافي الدقيق بالـ GPS (إلزامي):*
• رابط خرائط جوجل للموقع الفعلي:
${mapsLink}
${gpsAccuracy ? `• دقة الإحداثيات: في حدود ${gpsAccuracy} متر` : ''}

⏰ *توقيت الاستغاثة:*
${dateStr} — ${timeStr}

━━━━━━━━━━━━━━━━━━━━━
إلى: *${supervisorName}* (${supervisorTitle})
مرسل عبر: *منظومة تشغيل أسطول النقل — الهيئة القومية للبريد المصري*`;

    return `https://wa.me/20${supervisorPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      {/* 🚨 1. FLOATING SOS BUTTON — PERSISTENT ACROSS ALL PAGES AND SCREENS */}
      <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm rounded-full shadow-2xl shadow-rose-600/60 border-2 border-white/30 cursor-pointer transition-all transform hover:scale-105 active:scale-95 animate-pulse"
          title="استغاثة وطوارئ الطريق السريع"
          aria-label="استغاثة وطوارئ"
        >
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
          </span>
          <Radio className="w-4 h-4 text-white" />
          <span className="tracking-wide">استغاثة وطوارئ 🚨</span>
        </button>
      </div>

      {/* 🚨 2. COMPREHENSIVE AUTOMATED EMERGENCY SOS MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-5 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl text-white relative my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <span className="p-2.5 rounded-2xl bg-rose-500/20 text-2xl border border-rose-500/30">🚨</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white m-0">
                    مركز استغاثة وطوارئ الطريق السريع
                  </h3>
                  <span className="text-[11px] text-rose-300 font-bold block">
                    غرفة عمليات الدعم والمتابعة — البريد المصري
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. AUTOMATIC VEHICLE, DRIVER & MISSION DATA (READONLY / ZERO TYPING) */}
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold border-b border-slate-700/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>بيانات مأموريتك وشاحنتك المسجلة آلياً بالمنظومة:</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  تم الجلب تلقائياً ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    السائق المسجل:
                  </span>
                  <strong className="text-white font-bold block truncate mt-0.5">
                    الأسطى / {driverName}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{driverPhone}</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-400" />
                    الشاحنة واللوحة:
                  </span>
                  <strong className="text-amber-300 font-black block truncate mt-0.5">
                    {vehicleCode} {vehiclePlate ? `(${vehiclePlate})` : ''}
                  </strong>
                  <span className="text-[10px] text-slate-400 truncate block">{vehicleType}</span>
                </div>

                <div className="col-span-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700/50 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-emerald-400" />
                      المأمورية: <strong className="text-white mr-1">{missionNumber}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-amber-400" />
                      الحمولة: <strong className="text-amber-200 mr-1">{cargoDescription}</strong>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    {missionRoute}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ISSUE SELECTOR (KEPT AS REQUESTED) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>نوع المشكلة أو العطل الطارئ:</span>
              </label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white font-bold focus:border-rose-500 focus:outline-hidden"
              >
                {EMERGENCY_ISSUES.map((issue, idx) => (
                  <option key={idx} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. DRIVER SAFETY QUICK CHECK */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الحالة الصحية وسلامة السائق:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriverSafety('safe')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    driverSafety === 'safe'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🟢</span>
                  <span>سليم وبخير الحمد لله</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDriverSafety('injured')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    driverSafety === 'injured'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🔴</span>
                  <span>يوجد مصابين / إسعاف</span>
                </button>
              </div>
            </div>

            {/* 4. OPTIONAL ROAD LANDMARK */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم الطريق أو علامة مميزة تقريبية (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: طريق الإسكندرية الزراعي بعد بنها بـ 10 كم"
                value={locationLandmark}
                onChange={e => setLocationLandmark(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            {/* 5. AUTOMATIC & MANDATORY GPS DETECTION DISPLAY */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border-2 border-dashed border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <Locate className="w-4 h-4 text-blue-400" />
                  <span>تحديد الموقع الجغرافي بالأقمار الصناعية (إلزامي):</span>
                </span>
                
                {gpsStatus === 'detecting' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    جاري الالتقاط...
                  </span>
                )}
                {gpsStatus === 'success' && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم التحديد بنجاح ✓
                  </span>
                )}
                {gpsStatus === 'error' && (
                  <button
                    type="button"
                    onClick={triggerAutomaticGps}
                    className="text-[11px] font-bold text-rose-400 underline cursor-pointer"
                  >
                    إعادة المحاولة
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              {gpsStatus === 'detecting' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-bold flex items-center justify-center gap-2">
                  <Locate className="w-4 h-4 animate-spin text-amber-400" />
                  <span>جاري قراءة إحداثيات موقعك عبر الأقمار الصناعية (GPS) تلقائياً...</span>
                </div>
              )}

              {gpsStatus === 'success' && gpsCoords && (
                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-300 font-mono bg-slate-900 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <span>خط العرض: {gpsCoords.lat} | خط الطول: {gpsCoords.lng}</span>
                    <span className="text-[10px] text-slate-400">دقة: {gpsAccuracy} متر</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 justify-center pt-0.5"
                  >
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>معاينة الموقع الفعلي على خرائط Google Maps</span>
                  </a>
                </div>
              )}

              {gpsStatus === 'error' && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <p className="font-bold">⚠️ {gpsErrorMsg}</p>
                  <p className="text-[10px] text-slate-400 mt-1">تأكد من تشغيل (Location) في شريط إشعارات الهاتف ثم اضغط إعادة المحاولة.</p>
                </div>
              )}
            </div>

            {/* 6. ACTION BUTTONS: WHATSAPP (MANDATORY GPS) + DIRECT PHONE CALL */}
            <div className="space-y-2 pt-1">
              
              {/* WhatsApp Button (Locked if no GPS) */}
              {gpsStatus === 'success' ? (
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/40 transition-all cursor-pointer animate-pulse"
                >
                  <MessageCircle className="w-5 h-5 text-amber-300" />
                  <span>إرسال البلاغ فوراً لمشرف العمليات عبر واتساب 📲</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                  <span>
                    {gpsStatus === 'detecting'
                      ? 'جاري التقاط إحداثيات الموقع لإرسال البلاغ (إلزامي)...'
                      : 'يرجى تحديد الموقع الجغرافي لتفعيل إرسال الواتساب'}
                  </span>
                </button>
              )}

              {/* One-Tap Direct Call Option */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${supervisorPhone}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>اتصال صوتي فوري بالمشرف ({supervisorPhone})</span>
                </a>

                <a
                  href="tel:136"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-black flex items-center justify-center gap-1.5"
                  title="طوارئ المرور السريع"
                >
                  <span>طوارئ المرور 136</span>
                </a>
              </div>

            </div>

            {/* Official Postal Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span>المشرف المسؤول:</span>
                <strong className="text-white">{supervisorName}</strong>
              </span>
              <span>قطاع النقل والمخازن • البريد المصري</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
