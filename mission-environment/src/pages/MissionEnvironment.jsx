import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import { getSpaceWeather, applyStorm } from '../data/spaceWeather'

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
  const [updated, setUpdated] = useState(null)
  const [storm, setStorm] = useState(false)

  useEffect(() => {
    const load = () =>
      getSpaceWeather().then(d => {
        setData(d)
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

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mission Environment</h1>
            <p className="text-sm text-slate-400">
              Near-Earth space weather (NOAA SWPC, GOES satellites), used as a proxy for the mission environment
            </p>
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

        {/* Recommended actions, only during a storm */}
        {summary.radiationLevel === 'high' && (
          <Card title="Recommended actions (illustrative)">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              <li>Follow the mission radiation-safety protocol, including any shielded-area procedures.</li>
              <li>Notify mission control and the medical officer.</li>
              <li>Review planned outside-vehicle activity with mission control.</li>
              <li>Increase the frequency of health check-ins (see Health Analytics).</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Illustrative guidance only. Real responses require validated mission protocols.
            </p>
          </Card>
        )}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card title="Proton flux (≥10 MeV)">
            <p className="text-3xl font-bold">
              {summary.latestFlux.toFixed(2)} <span className="text-base font-normal text-slate-400">pfu</span>
            </p>
            <p className="text-xs text-slate-400">As of {fmt(summary.latestTime)}</p>
          </Card>
          <Card title="Alerts, last 7 days">
            <p className="text-3xl font-bold">{recentAlerts.length}</p>
            <p className="text-xs text-slate-400">From the NOAA alerts feed</p>
          </Card>
          <Card title="Last updated">
            <p className="text-3xl font-bold">
              {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-slate-400">Refreshes every 5 minutes</p>
          </Card>
        </div>

        {/* Chart */}
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
          Decision-support information, not a medical diagnosis. Data: NOAA Space Weather Prediction Center.
          Radiation levels shown here use a simple demonstration rule, and real mission thresholds require validated guidance.
        </footer>
      </div>
    </div>
  )
}
