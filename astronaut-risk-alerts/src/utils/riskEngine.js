export const SEVERITY = Object.freeze({
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
});

export const PARAMETER_DEFINITIONS = Object.freeze([
  { key: 'heartRate', label: 'Heart rate', unit: 'bpm', decimals: 0 },
  { key: 'spo2', label: 'Blood oxygen', unit: '%', decimals: 0 },
  { key: 'temperature', label: 'Body temperature', unit: '°C', decimals: 1 },
  { key: 'systolic', label: 'Systolic pressure', unit: 'mmHg', decimals: 0 },
  { key: 'diastolic', label: 'Diastolic pressure', unit: 'mmHg', decimals: 0 },
  { key: 'respiratoryRate', label: 'Respiratory rate', unit: '/min', decimals: 0 },
  { key: 'sleepHours', label: 'Sleep duration', unit: 'h', decimals: 1 },
]);

export const DEFAULT_THRESHOLDS = Object.freeze({
  heartRate: { valid: [0, 250], warningLow: 50, criticalLow: 40, warningHigh: 100, criticalHigh: 130 },
  spo2: { valid: [0, 100], warningLow: 95, criticalLow: 90 },
  temperature: { valid: [25, 45], warningLow: 36, criticalLow: 35, warningHigh: 37.8, criticalHigh: 39 },
  systolic: { valid: [40, 300], warningLow: 90, criticalLow: 80, warningHigh: 140, criticalHigh: 180 },
  diastolic: { valid: [20, 200], warningLow: 60, criticalLow: 50, warningHigh: 90, criticalHigh: 120 },
  respiratoryRate: { valid: [0, 80], warningLow: 12, criticalLow: 8, warningHigh: 20, criticalHigh: 30 },
  sleepHours: { valid: [0, 24], warningLow: 6, criticalLow: 4 },
});

const severityRank = { NORMAL: 0, WARNING: 1, CRITICAL: 2 };
const formatValue = (value, definition) => `${Number(value).toFixed(definition.decimals)} ${definition.unit}`;

function dataQualityDetection(definition, issue, value) {
  const isMissing = issue === 'missing';
  return {
    parameter: definition.key,
    parameterLabel: definition.label,
    severity: SEVERITY.WARNING,
    conditionKey: `${definition.key}:${issue}`,
    value,
    explanation: isMissing
      ? `${definition.label} has not been reported. Risk cannot be assessed for this parameter.`
      : `${definition.label} contains an invalid value${value === undefined ? '' : ` (${String(value)})`}; risk cannot be assessed.`,
    message: isMissing ? `${definition.label} data missing` : `Invalid ${definition.label.toLowerCase()} data`,
  };
}

function thresholdDetection(definition, value, thresholds) {
  const rules = thresholds[definition.key];
  const checks = [
    { side: 'low', severity: SEVERITY.CRITICAL, limit: rules.criticalLow },
    { side: 'high', severity: SEVERITY.CRITICAL, limit: rules.criticalHigh },
    { side: 'low', severity: SEVERITY.WARNING, limit: rules.warningLow },
    { side: 'high', severity: SEVERITY.WARNING, limit: rules.warningHigh },
  ];

  for (const check of checks) {
    if (check.limit === undefined) continue;
    const isOutside = check.side === 'low' ? value < check.limit : value > check.limit;
    if (!isOutside) continue;
    const direction = check.side === 'low' ? 'below' : 'above';
    const formattedValue = formatValue(value, definition);
    return {
      parameter: definition.key,
      parameterLabel: definition.label,
      severity: check.severity,
      conditionKey: `${definition.key}:${check.side}-${check.severity.toLowerCase()}`,
      value,
      message: `${definition.label} ${check.severity === SEVERITY.CRITICAL ? 'critical' : 'outside'} range`,
      explanation: `${definition.label} is ${formattedValue}, ${direction} the illustrative ${check.severity.toLowerCase()} threshold of ${check.limit} ${definition.unit}.`,
    };
  }
  return null;
}

export function analyzeReadings(readings, thresholds = DEFAULT_THRESHOLDS) {
  const detections = [];
  for (const definition of PARAMETER_DEFINITIONS) {
    const value = readings?.[definition.key];
    if (value === null || value === undefined || value === '') {
      detections.push(dataQualityDetection(definition, 'missing'));
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      detections.push(dataQualityDetection(definition, 'invalid', value));
      continue;
    }
    const [minimum, maximum] = thresholds[definition.key].valid;
    if (value < minimum || value > maximum) {
      detections.push(dataQualityDetection(definition, 'invalid', value));
      continue;
    }
    const detection = thresholdDetection(definition, value, thresholds);
    if (detection) detections.push(detection);
  }

  const severity = detections.reduce(
    (highest, detection) => severityRank[detection.severity] > severityRank[highest] ? detection.severity : highest,
    SEVERITY.NORMAL,
  );
  return { severity, detections, abnormalParameters: detections.map((detection) => detection.parameter) };
}
