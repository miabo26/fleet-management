import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Truck, 
  Users, 
  Wrench, 
  Building2, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCw,
  ArrowUpDown,
  Lock,
  ChevronDown
} from 'lucide-react';
import EgyptPostLogo from './EgyptPostLogo';

export default function AuditLogs({ 
  auditLogs = [], 
  currentUser,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all'); // 'all', 'today', 'week'

  // Unique users list for filter
  const uniqueUsers = useMemo(() => {
    const map = new Map();
    auditLogs.forEach(log => {
      if (log.userId && log.userName && !map.has(log.userId)) {
        map.set(log.userId, { id: log.userId, name: log.userName, role: log.userRole });
      }
    });
    return Array.from(map.values());
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    return auditLogs.filter(log => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesDetails = log.details && log.details.toLowerCase().includes(q);
        const matchesLabel = log.actionLabel && log.actionLabel.toLowerCase().includes(q);
        const matchesUser = log.userName && log.userName.toLowerCase().includes(q);
        const matchesEntity = log.entity && log.entity.toLowerCase().includes(q);
        if (!matchesDetails && !matchesLabel && !matchesUser && !matchesEntity) return false;
      }

      // Entity filter
      if (selectedEntity !== 'all') {
        if (selectedEntity === 'missions' && log.entity !== 'mission') return false;
        if (selectedEntity === 'drivers' && log.entity !== 'driver') return false;
        if (selectedEntity === 'vehicles' && log.entity !== 'vehicle') return false;
        if (selectedEntity === 'users' && log.entity !== 'user' && log.entity !== 'auth') return false;
        if (selectedEntity === 'maintenance' && log.entity !== 'maintenance') return false;
        if (selectedEntity === 'warehouses' && log.entity !== 'warehouse') return false;
      }

      // User filter
      if (selectedUser !== 'all' && log.userId !== selectedUser) {
        return false;
      }

      // Time range
      if (selectedTimeRange !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        if (selectedTimeRange === 'today' && logTime < todayStart) return false;
        if (selectedTimeRange === 'week' && logTime < weekAgo) return false;
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedEntity, selectedUser, selectedTimeRange]);

  // Stats calculation
  const totalLogsCount = auditLogs.length;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayLogsCount = auditLogs.filter(l => new Date(l.timestamp).getTime() >= todayStart).length;
  const missionLogsCount = auditLogs.filter(l => l.entity === 'mission').length;
  const driverLogsCount = auditLogs.filter(l => l.entity === 'driver').length;

  // Format Egyptian Date & Time
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: '---', time: '---', relative: '' };
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return { date: '---', time: '---', relative: '' };

    const dateStr = dateObj.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = dateObj.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Relative duration
    const diffMs = Date.now() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative = '';
    if (diffMins < 1) relative = 'الآن';
    else if (diffMins < 60) relative = `منذ ${diffMins} دقيقة`;
    else if (diffHours < 24) relative = `منذ ${diffHours} ساعة`;
    else relative = `منذ ${diffDays} يوم`;

    return { date: dateStr, time: timeStr, relative };
  };

  // Get action styling badge & icon
  const getActionBadge = (actionType, entity) => {
    switch (actionType) {
      case 'create_mission':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
          dot: 'bg-emerald-500',
          icon: FileText,
          label: 'إسناد مأمورية جديدة'
        };
      case 'mission_status':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'تحديث حالة مأمورية'
        };
      case 'driver_leave':
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          label: 'تسجيل إجازة وحجب شاحنة'
        };
      case 'driver_resume':
        return {
          bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700/60',
          dot: 'bg-teal-500',
          icon: CheckCircle2,
          label: 'إنهاء إجازة وعودة للعمل'
        };
      case 'create_driver':
      case 'update_driver':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60',
          dot: 'bg-indigo-500',
          icon: Users,
          label: 'بيانات السائقين'
        };
      case 'create_vehicle':
      case 'update_vehicle':
      case 'delete_vehicle':
        return {
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
          dot: 'bg-blue-500',
          icon: Truck,
          label: 'شاحنات الأسطول'
        };
      case 'create_maintenance':
        return {
          bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700/60',
          dot: 'bg-orange-500',
          icon: Wrench,
          label: 'صيانة دورية / طارئة'
        };
      case 'auth_login':
        return {
          bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
          dot: 'bg-sky-500',
          icon: ShieldCheck,
          label: 'تسجيل دخول معتمد'
        };
      case 'create_user':
      case 'update_user':
      case 'delete_user':
        return {
          bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60',
          dot: 'bg-purple-500',
          icon: User,
          label: 'إدارة المستخدمين'
        };
      case 'delete_mission':
      case 'delete_driver':
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
          dot: 'bg-rose-600',
          icon: AlertCircle,
          label: 'حذف من المنظومة'
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700/60',
          dot: 'bg-slate-500',
          icon: History,
          label: 'إجراء عام'
        };
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('لا توجد بيانات لتصديرها');
      return;
    }

    const headers = ['م', 'تاريخ وتوقيت الإدخال', 'اسم المستخدم', 'الرتبة / الصلاحية', 'طبيعة الإدخال', 'بيان وتفاصيل العملية'];
    const rows = filteredLogs.map((log, idx) => {
      const dt = formatDateTime(log.timestamp);
      return [
        idx + 1,
        `"${dt.date} - ${dt.time}"`,
        `"${log.userName || ''}"`,
        `"${log.userRole || ''}"`,
        `"${log.actionLabel || ''}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_الرقابة_والعمليات_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold">
              <History className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              سجل التدقيق والرقابة اللوجستية المعتمد
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>إشراف: م/ محمد ابراهيم ابوالمعاطى</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
            سجل العمليات والمدخلات الرقابي (Audit & Activity Trail)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            توثيق تاريخي فوري ومحكم لكافة حركات الإدخال، والتعديل، والتكليف، وتسجيل الإجازات، مع بيان هوية المستخدم المنفذ وتوقيت كل إجراء بدقة.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير كشف العمليات (CSV)</span>
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="تحديث السجل"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Logs */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي السجلات الموثقة</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalLogsCount}</span>
            <span className="text-[11px] text-slate-400">توثيق شامل للنظام</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* Today's Logs */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">عمليات اليوم</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{todayLogsCount}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">حركات جارية خلال 24 ساعة</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Mission Actions */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">حركات المأموريات</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{missionLogsCount}</span>
            <span className="text-[11px] text-slate-400">إسناد وتحديث وتسليم</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Drivers & Leaves */}
        <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">حركات السائقين والإجازات</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{driverLogsCount}</span>
            <span className="text-[11px] text-slate-400">تسجيل إجازات وجهوزية</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث في تفاصيل الإدخال، اسم المستخدم، رقم المأمورية، الشاحنة..."
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>

          {/* User Selector Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">-- كل المستخدمين ({uniqueUsers.length}) --</option>
              {uniqueUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'admin' ? 'مدير عام' : u.role === 'dispatcher' ? 'مسؤول حركة' : u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">كل التواريخ</option>
              <option value="today">عمليات اليوم فقط</option>
              <option value="week">آخر 7 أيام</option>
            </select>
          </div>

        </div>

        {/* Entity Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-400 font-bold ml-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            التصنيف:
          </span>
          {[
            { id: 'all', label: 'كافة العمليات' },
            { id: 'missions', label: 'المأموريات والتشغيل' },
            { id: 'drivers', label: 'السائقين والإجازات' },
            { id: 'vehicles', label: 'الأسطول والشاحنات' },
            { id: 'maintenance', label: 'الصيانة' },
            { id: 'warehouses', label: 'المخازن' },
            { id: 'users', label: 'المستخدمين والجلسات' }
          ].map(tab => {
            const isActive = selectedEntity === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedEntity(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Logs Table / Timeline List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Header Info */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">نتائج السجل الرقابي:</span>
            <span className="bg-indigo-50 text-indigo-700 font-mono font-black px-2 py-0.5 rounded-md border border-indigo-200">
              {filteredLogs.length} عملية موثقة
            </span>
          </div>
          <span className="text-[11px] text-slate-400">مرتبة من الأحدث إلى الأقدم</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">لا توجد عمليات تطابق البحث أو الفلاتر</h4>
            <p className="text-xs text-slate-500 mt-1">جرب تغيير شروط الفلترة أو مسح كلمة البحث</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const dt = formatDateTime(log.timestamp);
              const badge = getActionBadge(log.actionType, log.entity);
              const Icon = badge.icon;

              return (
                <div 
                  key={log.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-4"
                >
                  
                  {/* Left Column: Timestamp & Action Badge */}
                  <div className="flex items-start gap-3 lg:w-72 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-700">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {log.actionLabel || badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                          {dt.relative}
                        </span>
                      </div>

                      {/* Precise Timestamp */}
                      <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dt.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dt.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Exact Details of the Entry */}
                  <div className="flex-1 space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500">طبيعة وبيان العملية:</span>
                      {log.entityId && (
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          ID: {log.entityId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed m-0">
                      {log.details || 'لا توجد تفاصيل إضافية'}
                    </p>
                  </div>

                  {/* Right Column: User Who Entered/Modified the Data */}
                  <div className="lg:w-64 shrink-0 flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 self-stretch lg:self-start">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {log.userRole === 'admin' ? '👑' : <User className="w-4 h-4 text-indigo-600" />}
                    </div>

                    <div className="text-right leading-tight overflow-hidden">
                      <span className="text-[10px] text-slate-400 block font-medium">المستخدم المنفذ:</span>
                      <strong className="text-xs text-slate-900 block truncate">
                        {log.userName || 'مستخدم غير محدد'}
                      </strong>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                          {log.userRole === 'admin' ? 'مدير عام المنظومة' : log.userRole === 'dispatcher' ? 'مسؤول حركة' : log.userRole === 'warehouse_manager' ? 'أمين مخزن' : 'مشاهد'}
                        </span>
                        {log.userPhone && (
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {log.userPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}