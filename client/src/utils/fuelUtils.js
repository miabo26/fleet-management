/**
 * Utility functions for Fuel Efficiency & Waste Control (رقابة الوقود وترشيد تكلفة النقل)
 */

// Egyptian fleet benchmarks (معدلات الاستهلاك القياسية لشاحنات الأسطول)
export const FUEL_BENCHMARKS = {
  // شاحنات نقل صندوق (شيفروليه جامبو 7000 / 5 طن)
  boxTruck: {
    standardLitersPer100Km: 15.0, // المعيار القياسي: 15 لتر / 100 كم
    minAcceptable: 13.0,
    maxAcceptable: 16.5,
    kmPerLiter: 6.67,             // ~ 6.67 كم لكل لتر
    label: 'شاحنة نقل صندوق (5 طن)'
  },
  // سيارات كانتر شاسيه طويل (ميتسوبيشي فوزو كانتر / 6.5 طن)
  canterTruck: {
    standardLitersPer100Km: 18.5, // المعيار القياسي: 18.5 لتر / 100 كم
    minAcceptable: 16.5,
    maxAcceptable: 20.5,
    kmPerLiter: 5.41,             // ~ 5.41 كم لكل لتر
    label: 'كانتر شاسيه طويل (6.5 طن)'
  },
  // سعر لتر السولار الاسترشادي في مصر (ج.م)
  defaultDieselPricePerLiter: 15.00
};

/**
 * Calculates live fuel efficiency metrics and waste detection for a mission
 * @param {object} params
 * @param {number} params.fuelLiters - Liters of diesel consumed
 * @param {number} params.distanceKm - Distance covered in kilometers
 * @param {string} params.vehicleType - Type of vehicle ('نقل صندوق' or 'كانتر')
 * @param {number} params.fuelExpense - Total actual fuel cost in EGP
 * @param {number} params.fuelPricePerLiter - Price per liter in EGP
 * @returns {object} Efficiency analysis with benchmark comparison and waste level
 */
export function calculateFuelEfficiencyMetrics({
  fuelLiters = 0,
  distanceKm = 0,
  vehicleType = '',
  fuelExpense = 0,
  fuelPricePerLiter = FUEL_BENCHMARKS.defaultDieselPricePerLiter
}) {
  const liters = Number(fuelLiters) || 0;
  const distance = Number(distanceKm) || 0;
  const expense = Number(fuelExpense) || 0;
  const price = Number(fuelPricePerLiter) || FUEL_BENCHMARKS.defaultDieselPricePerLiter;

  const isCanter = typeof vehicleType === 'string' && vehicleType.includes('كانتر');
  const benchmarkConfig = isCanter ? FUEL_BENCHMARKS.canterTruck : FUEL_BENCHMARKS.boxTruck;
  const standardRate = benchmarkConfig.standardLitersPer100Km;

  // If liters is 0 but fuelExpense is provided, estimate liters based on price
  const effectiveLiters = liters > 0 ? liters : (expense > 0 && price > 0 ? expense / price : 0);

  if (distance <= 0 || effectiveLiters <= 0) {
    return {
      hasData: false,
      litersPer100Km: null,
      kmPerLiter: null,
      costPerKm: null,
      standardRate,
      variancePercent: null,
      wasteLiters: 0,
      wasteCostEgp: 0,
      status: 'insufficient_data',
      statusLabel: 'في انتظار تسجيل الكيلومترات ولترات السولار',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      benchmarkConfig
    };
  }

  // Actual rates
  const litersPer100Km = Number(((effectiveLiters / distance) * 100).toFixed(1));
  const kmPerLiter = Number((distance / effectiveLiters).toFixed(2));
  const costPerKm = expense > 0 
    ? Number((expense / distance).toFixed(2)) 
    : Number(((effectiveLiters * price) / distance).toFixed(2));

  // Variance from standard: ((Actual - Standard) / Standard) * 100
  const variancePercent = Number((((litersPer100Km - standardRate) / standardRate) * 100).toFixed(1));

  // Expected liters under standard
  const standardExpectedLiters = (distance * standardRate) / 100;
  const wasteLiters = Math.max(0, effectiveLiters - standardExpectedLiters);
  const wasteCostEgp = Math.round(wasteLiters * price);

  // Status classification
  let status = 'optimal';
  let statusLabel = 'استهلاك مثالي واقتصادي ضمن المعدل القياسي';
  let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (variancePercent > 20) {
    status = 'waste_alert';
    statusLabel = `تنبيه هدر مرتفع: يتجاوز المعيار القياسي بنسبة +${variancePercent}%`;
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold';
  } else if (variancePercent > 10) {
    status = 'moderate_excess';
    statusLabel = `استهلاك أعلى قليلاً من المعيار القياسي (+${variancePercent}%)`;
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
  } else if (variancePercent < -12) {
    status = 'very_efficient';
    statusLabel = `توفير ملحوظ في الوقود (أقل من المعيار بنسبة ${Math.abs(variancePercent)}%)`;
    badgeClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  }

  return {
    hasData: true,
    effectiveLiters: Number(effectiveLiters.toFixed(1)),
    distanceKm: distance,
    litersPer100Km,
    kmPerLiter,
    costPerKm,
    standardRate,
    variancePercent,
    standardExpectedLiters: Number(standardExpectedLiters.toFixed(1)),
    wasteLiters: Number(wasteLiters.toFixed(1)),
    wasteCostEgp,
    status,
    statusLabel,
    badgeClass,
    benchmarkConfig
  };
}

/**
 * Aggregates fuel consumption statistics across completed or active missions
 * @param {Array} missions 
 * @returns {object} Summary fleet fuel analytics
 */
export function aggregateFleetFuelStats(missions = []) {
  let totalDistanceKm = 0;
  let totalFuelExpense = 0;
  let totalEstimatedLiters = 0;
  let boxTotalDist = 0;
  let boxTotalLiters = 0;
  let canterTotalDist = 0;
  let canterTotalLiters = 0;
  let totalWasteCost = 0;
  let analyzedMissionsCount = 0;

  missions.forEach(m => {
    const dist = Number(m.distanceKm) || 0;
    const exp = Number(m.fuelExpense) || 0;
    const price = Number(m.fuelPricePerLiter) || FUEL_BENCHMARKS.defaultDieselPricePerLiter;
    const ltr = Number(m.fuelLiters) || (exp > 0 ? exp / price : 0);

    totalDistanceKm += dist;
    totalFuelExpense += exp;
    totalEstimatedLiters += ltr;

    if (dist > 0 && ltr > 0) {
      analyzedMissionsCount++;
      const isCanter = m.vehicleType && m.vehicleType.includes('كانتر');
      if (isCanter) {
        canterTotalDist += dist;
        canterTotalLiters += ltr;
      } else {
        boxTotalDist += dist;
        boxTotalLiters += ltr;
      }

      const metrics = calculateFuelEfficiencyMetrics({
        fuelLiters: ltr,
        distanceKm: dist,
        vehicleType: m.vehicleType,
        fuelExpense: exp,
        fuelPricePerLiter: price
      });

      if (metrics.wasteCostEgp > 0) {
        totalWasteCost += metrics.wasteCostEgp;
      }
    }
  });

  const fleetAvgLitersPer100Km = totalDistanceKm > 0 && totalEstimatedLiters > 0 
    ? Number(((totalEstimatedLiters / totalDistanceKm) * 100).toFixed(1)) 
    : 0;

  const boxAvgRate = boxTotalDist > 0 
    ? Number(((boxTotalLiters / boxTotalDist) * 100).toFixed(1)) 
    : FUEL_BENCHMARKS.boxTruck.standardLitersPer100Km;

  const canterAvgRate = canterTotalDist > 0 
    ? Number(((canterTotalLiters / canterTotalDist) * 100).toFixed(1)) 
    : FUEL_BENCHMARKS.canterTruck.standardLitersPer100Km;

  const fleetCostPerKm = totalDistanceKm > 0 
    ? Number((totalFuelExpense / totalDistanceKm).toFixed(2)) 
    : 0;

  return {
    totalDistanceKm,
    totalFuelExpense,
    totalEstimatedLiters: Math.round(totalEstimatedLiters),
    fleetAvgLitersPer100Km,
    fleetCostPerKm,
    boxAvgRate,
    canterAvgRate,
    totalWasteCost,
    analyzedMissionsCount
  };
}
