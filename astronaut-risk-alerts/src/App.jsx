import Dashboard from './components/Dashboard.jsx';
import { useRiskAlerts } from './hooks/useRiskAlerts.js';

export default function App() {
  const riskAlerts = useRiskAlerts();
  return (
    <Dashboard
      astronauts={riskAlerts.astronauts}
      analyses={riskAlerts.analyses}
      alerts={riskAlerts.alerts}
      onAcknowledge={riskAlerts.acknowledge}
      onResolve={riskAlerts.resolve}
      onSimulateReadings={riskAlerts.updateSimulatedReadings}
    />
  );
}
