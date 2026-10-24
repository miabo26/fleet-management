import React, { useState } from 'react';
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
  Moon
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';

export default function LoginScreen({ onLoginSuccess, theme = 'light', onToggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
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

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="font-bold">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
                placeholder="أدخل اسم المستخدم أو رقم الهاتف"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${
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
                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono ${
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
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول إلى المنظومة</span>
              </>
            )}
          </button>
        </form>

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