import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Award, 
  AlertCircle, 
  Truck, 
  Building2, 
  KeyRound,
  Sun,
  Moon,
  Phone,
  Navigation,
  CheckCircle2,
  Users
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';
import { fetchDriversPortalList, driverLogin } from '../services/api';

export default function LoginScreen({ 
  onLoginSuccess, 
  onDriverLoginSuccess, 
  theme = 'light', 
  onToggleTheme 
}) {
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'driver'

  // Admin credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Driver portal login state
  const [driversList, setDriversList] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch drivers list on mount for driver portal tab
  useEffect(() => {
    fetchDriversPortalList()
      .then(list => {
        setDriversList(list);
        if (list.length > 0) setSelectedDriverId(list[0].id);
      })
      .catch(err => console.error('Error fetching drivers for login:', err));
  }, []);

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

  // Handle Driver Quick Login
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const driverRes = await driverLogin(selectedDriverId || null, driverPhone.trim() || null);
      if (onDriverLoginSuccess) {
        onDriverLoginSuccess(driverRes);
      }
    } catch (err) {
      setError(err.message || 'فشل الدخول لبوابة السائق، تأكد من اختيار اسمك');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white' 
          : 'bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 text-slate-900'
      }`} 
      dir="rtl"
    >
      
      {/* Theme Toggle Button in Login Screen */}
      {onToggleTheme && (
        <div className="absolute top-4 left-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md backdrop-blur-md ${
              isDark
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-white/90 hover:bg-white border-slate-200 text-slate-700'
            }`}
            title={isDark ? 'التحويل إلى الوضع النهاري ☀️' : 'التحويل إلى الوضع الليلي 🌙'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>الوضع النهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>الوضع الليلي</span>
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

      {/* Main Login Card */}
      <div className={`w-full max-w-md backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
      }`}>
        
        {/* Header & Official Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EgyptPostLogo 
              className="h-12 w-auto" 
              variant={isDark ? "light" : "dark"} 
            />
          </div>

          <div>
            <h2 className={`text-lg sm:text-xl font-black tracking-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              منظومة حركة وتوزيع أسطول النقل
            </h2>
            <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
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
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="font-bold">{error}</div>
          </div>
        )}

        {/* MODE 1: ADMIN & STAFF LOGIN */}
        {loginMode === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 animate-in fade-in duration-200">
            
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
                  placeholder="أدخل اسم المستخدم"
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
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

        {/* MODE 2: SMART DRIVER PORTAL QUICK LOGIN */}
        {loginMode === 'driver' && (
          <form onSubmit={handleDriverSubmit} className="space-y-4 animate-in fade-in duration-200">
            
            {/* Driver Select */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                اختر اسمك من قائمة السائقين
              </label>
              <div className="relative">
                <select
                  value={selectedDriverId}
                  onChange={e => setSelectedDriverId(e.target.value)}
                  className={`w-full pl-3 pr-10 py-3 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {driversList.map(d => (
                    <option key={d.id} value={d.id}>
                      الأسطى / {d.name} ({d.vehicleCategory}) {d.phone ? `— ${d.phone}` : ''}
                    </option>
                  ))}
                </select>
                <Truck className="w-4 h-4 text-emerald-500 absolute right-3.5 top-4 pointer-events-none" />
              </div>
            </div>

            {/* Or Phone Number */}
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  أو اكتب رقم هاتفك المسجل:
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Driver Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            <p className="text-[11px] text-center text-slate-400 m-0">
              الدخول فوري ومخصص لمتابعة مأموريتك وموقع المخزن والتسليم
            </p>
          </form>
        )}

        {/* Protection Note */}
        <div className={`pt-2 border-t text-center text-xs flex items-center justify-center gap-1.5 ${
          isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}>
          <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
          <span>بوابة رسمية محمية ومخصصة للاستخدام المصرح به فقط</span>
        </div>

      </div>

    </div>
  );
}
