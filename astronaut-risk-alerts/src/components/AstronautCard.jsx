import { PARAMETER_DEFINITIONS } from '../utils/riskEngine.js';
import HealthParameterCard from './HealthParameterCard.jsx';

export default function AstronautCard({ astronaut, analysis, selected, onSelect }) {
  const severity = analysis?.severity ?? 'WARNING';
  return (
    <button className={`astronaut-card ${selected ? 'is-selected' : ''}`} onClick={onSelect} type="button">
      <div className="astronaut-card-header">
        <span className="avatar">{astronaut.avatar}</span>
        <span className="astronaut-identity">
          <strong>{astronaut.name}</strong>
          <small>{astronaut.role} · {astronaut.id}</small>
        </span>
        <span className={`severity-badge severity-${severity.toLowerCase()}`}>
          <i />{severity}
        </span>
      </div>
      <div className="parameter-grid">
        {PARAMETER_DEFINITIONS.map((definition) => (
          <HealthParameterCard
            definition={definition}
            key={definition.key}
            value={astronaut.readings?.[definition.key]}
          />
        ))}
      </div>
      <div className="card-footer">
        <span>Updated {new Date(astronaut.readings.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>{selected ? 'Selected' : 'View profile'} <span aria-hidden="true">→</span></span>
      </div>
    </button>
  );
}
