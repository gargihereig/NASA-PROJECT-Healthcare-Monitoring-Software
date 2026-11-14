
import { useState } from "react";
import "./App.css";

const crew = [
  { name: "Alex Morgan", role: "Commander", initials: "AM" },
  { name: "Sarah Chen", role: "Flight Engineer", initials: "SC" },
  { name: "Ryan Patel", role: "Mission Specialist", initials: "RP" }
];

const initialMetrics = [
  { name: "Heart Rate", value: 72, unit: "bpm", icon: "♥", status: "Normal", color: "pink" },
  { name: "Blood Oxygen", value: 98, unit: "%", icon: "◉", status: "Normal", color: "blue" },
  { name: "Body Temperature", value: 36.8, unit: "°C", icon: "♨", status: "Normal", color: "orange" },
  { name: "Blood Pressure", value: "118/78", unit: "mmHg", icon: "⌁", status: "Normal", color: "purple" },
  { name: "Sleep Duration", value: 7.8, unit: "hrs", icon: "☾", status: "Good", color: "purple" },
  { name: "Stress Level", value: 28, unit: "/100", icon: "◌", status: "Low", color: "pink" },
  { name: "Fatigue Level", value: 22, unit: "/100", icon: "⚡", status: "Low", color: "orange" }
];

export default function App() {
  const [astronaut, setAstronaut] = useState(crew[0]);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [page, setPage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [updated, setUpdated] = useState("Just now");

  const heart = Number(metrics[0].value);
  const oxygen = Number(metrics[1].value);
  const temperature = Number(metrics[2].value);
  const stress = Number(metrics[5].value);
  const fatigue = Number(metrics[6].value);

  const alerts = [];
  if (heart > 100) alerts.push("Heart rate is elevated");
  if (oxygen < 95) alerts.push("Blood oxygen is below the demo threshold");
  if (temperature > 38) alerts.push("Body temperature is elevated");
  if (stress > 70) alerts.push("Stress level is high");
  if (fatigue > 70) alerts.push("Fatigue level is high");

  const score = Math.max(0, Math.min(100, Math.round(
    100 -
    Math.abs(heart - 72) * 0.3 -
    Math.max(0, 98 - oxygen) * 3 -
    Math.abs(temperature - 36.8) * 8 -
    stress * 0.12 -
    fatigue * 0.12
  )));

  const visibleMetrics = metrics.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function refreshData() {
    setMetrics(old => old.map((m, i) =>
      i === 0
        ? { ...m, value: Math.max(60, Math.min(105, Number(m.value) + Math.floor(Math.random() * 7) - 3)) }
        : m
    ));
    setUpdated("A few seconds ago");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">✦</div>
          <div>
            <h2>Health<span>Space</span></h2>
            <small>ASTRONAUT WELLNESS</small>
          </div>
        </div>

        <div className="mission">
          <span className="live-dot"></span>
          <div>
            <strong>MISSION 07</strong>
            <small>ISS · Low Earth Orbit</small>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        {[
          ["Overview", "▦"],
          ["Vital Signs", "♡"],
          ["Sleep & Recovery", "☾"],
          ["Stress & Fatigue", "◉"],
          ["Health Alerts", "⚑"]
        ].map(([name, icon]) => (
          <button
            key={name}
            className={`nav-button ${page === name ? "selected" : ""}`}
            onClick={() => setPage(name)}
          >
            <span>{icon}</span>{name}
            {name === "Health Alerts" && alerts.length > 0 &&
              <b className="alert-count">{alerts.length}</b>}
          </button>
        ))}

        <div className="sidebar-footer">
          <span className="live-dot"></span> Systems connected
          <small>HEALTHSPACE · VERSION 1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>Mission Control / <strong>{page}</strong></span>
          <div className="crew-select">
            <span className="avatar">{astronaut.initials}</span>
            <select
              value={astronaut.name}
              onChange={e => setAstronaut(crew.find(c => c.name === e.target.value))}
            >
              {crew.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
        </header>

        <div className="content">
          <section className="welcome">
            <div>
              <p className="eyebrow"><span className="live-dot"></span> LIVE MISSION MONITORING</p>
              <h1>{page === "Overview" ? "Astronaut Health Overview" : page}</h1>
              <p className="muted">Monitoring the health and wellbeing of your crew in orbit.</p>
            </div>
            <button className="refresh" onClick={refreshData}>↻ Refresh data</button>
          </section>

          <section className="mission-stats">
            <div><small>MISSION STATUS</small><strong>● In Orbit</strong></div>
            <div><small>CREW MEMBERS</small><strong>03 Active</strong></div>
            <div><small>LAST UPDATED</small><strong>{updated}</strong></div>
            <div><small>ACTIVE ALERTS</small><strong>{alerts.length} Alerts</strong></div>
          </section>

          <section className="health-card">
            <div className="health-main">
              <p className="eyebrow">CREW HEALTH ANALYTICS</p>
              <div className="health-title">
                <div>
                  <h2>Overall health status</h2>
                  <p className="muted">Combined health indicators for {astronaut.name}</p>
                </div>
                <span className={`health-status ${alerts.length ? "warning" : ""}`}>
                  {alerts.length ? "⚠ Attention needed" : "✓ All systems normal"}
                </span>
              </div>

              <div className="score-row">
                <div className="score-circle" style={{ "--progress": `${score * 3.6}deg` }}>
                  <div><strong>{score}</strong><small>/100</small></div>
                </div>
                <div>
                  <h3>{score >= 85 ? "Excellent condition" : score >= 65 ? "Good condition" : "Needs attention"}</h3>
                  <p className="muted">
                    {alerts.length
                      ? "Some indicators have crossed the illustrative demo thresholds."
                      : "Current indicators are within the dashboard's illustrative demo thresholds."}
                  </p>
                </div>
              </div>
            </div>

            <div className="astronaut">
              <div className="big-avatar">{astronaut.initials}</div>
              <h3>{astronaut.name}</h3>
              <p>{astronaut.role}</p>
              <span className="crew-active">● Crew member active</span>
              <hr />
              <div className="detail"><span>Mission</span><strong>Orbital 07</strong></div>
              <div className="detail"><span>Location</span><strong>Low Earth Orbit</strong></div>
            </div>
          </section>

          <section className="metrics-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">REAL-TIME MONITORING</p>
                <h2>Health indicators</h2>
              </div>
              <input
                className="search"
                placeholder="Search indicators..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="metrics-grid">
              {visibleMetrics.map(metric => (
                <article className="metric" key={metric.name}>
                  <div className="metric-top">
                    <div className={`metric-icon ${metric.color}`}>{metric.icon}</div>
                    <span className={`metric-badge ${metric.status === "Normal" || metric.status === "Good" || metric.status === "Low" ? "" : "warning"}`}>
                      {metric.status}
                    </span>
                  </div>
                  <p>{metric.name}</p>
                  <h3>{metric.value}<small> {metric.unit}</small></h3>
                  <div className="metric-footer">● Live reading</div>
                </article>
              ))}
              {visibleMetrics.length === 0 && <p>No matching indicators found.</p>}
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel">
              <p className="eyebrow">CREW WELLNESS</p>
              <h2>Health alerts</h2>
              {alerts.length === 0
                ? <div className="no-alerts">✓ No active demo alerts</div>
                : alerts.map(a => <p className="alert" key={a}>⚠ {a}</p>)}
              <p className="disclaimer">Illustrative thresholds only. Not a medical diagnosis.</p>
            </div>

            <div className="panel">
              <p className="eyebrow">MISSION INSIGHTS</p>
              <h2>Recovery & wellness</h2>
              {[
                ["Sleep", Number(metrics[4].value), "hrs", 8],
                ["Stress", stress, "/100", 100],
                ["Fatigue", fatigue, "/100", 100]
              ].map(([name, value, unit, max]) => (
                <div className="progress-item" key={name}>
                  <div><strong>{name}</strong><span>{value} {unit}</span></div>
                  <div className="progress"><div style={{ width: `${Math.min(100, value / max * 100)}%` }}></div></div>
                </div>
              ))}
            </div>
          </section>

          <footer>HEALTHSPACE · ASTRONAUT WELLNESS MONITORING · DEMO DATA</footer>
        </div>
      </main>
    </div>
  );
}
