import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ActiveAlertsPanel from './ActiveAlertsPanel.jsx';
import AstronautCard from './AstronautCard.jsx';
import zenithLogo from '../assets/Zenith logo.png';

const filters = ['ALL', 'CRITICAL', 'WARNING', 'NORMAL'];
const PANEL_TRANSITION_DURATION_MS = 260;
const DEFAULT_NOTIFICATION_DURATION_MS = 8000;

function Metric({ label, value, tone, caption }) {
  return (
    <div className={`metric-card ${tone ? `metric-${tone}` : ''}`}>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="metric-caption">{caption}</span>
    </div>
  );
}

export default function Dashboard({
  astronauts,
  analyses,
  alerts,
  onAcknowledge,
  onResolve,
  onSimulateReadings,
  notificationDurationMs = DEFAULT_NOTIFICATION_DURATION_MS,
}) {
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(astronauts[0]?.id ?? null);
  const [panelMode, setPanelMode] = useState(null);
  const [notificationIds, setNotificationIds] = useState([]);
  const seenAlertIds = useRef(new Set());
  const notificationTimers = useRef(new Map());
  const panelCloseTimer = useRef(null);
  const notificationPanelDismissed = useRef(false);
  const panelModeRef = useRef(panelMode);
  const notificationIdsRef = useRef(notificationIds);
  const alertsByIdRef = useRef(new Map(alerts.map((alert) => [alert.id, alert])));
  panelModeRef.current = panelMode;
  notificationIdsRef.current = notificationIds;
  alertsByIdRef.current = new Map(alerts.map((alert) => [alert.id, alert]));

  const counts = useMemo(() => astronauts.reduce((total, astronaut) => {
    const severity = analyses.get(astronaut.id)?.severity ?? 'WARNING';
    total[severity] += 1;
    return total;
  }, { NORMAL: 0, WARNING: 0, CRITICAL: 0 }), [astronauts, analyses]);
  const filteredAstronauts = astronauts.filter((astronaut) => (
    filter === 'ALL' || analyses.get(astronaut.id)?.severity === filter
  ));
  const activeAlerts = alerts
    .filter((alert) => alert.status === 'ACTIVE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const notifications = notificationIds
    .map((id) => alertsByIdRef.current.get(id))
    .filter(Boolean);
  const unacknowledgedCriticalNotifications = notifications.filter(
    (alert) => alert.severity === 'CRITICAL' && !alert.acknowledgedAt,
  );
  const latestTimestamp = astronauts.reduce((latest, astronaut) => (
    astronaut.readings.timestamp > latest ? astronaut.readings.timestamp : latest
  ), '');

  const removeNotification = useCallback((alertId) => {
    setNotificationIds((current) => current.filter((id) => id !== alertId));
    const timer = notificationTimers.current.get(alertId);
    if (timer) clearTimeout(timer);
    notificationTimers.current.delete(alertId);
  }, []);

  const closePanel = useCallback((dismissNotifications = true) => {
    const currentMode = panelModeRef.current;
    if (currentMode !== 'active' && currentMode !== 'notifications') return;

    if (dismissNotifications && currentMode === 'notifications') {
      notificationPanelDismissed.current = true;
      notificationIdsRef.current.forEach((id) => {
        const alert = alertsByIdRef.current.get(id);
        if (alert?.severity !== 'CRITICAL') removeNotification(id);
      });
    }

    const closingMode = `closing-${currentMode}`;
    setPanelMode(closingMode);
    if (panelCloseTimer.current) clearTimeout(panelCloseTimer.current);
    panelCloseTimer.current = setTimeout(() => {
      setPanelMode((current) => {
        if (current !== closingMode) return current;
        if (
          currentMode === 'active'
          && !notificationPanelDismissed.current
          && notificationIdsRef.current.length > 0
        ) return 'notifications';
        return null;
      });
      panelCloseTimer.current = null;
    }, PANEL_TRANSITION_DURATION_MS);
  }, [removeNotification]);

  useEffect(() => {
    const newAlerts = alerts.filter((alert) => !seenAlertIds.current.has(alert.id));
    if (!newAlerts.length) return;

    newAlerts.forEach((alert) => seenAlertIds.current.add(alert.id));
    notificationPanelDismissed.current = false;
    if (panelCloseTimer.current) {
      clearTimeout(panelCloseTimer.current);
      panelCloseTimer.current = null;
    }
    setNotificationIds((current) => [...new Set([...current, ...newAlerts.map((alert) => alert.id)])]);
    setPanelMode((current) => current === 'active' ? current : 'notifications');

    const duration = Math.max(0, notificationDurationMs);
    newAlerts
      .filter((alert) => alert.severity !== 'CRITICAL')
      .forEach((alert) => {
        const timer = setTimeout(() => removeNotification(alert.id), duration);
        notificationTimers.current.set(alert.id, timer);
      });
  }, [alerts, notificationDurationMs, removeNotification]);

  useEffect(() => {
    const noLongerNotifiableIds = new Set(
      alerts
        .filter((alert) => (
          (alert.status === 'RESOLVED' && alert.severity !== 'CRITICAL')
          || (alert.severity === 'CRITICAL' && alert.acknowledgedAt)
        ))
        .map((alert) => alert.id),
    );
    if (!noLongerNotifiableIds.size) return;
    noLongerNotifiableIds.forEach((id) => {
      const timer = notificationTimers.current.get(id);
      if (timer) clearTimeout(timer);
      notificationTimers.current.delete(id);
    });
    setNotificationIds((current) => current.filter((id) => !noLongerNotifiableIds.has(id)));
  }, [alerts]);

  useEffect(() => {
    if (panelMode === 'notifications' && notifications.length === 0) closePanel(false);
  }, [panelMode, notifications.length, closePanel]);

  useEffect(() => () => {
    notificationTimers.current.forEach((timer) => clearTimeout(timer));
    if (panelCloseTimer.current) clearTimeout(panelCloseTimer.current);
  }, []);

  const openAllAlerts = useCallback(() => {
    if (panelCloseTimer.current) {
      clearTimeout(panelCloseTimer.current);
      panelCloseTimer.current = null;
    }
    setPanelMode('active');
  }, []);
  const showNotifications = useCallback(() => {
    notificationPanelDismissed.current = false;
    setPanelMode('notifications');
  }, []);

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="ZENITH home">
          <img className="brand-mark" src={zenithLogo} alt="Zenith Logo" />
          <span>ZENITH</span>
        </a>
        <div className="topbar-status"><span className="live-dot" /> TELEMETRY ONLINE <span className="status-divider">|</span> DEMO ENVIRONMENT</div>
        <button
          aria-expanded={panelMode === 'active'}
          aria-haspopup="dialog"
          aria-controls={panelMode === 'active' ? 'active-alerts-panel' : undefined}
          className="active-alerts-trigger"
          onClick={openAllAlerts}
          type="button"
        >
          <svg aria-hidden="true" className="alert-bell" fill="none" viewBox="0 0 20 20">
            <path d="M15.5 7.5a5.5 5.5 0 0 0-11 0c0 6-2 6-2 7.5h15c0-1.5-2-1.5-2-7.5ZM8 17h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
          Active alerts
          <span aria-label={`${activeAlerts.length} active alerts`} className="notification-badge">{activeAlerts.length}</span>
        </button>
        <button className="update-button" onClick={onSimulateReadings} type="button">
          <span aria-hidden="true">↻</span> Simulate update
        </button>
      </header>

      <div className="dashboard-content" id="overview">
        <section className="page-heading">
          <div>
            <p className="eyebrow">FLIGHT DECK <span>/</span> CREW HEALTH</p>
            <h1>Health risk overview</h1>
            <p className="page-subtitle">A live view of crew vitals and active health signals.</p>
          </div>
          <div className="last-updated"><span className="live-dot" /> LAST TELEMETRY <strong>{latestTimestamp ? new Date(latestTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</strong></div>
        </section>

        <section className="metrics-grid" aria-label="Crew health summary">
          <Metric label="CREW MONITORED" value={astronauts.length} caption="Active crew profiles" />
          <Metric label="NORMAL" value={counts.NORMAL} tone="normal" caption="No detected conditions" />
          <Metric label="WARNING" value={counts.WARNING} tone="warning" caption="Needs attention" />
          <Metric label="CRITICAL" value={counts.CRITICAL} tone="critical" caption="Priority response" />
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div><p className="eyebrow">CREW TELEMETRY</p><h2>Astronaut health</h2></div>
            <div className="filter-group" aria-label="Filter astronauts by severity">
              {filters.map((item) => (
                <button
                  aria-pressed={filter === item}
                  className={filter === item ? 'filter-button is-active' : 'filter-button'}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >{item === 'ALL' ? 'All alerts' : item.charAt(0) + item.slice(1).toLowerCase()}</button>
              ))}
            </div>
          </div>
          <div className="crew-grid">
            {filteredAstronauts.map((astronaut) => (
              <AstronautCard
                analysis={analyses.get(astronaut.id)}
                astronaut={astronaut}
                key={astronaut.id}
                onSelect={() => setSelectedId(astronaut.id)}
                selected={selectedId === astronaut.id}
              />
            ))}
            {!filteredAstronauts.length && <p className="empty-state">No crew members match this severity.</p>}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>ZENITH <span>·</span> FLIGHT SYSTEMS DEMO</span>
          <span>Illustrative thresholds only — not medically validated or for clinical use.</span>
        </footer>
      </div>
      {panelMode && (
        <ActiveAlertsPanel
          activeAlerts={activeAlerts}
          mode={panelMode}
          notifications={notifications}
          onAcknowledge={onAcknowledge}
          onClose={closePanel}
          onResolve={onResolve}
          onViewDetails={openAllAlerts}
        />
      )}
      {!panelMode && unacknowledgedCriticalNotifications.length > 0 && (
        <button className="critical-reminder" onClick={showNotifications} type="button">
          <span className="critical-reminder-dot" />
          {unacknowledgedCriticalNotifications.length} critical alert{unacknowledgedCriticalNotifications.length === 1 ? '' : 's'} need acknowledgment
          <span aria-hidden="true">→</span>
        </button>
      )}
    </main>
  );
}
