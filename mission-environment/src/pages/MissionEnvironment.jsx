import { useEffect, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import { getSpaceWeather, applyStorm, getExtras } from '../data/spaceWeather'

const LEVELS = {
  low: {
    label: 'Quiet',
    box: 'border-emerald-500 bg-emerald-950 text-emerald-200',
    note: 'Routine monitoring. No radiation-related action indicated.',
  },
  moderate: {
    label: 'Elevated',
    box: 'border-amber-500 bg-amber-950 text-amber-200',
    note: 'Particle levels are rising. Watch the trend and review the mission radiation-safety protocol.',
  },
  high: {
    label: 'Radiation storm',
    box: 'border-red-500 bg-red-950 text-red-200',
    note: 'Follow the mission radiation-safety protocol and notify mission control.',
  },
}

const IMPACT = {
  low: [
    'Crew health monitoring continues on the normal schedule.',
    'No radiation-related action indicated.',
  ],
  moderate: [
    'Consider more frequent health check-ins while particle levels are rising.',
    'Review the mission radiation-safety protocol.',
  ],
  high: [
    'Follow the mission radiation-safety protocol, including any shielded-area procedures.',
    'Notify mission control and the medical officer.',
    'Review planned outside-vehicle activity with mission control.',
    'Increase the frequency of health check-ins (see Health Analytics and Risk Alerts).',
  ],
}

const KIND_STYLE = {
  'ALERT': 'bg-red-900 text-red-200',
  'CONTINUED ALERT': 'bg-red-900 text-red-200',
  'WARNING': 'bg-amber-900 text-amber-200',
  'EXTENDED WARNING': 'bg-amber-900 text-amber-200',
  'WATCH': 'bg-sky-900 text-sky-200',
  'SUMMARY': 'bg-slate-700 text-slate-200',
}

const SOURCE_BADGE = {
  live: { text: 'Live data', cls: 'bg-emerald-900 text-emerald-200' },
  sample: { text: 'Sample data', cls: 'bg-amber-900 text-amber-200' },
  simulation: { text: 'Simulation', cls: 'bg-violet-900 text-violet-200' },
}

const fmt = t =>
  new Date(t).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

function flareColor(cls) {
  const letter = cls ? cls[0] : ''
  if (letter === 'X') return 'text-red-300'
  if (letter === 'M') return 'text-amber-300'
  if (letter === 'C') return 'text-sky-300'
  return 'text-emerald-300'
}

function kpInfo(kp) {
  if (kp >= 5) return { label: `G${Math.min(5, Math.round(kp) - 4)} storm`, cls: 'text-red-300' }
  if (kp >= 4) return { label: 'Active', cls: 'text-amber-300' }
  return { label: 'Quiet', cls: 'text-emerald-300' }
}

// Illustrative only: a made-up relative index, not a real radiation dose
function exposureSeries(storm) {
  let total = 0
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    total += 1 + (storm && day >= 29 ? 6 : 0)
    return { day, index: Math.round(total * 10) / 10 }
  })
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function MissionEnvironment() {
  const [data, setData] = useState(null)
  const [extras, setExtras] = useState({ flare: null, kp: null })
  const [updated, setUpdated] = useState(null)
  const [storm, setStorm] = useState(false)

  useEffect(() => {
    const load = () =>
      Promise.all([getSpaceWeather(), getExtras()]).then(([d, x]) => {
        setData(d)
        setExtras(x)
        setUpdated(new Date())
      })
    load()
    const timer = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  if (!data) return <p className="p-8 text-slate-300">Loading space weather…</p>

  const view = storm ? applyStorm(data) : data
  const { summary, alerts, protons, source } = view
  const level = LEVELS[summary.radiationLevel]
  const badge = SOURCE_BADGE[source]
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentAlerts = alerts.filter(a => new Date(a.time).getTime() >= weekAgo)

  const flare = storm ? { peak: 'X1.2', simulated: true } : extras.flare
  const kp = storm ? { value: 6, simulated: true } : extras.kp
  const kpState = kp ? kpInfo(kp.value) : null

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-xl font-black text-slate-950">
              Z
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Zenith</p>
              <h1 className="text-2xl font-bold">Mission Environment</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
              {badge.text}
            </span>
            <button
              onClick={() => setStorm(s => !s)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                storm
                  ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {storm ? 'Stop simulation' : 'Simulate solar storm'}
            </button>
          </div>
        </header>
        <p className="-mt-3 text-sm text-slate-400">
          Near-Earth space weather (NOAA SWPC, GOES satellites), used as a proxy for the mission environment.
          Updated {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, refreshes every 5 minutes.
        </p>

        {storm && (
          <div className="rounded-lg border border-violet-500 bg-violet-950 p-3 text-sm text-violet-200">
            Simulation mode: the radiation event below is generated for demonstration and is not real data.
          </div>
        )}

        {/* Status banner */}
        <div className={`rounded-xl border-2 p-5 ${level.box}`}>
          <p className="text-sm uppercase tracking-wide opacity-80">Radiation environment</p>
          <p className="text-3xl font-bold">{level.label}</p>
          <p className="mt-1">{level.note}</p>
        </div>

        {/* Indicator cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Proton flux (≥10 MeV)">
            <p className="text-3xl font-bold">
              {summary.latestFlux.toFixed(2)} <span className="text-base font-normal text-slate-400">pfu</span>
            </p>
            <p className="text-xs text-slate-400">As of {fmt(summary.latestTime)}</p>
          </Card>
          <Card title="Solar flare, 24h peak">
            {flare ? (
              <>
                <p className={`text-3xl font-bold ${flareColor(flare.peak)}`}>{flare.peak}</p>
                <p className="text-xs text-slate-400">
                  {flare.simulated ? 'Simulated' : `X-ray class, ${fmt(flare.peakTime)}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Not available right now</p>
            )}
          </Card>
          <Card title="Geomagnetic Kp index">
            {kp ? (
              <>
                <p className={`text-3xl font-bold ${kpState.cls}`}>
                  {kp.value.toFixed(1)} <span className="text-base font-normal">{kpState.label}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {kp.simulated ? 'Simulated' : `As of ${fmt(kp.time)}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Not available right now</p>
            )}
          </Card>
          <Card title="Alerts, last 7 days">
            <p className="text-3xl font-bold">{recentAlerts.length}</p>
            <p className="text-xs text-slate-400">From the NOAA alerts feed</p>
          </Card>
        </div>

        {/* Impact on crew health monitoring */}
        <Card title="Impact on crew health monitoring">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            {IMPACT[summary.radiationLevel].map(t => <li key={t}>{t}</li>)}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Illustrative guidance only. Real responses require validated mission protocols.
          </p>
        </Card>

        {/* Proton chart */}
        <Card title="Proton flux, last 24 hours (≥10 MeV)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={protons}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tickFormatter={t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  minTickGap={40}
                />
                <YAxis
                  scale="log"
                  domain={[0.01, 100]}
                  ticks={[0.01, 0.1, 1, 10, 100]}
                  allowDataOverflow
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                  labelFormatter={fmt}
                  formatter={v => [`${v.toFixed(2)} pfu`, '≥10 MeV']}
                />
                <ReferenceLine
                  y={10}
                  stroke="#ef4444"
                  strokeDasharray="6 4"
                  label={{ value: 'NOAA S1 radiation storm threshold (10 pfu)', fill: '#fca5a5', fontSize: 12, position: 'insideTopLeft' }}
                />
                <Line
                  type="monotone"
                  dataKey="flux"
                  stroke={storm ? '#c084fc' : '#38bdf8'}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exposure chart */}
        <Card title="Cumulative exposure, 30-day mission (illustrative)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exposureSeries(storm)}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#94a3b8" label={{ value: 'Mission day', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
                  labelFormatter={d => `Day ${d}`}
                  formatter={v => [v, 'Relative index']}
                />
                <Area
                  type="monotone"
                  dataKey="index"
                  stroke={storm ? '#c084fc' : '#38bdf8'}
                  fill={storm ? '#6b21a8' : '#0c4a6e'}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Illustrative relative index to show the concept of tracking exposure over time. It is not a real
            dose, and real astronaut dose data is not public.
          </p>
        </Card>

        {/* Alerts timeline */}
        <Card title="Space weather alerts">
          <ul className="space-y-2">
            {alerts.slice(0, 10).map(a => (
              <li key={a.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <details>
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${KIND_STYLE[a.kind] || 'bg-slate-700 text-slate-200'}`}>
                        {a.kind}
                      </span>
                      {a.scale && (
                        <span className="rounded bg-violet-900 px-2 py-0.5 text-xs font-semibold text-violet-200">
                          {a.scale}
                        </span>
                      )}
                      {a.id === 'simulated-storm' && (
                        <span className="rounded bg-fuchsia-900 px-2 py-0.5 text-xs font-semibold text-fuchsia-200">
                          SIMULATED
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{fmt(a.time)}</span>
                    </div>
                    <p className="mt-1 text-sm">{a.headline.replace(/^[A-Z ]+:\s*/, '')}</p>
                  </summary>
                  {a.raw && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-400">{a.raw}</pre>
                  )}
                </details>
              </li>
            ))}
          </ul>
        </Card>

        {/* Guidance */}
        <Card title="What this means for the crew">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Solar particle events can raise radiation exposure outside Earth’s protective environment.</li>
            <li>Geomagnetic storms can disturb communications and navigation systems.</li>
            <li>Always follow the mission’s approved radiation-safety protocol and mission control guidance.</li>
          </ul>
        </Card>

        <footer className="pb-6 text-xs text-slate-500">
          Zenith is a decision-support tool, not a medical diagnosis. Data: NOAA Space Weather Prediction Center.
          Radiation levels shown here use a simple demonstration rule, and real mission thresholds require validated guidance.
        </footer>
      </div>
    </div>
  )
}
