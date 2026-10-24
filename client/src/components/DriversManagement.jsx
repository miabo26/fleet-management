import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Truck, 
  Award, 
  Calendar, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  X,
  Save,
  Star
} from 'lucide-react';
import { calculateLicenseStatus } from '../utils/licenseUtils';

export default function DriversManagement({ 
  drivers = [], 
  vehicles = [], 
  onAddDriver, 
  onUpdateDriver, 
  onDeleteDriver 
}) {
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'سائق كانتر',
    vehicleCategory: 'كانتر شاسيه طويل',
    phone: '',
    nationalId: '',
    licenseNumber: '',
    licenseExpiry: '2028-01-01',
    status: 'متاح',
    rating: 5.0,
    notes: ''
  });

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      role: 'سائق كانتر',
      vehicleCategory: 'كانتر شاسيه طويل',
      phone: '',
      nationalId: '',
      licenseNumber: 'درجة أولى - ',
      licenseExpiry: '2028-01-01',
      status: 'متاح',
      rating: 5.0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({ ...driver });
    setIsModalOpen(true);
  };

  const handleRoleChange = (roleVal) => {
    const isCanter = roleVal.includes('كانتر');
    setFormData(prev => ({
      ...prev,
      role: roleVal,
      vehicleCategory: isCanter ? 'كانتر شاسيه طويل' : 'نقل صندوق',
      licenseNumber: isCanter ? 'درجة أولى - ' : 'درجة ثانية - '
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('يرجى إدخال اسم السائق');
      return;
    }

    if (editingDriver) {
      onUpdateDriver(editingDriver.id, formData);
    } else {
      onAddDriver(formData);
    }
    setIsModalOpen(false);
  };

  const filteredDrivers = drivers.filter(d => {
    if (filterRole === 'all') return true;
    if (filterRole === 'canter') return d.vehicleCategory.includes('كانتر');
    if (filterRole === 'box') return d.vehicleCategory.includes('صندوق');
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">طاقم السائقين المعتمدين</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة 6 سائقين (3 سائقي كانتر + 3 سائقي سيارات صندوق) مع تسجيل التراخيص وجهوزية المأموريات
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة سائق جديد +</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRole === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          جميع السائقين ({drivers.length})
        </button>
        <button
          onClick={() => setFilterRole('canter')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRole === 'canter'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🚛 سائقي كانتر شاسيه طويل ({drivers.filter(d => d.vehicleCategory.includes('كانتر')).length})
        </button>
        <button
          onClick={() => setFilterRole('box')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRole === 'box'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          📦 سائقي سيارات نقل صندوق ({drivers.filter(d => d.vehicleCategory.includes('صندوق')).length})
        </button>
      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map(driver => {
          const isCanter = driver.vehicleCategory.includes('كانتر');
          const assignedTruck = vehicles.find(v => v.id === driver.assignedVehicleId);

          return (
            <div 
              key={driver.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {driver.name.split(' ')[0][0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 m-0">{driver.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isCanter ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {driver.role}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{driver.rating || 4.9}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    driver.status === 'متاح'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : driver.status === 'في مأمورية'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : driver.status === 'إجازة' || driver.status === 'اجازة'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {driver.status === 'إجازة' || driver.status === 'اجازة' ? '🏖️ في إجازة رسمية' : driver.status}
                  </span>
                </div>

                {/* Details Box */}
                <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الهاتف والتواصل:</span>
                    {driver.phone && driver.phone.trim() ? (
                      <a href={`tel:${driver.phone}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1 font-mono" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {driver.phone}
                      </a>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-medium">قيد الإدراج</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>رخصة القيادة:</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <strong className="text-slate-800">{driver.licenseNumber || 'غير مسجلة'}</strong>
                      {(() => {
                        const lic = calculateLicenseStatus(driver.licenseExpiry);
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lic.badgeClass}`}>
                            {lic.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الرقم القومي:</span>
                    <span className="font-mono text-slate-700">{driver.nationalId || 'غير مسجل'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الشاحنة المعتادة:</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <strong className="text-slate-900">{assignedTruck ? `${assignedTruck.code} ${assignedTruck.plateNumber ? `(${assignedTruck.plateNumber})` : ''}` : 'حسب التكليف'}</strong>
                      {(driver.status === 'إجازة' || driver.status === 'اجازة') && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">
                          محجوبة 🔒
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Mission Details */}
                {driver.activeMission && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-300 text-[11px] space-y-1 text-amber-950">
                    <div className="font-bold flex items-center justify-between">
                      <span>مأمورية نشطة: {driver.activeMission.missionNumber}</span>
                      <span className="font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
                        إشغال {driver.activeMission.occupancyDays} {driver.activeMission.occupancyDays === 1 ? 'يوم' : driver.activeMission.occupancyDays === 2 ? 'يومان' : 'أيام'}
                      </span>
                    </div>
                    <div className="text-slate-700">{driver.activeMission.destinationName}</div>
                    <div className="text-[10px] text-slate-600">{driver.activeMission.schedulePattern}</div>
                    <div className="text-blue-900 font-bold pt-0.5">
                      تاريخ الجاهزية والعودة: {driver.activeMission.expectedReturnDate ? new Date(driver.activeMission.expectedReturnDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '---'}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {driver.notes && (
                  <p className="mt-3 text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    {driver.notes}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600">
                  إجمالي المأموريات: <strong className="text-blue-600">{driver.totalMissions || 0}</strong> رحلة
                </span>
                
                <div className="flex items-center gap-1.5">
                  {driver.status === 'متاح' && (
                    <button
                      type="button"
                      onClick={() => onUpdateDriver(driver.id, { ...driver, status: 'إجازة' })}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-1"
                      title="تسجيل أن السائق في إجازة رسمية لحجب شاحنته من المأموريات فوراً"
                    >
                      <span>تسجيل إجازة</span>
                      <span>🏖️</span>
                    </button>
                  )}
                  {(driver.status === 'إجازة' || driver.status === 'اجازة') && (
                    <button
                      type="button"
                      onClick={() => onUpdateDriver(driver.id, { ...driver, status: 'متاح' })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
                      title="إنهاء الإجازة وعودة السائق وشاحنته للجاهزية الفورية"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>إنهاء الإجازة (متاح)</span>
                    </button>
                  )}
                  {driver.status === 'في مأمورية' && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                      على الطريق 🚛
                    </span>
                  )}
                  <button
                    onClick={() => openEditModal(driver)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                    title="تعديل بيانات السائق"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف السائق ${driver.name}؟`)) {
                        onDeleteDriver(driver.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                    title="حذف السائق"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black m-0">
                    {editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد لطاقم الأسطول'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تسجيل بيانات السائق ورخصته وتخصصه
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
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الرباعي للسائق
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد علي"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فئة قيادة الشاحنات
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="سائق كانتر">سائق كانتر (شاسيه طويل)</option>
                    <option value="سائق سيارة صندوق">سائق سيارة صندوق (Box Truck)</option>
                    <option value="سائق نقل ثقيل وتريلات">سائق نقل ثقيل وتريلات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف المحمول
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010xxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الرخصة ودرجتها
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الرقم القومي (14 رقم)
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حالة السائق الحالية
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="متاح">متاح</option>
                    <option value="في مأمورية">في مأمورية</option>
                    <option value="إجازة">إجازة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ انتهاء الرخصة
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات أو توصيات خاصة
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: يفضل خطوط الصعيد / خبير في الطرق السريعة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
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
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingDriver ? 'حفظ التعديلات' : 'إضافة السائق'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
