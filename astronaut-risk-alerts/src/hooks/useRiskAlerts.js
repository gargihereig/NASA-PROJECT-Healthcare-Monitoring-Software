import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialAstronauts, getSimulatedSnapshot } from '../data/dummyData.js';
import { acknowledgeAlert, reconcileAlerts, resolveAlert } from '../utils/alertManager.js';
import { analyzeReadings } from '../utils/riskEngine.js';

export function useRiskAlerts() {
  const [astronauts, setAstronauts] = useState(initialAstronauts);
  const [alerts, setAlerts] = useState([]);
  const [simulationStep, setSimulationStep] = useState(0);

  useEffect(() => {
    setAlerts((current) => reconcileAlerts(current, astronauts).alerts);
  }, [astronauts]);

  const analyses = useMemo(
    () => new Map(astronauts.map((astronaut) => [astronaut.id, analyzeReadings(astronaut.readings)])),
    [astronauts],
  );
  const updateSimulatedReadings = useCallback(() => {
    const nextStep = simulationStep + 1;
    setAstronauts(getSimulatedSnapshot(nextStep));
    setSimulationStep(nextStep);
  }, [simulationStep]);
  const acknowledge = useCallback((alertId) => {
    setAlerts((current) => acknowledgeAlert(current, alertId));
  }, []);
  const resolve = useCallback((alertId) => {
    setAlerts((current) => resolveAlert(current, alertId));
  }, []);

  return { astronauts, analyses, alerts, acknowledge, resolve, updateSimulatedReadings };
}
