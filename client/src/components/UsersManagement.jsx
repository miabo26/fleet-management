import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';

export default function UsersManagement({ 
  users = [], 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 m-0">إدارة المستخدمين والصلاحيات</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تأمين الرابط وتحديد صلاحيات الموظفين (مدير عام • مسؤول حركة • أمين مخزن • مشاهد فقط)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-sm"
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
          const isMainAdmin = user.id === 'user-admin-1';
          const isSelf = currentUser?.id === user.id;

          return (
            <div 
              key={user.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 text-right transition-all hover:shadow-md ${
                user.status === 'inactive' ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                    user.role === 'dispatcher' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'warehouse_manager' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 m-0 flex items-center gap-1.5 flex-wrap">
                      <span>{user.name}</span>
                      {isSelf && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                          حسابك الحالي
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {user.status === 'active' ? 'حساب نشط' : 'حساب معطل'}
                </span>
              </div>

              {/* Role Badge */}
              <div className="pt-1">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border inline-flex items-center gap-1.5 ${roleInfo.badgeClass}`}>
                  <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{roleInfo.label}</span>
                </span>
              </div>

              {/* Details Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    جهة العمل / الإدارة:
                  </span>
                  <strong className="text-slate-800">{user.department || 'البريد المصري'}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    رقم الهاتف:
                  </span>
                  <span className="font-mono font-bold text-slate-800">{user.phone || 'غير مسجل'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {!isMainAdmin ? (
                    <button
                      type="button"
                      onClick={() => onUpdateUser(user.id, { ...user, status: user.status === 'active' ? 'inactive' : 'active' })}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        user.status === 'active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {user.status === 'active' ? 'تعطيل الدخول' : 'تفعيل الحساب'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      حساب المدير العام المحمي
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer"
                    title="تعديل بيانات المستخدم أو كلمة المرور"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {!isMainAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف حساب المستخدم ${user.name}؟`)) {
                          onDeleteUser(user.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                      title="حذف المستخدم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200" dir="rtl">
            
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black m-0">
                    {editingUser ? 'تعديل بيانات المستخدم والصلاحيات' : 'إضافة مستخدم جديد للمنظومة'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحديد اسم المستخدم، كلمة المرور، ونطاق الصلاحيات
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
                  الاسم الكامل للمستخدم
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبد الله (مشرف الحركة)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم للدخول (Username)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUser)}
                    placeholder="مثال: ahmed.ops"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'اتركها فارغة للإبقاء على الحالية' : 'أدخل كلمة مرور قوية'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الصلاحية ونطاق الدور
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="admin">مدير عام المنظومة (تحكم كامل في كل شيء)</option>
                  <option value="dispatcher">مسؤول حركة وتشغيل (إنشاء مأموريات وتكليف السيارات)</option>
                  <option value="warehouse_manager">أمين مخزن إقليمي (استلام الشحنات وتأكيد الوصول)</option>
                  <option value="viewer">مشاهد واستعلام فقط (للاطلاع بدون إمكانية التعديل)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    جهة العمل أو المقر اللوجستي
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: جراج شبرا / مخزن القرشية"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف والتواصل
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 010xxxxxxxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="active">حساب نشط (يمكنه تسجيل الدخول)</option>
                  <option value="inactive">حساب معطل (محظور من الدخول)</option>
                </select>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
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
