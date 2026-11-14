# Orbit Health — Astronaut Risk Alerts

A self-contained React/Vite dashboard for fictional astronaut telemetry. It has no backend, database, routing, or external application-state dependency. The health engine uses **illustrative development thresholds only**; they are not medically validated and must not be used for clinical decisions.

## Run locally

```sh
npm install
npm run dev
```

Use the local URL printed by Vite. Verify the production build and rules with:

```sh
npm test
npm run build
```

## Architecture

- `src/data/dummyData.js` holds fictional crew and simulated telemetry snapshots. Components do not embed fixture readings.
- `src/utils/riskEngine.js` validates inputs, applies configurable thresholds, and returns severity plus parameter-level detections. It has no UI or alert-state dependency.
- `src/utils/alertManager.js` turns detections into uniquely identified alert records, preserves unchanged active conditions, and records acknowledgement and resolution.
- `src/hooks/useRiskAlerts.js` connects incoming readings to analysis/alert reconciliation and exposes update and operator actions.
- `src/components/` contains reusable parameter, crew, alert, history, and dashboard components. `Dashboard` accepts data and callbacks as props; it does not own application routing or global state.

## Data contracts

Supply a list of astronaut objects:

```js
{
  id: 'AST-1042',
  name: 'Commander Maya Chen',
  role: 'Mission Commander',
  avatar: 'MC',
  readings: {
    heartRate: 72,       // bpm
    spo2: 98,            // percent
    temperature: 36.7,   // Celsius
    systolic: 116,       // mmHg
    diastolic: 76,       // mmHg
    respiratoryRate: 15, // breaths/min
    sleepHours: 7.4,     // hours
    timestamp: '2026-11-14T06:30:00.000Z'
  }
}
```

Numeric measurements are expected as finite JavaScript numbers. A `null`, omitted, or empty measurement is reported as missing; non-numeric or out-of-domain values are reported as invalid. Missing/invalid values produce a `WARNING` data-quality detection rather than being treated as normal.

`analyzeReadings(readings, thresholds?)` returns:

```js
{
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL',
  detections: [{
    parameter, parameterLabel, severity, conditionKey,
    value, message, explanation
  }],
  abnormalParameters: ['spo2']
}
```

Threshold configuration is exported as `DEFAULT_THRESHOLDS` from `src/utils/riskEngine.js`. Supply a complete threshold object in the same shape to `analyzeReadings` to customize it. Each parameter defines a `valid: [min, max]` data-domain range and optional `warningLow`, `criticalLow`, `warningHigh`, and `criticalHigh` limits. These defaults are examples, not clinical guidance.

Alert records include `id`, `astronautId`, `astronautName`, `parameter`, `parameterLabel`, `severity`, `conditionKey`, `message`, `explanation`, `value`, `createdAt`, nullable `acknowledgedAt`, nullable `resolvedAt`, and `status` (`ACTIVE` or `RESOLVED`). A persistent condition with the same astronaut and condition key reuses its active alert; cleared or changed conditions are resolved in history. If the same issue later reappears, it gets a new alert ID.

## Replace dummy data with an API

Keep the API adapter outside the risk engine and UI:

1. Fetch/subscribe to telemetry in the host app or a small adapter.
2. Map each API record to the astronaut/readings contract above; normalize units and timestamp format at this boundary. Do not silently coerce invalid measurements into normal-looking values.
3. Pass the resulting astronauts and callbacks to `Dashboard`, or replace the data source inside `useRiskAlerts` with a query/subscription hook.
4. Preserve stable astronaut IDs. Continue calling `reconcileAlerts` when new readings arrive so existing alert history is retained; persist the returned alert state in the host only if cross-session history is required.
5. Add authentication, transport error/loading states, and server-side retention according to the host application's requirements. None are assumed by this demo.

Example integration:

```jsx
<Dashboard
  astronauts={astronauts}
  analyses={analyses} // Map<astronautId, analyzeReadings(readings)>
  alerts={alerts}
  onAcknowledge={handleAcknowledge}
  onResolve={handleResolve}
  onSimulateReadings={refreshTelemetry}
  notificationDurationMs={8000}
/>
```

The supplied `App.jsx` uses the demo hook. In a team application, import `Dashboard` directly and let the existing host own routing and state; do not mount the demo `App` unless a standalone page is desired.

## Operator interactions

- New alert records are grouped in a right-side notification panel. Warning notifications retract after 8 seconds by default; `notificationDurationMs` on `Dashboard` configures this display-only duration. Critical notifications persist until acknowledged, even if the condition resolves, and closing their panel leaves a reminder.
- Use the header bell to open all active alerts in the right-side panel. Acknowledge or resolve alerts there; resolving updates the active badge immediately. Escape or the close button closes the panel.
- Filter crew cards by all, critical, warning, or normal.
- **Simulate update** cycles through separate fictional snapshots, causing new detections and recovery transitions.
