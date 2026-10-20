import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  User, 
  Plus, 
  ArrowUpRight, 
  Compass, 
  Shield, 
  Edit2, 
  Edit3, 
  X, 
  Save, 
  Building2, 
  PhoneCall 
} from 'lucide-react';

// Custom DivIcons for Map Pins
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });
};

const icons = {
  garage: createCustomIcon('#f59e0b', '🅿️'), // Amber for Garage
  main: createCustomIcon('#2563eb', '🏢'),   // Blue for Main Warehouse
  regional: createCustomIcon('#10b981', '🏬') // Emerald for Regional
};

export default function WarehousesMap({ 
  warehouses = [], 
  missions = [], 
  onOpenNewMissionWithDest,
  onUpdateWarehouse 
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({ manager: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (w) => {
    setEditingWarehouse(w);
    setFormData({
      manager: w.manager || '',
      phone: w.phone || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingWarehouse || !onUpdateWarehouse) return;
    setIsSaving(true);
    try {
      await onUpdateWarehouse(editingWarehouse.id, {
        manager: formData.manager.trim(),
        phone: formData.phone.trim()
      });
      setEditingWarehouse(null);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ البيانات: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Egypt Center
  const center = [28.5, 31.5];

  // Route lines from Tagamoa Main Warehouse to each destination
  const tagamoaCoords = [29.96714, 31.50055];
  const shubraCoords = [30.1085, 31.2464];

  const routes = [
    {
      name: 'خط القاهرة - الدلتا والغربية (القرشية)',
      dest: [30.84963, 31.11938],
      distance: '165 كم',
      time: 'ساعتان و45 دقيقة',
      occupancyText: '🟢 إشغال 1 يوم: ذهاب وعودة في نفس اليوم',
      color: '#3b82f6'
    },
    {
      name: 'خط القاهرة - مصر الوسطى والمنيا الجديدة (مركز الطويل الإداري)',
      dest: [28.0865, 30.7985],
      distance: '260 كم',
      time: '3 ساعات ونصف',
      occupancyText: '🟡 إشغال يومين: ذهاب اليوم + مبيت وعودة الغد',
      color: '#8b5cf6'
    },
    {
      name: 'خط القاهرة - مصر العليا وسوهاج (الكوثر / السلاموني)',
      dest: [26.61288, 31.78125],
      distance: '495 كم',
      time: '6 ساعات ونصف',
      occupancyText: '🟣 إشغال 3 أيام: يوم ذهاب + يوم راحة وتفريغ + يوم عودة',
      color: '#10b981'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">شبكة المخازن والمسارات اللوجستية في مصر</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                المخزن الرئيسي بالتجمع وجراج شبرا والمخازن الإقليمية الثلاثة (الغربية - المنيا - سوهاج)
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            المخزن الرئيسي (التجمع)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            الجراج (شبرا)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            مخازن إقليمية (3)
          </span>
        </div>
      </div>

      {/* Map + Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[540px] relative z-10">
          <MapContainer 
            center={center} 
            zoom={6.8} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Warehouse Markers */}
            {warehouses.map(w => {
              const icon = w.type === 'garage' ? icons.garage : w.type === 'main_warehouse' ? icons.main : icons.regional;
              const activeIncoming = missions.filter(m => m.destinationId === w.id && ['assigned', 'loading', 'on_road'].includes(m.status));

              return (
                <Marker 
                  key={w.id} 
                  position={w.coordinates} 
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedWarehouse(w),
                  }}
                >
                  <Popup>
                    <div className="text-right p-1 font-sans text-xs dir-rtl" style={{ direction: 'rtl' }}>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 block mb-1">
                        {w.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 m-0 mb-1">{w.name}</h4>
                      <p className="text-[11px] text-slate-600 mb-1">{w.address}</p>
                      <div className="text-[11px] text-slate-700 font-bold mb-1">
                        المسؤول: {w.manager && w.manager.trim() ? `${w.manager} ${w.phone ? `(${w.phone})` : ''}` : 'غير محدد بعد (يمكن إدراجه من القائمة)'}
                      </div>
                      {activeIncoming.length > 0 && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded font-bold mt-1">
                          🚚 شحنات في الطريق حالياً: {activeIncoming.length} مأمورية
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route Polylines */}
            {routes.map((r, i) => (
              <Polyline 
                key={i} 
                positions={[tagamoaCoords, r.dest]} 
                color={r.color} 
                weight={3.5} 
                opacity={0.8}
                dashArray="6, 8" 
              />
            ))}

            {/* Link between Shubra Garage and Tagamoa Main Warehouse */}
            <Polyline 
              positions={[shubraCoords, tagamoaCoords]} 
              color="#f59e0b" 
              weight={3} 
              opacity={0.9} 
            />
          </MapContainer>
        </div>

        {/* Route Details & Logistics Information */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              المسافات ومسارات الشحن المعتمدة
            </h3>

            <div className="space-y-3">
              {routes.map((route, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{route.name}</span>
                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {route.distance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>زمن الرحلة: <strong>{route.time}</strong></span>
                    <span>طريق سريع حر</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200/60 text-[11px] font-bold text-slate-700">
                    {route.occupancyText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Cards */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              المخازن الإقليمية الثلاثة
            </h4>
            
            <div className="space-y-2 text-xs">
              {warehouses.filter(w => w.type === 'regional_warehouse').map(w => (
                <div key={w.id} className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white m-0 text-xs">{w.name}</h5>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{w.city}</span>
                  </div>
                  <button
                    onClick={() => onOpenNewMissionWithDest && onOpenNewMissionWithDest(w.id)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>مأمورية جديدة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Warehouse Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {warehouses.map(w => (
          <div key={w.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  w.type === 'garage'
                    ? 'bg-amber-100 text-amber-800'
                    : w.type === 'main_warehouse'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {w.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">{w.city}</span>
                  <button
                    onClick={() => openEditModal(w)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    title="تعديل بيانات المسؤول والهاتف"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تعديل</span>
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-base text-slate-900 m-0">{w.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{w.address}</p>

              {/* Responsible Person & Phone (Capacity completely deleted) */}
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>المسؤول:</span>
                  </span>
                  {w.manager && w.manager.trim() ? (
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-800 font-bold">{w.manager}</strong>
                      <button
                        onClick={() => openEditModal(w)}
                        title="تعديل اسم المسؤول"
                        className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openEditModal(w)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>أدرج اسم المسؤول</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>الهاتف:</span>
                  </span>
                  {w.phone && w.phone.trim() ? (
                    <div className="flex items-center gap-1.5">
                      <a 
                        href={`tel:${w.phone}`} 
                        dir="ltr"
                        className="font-bold text-blue-600 hover:underline font-mono"
                      >
                        {w.phone}
                      </a>
                      <button
                        onClick={() => openEditModal(w)}
                        title="تعديل رقم الهاتف"
                        className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openEditModal(w)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>أدرج رقم الهاتف</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {w.plusCode ? `Plus Code: ${w.plusCode}` : `إحداثيات: ${w.coordinates[0].toFixed(2)}, ${w.coordinates[1].toFixed(2)}`}
              </span>
              <a
                href={w.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${w.coordinates[0]},${w.coordinates[1]}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Edit Warehouse Manager & Phone Modal */}
      {editingWarehouse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">تعديل بيانات المسؤول والتواصل</h3>
              </div>
              <button
                onClick={() => setEditingWarehouse(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {editingWarehouse.category}
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1 mb-0.5">{editingWarehouse.name}</h4>
                <p className="text-xs text-slate-500">{editingWarehouse.address}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>اسم المسؤول عن الموقع / المخزن</span>
                  </label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="أدخل الاسم الحقيقي للمسؤول أو اتركه خالياً"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    إذا تركت الخانة خالية سيظهر زر «أدرج اسم المسؤول»
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>رقم الهاتف للتواصل المباشر</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="مثال: 01012345678 أو اتركه خالياً"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-right"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    الرقم المعتمد للتواصل مع السائقين والمكتب
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
