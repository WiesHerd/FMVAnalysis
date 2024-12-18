export const calculatePercentile = (value: number, benchmarks: number[]): number => {
  if (!benchmarks.length) return 0;
  const sorted = [...benchmarks].sort((a, b) => a - b);
  
  // If value is less than lowest benchmark
  if (value <= sorted[0]) {
    return Math.max(0, (value / sorted[0]) * 10);
  }
  
  // If value is greater than highest benchmark
  if (value >= sorted[sorted.length - 1]) {
    return Math.min(100, 100 - ((sorted[sorted.length - 1] - value) / sorted[sorted.length - 1]) * 10);
  }
  
  // Find position between benchmarks
  for (let i = 0; i < sorted.length - 1; i++) {
    if (value >= sorted[i] && value <= sorted[i + 1]) {
      const range = sorted[i + 1] - sorted[i];
      const position = value - sorted[i];
      const percentileRange = ((i + 2) * 100 / (sorted.length + 1)) - ((i + 1) * 100 / (sorted.length + 1));
      const basePercentile = (i + 1) * 100 / (sorted.length + 1);
      return basePercentile + (position / range) * percentileRange;
    }
  }
  
  return 0;
};

export const calculateCompensationMetrics = (
  totalCompensation: number,
  wrvus: number,
  callTotal: number,
  adminTotal: number,
  baseTotal: number,
  productivityTotal: number,
  benchmarks: any[]
) => {
  // Calculate per wRVU rate
  const perWrvu = wrvus > 0 ? totalCompensation / wrvus : 0;

  // Extract benchmark values for percentile calculations
  const tccBenchmarks = benchmarks.map(b => b.tcc);
  const wrvuBenchmarks = benchmarks.map(b => b.wrvus);
  const cfBenchmarks = benchmarks.map(b => b.conversionFactor);

  // Calculate percentiles
  const tccPercentile = calculatePercentile(totalCompensation, tccBenchmarks);
  const wrvuPercentile = calculatePercentile(wrvus, wrvuBenchmarks);
  const cfPercentile = calculatePercentile(perWrvu, cfBenchmarks);

  return {
    total: totalCompensation,
    wrvus,
    perWrvu,
    tccPercentile,
    wrvuPercentile,
    cfPercentile,
    components: {
      baseTotal,
      productivityTotal,
      callTotal,
      adminTotal
    }
  };
};
