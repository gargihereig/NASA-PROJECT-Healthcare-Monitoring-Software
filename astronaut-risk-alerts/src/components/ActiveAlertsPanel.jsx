import { useEffect, useRef } from 'react';
import AlertList from './AlertList.jsx';
import { PARAMETER_DEFINITIONS } from '../utils/riskEngine.js';

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatReading(alert) {
  if (typeof alert.value !== 'number' || !Number.isFinite(alert.value)) {
    return alert.value === null || alert.value === undefined ? 'Unavailable' : `Invalid: ${String(alert.value)}`;
  }
  const definition = PARAMETER_DEFINITIONS.find((item) => item.key === alert.parameter);
  return `${alert.value.toFixed(definition?.decimals ?? 0)} ${definition?.unit ?? ''}`.trim();
}

function NotificationCard({ alert, onAcknowledge, onViewDetails }) {
  return (
    <article className={`notification-card severity-${alert.severity.toLowerCase()}`}>
      <div className="notification-card-heading">
        <strong>{alert.astronautName}</strong>
        <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
          <i />{alert.severity}
        </span>
      </div>
      <p className="notification-astronaut-id">{alert.astronautId}</p>
      <p className="notification-reading">{alert.parameterLabel} <span>·</span> {formatReading(alert)}</p>
      <p className="notification-description">{alert.explanation}</p>
      <div className="notification-card-footer">
        <time dateTime={alert.createdAt}>{formatTime(alert.createdAt)}</time>
        <div className="notification-actions">
          {alert.severity === 'CRITICAL' && !alert.acknowledgedAt && (
            <button className="text-button resolve-button" onClick={() => onAcknowledge(alert.id)} type="button">Acknowledge</button>
          )}
          <button className="text-button" onClick={onViewDetails} type="button">View details</button>
        </div>
      </div>
    </article>
  );
}

export default function ActiveAlertsPanel({
  mode,
  activeAlerts,
  notifications,
  onAcknowledge,
  onResolve,
  onClose,
  onViewDetails,
}) {
  const closeButtonRef = useRef(null);
  const isClosing = mode.startsWith('closing-');
  const panelType = mode.replace('closing-', '');
  const isNotificationPanel = panelType === 'notifications';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isNotificationPanel) closeButtonRef.current?.focus();
  }, [isNotificationPanel]);

  return (
    <aside
      aria-label={isNotificationPanel ? 'New health risk notifications' : 'Active health alerts'}
      aria-modal={isNotificationPanel ? undefined : 'false'}
      className={`side-panel side-panel-${panelType} ${isClosing ? 'is-closing' : ''}`}
      id={isNotificationPanel ? undefined : 'active-alerts-panel'}
      role={isNotificationPanel ? 'region' : 'dialog'}
    >
      <header className="side-panel-header">
        <div>
          <p className="eyebrow">{isNotificationPanel ? 'FLIGHT DECK / NEW SIGNALS' : 'ATTENTION REQUIRED'}</p>
          <h2>
            {isNotificationPanel ? 'Health notifications' : 'Active alerts'}
            <span className="count-pill">{isNotificationPanel ? notifications.length : activeAlerts.length}</span>
          </h2>
        </div>
        <button
          aria-label="Close alerts panel"
          className="modal-close-button"
          onClick={() => onClose()}
          ref={closeButtonRef}
          type="button"
        >×</button>
      </header>
      <div className={isNotificationPanel ? 'side-panel-content notification-list' : 'side-panel-content active-alert-list'}>
        {isNotificationPanel ? (
          notifications.length ? notifications.map((alert) => (
            <NotificationCard alert={alert} key={alert.id} onAcknowledge={onAcknowledge} onViewDetails={onViewDetails} />
          )) : <p className="empty-state">No new alerts.</p>
        ) : (
          <AlertList
            alerts={activeAlerts}
            emptyMessage="No active alerts."
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
          />
        )}
      </div>
    </aside>
  );
}
