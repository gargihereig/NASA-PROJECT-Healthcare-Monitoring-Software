import { useEffect, useState } from 'react'
import { getSpaceWeather } from '../data/spaceWeather'

const STYLE = {
  low: ['Quiet', 'border-emerald-500 bg-emerald-950 text-emerald-200'],
  moderate: ['Elevated', 'border-amber-500 bg-amber-950 text-amber-200'],
  high: ['Radiation storm', 'border-red-500 bg-red-950 text-red-200'],
}

// Small card any page can drop in, e.g. the Home Dashboard
export default function EnvironmentStatusCard() {
  const [level, setLevel] = useState(null)

  useEffect(() => {
    getSpaceWeather().then(d => setLevel(d.summary.radiationLevel))
  }, [])

  if (!level) return null
  const [label, cls] = STYLE[level]
  return (
    <div className={`rounded-xl border-2 p-4 ${cls}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">Radiation environment</p>
      <p className="text-2xl font-bold">{label}</p>
    </div>
  )
}
