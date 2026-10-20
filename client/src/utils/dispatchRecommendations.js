/**
 * Smart Dispatch Recommendation Engine (نظام الترشيح والتوزيع العادل للمأموريات)
 * Analyzes mission history for the current week and provides vehicle recommendations
 * based on destination rotation and quota conditions (e.g. 0 missions vs >= 2 missions).
 */

/**
 * Returns the Date representing Saturday 00:00:00 of the current week (Egyptian business week standard)
 * @param {Date} refDate 
 * @returns {Date}
 */
export function getStartOfCurrentWeek(refDate = new Date()) {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  // In Egypt, the work week starts on Saturday (day 6)
  const diffToSaturday = (day + 1) % 7;
  d.setDate(d.getDate() - diffToSaturday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Analyzes vehicles against missions to a specific destination in the current week
 * @param {object} params
 * @param {Array} params.vehicles - List of fleet vehicles
 * @param {Array} params.missions - List of all missions
 * @param {string} params.destinationId - The selected destination ID (e.g. 'loc-gharbia-qarshiya')
 * @param {string} params.destinationName - Name of the destination
 * @param {string} params.vehicleTypeFilter - 'all' | 'box' | 'canter'
 * @returns {object} Recommendations and statistics
 */
export function getVehicleDispatchRecommendations({
  vehicles = [],
  missions = [],
  destinationId = '',
  destinationName = 'القرشية',
  vehicleTypeFilter = 'all'
}) {
  const weekStart = getStartOfCurrentWeek();

  // Filter missions that departed on or after weekStart and are not cancelled
  const thisWeekMissions = missions.filter(m => {
    if (m.status === 'cancelled') return false;
    const dep = m.departureDate ? new Date(m.departureDate) : new Date(m.createdAt || 0);
    return dep >= weekStart;
  });

  // Missions specifically to this destination this week
  const destMissionsThisWeek = thisWeekMissions.filter(m => {
    if (!destinationId) return false;
    return m.destinationId === destinationId;
  });

  // Map each vehicle with its statistics
  const analyzedVehicles = vehicles.map(v => {
    // Count missions for this specific vehicle to this destination this week
    const vehicleDestMissions = destMissionsThisWeek.filter(m => m.vehicleId === v.id);
    const destCount = vehicleDestMissions.length;

    // Total missions for this vehicle across all destinations this week
    const vehicleAllMissions = thisWeekMissions.filter(m => m.vehicleId === v.id);
    const totalWeekCount = vehicleAllMissions.length;

    const isBox = v.type && v.type.includes('صندوق');
    const isCanter = v.type && v.type.includes('كانتر');

    // Classification
    let recommendationType = 'moderate';
    let recommendationLabel = '';
    let recommendationTag = '';
    let badgeClass = '';
    let isRecommended = false;
    let hasAchievedMinTwo = false;

    if (destCount === 0) {
      // 0 missions to this destination this week -> HIGHEST RECOMMENDATION (لعدالة التوزيع)
      isRecommended = true;
      recommendationType = 'priority_recommended';
      recommendationLabel = `لم تخرج للوجهة هذا الأسبوع (الأحق بالخروج)`;
      recommendationTag = `⭐ موصى بها (0 مأموريات)`;
      badgeClass = 'bg-emerald-500 text-white border-emerald-600';
    } else if (destCount >= 2) {
      // Achieved the condition of at least 2 missions to this destination
      hasAchievedMinTwo = true;
      recommendationType = 'achieved_minimum';
      recommendationLabel = `حققت شرط مأموريتين كحد أدنى (${destCount} مأموريات)`;
      recommendationTag = `🎯 حققت شرط مأموريتين (${destCount})`;
      badgeClass = 'bg-purple-600 text-white border-purple-700 font-bold';
    } else {
      // Exactly 1 mission
      recommendationType = 'single_mission';
      recommendationLabel = `خرجت مأمورية واحدة للوجهة هذا الأسبوع`;
      recommendationTag = `1 مأمورية سابقة`;
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    }

    return {
      id: v.id,
      code: v.code,
      plateNumber: v.plateNumber,
      type: v.type,
      isBox,
      isCanter,
      status: v.status,
      isAvailable: v.status === 'متاحة',
      currentLocation: v.currentLocation,
      driverId: v.driverId,
      destCountThisWeek: destCount,
      totalWeekCount,
      isRecommended,
      hasAchievedMinTwo,
      recommendationType,
      recommendationLabel,
      recommendationTag,
      badgeClass,
      rawVehicle: v
    };
  });

  // Filter by vehicle type if requested
  const filteredVehicles = analyzedVehicles.filter(v => {
    if (vehicleTypeFilter === 'box') return v.isBox;
    if (vehicleTypeFilter === 'canter') return v.isCanter;
    return true;
  });

  // Segregate categories
  const recommendedVehicles = filteredVehicles.filter(v => v.destCountThisWeek === 0);
  const achievedMinTwoVehicles = filteredVehicles.filter(v => v.hasAchievedMinTwo);
  const singleMissionVehicles = filteredVehicles.filter(v => v.destCountThisWeek === 1);

  // Sort order: Available first, then recommended (0 count), then 1 count, then >= 2 count
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    // Availability first
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    // Then destination count ascending (0 first, then 1, then 2+)
    return a.destCountThisWeek - b.destCountThisWeek;
  });

  return {
    weekStart,
    destinationId,
    destinationName,
    allVehicles: analyzedVehicles,
    filteredVehicles: sortedVehicles,
    recommendedVehicles,
    achievedMinTwoVehicles,
    singleMissionVehicles,
    totalCount: filteredVehicles.length,
    recommendedCount: recommendedVehicles.length,
    achievedCount: achievedMinTwoVehicles.length
  };
}
