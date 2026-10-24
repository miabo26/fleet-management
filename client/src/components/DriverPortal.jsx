import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Award, 
  LogOut, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  FileText,
  AlertCircle,
  X,
  Send,
  Star,
  Locate,
  PhoneCall
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';
import { 
  fetchDriverPortalMe, 
  updateDriverMissionStatus, 
  reportDriverEmergency 
} from '../services/api';

export default function DriverPortal({ 
  driverData, 
  onLogout, 
  theme = 'dark',
  onToggleTheme 
}) {
  const [data, setData] = useState(driverData);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  
  // Emergency report modal state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    issueType: 'عطل ميكانيكي مفاجئ',
    description: '',
    location: ''
  });
  const [emergencySending, setEmergencySending] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Quick GPS Detector for roadside emergencies
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('خدمة الـ GPS غير مدعومة على هذا المتصفح');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setEmergencyForm(prev => ({
          ...prev,
          location: `${prev.location ? prev.location + ' | ' : ''}موقع GPS: ${mapsUrl}`
        }));
      },
      (err) => {
        setIsDetectingGps(false);
        alert('تعذر جلب إحداثيات GPS: تأكد من تفعيل خدمة الموقع في الهاتف');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const driver = data?.driver;
  const assignedVehicle = data?.assignedVehicle;
  const activeMission = data?.activeMission;
  const recentMissions = data?.recentMissions || [];
  const supervisor = data?.supervisor || {
    name: 'م/ محمد ابراهيم ابوالمعاطى',
    title: 'مدير ادارة الدعم والمتابعة',
    phone: '01159700466',
    whatsappUrl: 'https://wa.me/201159700466'
  };

  // Refresh live driver portal data
  const refreshData = async () => {
    if (!driver?.id) return;
    try {
      setLoading(true);
      const res = await fetchDriverPortalMe(driver.id);
      setData(res);
    } catch (err) {
      console.error('Error refreshing driver data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle mission status update by driver
  const handleStatusChange = async (newStatus) => {
    if (!activeMission) return;
    const confirmMsg = newStatus === 'on_road' 
      ? 'هل أنت جاهز لبدء التحرك على الطريق؟ سيتم إشعار إدارة الحركة فوراً.' 
      : 'هل تم الوصول للمخزن وتفريغ الشحنة وتسليم العهدة بنجاح؟';
    
    if (!confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await updateDriverMissionStatus(activeMission.id, driver.id, newStatus);
      setActionSuccess(newStatus === 'on_road' ? 'تم تسجيل انطلاقك على الطريق بالسلامة 🚚' : 'تم تسجيل وصولك وتفريغ الشحنة بنجاح 📦');
      setTimeout(() => setActionSuccess(''), 5000);
      await refreshData();
    } catch (err) {
      alert(err.message || 'فشل تحديث الحالة');
    } finally {
      setLoading(false);
    }
  };

  // Handle emergency issue report
  const handleSendEmergency = async (e) => {
    e.preventDefault();
    if (!emergencyForm.description.trim()) {
      alert('يرجى وصف المشكلة أو العطل');
      return;
    }

    try {
      setEmergencySending(true);
      await reportDriverEmergency(
        driver.id,
        assignedVehicle?.id || null,
        activeMission?.id || null,
        emergencyForm.issueType,
        emergencyForm.description,
        emergencyForm.location || 'على طريق السير'
      );
      setIsEmergencyModalOpen(false);
      setEmergencyForm({ issueType: 'عطل ميكانيكي مفاجئ', description: '', location: '' });
      setActionSuccess('تم إرسال البلاغ الطارئ لإدارة الحركة والدعم الفني بنجاح!');
      setTimeout(() => setActionSuccess(''), 6000);
    } catch (err) {
      alert(err.message || 'فشل إرسال البلاغ');
    } finally {
      setEmergencySending(false);
    }
  };

  const isDriverOnLeave = driver?.status === 'إجازة' || driver?.status === 'اجازة';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white" dir="rtl">
      
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EgyptPostLogo className="h-8" variant="light" />
            <div>
              <h1 className="text-xs font-black text-white m-0">بوابة السائق الذكية</h1>
              <span className="text-[10px] text-emerald-400 font-bold">الهيئة القومية للبريد المصري</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-12">
        
        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Driver Profile Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xl shadow-inner">
                {driver?.name ? driver.name.charAt(0) : 'س'}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">مرحباً بك،</span>
                <h2 className="text-base font-black text-white m-0">الأسطى / {driver?.name}</h2>
                <span className="text-xs text-emerald-400 font-bold block mt-0.5">{driver?.role || 'سائق بالأسطول'}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isDriverOnLeave 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : activeMission 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isDriverOnLeave ? '🏖️ في إجازة رسمية' : activeMission ? '🚛 في مأمورية' : '🟢 متاح للتشغيل'}
              </span>
              <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-[11px] text-white">5.0</span>
              </div>
            </div>
          </div>

          {/* Assigned Truck Pill */}
          {assignedVehicle && (
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] block">الشاحنة المخصصة:</span>
                  <span className="font-black text-white">{assignedVehicle.code} — {assignedVehicle.type}</span>
                </div>
              </div>
              <span className="font-mono text-emerald-400 font-black bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                {assignedVehicle.plateNumber || 'بدون لوحات'}
              </span>
            </div>
          )}
        </div>

        {/* Leave Status Notice */}
        {isDriverOnLeave && (
          <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 p-5 rounded-3xl border border-purple-500/30 text-center space-y-2">
            <span className="text-3xl block">🏖️</span>
            <h3 className="text-sm font-black text-purple-200 m-0">أنت في إجازة رسمية معتمدة</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              شاحنتك محجوبة تلقائياً حتى عودتك بالسلامة. نتمنى لك قضاء وقت ممتع!
            </p>
          </div>
        )}

        {/* ACTIVE MISSION CARD (IF ASSIGNED) */}
        {!isDriverOnLeave && activeMission ? (
          <div className="bg-gradient-to-br from-slate-900 to-blue-950/60 p-5 rounded-3xl border-2 border-blue-500/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Mission Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                  المأمورية المكلف بها حالياً
                </span>
                <h3 className="text-base font-black text-white m-0 mt-0.5">
                  {activeMission.title}
                </h3>
                <span className="text-xs font-mono text-slate-400 block mt-0.5">
                  كود: <strong className="text-white">{activeMission.missionNumber}</strong>
                </span>
              </div>

              <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border shrink-0 ${
                activeMission.status === 'on_road'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
              }`}>
                {activeMission.status === 'on_road' ? 'على الطريق 🚚' : 'جاهزة للتحرك 📋'}
              </span>
            </div>

            {/* Route & Destination with GOOGLE MAPS DIRECT NAVIGATION */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-400">الانطلاق:</span>
                <strong className="text-white">{activeMission.originName || 'المخزن الرئيسي بالتجمع'}</strong>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400">الوجهة:</span>
                <strong className="text-emerald-300">{activeMission.destinationName}</strong>
              </div>

              {/* ONE-CLICK GOOGLE MAPS NAVIGATION BUTTON */}
              {activeMission.destinationGoogleMapsUrl ? (
                <a
                  href={activeMission.destinationGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 text-xs sm:text-sm transition-all"
                >
                  <Navigation className="w-4 h-4 animate-pulse" />
                  <span>فتح المسار والملاحة في Google Maps 🗺️</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : null}
            </div>

            {/* Mission Financials & Cargo Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">العهدة النقدية المسلمة:</span>
                <strong className="text-emerald-400 font-mono text-sm">{activeMission.cashAdvance || 0} ج.م</strong>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">مدة إشغال الرحلة:</span>
                <strong className="text-amber-300 text-xs">
                  {activeMission.occupancyDays === 1 ? 'نفس اليوم 🟢' : activeMission.occupancyDays === 2 ? 'يومان 🟡' : '3 أيام 🟣'}
                </strong>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">طبيعة الحمولة:</span>
                <strong className="text-white">{activeMission.cargoType || 'مهمات بريدية'}</strong>
              </div>
              {activeMission.dispatchOrderNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">إذن الصرف:</span>
                  <span className="font-mono text-slate-300">{activeMission.dispatchOrderNumber}</span>
                </div>
              )}
            </div>

            {/* Mission Action Buttons */}
            <div className="space-y-2 pt-1">
              {activeMission.status !== 'on_road' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('on_road')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Truck className="w-5 h-5" />
                  <span>بدء التحرك والانطلاق على الطريق 🚚</span>
                </button>
              )}

              {activeMission.status === 'on_road' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('delivered')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم الوصول للمخزن وتفريغ الشحنة بنجاح 📦</span>
                </button>
              )}

              {/* Emergency / Breakdown Report Button */}
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>إبلاغ عن عطل طارئ / طلب مساعدة عاجلة ⚠️</span>
              </button>
            </div>

          </div>
        ) : !isDriverOnLeave ? (
          /* NO ACTIVE MISSION */
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-white m-0">أنت متاح للتشغيل حالياً</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              لا توجد مأمورية جارية مسندة إليك في هذا الوقت. سيتم إشعارك فور تكليفك برحلة جديدة من قبل إدارة الحركة.
            </p>
          </div>
        ) : null}

        {/* Supervisor Hotline Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Award className="w-4 h-4" />
            <span>مشرف ومسؤول المتابعة والدعم الفني:</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-sm text-white block">{supervisor.name}</strong>
              <span className="text-[11px] text-slate-400">{supervisor.title}</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400" dir="ltr">
              {supervisor.phone}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${supervisor.phone}`}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال هاتفي</span>
            </a>

            <a
              href={supervisor.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </a>
          </div>
        </div>

        {/* Recent Missions History */}
        {recentMissions.length > 0 && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">سجل مأمورياتك السابقة</span>
              <span className="text-[10px] text-emerald-400 font-bold">{recentMissions.length} رحلة</span>
            </div>

            <div className="divide-y divide-slate-800">
              {recentMissions.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white block text-[11px]">{m.destinationName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{m.missionNumber} • {m.cargoType}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    مكتملة ومغلقة ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING PERSISTENT EMERGENCY SOS BUTTON (ALWAYS VISIBLE FOR ROADSIDE BREAKDOWNS) */}
      <div className="fixed bottom-5 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsEmergencyModalOpen(true)}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-2xl shadow-rose-600/50 border-2 border-rose-400/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse"
        >
          <span className="text-base">🚨</span>
          <span>طوارئ وعطل مفاجئ</span>
        </button>
      </div>

      {/* EMERGENCY BREAKDOWN MODAL */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-sm space-y-4 shadow-2xl text-white">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black text-white m-0">استغاثة وعطل طارئ على الطريق</h3>
              </div>
              <button 
                onClick={() => setIsEmergencyModalOpen(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Phone Call Button */}
            <a
              href="tel:01159700466"
              className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-between shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>اتصال مباشر: م/ محمد ابوالمعاطى</span>
              </div>
              <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-400/30 font-bold" dir="ltr">
                01159700466
              </span>
            </a>

            <form onSubmit={handleSendEmergency} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع العطل / المشكلة:</label>
                <select
                  value={emergencyForm.issueType}
                  onChange={e => setEmergencyForm({ ...emergencyForm, issueType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="عطل ميكانيكي مفاجئ">عطل ميكانيكي مفاجئ (موتور / فتيس)</option>
                  <option value="انفجار أو عطل إطار (كاوتش)">انفجار أو عطل إطار (كاوتش)</option>
                  <option value="عطل كهربائي / بطارية">عطل كهربائي / بطارية</option>
                  <option value="نقص أو مشكلة في السولار">نقص أو مشكلة في السولار</option>
                  <option value="حادث أو توقف أمني على الطريق">حادث أو توقف أمني على الطريق</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">الموقع الحالي على الطريق:</label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="text-[10px] text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Locate className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'جاري التحديد...' : 'تحديد موقعي GPS 📍'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="مثال: طريق الصعيد الصحراوي قبل بني سويف بـ 20 كم"
                  value={emergencyForm.location}
                  onChange={e => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تفاصيل العطل وما تحتاجه:</label>
                <textarea
                  required
                  rows={2}
                  placeholder="صف ما حدث بالضبط وحالة السيارة..."
                  value={emergencyForm.description}
                  onChange={e => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Direct WhatsApp Emergency link */}
              <a
                href={(() => {
                  const now = new Date();
                  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  const text = `🚨 *بلاغ استغاثة وعطل طارئ على الطريق* 🚨
━━━━━━━━━━━━━━━━━━━━━
🏢 *الهيئة القومية للبريد المصري*
🚚 *قطاع تشغيل وحركة الأسطول — غرفة العمليات والطوارئ*
━━━━━━━━━━━━━━━━━━━━━

👤 *بيانات السائق المُبلّغ:*
• الاسم: الأسطى / ${driver?.name || 'سائق بالأسطول'}
• الهاتف: ${driver?.phone || '01xxxxxxxxx'}

🚛 *بيانات الشاحنة والحمولة:*
• الشاحنة: ${assignedVehicle?.code || 'شاحنة الأسطول'} (${assignedVehicle?.type || ''})
• رقم اللوحات: ${assignedVehicle?.plateNumber || 'لوحات النقل الرسمية'}
• نوع الحمولة: ${activeMission?.cargoType || 'مهمات ومطبوعات بريدية رسمية'}

📍 *بيانات خط السير والمأمورية:*
• رقم المأمورية: ${activeMission?.missionNumber || 'مأمورية جارية'}
• خط السير: من [${activeMission?.originName || 'المخزن الرئيسي بالتجمع'}] إلى [${activeMission?.destinationName || 'المخزن الإقليمي'}]
• العهدة النقدية: ${activeMission?.cashAdvance || 0} ج.م

⚠️ *تفاصيل البلاغ والعطل الميداني:*
• نوع المشكلة: ${emergencyForm.issueType}
• وصف العطل وما يلزم: ${emergencyForm.description || 'توقف مفاجئ وبحاجة لدعم فني'}
• الموقع والعلامة المميزة: ${emergencyForm.location || 'على خط السير'}

🛡️ *حالة الأمان والشحنة:*
الشاحنة متوقفة بالجانب الآمن من الطريق والحمولة مؤمنة بالكامل دون أي تلفيات.

⏱️ *توقيت وتاريخ البلاغ:* ${timeStr} — ${dateStr}
━━━━━━━━━━━━━━━━━━━━━
📞 *موجه إلى:* م/ محمد ابراهيم ابوالمعاطى — مدير إدارة الدعم والمتابعة`;
                  return `https://wa.me/201159700466?text=${encodeURIComponent(text)}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال البلاغ المفصل فوراً عبر واتساب 📲</span>
              </a>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-400 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={emergencySending}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{emergencySending ? 'جاري الإرسال...' : 'تسجيل بلاغ بالمنظومة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-[10px] text-slate-500">
        بوابة سائقي أسطول النقل والمخازن © 2026 — الهيئة القومية للبريد المصري
      </footer>

    </div>
  );
}
