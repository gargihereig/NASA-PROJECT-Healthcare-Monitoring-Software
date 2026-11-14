const reading = (overrides = {}, minutesAgo = 2) => ({
  heartRate: 72,
  spo2: 98,
  temperature: 36.7,
  systolic: 116,
  diastolic: 76,
  respiratoryRate: 15,
  sleepHours: 7.4,
  timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  ...overrides,
});

export const initialAstronauts = [
  {
    id: 'AST-1042',
    name: 'Commander Maya Chen',
    role: 'Mission Commander',
    avatar: 'MC',
    readings: reading(),
  },
  {
    id: 'AST-1078',
    name: 'Dr. Elias Okafor',
    role: 'Flight Surgeon',
    avatar: 'EO',
    readings: reading({ heartRate: 104, spo2: 93, sleepHours: 5.3 }, 5),
  },
  {
    id: 'AST-1103',
    name: 'Pilot Sofia Reyes',
    role: 'Pilot',
    avatar: 'SR',
    readings: reading({ heartRate: 138, spo2: 87, temperature: 38.6, systolic: 154 }, 1),
  },
  {
    id: 'AST-1121',
    name: 'Flight Engineer Noah Williams',
    role: 'Flight Engineer',
    avatar: 'NW',
    readings: reading(
      { heartRate: 112, spo2: 92, temperature: 38.1, systolic: 148, diastolic: 94, respiratoryRate: 24, sleepHours: 4.2 },
      3,
    ),
  },
];

const scenario = (astronaut, overrides, minutesAgo = 0) => ({
  ...astronaut,
  readings: reading(
    { ...astronaut.readings, ...overrides, timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString() },
    minutesAgo,
  ),
});

export const simulatedSnapshots = [
  initialAstronauts.map((astronaut) => scenario(astronaut, {}, 0)),
  [
    scenario(initialAstronauts[0], { heartRate: 107, spo2: 98 }, 0),
    scenario(initialAstronauts[1], { heartRate: 88, spo2: 97, sleepHours: 7 }, 0),
    scenario(initialAstronauts[2], { heartRate: 108, spo2: 94, temperature: 37.6, systolic: 132 }, 0),
    scenario(initialAstronauts[3], { heartRate: 76, spo2: 98, temperature: 36.8, systolic: 118, diastolic: 77, respiratoryRate: 16, sleepHours: 7.1 }, 0),
  ],
  [
    scenario(initialAstronauts[0], {}, 0),
    scenario(initialAstronauts[1], { heartRate: 104, spo2: 93, sleepHours: 5.3 }, 0),
    scenario(initialAstronauts[2], { heartRate: 138, spo2: 87, temperature: 38.6, systolic: 154 }, 0),
    scenario(initialAstronauts[3], { heartRate: 112, spo2: 92, temperature: 38.1, systolic: 148, diastolic: 94, respiratoryRate: 24, sleepHours: 4.2 }, 0),
  ],
];

export function getSimulatedSnapshot(step) {
  return simulatedSnapshots[step % simulatedSnapshots.length].map((astronaut) => ({
    ...astronaut,
    readings: { ...astronaut.readings, timestamp: new Date().toISOString() },
  }));
}
