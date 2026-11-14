export default function HealthParameterCard({ definition, value }) {
  const shown = typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(definition.decimals)} ${definition.unit}`
    : 'Unavailable';

  return (
    <div className="parameter">
      <span className="parameter-label">{definition.label}</span>
      <strong className={shown === 'Unavailable' ? 'parameter-value is-missing' : 'parameter-value'}>{shown}</strong>
    </div>
  );
}
