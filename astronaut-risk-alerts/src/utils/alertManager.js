import { analyzeReadings } from './riskEngine.js';

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function createAlert(astronaut, detection, timestamp, createId) {
  return {
    id: createId(),
    astronautId: astronaut.id,
    astronautName: astronaut.name,
    parameter: detection.parameter,
    parameterLabel: detection.parameterLabel,
    severity: detection.severity,
    conditionKey: detection.conditionKey,
    message: detection.message,
    explanation: detection.explanation,
    value: detection.value,
    createdAt: timestamp,
    acknowledgedAt: null,
    resolvedAt: null,
    status: 'ACTIVE',
  };
}

export function reconcileAlerts(alerts, astronauts, options = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  const createId = options.createId ?? makeId;
  const analyses = new Map(astronauts.map((astronaut) => [astronaut.id, analyzeReadings(astronaut.readings)]));
  const activeDetections = new Map();
  for (const astronaut of astronauts) {
    activeDetections.set(
      astronaut.id,
      new Map(analyses.get(astronaut.id).detections.map((detection) => [detection.conditionKey, detection])),
    );
  }

  let changed = false;
  const reconciled = alerts.map((alert) => {
    if (alert.status !== 'ACTIVE') return alert;
    const detection = activeDetections.get(alert.astronautId)?.get(alert.conditionKey);
    if (detection) {
      activeDetections.get(alert.astronautId).delete(alert.conditionKey);
      if (alert.explanation === detection.explanation) return alert;
      changed = true;
      return { ...alert, explanation: detection.explanation, value: detection.value };
    }
    changed = true;
    return { ...alert, status: 'RESOLVED', resolvedAt: now(), resolution: 'Condition cleared or changed' };
  });

  for (const astronaut of astronauts) {
    const remaining = activeDetections.get(astronaut.id);
    for (const detection of remaining.values()) {
      reconciled.unshift(createAlert(astronaut, detection, now(), createId));
      changed = true;
    }
  }

  return { alerts: changed ? reconciled : alerts, analyses };
}

export function acknowledgeAlert(alerts, alertId, timestamp = new Date().toISOString()) {
  return alerts.map((alert) => alert.id === alertId && !alert.acknowledgedAt
    ? { ...alert, acknowledgedAt: timestamp }
    : alert);
}

export function resolveAlert(alerts, alertId, timestamp = new Date().toISOString()) {
  return alerts.map((alert) => alert.id === alertId && alert.status === 'ACTIVE'
    ? { ...alert, status: 'RESOLVED', resolvedAt: timestamp, resolution: 'Resolved by operator' }
    : alert);
}
