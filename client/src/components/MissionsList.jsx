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
  ArrowUpDown
} from 'lucide-react';

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
    <div className="space-y-6 pb-12">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">سجل وتوزيع المأموريات اللوجستية</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                جدولة ومتابعة رحلات الشاحنات من المخزن الرئيسي إلى المخازن الإقليمية
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenNewMission}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إسناد مأمورية جديدة</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم المأمورية، السائق، رقم اللوحة، إذن الصرف..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Destination Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">كل الوجهات الإقليمية</option>
              <option value="loc-gharbia-qarshiya">مخزن الغربية (القرشية)</option>
              <option value="loc-minya-mustaqbal">مخزن المنيا الجديدة (المستقبل)</option>
              <option value="loc-sohag-kawthar">مخزن سوهاج (الكوثر)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'النشطة حالياً' },
            { id: 'loading', label: 'جار التحميل' },
            { id: 'on_road', label: 'على الطريق' },
            { id: 'delivered', label: 'تم التسليم' },
            { id: 'completed', label: 'المكتملة' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-slate-400 mr-auto text-[11px]">
            عرض {filteredMissions.length} من أصل {missions.length} مأمورية
          </span>
        </div>
      </div>

      {/* Missions Table / Card List */}
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
          <div className="overflow-x-auto">
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
        )}
      </div>

    </div>
  );
}
