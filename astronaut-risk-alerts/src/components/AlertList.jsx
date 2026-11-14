import AlertCard from './AlertCard.jsx';

export default function AlertList({ alerts, onAcknowledge, onResolve, emptyMessage = 'No active alerts in this view.' }) {
  if (!alerts.length) return <p className="empty-state">{emptyMessage}</p>;
  return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <AlertCard alert={alert} key={alert.id} onAcknowledge={onAcknowledge} onResolve={onResolve} />
      ))}
    </div>
  );
}
