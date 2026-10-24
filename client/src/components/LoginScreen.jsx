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
  KeyRound
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';

export default function LoginScreen({ onLoginSuccess }) {
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

  const handleQuickLogin = (quickUser, quickPass) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden" dir="rtl">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header & Official Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EgyptPostLogo 
              className="h-12 w-auto" 
              variant="light" 
            />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white m-0">
              منظومة حركة وتوزيع أسطول النقل
            </h2>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              الهيئة القومية للبريد المصري — بوابة الدخول المعتمدة
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>إشراف: <strong className="text-white">م/ محمد ابراهيم ابوالمعاطى</strong></span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="font-bold">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username / Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسم المستخدم أو رقم الهاتف
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="مثال: admin أو 01159700466"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="أدخل كلمة المرور الخاصة بحسابك"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
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

        {/* Quick Demo Credentials for Fast Testing */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block text-center">
            حسابات الدخول الافتراضية (انقر للتعبئة السريعة):
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin2026')}
              className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-right transition-colors cursor-pointer group"
            >
              <strong className="text-amber-400 block group-hover:text-amber-300">م/ محمد ابراهيم (تحكم كامل)</strong>
              <span className="text-slate-400 font-mono">admin / admin2026</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('operations', 'op123456')}
              className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl text-right transition-colors cursor-pointer group"
            >
              <strong className="text-blue-400 block group-hover:text-blue-300">مسؤول حركة وتشغيل</strong>
              <span className="text-slate-400 font-mono">operations / op123456</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('warehouse', 'wh123456')}
              className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-right transition-colors cursor-pointer group"
            >
              <strong className="text-purple-400 block group-hover:text-purple-300">أمين مخزن إقليمي</strong>
              <span className="text-slate-400 font-mono">warehouse / wh123456</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('viewer', 'view1234')}
              className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500/50 rounded-xl text-right transition-colors cursor-pointer group"
            >
              <strong className="text-slate-300 block">مشاهد واستعلام فقط</strong>
              <span className="text-slate-400 font-mono">viewer / view1234</span>
            </button>
          </div>
        </div>

        {/* Protection Note */}
        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <KeyRound className="w-3 h-3 text-slate-400" />
          <span>منظومة محمية ومخصصة للاستخدام المصرح به فقط</span>
        </div>

      </div>

    </div>
  );
}
