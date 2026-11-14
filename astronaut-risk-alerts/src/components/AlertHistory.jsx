import AlertCard from './AlertCard.jsx';

export default function AlertHistory({ alerts }) {
  if (!alerts.length) return <p className="empty-state">Alert history will appear here as conditions are detected.</p>;
  return (
    <div className="history-list">
      {alerts.map((alert) => <AlertCard alert={alert} history key={alert.id} />)}
    </div>
  );
}
