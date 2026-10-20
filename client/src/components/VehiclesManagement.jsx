import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  User, 
  Gauge, 
  Calendar,
  X,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { calculateLicenseStatus } from '../utils/licenseUtils';

export default function VehiclesManagement({ 
  vehicles = [], 
  drivers = [], 
  onAddVehicle, 
  onUpdateVehicle, 
  onDeleteVehicle 
}) {
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    plateNumber: '',
    type: 'نقل صندوق',
    model: '',
    year: 2024,
    capacity: '5 طن',
    currentLocation: 'جراج شبرا',
    status: 'متاحة',
    odometer: 0,
    fuelTankCapacity: 140,
    licenseExpiry: '2027-12-31',
    nextMaintenanceKm: 10000,
    driverId: ''
  });

  const openAddModal = () => {
    setEditingVehicle(null);
    const boxCount = vehicles.filter(v => v.type.includes('صندوق')).length;
    setFormData({
      code: `صندوق-${String(boxCount + 1).padStart(2, '0')}`,
      plateNumber: '',
      type: 'نقل صندوق',
      model: 'شيفورليه جامبو 7000 صندوق',
      year: 2024,
      capacity: '5 طن / 24 متر مكعب',
      currentLocation: 'جراج شبرا',
      status: 'متاحة',
      odometer: 0,
      fuelTankCapacity: 140,
      licenseExpiry: '2027-12-31',
      nextMaintenanceKm: 10000,
      driverId: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (veh) => {
    setEditingVehicle(veh);
    setFormData({ ...veh });
    setIsModalOpen(true);
  };

  const handleTypeChange = (typeVal) => {
    const isCanter = typeVal.includes('كانتر');
    const count = vehicles.filter(v => v.type === typeVal).length + 1;
    setFormData(prev => ({
      ...prev,
      type: typeVal,
      code: isCanter ? `كانتر-${String(count).padStart(2, '0')}` : `صندوق-${String(count).padStart(2, '0')}`,
      model: isCanter ? 'ميتسوبيشي فوزو كانتر شاسيه طويل' : 'شيفورليه جامبو 7000 صندوق',
      capacity: isCanter ? '6.5 طن - أطوال وطرود كبيرة' : '5 طن / 24 متر مكعب'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.plateNumber) {
      alert('يرجى إدخال رقم اللوحة المعدنية للسيارة');
      return;
    }

    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, formData);
    } else {
      onAddVehicle(formData);
    }
    setIsModalOpen(false);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filterType === 'all') return true;
    if (filterType === 'box') return v.type.includes('صندوق');
    if (filterType === 'canter') return v.type.includes('كانتر');
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">إدارة أسطول الشاحنات والسيارات</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                3 سيارات صندوق + 3 كانتر شاسيه طويل — مع إمكانية إضافة شاحنات جديدة للأسطول
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سيارة جديدة للأسطول +</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          جميع سيارات الأسطول ({vehicles.length})
        </button>
        <button
          onClick={() => setFilterType('box')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'box'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          📦 سيارات نقل صندوق ({vehicles.filter(v => v.type.includes('صندوق')).length})
        </button>
        <button
          onClick={() => setFilterType('canter')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'canter'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🚛 سيارات كانتر شاسيه طويل ({vehicles.filter(v => v.type.includes('كانتر')).length})
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map(veh => {
          const assignedDriver = drivers.find(d => d.id === veh.driverId);
          const isBox = veh.type.includes('صندوق');

          return (
            <div 
              key={veh.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isBox ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {isBox ? '📦' : '🚛'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{veh.code}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                          veh.plateNumber 
                            ? 'bg-slate-100 text-slate-700 border-slate-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {veh.plateNumber || 'لوحة قيد التسجيل'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                        {veh.type}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    veh.status === 'متاحة'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : veh.status === 'في مأمورية'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {veh.status}
                  </span>
                </div>

                {/* Specs */}
                <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الموديل وسنة الصنع:</span>
                    <strong className="text-slate-800">{veh.model} {veh.year ? `(${veh.year})` : ''}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>حمولة وسعة الشاحنة:</span>
                    <strong className="text-slate-800">{veh.capacity}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>قراءة العداد الحالية:</span>
                    <strong className="text-slate-900 font-mono">{veh.odometer?.toLocaleString('ar-EG') || 0} كم</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الموقع اللوجستي:</span>
                    <strong className="text-blue-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {veh.currentLocation}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      رخصة التسيير:
                    </span>
                    {(() => {
                      const lic = calculateLicenseStatus(veh.licenseExpiry);
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lic.badgeClass}`}>
                          {lic.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Driver */}
                <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-100 bg-white">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>السائق المعتاد:</span>
                    <strong className="text-slate-900">{assignedDriver ? assignedDriver.name : 'غير محدد'}</strong>
                  </div>
                  {assignedDriver && (
                    <span className="text-[10px] text-slate-400 font-mono">{assignedDriver.phone}</span>
                  )}
                </div>

                {/* Active Mission Occupancy Tracker */}
                {veh.activeMission && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 text-[11px] space-y-1 text-amber-950">
                    <div className="font-bold flex items-center justify-between">
                      <span>مأمورية نشطة: {veh.activeMission.missionNumber}</span>
                      <span className="font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
                        إشغال {veh.activeMission.occupancyDays} {veh.activeMission.occupancyDays === 1 ? 'يوم' : veh.activeMission.occupancyDays === 2 ? 'يومان' : 'أيام'}
                      </span>
                    </div>
                    <div className="text-slate-700">{veh.activeMission.destinationName}</div>
                    <div className="text-[10px] text-slate-600">{veh.activeMission.schedulePattern}</div>
                    <div className="text-blue-900 font-bold pt-0.5">
                      تاريخ الجاهزية والعودة: {veh.activeMission.expectedReturnDate ? new Date(veh.activeMission.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  صيانة قادمة: {veh.nextMaintenanceKm ? `${veh.nextMaintenanceKm} كم` : '---'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(veh)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                    title="تعديل بيانات السيارة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف السيارة ${veh.code} (${veh.plateNumber}) من الأسطول؟`)) {
                        onDeleteVehicle(veh.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                    title="حذف السيارة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black m-0">
                    {editingVehicle ? 'تعديل بيانات الشاحنة' : 'إضافة شاحنة جديدة للأسطول'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    توسيع الأسطول وتحديث بيانات المركبة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تصنيف ونوع الشاحنة
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="نقل صندوق">نقل صندوق (Box Truck)</option>
                    <option value="كانتر شاسيه طويل">كانتر شاسيه طويل (Canter Long Chassis)</option>
                    <option value="تريلا نقل ثقيل">تريلا نقل ثقيل (Trailer)</option>
                    <option value="جامبو نصف نقل">جامبو نصف نقل (Medium Pickup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كود السيارة التعريفي
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم اللوحة المعدنية
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ق أ ص 3819"
                    value={formData.plateNumber}
                    onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموديل والماركة
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    سنة الصنع
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحمولة القصوى
                  </label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حالة السيارة الحالية
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="متاحة">متاحة</option>
                    <option value="في مأمورية">في مأمورية</option>
                    <option value="صيانة">صيانة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    قراءة العداد (كم)
                  </label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموقع اللوجستي الحالي
                  </label>
                  <select
                    value={formData.currentLocation}
                    onChange={e => setFormData({ ...formData, currentLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="جراج شبرا">جراج شبرا</option>
                    <option value="المخزن الرئيسي بالتجمع">المخزن الرئيسي بالتجمع</option>
                    <option value="مخزن الغربية (القرشية)">مخزن الغربية (القرشية)</option>
                    <option value="مخزن المنيا الجديدة (المستقبل)">مخزن المنيا الجديدة (المستقبل)</option>
                    <option value="مخزن سوهاج (الكوثر)">مخزن سوهاج (الكوثر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السائق المخصص
                  </label>
                  <select
                    value={formData.driverId || ''}
                    onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">بدون سائق محدد</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ انتهاء رخصة تسيير السيارة
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiry || ''}
                    onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    يطلق جرس التنبيه الاستباقي قبل 30 يوماً من الانتهاء
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    موعد الصيانة الدورية القادمة (كم)
                  </label>
                  <input
                    type="number"
                    value={formData.nextMaintenanceKm || ''}
                    onChange={e => setFormData({ ...formData, nextMaintenanceKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingVehicle ? 'حفظ التعديلات' : 'إضافة للأسطول'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
