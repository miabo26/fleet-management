import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share, CheckCircle2 } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://');

    if (isAppStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If iOS and not installed, show after 2.5 seconds
    if (isIosDevice && !isAppStandalone) {
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // If prompt not ready yet, alert instructions
      alert('لتثبيت التطبيق على هاتفك: اضغط على القائمة (الثلاث نقاط ⋮ أعلى المتصفح) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // If already running inside installed standalone app, don't show prompt
  if (isStandalone) return null;

  return (
    <>
      {/* Toast Notification when installed successfully */}
      {installedSuccess && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-sm">تم تثبيت التطبيق بنجاح على هاتفك! 🚀</p>
            <p className="text-xs text-emerald-100">ستجده الآن في قائمة التطبيقات على شاشتك الرئيسية.</p>
          </div>
        </div>
      )}

      {/* Floating Install Prompt Banner */}
      {showPrompt && !installedSuccess && (
        <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-4 md:max-w-md z-40 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-900/40 shrink-0">
                <Smartphone className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-400">تثبيت تطبيق أسطول البريد على هاتفك 📲</h4>
                <p className="text-xs text-slate-300">لتشغيل أسرع مثل تطبيقات الموبايل بدون متصفح</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>تثبيت التطبيق الآن على الهاتف</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              لاحقاً
            </button>
          </div>
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-900/50">
                <Smartphone className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="font-black text-lg text-amber-400">طريقة التثبيت على الآيفون (iOS)</h3>
              <p className="text-xs text-slate-300 mt-1">خطوتين سهلتين لتثبيت التطبيق على شاشة موبايلك:</p>
            </div>

            <div className="space-y-3 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-bold text-white flex items-center gap-1">
                    اضغط على زر المشاركة <Share className="w-3.5 h-3.5 text-blue-400 inline" /> (Share)
                  </p>
                  <p className="text-[11px] text-slate-400">ستجده في أسفل شاشة متصفح Safari بالآيفون.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-bold text-white">
                    اختر "إضافة إلى الشاشة الرئيسية" ➕
                  </p>
                  <p className="text-[11px] text-slate-400">(Add to Home Screen) ثم اضغط "إضافة" (Add) بأعلى اليمين.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}
    </>
  );
}
