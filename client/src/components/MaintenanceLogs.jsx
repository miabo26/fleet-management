import React, { useState } from 'react';
import { Wrench, Plus, Truck, Calendar, DollarSign, CheckCircle2, X } from 'lucide-react';

export default function MaintenanceLogs({ maintenanceLogs = [], vehicles = [], onAddLog }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'تغيير زيت وفلاتر',
    cost: 1500,
    odometer: 0,
    workshop: 'الورشة المركزية - جراج شبرا',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      alert('يرجى اختيار السيارة المسجلة للصيانة');
      return;
    }
    onAddLog(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">سجل الصيانة الدورية للأعطال والزيوت</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة دورات تغيير زيت المحرك، الفلاتر، الفرامل، والإطارات لشاحنات الأسطول
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              vehicleId: vehicles[0]?.id || '',
              type: 'تغيير زيت وفلاتر',
              cost: 1500,
              odometer: vehicles[0]?.odometer || 0,
              workshop: 'الورشة المركزية - جراج شبرا',
              notes: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/20 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل صيانة جديدة +</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4">الشاحنة</th>
                <th className="py-3.5 px-4">نوع الصيانة</th>
                <th className="py-3.5 px-4">قراءة العداد</th>
                <th className="py-3.5 px-4">التكلفة</th>
                <th className="py-3.5 px-4">مركز الصيانة / الورشة</th>
                <th className="py-3.5 px-4">الملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceLogs.map(log => {
                const veh = vehicles.find(v => v.id === log.vehicleId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-sans text-slate-600">{log.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {veh ? `${veh.code} (${veh.plateNumber})` : log.vehiclePlate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{log.type}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{log.odometer?.toLocaleString('ar-EG')} كم</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">{log.cost} ج.م</td>
                    <td className="py-3.5 px-4 text-slate-600">{log.workshop}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{log.notes || '---'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <h3 className="text-base font-black m-0">تسجيل عملية صيانة للسيارة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السيارة</label>
                <select
                  value={formData.vehicleId}
                  onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.code} - {v.plateNumber} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الصيانة</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="تغيير زيت وفلاتر">تغيير زيت وفلاتر</option>
                    <option value="صيانة فرامل وتيل">صيانة فرامل وتيل</option>
                    <option value="تغيير وضبط إطارات">تغيير وضبط إطارات</option>
                    <option value="كهرباء وبطارية">كهرباء وبطارية</option>
                    <option value="عمرة محرك / فتيس">عمرة محرك / فتيس</option>
                    <option value="فحص دوري شامل">فحص دوري شامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التكلفة (ج.م)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">قراءة العداد (كم)</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الورشة / المركز</label>
                  <input
                    type="text"
                    value={formData.workshop}
                    onChange={e => setFormData({ ...formData, workshop: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وملاحظات القطع</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  حفظ الصيانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
