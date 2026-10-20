/**
 * Utility functions for Vehicle and Driver License Tracking & Expiry Alerts
 */

/**
 * Calculates the license expiry status given an ISO date string (YYYY-MM-DD)
 * @param {string} dateStr 
 * @returns {object} Status object containing status, daysRemaining, label, badgeClass, etc.
 */
export function calculateLicenseStatus(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return {
      status: 'unrecorded',
      daysRemaining: null,
      label: 'غير مسجل تاريخ',
      shortLabel: 'غير مسجل',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);

  if (isNaN(expiry.getTime())) {
    return {
      status: 'unrecorded',
      daysRemaining: null,
      label: 'تاريخ غير صالح',
      shortLabel: 'غير صالح',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200'
    };
  }

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const pastDays = Math.abs(diffDays);
    return {
      status: 'expired',
      daysRemaining: diffDays,
      label: `منتهية منذ ${pastDays} يوم`,
      shortLabel: `منتهية (${pastDays}ي)`,
      color: 'rose',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse'
    };
  } else if (diffDays === 0) {
    return {
      status: 'expired',
      daysRemaining: 0,
      label: 'تنتهي اليوم فوراً!',
      shortLabel: 'تنتهي اليوم',
      color: 'rose',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'expiring_soon',
      daysRemaining: diffDays,
      label: `تنتهي خلال ${diffDays} يوم`,
      shortLabel: `خلال ${diffDays} يوم`,
      color: 'amber',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
    };
  } else {
    return {
      status: 'valid',
      daysRemaining: diffDays,
      label: `سارية (متبقي ${diffDays} يوم)`,
      shortLabel: `سارية (${diffDays}ي)`,
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium'
    };
  }
}

/**
 * Aggregates license alerts across vehicles and drivers
 * @param {Array} vehicles 
 * @param {Array} drivers 
 * @returns {object} Summary counts and detailed items
 */
export function getFleetLicenseAlerts(vehicles = [], drivers = []) {
  const vehicleAlerts = vehicles.map(v => ({
    id: v.id,
    type: 'vehicle',
    title: `${v.code} - ${v.plateNumber || 'بدون لوحة'}`,
    subtitle: `${v.type} • ${v.model || ''}`,
    identifier: v.plateNumber || 'لوحات غير مسجلة',
    code: v.code,
    licenseExpiry: v.licenseExpiry,
    statusInfo: calculateLicenseStatus(v.licenseExpiry),
    rawItem: v
  }));

  const driverAlerts = drivers.map(d => ({
    id: d.id,
    type: 'driver',
    title: d.name,
    subtitle: `${d.role} • ${d.phone || 'بدون هاتف'}`,
    identifier: d.licenseNumber || 'رقم رخصة غير مسجل',
    licenseExpiry: d.licenseExpiry,
    statusInfo: calculateLicenseStatus(d.licenseExpiry),
    rawItem: d
  }));

  const allAlerts = [...vehicleAlerts, ...driverAlerts];

  const expiredList = allAlerts.filter(a => a.statusInfo.status === 'expired');
  const expiringSoonList = allAlerts.filter(a => a.statusInfo.status === 'expiring_soon');
  const unrecordedList = allAlerts.filter(a => a.statusInfo.status === 'unrecorded');
  const validList = allAlerts.filter(a => a.statusInfo.status === 'valid');

  const urgentCount = expiredList.length + expiringSoonList.length;

  return {
    allAlerts,
    vehicleAlerts,
    driverAlerts,
    expiredList,
    expiringSoonList,
    unrecordedList,
    validList,
    urgentCount,
    expiredCount: expiredList.length,
    expiringSoonCount: expiringSoonList.length,
    unrecordedCount: unrecordedList.length,
    validCount: validList.length,
    totalCount: allAlerts.length
  };
}
