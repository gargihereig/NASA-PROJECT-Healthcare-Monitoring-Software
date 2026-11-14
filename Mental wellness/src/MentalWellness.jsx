import { useState } from 'react'
import './MentalWellness.css'

const initialSleepHistory = [
  { day: 'M', hours: 7.2 },
  { day: 'T', hours: 6.4 },
  { day: 'W', hours: 8.1 },
  { day: 'T', hours: 7.6 },
  { day: 'F', hours: 6.8 },
  { day: 'S', hours: 8.4 },
  { day: 'S', hours: 7.4 },
]

const initialStressHistory = [62, 54, 48, 57, 43, 51, 47]

const moods = [
  { name: 'Happy', face: '😄', color: 'happy' },
  { name: 'Calm', face: '😌', color: 'calm' },
  { name: 'Neutral', face: '😐', color: 'neutral' },
  { name: 'Sad', face: '😔', color: 'sad' },
  { name: 'Stressed', face: '😣', color: 'stressed' },
]

const initialMoodHistory = [
  { day: 'Today', mood: 'Calm' },
  { day: 'Yesterday', mood: 'Happy' },
  { day: 'Nov 12', mood: 'Neutral' },
  { day: 'Nov 11', mood: 'Calm' },
]

function getSleepQuality(hours) {
  if (hours >= 7 && hours <= 9) return 'Good'
  if (hours >= 6 && hours <= 10) return 'Average'
  return 'Poor'
}

function getStressStatus(value) {
  if (value < 35) return 'Low'
  if (value < 70) return 'Moderate'
  return 'High'
}

function StressChart({ values }) {
  const points = values
    .map((value, index) => {
      const x = 8 + (index * 284) / (values.length - 1)
      const y = 100 - value * 0.8
      return `${x},${y}`
    })
    .join(' ')
  const lastPoint = points.split(' ').at(-1).split(',')

  return (
    <svg
      className="stress-chart"
      viewBox="0 0 300 110"
      role="img"
      aria-label={`Stress history chart. Latest value ${values.at(-1)} out of 100.`}
    >
      <defs>
        <linearGradient id="stressFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9b8cff" stopOpacity=".28" />
          <stop offset="100%" stopColor="#9b8cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 50, 80].map((y) => (
        <line key={y} x1="8" x2="292" y1={y} y2={y} className="chart-gridline" />
      ))}
      <polygon points={`8,100 ${points} 292,100`} fill="url(#stressFill)" />
      <polyline points={points} className="stress-line" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="4.5" className="stress-point" />
    </svg>
  )
}

function MentalWellness() {
  const [sleepHours, setSleepHours] = useState('7.4')
  const [mood, setMood] = useState('Calm')
  const [stress, setStress] = useState(47)
  const [sleepHistory, setSleepHistory] = useState(initialSleepHistory)
  const [stressHistory, setStressHistory] = useState(initialStressHistory)
  const [moodHistory, setMoodHistory] = useState(initialMoodHistory)
  const [sleepError, setSleepError] = useState('')
  const [saved, setSaved] = useState(false)

  const numericSleep = Number(sleepHours)
  const sleepInputValid = sleepHours.trim() !== '' && Number.isFinite(numericSleep) && numericSleep >= 0 && numericSleep <= 24
  const safeSleep = sleepInputValid ? numericSleep : 0
  const sleepQuality = sleepInputValid ? getSleepQuality(safeSleep) : ''
  const stressStatus = getStressStatus(stress)
  const selectedMood = moods.find((item) => item.name === mood)
  const moodTrend = [...moodHistory].reverse()
  const moodLevels = { Happy: 12, Calm: 30, Neutral: 48, Sad: 66, Stressed: 84 }
  const moodTrendPoints = moodTrend
    .map((entry, index) => {
      const x = moodTrend.length === 1 ? 180 : 66 + (index * 228) / (moodTrend.length - 1)
      return `${x},${moodLevels[entry.mood]}`
    })
    .join(' ')

  function saveCheckIn(event) {
    event.preventDefault()
    if (!sleepInputValid) {
      setSleepError('Enter a sleep duration from 0 to 24 hours.')
      setSaved(false)
      return
    }

    const hours = numericSleep
    setSleepHours(hours.toFixed(1))
    setSleepHistory((history) =>
      history.map((entry, index) =>
        index === history.length - 1 ? { ...entry, hours } : entry,
      ),
    )
    setStressHistory((history) =>
      history.map((value, index) => (index === history.length - 1 ? stress : value)),
    )
    setMoodHistory((history) => [
      { day: 'Today', mood },
      ...history.filter((entry) => entry.day !== 'Today'),
    ].slice(0, 4))
    setSaved(true)
  }

  const recommendations = []
  if (!sleepInputValid) {
    recommendations.push({
      icon: '🌙',
      title: 'Add your sleep check-in',
      text: 'Enter a duration between 0 and 24 hours to see sleep-specific guidance.',
    })
  } else if (safeSleep < 7) {
    recommendations.push({
      icon: '🌙',
      title: 'Protect your sleep window',
      text: 'Aim for 7–9 hours. Dim cabin lights and keep a consistent wind-down routine before your next sleep period.',
    })
  } else {
    recommendations.push({
      icon: '✨',
      title: 'Keep your sleep rhythm',
      text: 'You’re in the recommended 7–9 hour range. Keep your wind-down routine consistent across mission shifts.',
    })
  }
  if (stress >= 70 || mood === 'Stressed') {
    recommendations.push({
      icon: '🫁',
      title: 'Take a reset break',
      text: 'Try a few minutes of slow breathing and, if possible, check in with a crewmate or your ground-support team.',
    })
  } else if (stress >= 35 || mood === 'Sad') {
    recommendations.push({
      icon: '🫁',
      title: 'Make room to decompress',
      text: 'A short guided breathing break or a quiet moment away from task switching may help you reset.',
    })
  } else {
    recommendations.push({
      icon: '🌿',
      title: 'Build in a mindful pause',
      text: 'A few calm minutes between tasks can help protect your sense of balance during a busy mission day.',
    })
  }

  return (
    <div className="mw-app">
      <aside className="mw-sidebar" aria-label="Main navigation">
        <a className="mw-brand" href="#overview" aria-label="Orbit Well home">
          <span className="mw-brand-mark">✦</span>
          <span>ORBIT<span className="mw-brand-light">WELL</span></span>
        </a>
        <div className="mw-nav-label">MISSION CONTROL</div>
        <nav className="mw-nav">
          <a className="mw-nav-item" href="#overview"><span>⌂</span> Overview</a>
          <a className="mw-nav-item" href="#sleep"><span>♡</span> Health analytics</a>
          <a className="mw-nav-item" href="#stress"><span>◎</span> Risk alerts</a>
          <a className="mw-nav-item active" href="#overview" aria-current="page"><span>☾</span> Mental wellness</a>
          <a className="mw-nav-item" href="#recommendations"><span>◉</span> Mission environment</a>
        </nav>
        <div className="mw-sidebar-bottom">
          <div className="mw-orbit-art" aria-hidden="true">
            <span className="mw-orbit-ring" />
            <span className="mw-orbit-planet">◉</span>
            <span className="mw-orbit-star star-one">✦</span>
            <span className="mw-orbit-star star-two">·</span>
          </div>
          <p>Taking care of you,<br />wherever you are.</p>
          <span className="mw-sidebar-caption">CREW WELLNESS · v1.0</span>
        </div>
      </aside>

      <main className="mw-main" id="overview">
        <header className="mw-topbar">
          <div className="mw-breadcrumb">MISSION <span>/</span> CREW HEALTH <span>/</span> <b>MENTAL WELLNESS</b></div>
          <div className="mw-topbar-right">
            <span className="mw-live"><span /> SAMPLE MODE</span>
            <button type="button" className="mw-avatar" aria-label="Crew member profile">A</button>
          </div>
        </header>

        <div className="mw-content">
          <section className="mw-heading">
            <div>
              <div className="mw-eyebrow"><span className="mw-eyebrow-line" /> CREW WELLNESS CENTER</div>
              <h1>Mental wellness</h1>
              <p className="mw-subtitle">A moment to check in with yourself, astronaut.</p>
            </div>
            <div className="mw-date-pill"><span>◷</span> DAILY CHECK-IN <b>•</b> TODAY</div>
          </section>

          <section className="mw-sample-note" aria-label="Sample data notice">
            <span className="mw-sample-icon">ⓘ</span>
            <span><b>DEMO DATA</b> &nbsp;This dashboard uses illustrative sample values only — no live astronaut sensors are connected.</span>
            <span className="mw-note-sparkle">✦</span>
          </section>

          <section className="mw-overview-grid" aria-label="Today's wellness overview">
            <article className="mw-card mw-overview-card mw-overview-sleep">
              <div className="mw-card-heading">
                <span className="mw-icon-tile sleep-tile">☾</span>
                <span className="mw-card-kicker">SLEEP LAST NIGHT</span>
                <span className="mw-trend good-trend">↗ ON TRACK</span>
              </div>
              <div className="mw-overview-number">{sleepInputValid ? safeSleep.toFixed(1) : '—'}<small> hrs</small></div>
              <div className="mw-progress-track"><span style={{ width: `${Math.min(100, (safeSleep / 9) * 100)}%` }} /></div>
              <div className="mw-overview-foot"><span>Sleep quality</span><b className={sleepQuality ? `quality-${sleepQuality.toLowerCase()}` : ''}>{sleepQuality || '—'}</b></div>
            </article>

            <article className="mw-card mw-overview-card mw-overview-mood">
              <div className="mw-card-heading">
                <span className="mw-icon-tile mood-tile">☺</span>
                <span className="mw-card-kicker">YOUR MOOD TODAY</span>
                <span className="mw-trend">CHECK IN</span>
              </div>
              <div className="mw-mood-overview">
                <span className="mw-big-emoji">{selectedMood?.face}</span>
                <div><div className="mw-overview-number mood-number">{mood}</div><span className="mw-muted">Thanks for checking in</span></div>
              </div>
              <div className="mw-overview-foot"><span>One check-in at a time</span><span className="mw-cyan-text">YOU’VE GOT THIS ✦</span></div>
            </article>

            <article className="mw-card mw-overview-card mw-overview-stress">
              <div className="mw-card-heading">
                <span className="mw-icon-tile stress-tile">⌁</span>
                <span className="mw-card-kicker">STRESS LEVEL</span>
                <span className={`mw-status-dot status-${stressStatus.toLowerCase()}`} />
              </div>
              <div className="mw-stress-summary"><div className="mw-overview-number">{stress}<small> / 100</small></div><span className={`mw-status-pill status-${stressStatus.toLowerCase()}`}>{stressStatus}</span></div>
              <div className="mw-progress-track stress-track"><span style={{ width: `${stress}%` }} /></div>
              <div className="mw-overview-foot"><span>Self-reported check-in</span><span>↘ STEADY</span></div>
            </article>
          </section>

          <section className="mw-data-grid" aria-label="Wellness tracking">
            <article className="mw-card mw-panel" id="sleep">
              <div className="mw-panel-header">
                <div><div className="mw-panel-title"><span className="mw-panel-icon sleep-color">☾</span><h2>Sleep monitoring</h2></div><p>Rest is part of the mission.</p></div>
                <span className="mw-sample-tag">7-DAY HISTORY · SAMPLE</span>
              </div>
              <div className="mw-sleep-chart" role="img" aria-label="Sample sleep duration for the past seven days, measured in hours">
                <div className="mw-chart-ylabels"><span>9h</span><span>6h</span><span>3h</span><span>0</span></div>
                <div className="mw-bars">
                  {sleepHistory.map((entry, index) => (
                    <div className="mw-bar-column" key={`${entry.day}-${index}`} style={{ '--bar-height': `${(entry.hours / 10) * 100}%` }}>
                      <span className="mw-bar-value">{entry.hours.toFixed(1)}</span>
                      <div className={`mw-sleep-bar ${index === sleepHistory.length - 1 ? 'today-bar' : ''}`} style={{ height: `${(entry.hours / 10) * 100}%` }} title={`${entry.hours} hours`} />
                      <span className="mw-axis-label">{entry.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mw-chart-legend"><span><i className="legend-dot sleep-dot" /> Sleep duration</span><span>Recommended <b>7–9 hrs</b></span></div>
              <form className="mw-sleep-form" onSubmit={saveCheckIn}>
                <label htmlFor="sleep-hours">Last night’s sleep</label>
                <div className="mw-sleep-input-wrap">
                  <input id="sleep-hours" type="number" min="0" max="24" step="0.1" required value={sleepHours} aria-invalid={Boolean(sleepError)} aria-describedby={sleepError ? 'sleep-error' : undefined} onChange={(event) => { setSleepHours(event.target.value); setSleepError(''); setSaved(false) }} />
                  <span>hours</span>
                </div>
                <span className={`mw-quality-tag ${sleepQuality ? `quality-${sleepQuality.toLowerCase()}` : ''}`}>{sleepQuality ? <><i /> {sleepQuality} quality</> : 'Awaiting input'}</span>
              </form>
              {sleepError && <p className="mw-form-error" id="sleep-error" role="alert">{sleepError}</p>}
            </article>

            <article className="mw-card mw-panel" id="mood">
              <div className="mw-panel-header">
                <div><div className="mw-panel-title"><span className="mw-panel-icon mood-color">☺</span><h2>Mood check-in</h2></div><p>How are you feeling today?</p></div>
                <span className="mw-sample-tag">MOOD HISTORY · SAMPLE</span>
              </div>
              <div className="mw-mood-options" role="group" aria-label="Select your mood">
                {moods.map((item) => (
                  <button
                    className={`mw-mood-option ${mood === item.name ? `selected ${item.color}` : ''}`}
                    key={item.name}
                    type="button"
                    aria-pressed={mood === item.name}
                    onClick={() => { setMood(item.name); setSaved(false) }}
                  >
                    <span>{item.face}</span><small>{item.name}</small>
                  </button>
                ))}
              </div>
              <div className="mw-mood-history">
                <div className="mw-history-heading"><span>MOOD TREND</span><span>LAST 4 · SAMPLE</span></div>
                <svg className="mw-mood-chart" viewBox="0 0 310 108" role="img" aria-label={`Mood history: ${moodTrend.map((entry) => `${entry.day} ${entry.mood}`).join(', ')}.`}>
                  {[12, 30, 48, 66, 84].map((y) => (
                    <line key={y} x1="61" x2="304" y1={y} y2={y} className="chart-gridline" />
                  ))}
                  {['Happy', 'Calm', 'Neutral', 'Sad', 'Stressed'].map((name) => (
                    <text key={name} x="2" y={moodLevels[name] + 3} className="mood-chart-label">{name}</text>
                  ))}
                  {moodTrend.length > 1 && <polyline points={moodTrendPoints} className="mood-chart-line" />}
                  {moodTrend.map((entry, index) => {
                    const x = moodTrend.length === 1 ? 180 : 66 + (index * 228) / (moodTrend.length - 1)
                    const item = moods.find((option) => option.name === entry.mood)
                    return (
                      <g key={`${entry.day}-${index}`}>
                        <circle cx={x} cy={moodLevels[entry.mood]} r="4.5" className={`mood-chart-point ${item?.color}`} />
                        <text x={x} y="104" textAnchor="middle" className="mood-chart-day">{entry.day}</text>
                      </g>
                    )
                  })}
                </svg>
                <div className="mw-history-heading mw-recent-heading"><span>RECENT CHECK-INS</span><span>LOG</span></div>
                {moodHistory.map((entry, index) => {
                  const entryMood = moods.find((item) => item.name === entry.mood)
                  return (
                    <div className="mw-mood-history-row" key={`${entry.day}-${index}`}>
                      <span className="mw-history-day">{entry.day}</span>
                      <span className={`mw-history-face ${entryMood?.color}`}>{entryMood?.face}</span>
                      <span className="mw-history-mood">{entry.mood}</span>
                      <span className="mw-history-check">✓</span>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="mw-card mw-panel mw-stress-panel" id="stress">
              <div className="mw-panel-header">
                <div><div className="mw-panel-title"><span className="mw-panel-icon stress-color">⌁</span><h2>Stress monitor</h2></div><p>Notice it. Name it. Adjust.</p></div>
                <span className="mw-sample-tag">7-DAY HISTORY · SAMPLE</span>
              </div>
              <div className="mw-stress-chart-wrap">
                <div className="mw-stress-ylabels"><span>100</span><span>50</span><span>0</span></div>
                <StressChart values={stressHistory} />
              </div>
              <div className="mw-stress-axis"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
              <div className="mw-slider-section">
                <div className="mw-slider-label"><label htmlFor="stress-range">Today’s stress level</label><span className={`mw-stress-value status-${stressStatus.toLowerCase()}`}>{stress}<small> / 100</small></span></div>
                <input id="stress-range" className="mw-range" type="range" min="0" max="100" value={stress} style={{ '--range-progress': `${stress}%` }} onChange={(event) => { setStress(Number(event.target.value)); setSaved(false) }} aria-valuetext={`${stress}, ${stressStatus} stress`} />
                <div className="mw-range-labels"><span>Low</span><span>Moderate</span><span>High</span></div>
              </div>
            </article>

            <article className="mw-card mw-panel mw-recommend-panel" id="recommendations">
              <div className="mw-panel-header">
                <div><div className="mw-panel-title"><span className="mw-panel-icon rec-color">✦</span><h2>Your wellness toolkit</h2></div><p>Small steps, tailored to your check-in.</p></div>
                <span className="mw-personalized-tag">✦ PERSONALIZED</span>
              </div>
              <div className="mw-recommendations">
                {recommendations.map((item) => (
                  <div className="mw-recommendation" key={item.title}>
                    <span className="mw-rec-icon">{item.icon}</span>
                    <div><h3>{item.title}</h3><p>{item.text}</p></div>
                    <span className="mw-rec-arrow">↗</span>
                  </div>
                ))}
              </div>
              <div className="mw-breathing">
                <div className="mw-breathing-orb"><span>inhale</span></div>
                <div className="mw-breathing-copy"><span className="mw-breathing-label">60-SECOND RESET</span><h3>Box breathing</h3><p>Inhale 4 · Hold 4 · Exhale 4 · Hold 4</p></div>
                <span className="mw-breathing-time">1 MIN</span>
              </div>
              <p className="mw-disclaimer">Wellness suggestions are for general support and aren’t a substitute for professional care. Reach out to your crew health team when you need support.</p>
            </article>
          </section>

          <section className="mw-save-row">
            <span className="mw-save-note">{saved ? '✓ Check-in saved to this demo session.' : 'Your check-in stays in this browser session only.'}</span>
            <button className="mw-save-button" type="button" onClick={saveCheckIn}>Save today’s check-in <span>→</span></button>
          </section>
          <footer className="mw-footer"><span>ORBITWELL <b>·</b> CREW WELLNESS</span><span>DEMO EXPERIENCE <i /> NOT CONNECTED TO FLIGHT SYSTEMS</span></footer>
        </div>
      </main>
    </div>
  )
}

export default MentalWellness
