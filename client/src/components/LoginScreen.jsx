import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Award, 
  AlertCircle, 
  Truck, 
  KeyRound,
  Sun,
  Moon,
  Phone,
  Navigation,
  AlertTriangle,
  MessageCircle,
  Locate,
  X,
  PhoneCall,
  CreditCard,
  Smartphone,
  Download,
  Share
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';
import { fetchDriversPortalList, driverLogin } from '../services/api';

export default function LoginScreen({ 
  onLoginSuccess, 
  onDriverLoginSuccess, 
  theme = 'light', 
  onToggleTheme 
}) {
  const [loginMode, setLoginMode] = useState('driver'); // 'admin' or 'driver'

  // Admin credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Driver portal login state: strictly Phone Number + Last 4 Digits of National ID (Zero public driver names)
  const [driverPhone, setDriverPhone] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('fleet_saved_driver_phone')) || '';
  });
  const [driverNationalIdPin, setDriverNationalIdPin] = useState('');
  const [showDriverPin, setShowDriverPin] = useState(false);

  // PWA Install state
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  // Emergency SOS Modal state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [gpsLocation, setGpsLocation] = useState('');
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [emergencyDriverName, setEmergencyDriverName] = useState('');
  const [emergencyIssue, setEmergencyIssue] = useState('انفجار إطار الشاحنة (كاوتش) وتوقف بالكامل');
  const [emergencyAidNeeded, setEmergencyAidNeeded] = useState('طاقم إصلاح وتغيير إطارات (كاوتش)');
  const [emergencyLocationNotes, setEmergencyLocationNotes] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Admin / Staff Login
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onLoginSuccess({ username: username.trim(), password });
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Handle Driver Login (Phone + Last 4 Digits of National ID)
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    
    const cleanPhone = driverPhone.trim();
    const cleanPin = driverNationalIdPin.trim();

    if (!cleanPhone) {
      setError('يرجى إدخال رقم هاتفك المحمول المسجل');
      return;
    }
    if (!cleanPin || cleanPin.length !== 4) {
      setError('يرجى إدخال آخر 4 أرقام من بطاقة الرقم القومي (4 أرقام)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const driverRes = await driverLogin(null, cleanPhone, cleanPin);
      
      // Save permanently on this phone for automatic next visits
      localStorage.setItem('fleet_driver_id', driverRes.driver.id);
      localStorage.setItem('fleet_saved_driver_phone', cleanPhone);
      
      if (onDriverLoginSuccess) {
        onDriverLoginSuccess(driverRes);
      }
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة، تأكد من رقم الهاتف وآخر 4 أرقام من الرقم القومي');
    } finally {
      setLoading(false);
    }
  };

  // Handle GPS location fetch for emergency
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('خاصية تحديد الموقع الجغرافي غير مدعومة في هذا المتصفح');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGps(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setGpsLocation(`https://maps.google.com/?q=${lat},${lng}`);
      },
      (err) => {
        setIsGettingGps(false);
        alert('تعذر جلب موقعك: يرجى التأكد من تفعيل خدمة الـ GPS في الهاتف والسماح للمتصفح');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Build emergency WhatsApp URL with rich structured operational details
  const buildEmergencyWhatsAppUrl = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const text = `🚨 *بلاغ استغاثة وعطل طارئ على الطريق* 🚨
━━━━━━━━━━━━━━━━━━━━━
🏢 *الهيئة القومية للبريد المصري*
🚚 *قطاع تشغيل وحركة الأسطول — غرفة العمليات والطوارئ*
━━━━━━━━━━━━━━━━━━━━━

👤 *بيانات السائق المُبلّغ:*
• الاسم: ${emergencyDriverName.trim() ? `الأسطى / ${emergencyDriverName.trim()}` : (driverPhone.trim() ? `سائق برقم هاتف (${driverPhone.trim()})` : 'سائق بأسطول النقل')}
• الهاتف: ${driverPhone.trim() || 'مرفق بالمحادثة'}

⚠️ *تفاصيل البلاغ والعطل الميداني:*
• نوع المشكلة: ${emergencyIssue}
• ما يلزم للدعم فوراً: ${emergencyAidNeeded || 'ونش أو دعم فني'}
${emergencyLocationNotes ? `• العلامة المميزة على الطريق: ${emergencyLocationNotes}\n` : ''}${emergencyNotes ? `• ملاحظات السائق: ${emergencyNotes}\n` : ''}
🛡️ *حالة الأمان والشحنة:*
الشاحنة متوقفة بالجانب الآمن من الطريق والحمولة مؤمنة بالكامل دون أي تلفيات.

📍 *موقعي الدقيق على الخريطة (Google Maps):*
${gpsLocation ? gpsLocation : 'جاري تحديد الإحداثيات (يرجى الاتصال بي فوراً)'}

⏱️ *توقيت وتاريخ البلاغ:* ${timeStr} — ${dateStr}
━━━━━━━━━━━━━━━━━━━━━
📞 *موجه إلى:* م/ محمد ابراهيم ابوالمعاطى — مدير إدارة الدعم والمتابعة`;

    return `https://wa.me/201159700466?text=${encodeURIComponent(text)}`;
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`min-h-screen flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden transition-colors duration-200 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white' 
          : 'bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 text-slate-900'
      }`} 
      dir="rtl"
    >
      
      {/* Theme Toggle Button */}
      {onToggleTheme && (
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md backdrop-blur-md ${
              isDark
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-white/90 hover:bg-white border-slate-200 text-slate-700'
            }`}
            title={isDark ? 'التحويل إلى الوضع النهاري ☀️' : 'التحويل إلى الوضع الليلي 🌙'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">الوضع النهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">الوضع الليلي</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Decorative ambient background glows */}
      <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/15'
      }`}></div>
      <div className={`absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-blue-600/10' : 'bg-blue-400/10'
      }`}></div>

      {/* Main Container */}
      <div className="w-full max-w-md space-y-3 relative z-10">

        {/* 🚨 ZERO-FRICTION EMERGENCY SOS TOP BANNER (Accessible WITHOUT login) */}
        <div className="rounded-3xl p-1 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 shadow-xl shadow-rose-600/20">
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="w-full py-3 px-4 rounded-[22px] bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm flex items-center justify-between gap-2 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-base animate-pulse">
                🚨
              </span>
              <div className="text-right">
                <div className="text-rose-400 font-black text-xs flex items-center gap-1">
                  <span>طوارئ واستغاثة سريعة على الطريق</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                </div>
                <div className="text-[10px] text-slate-300 font-semibold">
                  اتصال فوري أو استغاثة واتساب (بدون تسجيل دخول)
                </div>
              </div>
            </div>

            <span className="text-[11px] bg-rose-600 text-white px-3 py-1.5 rounded-xl font-bold shrink-0 group-hover:bg-rose-500 transition-colors shadow-md">
              اضغط هنا ⚡
            </span>
          </button>
        </div>

        {/* Main Card */}
        <div className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}>
          
          {/* Header & Official Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <EgyptPostLogo 
                className="h-11 sm:h-12 w-auto" 
                variant={isDark ? "light" : "dark"} 
              />
            </div>

            <div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                منظومة حركة وتوزيع أسطول النقل
              </h2>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                الهيئة القومية للبريد المصري — بوابة الدخول المعتمدة
              </p>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>إشراف: <strong className={isDark ? 'text-white' : 'text-slate-900'}>م/ محمد ابراهيم ابوالمعاطى</strong></span>
            </div>
          </div>

          {/* Portal Type Switcher Tabs */}
          <div className={`grid grid-cols-2 p-1 rounded-2xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => {
                setLoginMode('driver');
                setError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'driver'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>بوابة السائقين 🚚</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>الإدارة والتشغيل</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-bold">{error}</div>
            </div>
          )}

          {/* MODE 1: SMART DRIVER SECURE LOGIN (Phone Number + Last 4 Digits of National ID) */}
          {loginMode === 'driver' && (
            <form onSubmit={handleDriverSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Field 1: Driver Mobile Number */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  رقم هاتف السائق المسجل بالهيئة:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="01xxxxxxxxx (رقم هاتفك المحمول)"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className={`w-full pl-3 pr-10 py-3 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Last 4 Digits of National ID (Security PIN) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>آخر 4 أرقام من الرقم القومي (رمز الأمان):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">4 أرقام</span>
                </div>

                <div className="relative">
                  <input
                    type={showDriverPin ? "text" : "password"}
                    required
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="•••• (مثال: 1234)"
                    value={driverNationalIdPin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setDriverNationalIdPin(val);
                    }}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-center text-lg font-black tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${
                      isDark
                        ? 'bg-slate-800/95 border-amber-500/40 text-amber-300 placeholder:text-slate-500'
                        : 'bg-amber-50/50 border-amber-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-amber-500 absolute right-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowDriverPin(!showDriverPin)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                    title={showDriverPin ? "إخفاء" : "إظهار"}
                  >
                    {showDriverPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>دخول بوابة السائق والملاحة 🚚</span>
                  </>
                )}
              </button>

              {/* Permanent Login Notice */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>يتم حفظ الجلسة دائماً على هاتفك وتفتح بوابتك مباشرة في المرات القادمة</span>
                </span>
              </div>

              {/* Direct Install PWA Button */}
              <button
                type="button"
                onClick={handleTriggerInstall}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تنزيل وتثبيت التطبيق كأيقونة على الموبايل 📲</span>
              </button>

            </form>
          )}

          {/* MODE 2: ADMIN & STAFF LOGIN */}
          {loginMode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5 animate-in fade-in duration-200">
              
              {/* Username / Phone */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  اسم المستخدم أو رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="أدخل اسم المستخدم (admin أو ahmed)"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                    title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تسجيل الدخول الإداري</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Protection Note */}
          <div className={`pt-2 border-t text-center text-[11px] flex items-center justify-center gap-1.5 ${
            isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
            <span>بوابة معتمدة ومؤمنة بأحدث معايير التشفير والرقابة</span>
          </div>

        </div>

      </div>

      {/* 🚨 ZERO-FRICTION EMERGENCY SOS MODAL (Zero-barrier roadside assistance) */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <span className="p-2 rounded-2xl bg-rose-500/20 text-xl">🚨</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white m-0">
                    مركز استغاثة وطوارئ الطريق السريع
                  </h3>
                  <span className="text-[10px] text-rose-300 font-bold block">
                    غرفة عمليات الدعم والمتابعة — البريد المصري
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsEmergencyModalOpen(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Buttons */}
            <div className="space-y-2.5">
              
              {/* Direct Phone Call to Eng. Mohamed Aboelmaaty */}
              <a
                href="tel:01159700466"
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-5 h-5 text-white animate-bounce" />
                  <div className="text-right">
                    <span className="block text-xs font-bold text-emerald-100">اتصال هاتفي مباشر بالمسؤول:</span>
                    <span className="block font-black text-sm">م/ محمد ابراهيم ابوالمعاطى</span>
                  </div>
                </div>
                <span className="font-mono text-xs bg-emerald-950/60 px-2.5 py-1 rounded-xl text-emerald-200 border border-emerald-400/30 font-bold" dir="ltr">
                  01159700466
                </span>
              </a>

              {/* Direct WhatsApp SOS Dispatch */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block">
                  أو إرسال بلاغ استغاثة تفصيلي على واتساب مع موقعك (GPS):
                </span>

                {/* Driver Name (Text input) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم السائق المُبلّغ (اختياري):</label>
                  <input
                    type="text"
                    placeholder="الأسطى / اكتب اسمك"
                    value={emergencyDriverName}
                    onChange={e => setEmergencyDriverName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* Issue Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">نوع المشكلة / العطل:</label>
                  <select
                    value={emergencyIssue}
                    onChange={e => setEmergencyIssue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white font-bold"
                  >
                    <option value="انفجار إطار الشاحنة (كاوتش) وتوقف بالكامل">انفجار إطار الشاحنة (كاوتش) وتوقف بالكامل</option>
                    <option value="عطل ميكانيكي طارئ في المحرك أو الفتيس">عطل ميكانيكي طارئ في المحرك أو الفتيس</option>
                    <option value="عطل كهربائي وانقطاع الإنارة بالكامل">عطل كهربائي وانقطاع الإنارة بالكامل</option>
                    <option value="ارتفاع شديد في حرارة المحرك وتوقف التبريد">ارتفاع شديد في حرارة المحرك وتوقف التبريد</option>
                    <option value="توقف أمني أو مشكلة على الطريق الصحراوي">توقف أمني أو مشكلة على الطريق الصحراوي</option>
                    <option value="حادث سير لا قدر الله وبحاجة لوحدة إسعاف وونش">حادث سير لا قدر الله وبحاجة لوحدة إسعاف وونش</option>
                    <option value="نفاد السولار">نفاد السولار</option>
                  </select>
                </div>

                {/* Aid Needed */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">ما يلزم للدعم فوراً:</label>
                  <select
                    value={emergencyAidNeeded}
                    onChange={e => setEmergencyAidNeeded(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white font-bold"
                  >
                    <option value="طاقم إصلاح وتغيير إطارات (كاوتش)">طاقم إصلاح وتغيير إطارات (كاوتش)</option>
                    <option value="ونش سحب وإنقاذ شاحنات ثقيل">ونش سحب وإنقاذ شاحنات ثقيل</option>
                    <option value="فني ميكانيكا محركات متنقل">فني ميكانيكا محركات متنقل</option>
                    <option value="سيارة نقل بديلة لنقل وتأمين الحمولة">سيارة نقل بديلة لنقل وتأمين الحمولة</option>
                    <option value="إسعاف وطوارئ طبية">إسعاف وطوارئ طبية</option>
                  </select>
                </div>

                {/* Location Landmark */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">اسم الطريق أو علامة مميزة تقريبية (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مثال: طريق الإسكندرية الزراعي بعد بنها بـ 10 كم"
                    value={emergencyLocationNotes}
                    onChange={e => setEmergencyLocationNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* GPS Location Button */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={isGettingGps}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Locate className={`w-4 h-4 ${isGettingGps ? 'animate-spin' : ''}`} />
                      <span>{isGettingGps ? 'جاري تحديد موقعك...' : gpsLocation ? 'تم التقاط الموقع بالـ GPS ✓' : 'تحديد موقعي الحالي بالـ GPS 📍'}</span>
                    </button>
                  </div>

                  {gpsLocation && (
                    <div className="text-[10px] text-emerald-400 font-mono truncate bg-slate-900 p-1.5 rounded-lg border border-slate-800 mt-1">
                      {gpsLocation}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <a
                  href={buildEmergencyWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال البلاغ المفصل فوراً عبر واتساب 📲</span>
                </a>
              </div>

              {/* National Official Emergency Hotlines */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">أرقام الطوارئ السريعة بالدولة:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <a href="tel:136" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">طوارئ المرور</span>
                    <strong className="text-amber-400 font-mono font-black text-sm">136</strong>
                  </a>
                  <a href="tel:122" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">شرطة النجدة</span>
                    <strong className="text-blue-400 font-mono font-black text-sm">122</strong>
                  </a>
                  <a href="tel:123" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">الإسعاف المصري</span>
                    <strong className="text-rose-400 font-mono font-black text-sm">123</strong>
                  </a>
                </div>
              </div>

            </div>

            <div className="text-center text-[10px] text-slate-400 pt-1">
              إدارة أسطول النقل والمخازن — الهيئة القومية للبريد المصري
            </div>

          </div>
        </div>
      )}

      {/* 📲 PWA INSTALLATION GUIDE MODAL */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl text-white relative">
            
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center mb-3">
                <Smartphone className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                تثبيت المنظومة كتطبيق على هاتفك 📲
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                ينزل التطبيق مباشرة على شاشة هاتفك الرئيسية ويعمل بسرعة فائقة وبدون شريط المتصفح
              </p>
            </div>

            {/* Android Instructions */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>🤖 لهواتف أندرويد (Chrome / سامسونج):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                <li>اضغط على زر خيارات المتصفح (الثلاث نقاط <strong>⋮</strong> بأعلى الشاشة).</li>
                <li>اضغط على خيار <strong className="text-amber-300">"تثبيت التطبيق"</strong> أو <strong className="text-amber-300">"إضافة إلى الشاشة الرئيسية"</strong>.</li>
                <li>ستظهر أيقونة التطبيق الخضراء فوراً على شاشة هاتفك مثل أي تطبيق عادي!</li>
              </ol>
            </div>

            {/* iPhone Instructions */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <span>🍏 لهواتف آيفون (Apple Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                <li>اضغط على زر المشاركة <Share className="w-3.5 h-3.5 text-blue-400 inline" /> (Share) في أسفل المتصفح.</li>
                <li>مرر لأسفل واختر <strong className="text-amber-300">"إضافة إلى الشاشة الرئيسية" ➕ (Add to Home Screen)</strong>.</li>
                <li>اضغط <strong>"إضافة" (Add)</strong> بأعلى اليمين لتثبيته.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-lg"
            >
              فهمت الخطوات، إغلاق
            </button>

          </div>
        </div>
      )}

    </div>
  );
}