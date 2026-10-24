import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Eye, 
  Trash2, 
  MapPin, 
  Truck, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Fuel, 
  ArrowUpDown, 
  Phone, 
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { generateWhatsAppMissionUrl } from '../services/api';

export default function MissionsList({ 
  missions = [], 
  onOpenNewMission, 
  onViewMission, 
  onPrintMission, 
  onDeleteMission,
  onQuickStatusChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');

  const filteredMissions = missions.filter(m => {
    const matchesSearch = 
      m.missionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.dispatchOrderNumber && m.dispatchOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? ['assigned', 'loading', 'on_road'].includes(m.status) :
      m.status === statusFilter;

    const matchesDestination = 
      destinationFilter === 'all' ? true : m.destinationId === destinationFilter;

    return matchesSearch && matchesStatus && matchesDestination;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on_road':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-300"><span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>على الطريق</span>;
      case 'loading':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-700 border border-blue-300"><Clock className="w-3 h-3 animate-spin" />جارٍ التحميل</span>;
      case 'assigned':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 border border-purple-300">تم التكليف</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-300"><CheckCircle2 className="w-3 h-3" />تم التسليم</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">مكتملة ومغلقة</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">مسودة</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 m-0">سجل وتوزيع المأموريات اللوجستية</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                جدولة ومتابعة رحلات الشاحنات من المخزن الرئيسي إلى المخازن الإقليمية
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenNewMission}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إسناد مأمورية جديدة</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث برقم المأمورية، السائق، رقم السيارة، إذن الصرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({missions.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              نشطة حالياً ({missions.filter(m => ['assigned', 'loading', 'on_road'].includes(m.status)).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              مكتملة ({missions.filter(m => m.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Second Row: Destination Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              تصفية بالوجهة:
            </span>
            <button
              onClick={() => setDestinationFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                destinationFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              جميع المخازن
            </button>
            <button
              onClick={() => setDestinationFilter('loc-gharbia-qarshiya')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                destinationFilter === 'loc-gharbia-qarshiya' ? 'bg-emerald-100 text-emerald-700 font-black' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              القرشية (الغربية)
            </button>
            <button
              onClick={() => setDestinationFilter('loc-minya-mustaqbal')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                destinationFilter === 'loc-minya-mustaqbal' ? 'bg-amber-100 text-amber-700 font-black' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              المنيا الجديدة
            </button>
            <button
              onClick={() => setDestinationFilter('loc-sohag-kawthar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                destinationFilter === 'loc-sohag-kawthar' ? 'bg-purple-100 text-purple-700 font-black' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              سوهاج (الكوثر)
            </button>
          </div>

          <span className="text-slate-400 font-medium">
            عرض {filteredMissions.length} من أصل {missions.length} مأمورية
          </span>
        </div>
      </div>

      {/* Missions Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">
              {missions.length === 0 ? 'سجل المأموريات خالي ونظيف تماماً' : 'لا توجد مأموريات مطابقة للبحث'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {missions.length === 0 ? 'ابدأ بإسناد أول مأمورية حقيقية لأحد السائقين والسيارات' : 'جرّب تغيير كلمات البحث أو فلاتر التصفية'}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Touch-Friendly Responsive Cards (hidden on md+) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredMissions.map((mission) => (
                <div key={mission.id} className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors">
                  
                  {/* Card Header: Code + Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-md">
                        {mission.missionNumber}
                      </span>
                      {getStatusBadge(mission.status)}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      mission.occupancyDays === 3 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : mission.occupancyDays === 2 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {mission.occupancyDays === 3 ? '🟣 3 أيام' : mission.occupancyDays === 2 ? '🟡 يومان' : '🟢 نفس اليوم'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-slate-900 leading-snug m-0">
                    {mission.title}
                  </h4>

                  {/* Route & Destination */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">خط السير:</span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <span>{mission.originName}</span>
                        <span>➔</span>
                        <span>{mission.destinationName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">السائق والشاحنة:</span>
                      <div className="text-right text-[11px]">
                        <span className="font-bold text-slate-900 block">{mission.driverName}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{mission.vehicleCode} - {mission.vehiclePlate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">الحمولة:</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{mission.cargoType}</span>
                    </div>

                    {mission.dispatchOrderNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">إذن الصرف:</span>
                        <span className="font-mono text-slate-600 text-[10px]">{mission.dispatchOrderNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                      <span className="text-slate-600 font-sans font-bold">العهدة / المتبقي:</span>
                      <span className="text-slate-900 font-bold">
                        {mission.cashAdvance} ج.م / <span className={mission.remainingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{mission.remainingCash} ج.م</span>
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onViewMission(mission)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>التفاصيل</span>
                    </button>

                    <a
                      href={generateWhatsAppMissionUrl(mission)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                      title="إرسال بيانات المأمورية للسائق عبر واتساب 📲"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                    
                    <button
                      onClick={() => onPrintMission(mission)}
                      className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="طباعة إذن التشغيل"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف المأمورية ${mission.missionNumber}؟`)) {
                          onDeleteMission(mission.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                      title="حذف المأمورية"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Full Data Table (hidden on mobile, visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">المأمورية</th>
                    <th className="py-3.5 px-4">مسار الرحلة</th>
                    <th className="py-3.5 px-4">السائق والشاحنة</th>
                    <th className="py-3.5 px-4">الحمولة وإذن الصرف</th>
                    <th className="py-3.5 px-4">التاريخ والموعد</th>
                    <th className="py-3.5 px-4">الماليات والعهدة</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMissions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Mission ID & Title */}
                      <td className="py-4 px-4 font-bold">
                        <div className="font-mono text-xs font-black text-slate-900">
                          {mission.missionNumber}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 max-w-[180px]">
                          {mission.title}
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="text-blue-700 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {mission.originName}
                          </span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            {mission.destinationName}
                          </span>
                        </div>
                      </td>

                      {/* Driver & Vehicle */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            <span>{mission.driverName}</span>
                          </div>
                          <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span>{mission.vehicleCode} - {mission.vehiclePlate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo & Dispatch Order */}
                      <td className="py-4 px-4">
                        <div className="text-[11px]">
                          <div className="font-semibold text-slate-800">{mission.cargoType}</div>
                          <div className="text-slate-400">{mission.dispatchOrderNumber}</div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              mission.occupancyDays === 3 
                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                : mission.occupancyDays === 2 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {mission.occupancyDays === 3 ? '🟣 إشغال 3 أيام' : mission.occupancyDays === 2 ? '🟡 إشغال يومين' : '🟢 إشغال نفس اليوم'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Dates & Return Schedule */}
                      <td className="py-4 px-4 text-slate-600 text-[11px]">
                        <div>انطلاق: <strong>{mission.departureDate ? new Date(mission.departureDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}</strong></div>
                        <div className="text-blue-700">عودة متوقعة: <strong>{mission.expectedReturnDate ? new Date(mission.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (mission.expectedArrival ? new Date(mission.expectedArrival).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : '---')}</strong></div>
                        <div className="text-[10px] text-slate-400 font-semibold">{mission.schedulePattern || 'ذهاب وعودة'}</div>
                      </td>

                      {/* Financials */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        <div>عهدة: <strong className="text-slate-900">{mission.cashAdvance} ج.م</strong></div>
                        <div className="text-slate-500 text-[10px]">
                          سولار: {mission.fuelExpense || 0} | كارتات: {mission.tollExpense || 0}
                        </div>
                        <div className={`text-[10px] font-bold ${mission.remainingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          متبقي: {mission.remainingCash} ج.م
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(mission.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewMission(mission)}
                            title="عرض وتعديل التفاصيل والتسوية"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={generateWhatsAppMissionUrl(mission)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="إرسال بيانات المأمورية للسائق عبر واتساب 📲"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => onPrintMission(mission)}
                            title="طباعة إذن تشغيل المأمورية"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف المأمورية ${mission.missionNumber}؟`)) {
                                onDeleteMission(mission.id);
                              }
                            }}
                            title="حذف المأمورية"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
