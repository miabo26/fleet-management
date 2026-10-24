import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  Key, 
  Trash2, 
  Edit, 
  Lock, 
  Unlock, 
  Phone, 
  Building, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Truck,
  Building2,
  Eye,
  ShieldAlert,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Cloud,
  Clock,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { 
  fetchBackupStats, 
  downloadBackupFile, 
  restoreBackupData, 
  createManualSnapshot 
} from '../services/api';

export default function UsersManagement({ 
  users = [], 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  onRefresh
}) {
  const [activeSection, setActiveSection] = useState('users'); // 'users' or 'backup'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Backup states
  const [backupStats, setBackupStats] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState({ text: '', type: '' });
  const [isRestoring, setIsRestoring] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'dispatcher',
    phone: '',
    department: 'جراج السيارات - شبرا',
    status: 'active'
  });

  const [filterRole, setFilterRole] = useState('all');

  // Load backup stats on mount or section switch
  const loadBackupStats = async () => {
    try {
      setBackupLoading(true);
      const data = await fetchBackupStats();
      setBackupStats(data);
    } catch (err) {
      console.error('Error fetching backup stats:', err);
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    loadBackupStats();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'dispatcher',
      phone: '',
      department: 'جراج السيارات - شبرا',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '', // blank unless user wants to change it
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      status: user.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      alert('يرجى إدخال الاسم واسم المستخدم');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      alert('يرجى تعيين كلمة مرور للمستخدم الجديد');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, formData);
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  // Handle Download Backup
  const handleDownloadBackup = async () => {
    try {
      setBackupLoading(true);
      await downloadBackupFile();
      setBackupMessage({ text: 'تم تحميل نسخة احتياطية كاملة (.json) بنجاح على جهازك', type: 'success' });
      await loadBackupStats();
    } catch (err) {
      setBackupMessage({ text: err.message || 'فشل تحميل النسخة الاحتياطية', type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  // Handle Create Snapshot
  const handleCreateSnapshot = async () => {
    try {
      setBackupLoading(true);
      const res = await createManualSnapshot();
      setBackupStats(res.stats);
      setBackupMessage({ text: `تم حفظ لقطة احتياطية فورية على الخادم (${res.filename})`, type: 'success' });
    } catch (err) {
      setBackupMessage({ text: err.message || 'فشل إنشاء اللقطة الاحتياطية', type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  // Handle Restore Backup File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('⚠️ تحذير: استعادة نسخة احتياطية سيقوم باستبدال كافة البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد من الاستمرار؟')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        const parsedData = JSON.parse(event.target.result);
        const res = await restoreBackupData(parsedData);
        setBackupStats(res.stats);
        setBackupMessage({ text: 'تمت استعادة كافة البيانات وسجلات الأسطول بنجاح!', type: 'success' });
        if (onRefresh) onRefresh();
      } catch (err) {
        setBackupMessage({ text: err.message || 'الملف المرفوع غير صالح كنسخة احتياطية', type: 'error' });
      } finally {
        setIsRestoring(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدير عام المنظومة (تحكم كامل)',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: ShieldCheck
        };
      case 'dispatcher':
        return {
          label: 'مسؤول حركة وتشغيل',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Truck
        };
      case 'warehouse_manager':
        return {
          label: 'أمين مخزن إقليمي',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Building2
        };
      case 'viewer':
      default:
        return {
          label: 'مشاهد واستعلام فقط',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Eye
        };
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 m-0">
                إدارة المستخدمين وسلامة البيانات اللوجستية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تأمين المنظومة وتحديد صلاحيات الوصول والنسخ الاحتياطي الدوري
              </p>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSection('users')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'users'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>المستخدمين والصلاحيات ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('backup');
              loadBackupStats();
            }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'backup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>النسخ الاحتياطي والأمان</span>
            {backupStats?.isCloudConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: DATABASE BACKUP & DATA SECURITY */}
      {activeSection === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Status Message */}
          {backupMessage.text && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
              backupMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {backupMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{backupMessage.text}</span>
              </div>
              <button 
                onClick={() => setBackupMessage({ text: '', type: '' })} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Database Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">حالة قاعدة البيانات</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-black text-slate-900 text-sm">مؤمنة وتعمل بنجاح</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 m-0">
                {backupStats?.storageType || 'تخزين مشفر مع نسخ دوري'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">النسخ الاحتياطية للخادم</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-black text-blue-600">{backupStats?.backupsCount || 0}</span>
                <span className="text-xs text-slate-500">لقطات محفوظة</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 m-0">
                حفظ تلقائي دوري كل 30 دقيقة
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي السجلات المؤمنة</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl font-black text-slate-900">
                  {(backupStats?.totalRecords?.missions || 0) + (backupStats?.totalRecords?.vehicles || 0) + (backupStats?.totalRecords?.drivers || 0)}
                </span>
                <span className="text-xs text-slate-500">سجل رئيسي</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 m-0">
                {backupStats?.totalRecords?.missions || 0} مأمورية • {backupStats?.totalRecords?.vehicles || 0} شاحنة • {backupStats?.totalRecords?.drivers || 0} سائق
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">آخر تعديل وحفظ</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-800 font-mono block">
                  {backupStats?.lastModified ? new Date(backupStats.lastModified).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {backupStats?.lastModified ? new Date(backupStats.lastModified).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '---'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 m-0">
                حجم الملف: {backupStats?.fileSizeKb || 0} كيلوبايت
              </p>
            </div>

          </div>

          {/* Core Actions Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                إجراءات الطوارئ وإدارة النسخ الاحتياطي
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white m-0">
                تحميل واستعادة النسخ الاحتياطية (Disaster Recovery & Data Export)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                يمكنك في أي لحظة تنزيل نسخة احتياطية كاملة وشاملة لكافة بيانات الأسطول والمأموريات والسائقين وسجل الرقابة على حاسوبك أو هاتفك المحمول، كما يمكنك استعادتها فوراً بضغطة زر.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
              
              {/* Download Backup Button */}
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={backupLoading}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/20 text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة احتياطية كاملة للمنظومة (.json)</span>
              </button>

              {/* Restore Backup File Upload */}
              <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 text-xs sm:text-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{isRestoring ? 'جاري الاستعادة...' : 'استعادة نسخة احتياطية من ملف'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isRestoring}
                  className="hidden"
                />
              </label>

              {/* Create Instant Server Snapshot */}
              <button
                type="button"
                onClick={handleCreateSnapshot}
                disabled={backupLoading}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>أخذ لقطة فورية على الخادم</span>
              </button>

              {/* Refresh Stats */}
              <button
                type="button"
                onClick={loadBackupStats}
                disabled={backupLoading}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer self-center"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${backupLoading ? 'animate-spin' : ''}`} />
              </button>

            </div>

            {/* Safety Notice */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>توصية هامة ومؤكدة لإدارة الحركة والدعم الفني:</span>
              </div>
              <p className="m-0 leading-relaxed text-[11px] text-slate-300">
                1. ننصح بتحميل ملف النسخة الاحتياطية مرة أسبوعياً أو عند إدخال مأموريات جماعية كبيرة، والاحتفاظ بالملف على حاسوبك المكتبي أو بريدك الإلكتروني كإجراء أمان إضافي.
                <br />
                2. يحتوي ملف النسخة الاحتياطية على كافة تفاصيل المأموريات، وأرقام الشاحنات، وتراخيص السائقين، والعهد المالية، وسجل الرقابة بالكامل.
              </p>
            </div>

          </div>

          {/* Cloud Database Integration Guide (MongoDB Atlas) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 m-0">
                    الربط السحابي الدائم عبر (MongoDB Atlas Cloud Database)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    أعلى معايير الحفظ السحابي التلقائي المستمر مع جاهزية 99.99%
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                backupStats?.isCloudConnected 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                {backupStats?.isCloudConnected ? 'متصل سحابياً ☁️' : 'جاهز للربط الفوري'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              المنظومة مجهزة بالفعل برمجياً للربط المباشر مع قواعد بيانات <strong>MongoDB Atlas</strong> السحابية المجانية (M0 Cluster - 512MB مجاني للأبد).
              بمجرد إضافة متغير البيئة <code>MONGODB_URI</code> في لوحة تحكم الخادم (Render Environment Variables)، ستقوم المنظومة تلقائياً بحفظ كل عملية ومزامنتها لحظياً في السحابة لضمان بقائها إلى الأبد دون الاعتماد على القرص المؤقت.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <strong className="text-slate-800 block">خطوات التفعيل السحابي (إذا رغبت):</strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>إنشاء قاعدة بيانات مجانية على موقع <code>mongodb.com/atlas</code>.</li>
                <li>نسخ رابط الاتصال (Connection String) الخاص بالقاعدة.</li>
                <li>إضافته باسم <code>MONGODB_URI</code> في إعدادات البيئة على Render.</li>
              </ol>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: USERS & PERMISSIONS MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 m-0">قائمة مستخدمي ومسؤولي النظام</h3>
              <p className="text-xs text-slate-500 mt-0.5">صلاحيات محكمة لمنع الوصول غير المصرح به للمنظومة</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم جديد +</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">إجمالي المستخدمين</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 block">مدراء عام (تحكم كامل)</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {users.filter(u => u.role === 'admin').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 block">مسؤولو الحركة والتشغيل</span>
                <span className="text-2xl font-black text-blue-600 mt-1 block">
                  {users.filter(u => u.role === 'dispatcher').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-700 block">أمناء المخازن الإقليمية</span>
                <span className="text-2xl font-black text-purple-600 mt-1 block">
                  {users.filter(u => u.role === 'warehouse_manager').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              جميع المستخدمين ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              مدير عام المنظومة ({users.filter(u => u.role === 'admin').length})
            </button>
            <button
              onClick={() => setFilterRole('dispatcher')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'dispatcher'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              مسؤولو الحركة ({users.filter(u => u.role === 'dispatcher').length})
            </button>
            <button
              onClick={() => setFilterRole('warehouse_manager')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'warehouse_manager'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              أمناء المخازن ({users.filter(u => u.role === 'warehouse_manager').length})
            </button>
            <button
              onClick={() => setFilterRole('viewer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterRole === 'viewer'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              مشاهدين ({users.filter(u => u.role === 'viewer').length})
            </button>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map(user => {
              const roleInfo = getRoleBadge(user.role);
              const RoleIcon = roleInfo.icon;
              const isSelf = currentUser?.id === user.id;

              return (
                <div 
                  key={user.id} 
                  className={`bg-white rounded-2xl p-5 border transition-all space-y-4 ${
                    isSelf 
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                        user.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : user.role === 'dispatcher'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'warehouse_manager'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role === 'admin' ? '👑' : user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-slate-900 text-sm m-0">{user.name}</h4>
                          {isSelf && (
                            <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              حسابك الحالي
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono block mt-0.5" dir="ltr">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 shrink-0 ${roleInfo.badgeClass}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span>{user.role === 'admin' ? 'مدير عام' : user.roleLabel || roleInfo.label}</span>
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>الإدارة / التبعية:</span>
                      <strong className="text-slate-800 text-[11px] text-left truncate max-w-[180px]">
                        {user.department || '---'}
                      </strong>
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-between">
                        <span>رقم الهاتف:</span>
                        <a href={`tel:${user.phone}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span>حالة الحساب:</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        user.status === 'active' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {user.status === 'active' ? 'مفعل وجاهز للدخول' : 'معطل ومحظور'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل الصلاحية / المرور</span>
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف المستخدم (${user.name})؟ لن يتمكن من الدخول للمنظومة مجدداً.`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black m-0">
                    {editingUser ? 'تعديل بيانات وصلاحيات المستخدم' : 'إنشاء حساب مستخدم جديد'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التحكم في مستويات الدخول والصلاحيات الإدارية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الرباعي الكامل للموظف
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: م/ حسام أحمد محمود"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الدخول (Username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="hossam.post"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? 'كلمة المرور (اتركها فارغة للتخطي)' : 'كلمة المرور'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? '••••••••' : 'كلمة المرور'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شريحة الصلاحية ونطاق المسؤولية
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="dispatcher">مسؤول حركة وتشغيل (إسناد ومتابعة المأموريات والسائقين)</option>
                  <option value="warehouse_manager">أمين مخزن إقليمي (استلام الشحنات وتأكيد الوصول بالموقع)</option>
                  <option value="viewer">مشاهد ومتابع فقط (استعراض المؤشرات والتقارير دون تعديل)</option>
                  <option value="admin">مدير عام المنظومة (تحكم كامل في كافة الأقسام والمستخدمين)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف والتواصل
                  </label>
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الإدارة أو جهة العمل
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: جراج شبرا / مخزن القرشية"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  حالة الحساب
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="active">حساب نشط ومفعل (يمكنه تسجيل الدخول فوراً)</option>
                  <option value="inactive">حساب معطل (محظور من الدخول)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
