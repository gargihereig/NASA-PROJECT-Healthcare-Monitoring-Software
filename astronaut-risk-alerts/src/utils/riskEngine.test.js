import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeReadings, PARAMETER_DEFINITIONS, SEVERITY } from './riskEngine.js';
import { acknowledgeAlert, reconcileAlerts, resolveAlert } from './alertManager.js';

const normalReadings = {
  heartRate: 72,
  spo2: 98,
  temperature: 36.7,
  systolic: 116,
  diastolic: 76,
  respiratoryRate: 15,
  sleepHours: 7.4,
};
const astronaut = (readings = normalReadings) => ({ id: 'AST-TEST', name: 'Test Astronaut', readings });
const options = { now: () => '2026-01-01T00:00:00.000Z', createId: (() => { let id = 0; return () => `test-${++id}`; })() };

test('normal readings produce no detections', () => {
  assert.deepEqual(analyzeReadings(normalReadings), { severity: SEVERITY.NORMAL, detections: [], abnormalParameters: [] });
});

test('warning and critical threshold readings receive the expected severity', () => {
  assert.equal(analyzeReadings({ ...normalReadings, heartRate: 105 }).severity, SEVERITY.WARNING);
  assert.equal(analyzeReadings({ ...normalReadings, heartRate: 140 }).severity, SEVERITY.CRITICAL);
});

test('multiple simultaneous abnormalities are all identified and highest severity wins', () => {
  const result = analyzeReadings({ ...normalReadings, heartRate: 140, spo2: 88, sleepHours: 5 });
  assert.equal(result.severity, SEVERITY.CRITICAL);
  assert.deepEqual(result.abnormalParameters.sort(), ['heartRate', 'sleepHours', 'spo2']);
});

test('missing and invalid values are warnings, never normal', () => {
  const missing = { ...normalReadings, spo2: null };
  const invalid = { ...normalReadings, spo2: 'ninety-eight' };
  assert.equal(analyzeReadings(missing).severity, SEVERITY.WARNING);
  assert.match(analyzeReadings(missing).detections[0].explanation, /not been reported/);
  assert.equal(analyzeReadings(invalid).severity, SEVERITY.WARNING);
  assert.match(analyzeReadings(invalid).detections[0].explanation, /invalid value/);
});

test('out-of-domain numeric values are treated as invalid data', () => {
  const result = analyzeReadings({ ...normalReadings, spo2: 140 });
  assert.equal(result.detections[0].conditionKey, 'spo2:invalid');
});

test('recovery resolves active alerts and unchanged conditions do not duplicate', () => {
  const warningAstronaut = astronaut({ ...normalReadings, heartRate: 105 });
  const first = reconcileAlerts([], [warningAstronaut], options);
  const repeated = reconcileAlerts(first.alerts, [warningAstronaut], options);
  assert.equal(first.alerts.length, 1);
  assert.equal(repeated.alerts.length, 1);
  assert.equal(first.alerts[0].id, repeated.alerts[0].id);

  const recovered = reconcileAlerts(first.alerts, [astronaut()], options);
  assert.equal(recovered.alerts[0].status, 'RESOLVED');
  assert.equal(recovered.alerts[0].resolvedAt, options.now());
  assert.equal(recovered.analyses.get('AST-TEST').severity, SEVERITY.NORMAL);
});

test('alerts can be acknowledged and resolved by an operator', () => {
  const active = reconcileAlerts([], [astronaut({ ...normalReadings, spo2: 92 })], options).alerts;
  const acknowledged = acknowledgeAlert(active, active[0].id, options.now());
  assert.equal(acknowledged[0].acknowledgedAt, options.now());
  const resolved = resolveAlert(acknowledged, active[0].id, options.now());
  assert.equal(resolved[0].status, 'RESOLVED');
  assert.deepEqual(resolveAlert(resolved, active[0].id), resolved);
});

test('a resolved critical alert can still be acknowledged', () => {
  const active = reconcileAlerts([], [astronaut({ ...normalReadings, heartRate: 140 })], options).alerts;
  const resolved = resolveAlert(active, active[0].id, options.now());
  const acknowledged = acknowledgeAlert(resolved, active[0].id, options.now());
  assert.equal(acknowledged[0].status, 'RESOLVED');
  assert.equal(acknowledged[0].acknowledgedAt, options.now());
});

test('every configured health parameter is evaluated', () => {
  const result = analyzeReadings({});
  assert.equal(result.detections.length, PARAMETER_DEFINITIONS.length);
  assert.equal(result.severity, SEVERITY.WARNING);
});
