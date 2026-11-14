import { PARAMETER_DEFINITIONS } from '../utils/riskEngine.js';

function formatTime(value) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AlertCard({ alert, onAcknowledge, onResolve, history = false }) {
  const parameter = PARAMETER_DEFINITIONS.find((item) => item.key === alert.parameter);
  const reading = typeof alert.value === 'number' && Number.isFinite(alert.value)
    ? `${alert.value.toFixed(parameter?.decimals ?? 0)} ${parameter?.unit ?? ''}`.trim()
    : alert.value === null || alert.value === undefined
      ? 'Unavailable'
      : `Invalid: ${String(alert.value)}`;

  return (
    <article className={`alert-card ${history ? 'is-history' : ''} severity-${alert.severity.toLowerCase()}`}>
      <span className={`alert-indicator severity-${alert.severity.toLowerCase()}`} aria-hidden="true" />
      <div className="alert-content">
        <div className="alert-title-row">
          <strong>{alert.message}</strong>
          <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span>
        </div>
        <p className="alert-identity">{alert.astronautName} <span>·</span> {alert.astronautId}</p>
        <p className="alert-reading">{alert.parameterLabel} <span>·</span> {reading}</p>
        <p className="alert-explanation">{alert.explanation}</p>
        <div className="alert-meta">
          <time dateTime={alert.createdAt}>{formatTime(alert.createdAt)}</time>
          {alert.acknowledgedAt && <span className="acknowledged-label">Acknowledged</span>}
          {alert.resolvedAt && <span className="resolved-label">{alert.resolution ?? 'Resolved'}</span>}
        </div>
      </div>
      {!history && alert.status === 'ACTIVE' && (
        <div className="alert-actions">
          {!alert.acknowledgedAt && (
            <button className="text-button" onClick={() => onAcknowledge(alert.id)} type="button">Acknowledge</button>
          )}
          <button className="text-button resolve-button" onClick={() => onResolve(alert.id)} type="button">Resolve</button>
        </div>
      )}
    </article>
  );
}
