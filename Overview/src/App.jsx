import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowRight, ChevronDown, Download, CircleHelp, Sparkles, Users
} from "lucide-react";

const demoCrew = [
  { id:"poorna", name:"S. Poorna", role:"Commander", health:"Nominal", risk:"No alerts", wellness:"Stable", environment:"Normal", readiness:94 },
  { id:"nithish", name:"R. Nithish", role:"Flight engineer", health:"Nominal", risk:"1 caution", wellness:"Stable", environment:"Normal", readiness:91 },
  { id:"gargi", name:"S. Gargi", role:"Medical officer", health:"Nominal", risk:"No alerts", wellness:"Stable", environment:"Normal", readiness:95 },
  { id:"annie", name:"M. Annie", role:"Mission specialist", health:"Nominal", risk:"1 info", wellness:"Stable", environment:"Normal", readiness:90 },
  { id:"vaishnavi", name:"U. Vaishnavi", role:"Payload specialist", health:"Caution", risk:"2 caution", wellness:"Elevated", environment:"Normal", readiness:78 },
  { id:"aditya", name:"B. Aditya", role:"Pilot", health:"Nominal", risk:"1 info", wellness:"Stable", environment:"Normal", readiness:88 },
];

const demoAlerts = [
  { id:1, person:"U. Vaishnavi", detail:"Fatigue above personal baseline", level:"CAUTION" },
  { id:2, person:"R. Nithish", detail:"Exercise below daily goal", level:"CAUTION" },
  { id:3, person:"B. Aditya", detail:"Sleep under mission target", level:"INFO" },
  { id:4, person:"U. Vaishnavi", detail:"Recovery trend needs review", level:"INFO" },
  { id:5, person:"M. Annie", detail:"Routine hydration reminder", level:"INFO" },
];

function HumanBody3D() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03101d, 0.055);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 2.55, 10.7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x8ddfff, 0x061426, 1.65));
    const key = new THREE.DirectionalLight(0x9be8ff, 2.8);
    key.position.set(-4, 7, 7); scene.add(key);
    const rim = new THREE.PointLight(0x00bfff, 18, 12);
    rim.position.set(3, 3, -3); scene.add(rim);
    const warm = new THREE.PointLight(0xff456e, 5, 5);
    warm.position.set(0, 3, 2); scene.add(warm);

    const bodyRoot = new THREE.Group();
    scene.add(bodyRoot);
    const anatomy = new THREE.Group();
    bodyRoot.add(anatomy);

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x39bfff, emissive: 0x0879c5, emissiveIntensity: 0.45,
      metalness: 0.22, roughness: 0.24, transparent: true, opacity: 0.34,
      transmission: 0.12, thickness: 0.5, side: THREE.DoubleSide
    });
    const shellBright = new THREE.MeshStandardMaterial({
      color: 0x6edaff, emissive: 0x087bc9, emissiveIntensity: 0.7,
      metalness: 0.35, roughness: 0.28
    });
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xb9eaff, emissive: 0x286d9b, emissiveIntensity: 0.35,
      metalness: 0.3, roughness: 0.32
    });
    const organMat = new THREE.MeshStandardMaterial({
      color: 0xff617f, emissive: 0x9b163b, emissiveIntensity: 1.0,
      transparent: true, opacity: 0.88, roughness: 0.3
    });
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0x55b9ff, emissive: 0x075baf, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.78, roughness: 0.3
    });

    const sphere = (parent, position, scale, material, segments=28) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, segments), material);
      mesh.position.set(...position); mesh.scale.set(...scale); parent.add(mesh); return mesh;
    };
    const bone = (parent, a, b, radius, material=boneMat) => {
      const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
      const direction = new THREE.Vector3().subVectors(end, start);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.78, radius, direction.length(), 12), material);
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
      parent.add(mesh);
      sphere(parent, a, [radius,radius,radius], material, 14);
      sphere(parent, b, [radius*0.82,radius*0.82,radius*0.82], material, 14);
      return mesh;
    };
    const capsule = (parent, a, b, radius, material) => bone(parent, a, b, radius, material);

    // Outer translucent human silhouette: head, neck, torso, pelvis and limbs.
    sphere(anatomy, [0,4.53,0], [0.34,0.43,0.30], shellMat, 36);
    capsule(anatomy, [0,4.15,0], [0,3.88,0], 0.17, shellMat);
    sphere(anatomy, [0,3.48,0], [0.69,0.78,0.34], shellMat, 36);
    sphere(anatomy, [0,2.72,0], [0.48,0.57,0.29], shellMat, 32);
    sphere(anatomy, [0,2.06,0], [0.49,0.35,0.31], shellMat, 32);
    // Shoulder caps and arms in a relaxed, slightly abducted pose.
    capsule(anatomy, [-0.58,3.68,0], [-0.93,3.12,0.02], 0.19, shellMat);
    capsule(anatomy, [-0.93,3.12,0.02], [-1.12,2.42,0.08], 0.145, shellMat);
    capsule(anatomy, [0.58,3.68,0], [0.93,3.12,0.02], 0.19, shellMat);
    capsule(anatomy, [0.93,3.12,0.02], [1.12,2.42,0.08], 0.145, shellMat);
    sphere(anatomy, [-1.15,2.25,0.08], [0.14,0.23,0.12], shellMat);
    sphere(anatomy, [1.15,2.25,0.08], [0.14,0.23,0.12], shellMat);
    // Legs, knees, ankles and feet.
    capsule(anatomy, [-0.27,1.93,0], [-0.34,1.05,0.01], 0.235, shellMat);
    capsule(anatomy, [-0.34,1.05,0.01], [-0.35,0.27,0.03], 0.15, shellMat);
    capsule(anatomy, [0.27,1.93,0], [0.34,1.05,0.01], 0.235, shellMat);
    capsule(anatomy, [0.34,1.05,0.01], [0.35,0.27,0.03], 0.15, shellMat);
    sphere(anatomy, [-0.35,0.16,0.16], [0.18,0.13,0.34], shellMat);
    sphere(anatomy, [0.35,0.16,0.16], [0.18,0.13,0.34], shellMat);

    // Internal skeletal landmarks and rib cage, visible through the glass-like shell.
    bone(anatomy, [0,4.12,0.12], [0,2.18,0.12], 0.045);
    bone(anatomy, [-0.48,3.62,0.08], [0.48,3.62,0.08], 0.055);
    for (let i=0;i<5;i++) {
      const y=3.56-i*0.16, width=0.39-i*0.025;
      bone(anatomy, [-0.04,y,0.16], [-width,y-0.05,0.13], 0.018);
      bone(anatomy, [0.04,y,0.16], [width,y-0.05,0.13], 0.018);
    }
    bone(anatomy, [-0.42,3.67,0.04], [-0.92,3.13,0.04], 0.075);
    bone(anatomy, [-0.92,3.13,0.04], [-1.11,2.43,0.09], 0.052);
    bone(anatomy, [0.42,3.67,0.04], [0.92,3.13,0.04], 0.075);
    bone(anatomy, [0.92,3.13,0.04], [1.11,2.43,0.09], 0.052);
    bone(anatomy, [-0.27,1.98,0.02], [-0.34,1.05,0.02], 0.09);
    bone(anatomy, [-0.34,1.05,0.02], [-0.35,0.27,0.02], 0.06);
    bone(anatomy, [0.27,1.98,0.02], [0.34,1.05,0.02], 0.09);
    bone(anatomy, [0.34,1.05,0.02], [0.35,0.27,0.02], 0.06);
    // Simplified organ cluster, deliberately illustrative rather than clinical.
    sphere(anatomy, [-0.20,3.28,0.29], [0.19,0.34,0.12], lungMat);
    sphere(anatomy, [0.20,3.28,0.29], [0.19,0.34,0.12], lungMat);
    sphere(anatomy, [0.015,3.15,0.42], [0.16,0.22,0.15], organMat, 32);
    sphere(anatomy, [0.12,2.77,0.27], [0.28,0.16,0.13], new THREE.MeshStandardMaterial({color:0xd99a57,emissive:0x6d3212,emissiveIntensity:0.5}));
    sphere(anatomy, [0,2.53,0.29], [0.16,0.24,0.12], new THREE.MeshStandardMaterial({color:0x69c9ff,emissive:0x075b9b,emissiveIntensity:0.5}));
    // Small luminous biometric points on the body.
    const hotSpots=[];
    [[0,4.53,0.31],[0,3.28,0.49],[0,2.72,0.37],[-0.35,1.05,0.17],[0.35,1.05,0.17]].forEach((p,i)=>{
      const h=sphere(anatomy,p,[0.055,0.055,0.055],new THREE.MeshBasicMaterial({color:i===1?0xff6b8a:0x8beaff}));
      hotSpots.push(h);
    });

    // Holographic rings, ground reticle and vertical calibration grid.
    const ringMat = new THREE.MeshBasicMaterial({color:0x14bfff,transparent:true,opacity:0.38,side:THREE.DoubleSide});
    const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.62,0.009,8,120),ringMat);
    orbit1.position.set(0,2.42,-0.45); orbit1.rotation.x=Math.PI/2.2; bodyRoot.add(orbit1);
    const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.3,0.006,8,120),new THREE.MeshBasicMaterial({color:0x31e6dc,transparent:true,opacity:0.24}));
    orbit2.position.set(0,0.12,0); orbit2.rotation.x=Math.PI/2; bodyRoot.add(orbit2);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.55,80),new THREE.MeshBasicMaterial({color:0x087ab1,transparent:true,opacity:0.12,side:THREE.DoubleSide}));
    floor.rotation.x=-Math.PI/2; floor.position.y=0.08; bodyRoot.add(floor);

    const scanGroup = new THREE.Group();
    const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.5,1.45),new THREE.MeshBasicMaterial({color:0x20caff,transparent:true,opacity:0.10,side:THREE.DoubleSide,depthWrite:false}));
    scanPlane.rotation.x=-Math.PI/2; scanGroup.add(scanPlane);
    const scanLine = new THREE.Mesh(new THREE.BoxGeometry(3.15,0.018,0.018),new THREE.MeshBasicMaterial({color:0x9af5ff,transparent:true,opacity:0.95}));
    scanLine.position.y=0.012; scanGroup.add(scanLine);
    const scanGlow = new THREE.PointLight(0x17caff,3,3); scanGroup.add(scanGlow);
    bodyRoot.add(scanGroup);

    const particleGeo = new THREE.BufferGeometry();
    const particleCount=190, positions=new Float32Array(particleCount*3);
    for(let i=0;i<particleCount;i++){
      positions[i*3]=(Math.random()-0.5)*4.2;
      positions[i*3+1]=Math.random()*5.1;
      positions[i*3+2]=(Math.random()-0.5)*1.8-0.5;
    }
    particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x50cfff,size:0.018,transparent:true,opacity:0.7,sizeAttenuation:true}));
    scene.add(particles);

    const resize=()=>{
      const width=host.clientWidth||500, height=host.clientHeight||360;
      camera.aspect=width/height; camera.updateProjectionMatrix(); renderer.setSize(width,height,false);
    };
    resize();
    const observer=new ResizeObserver(resize); observer.observe(host);
    const clock=new THREE.Clock(); let frame=0;
    const animate=()=>{
      frame=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      bodyRoot.rotation.y=Math.sin(t*0.22)*0.13 + t*0.12;
      anatomy.position.y=Math.sin(t*1.1)*0.018;
      orbit1.rotation.z=t*0.18;
      orbit2.rotation.z=-t*0.25;
      scanGroup.position.y=0.28+((t*0.72)%4.45);
      scanGlow.position.y=0.05;
      hotSpots.forEach((h,i)=>{const pulse=1+0.18*Math.sin(t*3.2+i);h.scale.setScalar(0.055*pulse);});
      particles.rotation.y=t*0.018;
      renderer.render(scene,camera);
    };
    animate();

    return ()=>{
      cancelAnimationFrame(frame); observer.disconnect();
      scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material.dispose();}});
      renderer.dispose(); if(host.contains(renderer.domElement))host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="three-body-host" ref={hostRef} aria-label="Slowly rotating 3D holographic human anatomy scan" />;
}

function Status({ children }) {
  const value = String(children).toLowerCase();
  const tone = value.includes("caution") || value.includes("elevated")
    ? "warn" : value.includes("info") ? "info" : "good";
  return <span className={`status ${tone}`}><i />{children}</span>;
}

export default function App() {
  const [selectedId, setSelectedId] = useState("nithish");
  const [filter, setFilter] = useState("All crew");
  const [allAlerts, setAllAlerts] = useState(false);
  const selected = demoCrew.find(member => member.id === selectedId) || demoCrew[0];
  const nominal = demoCrew.filter(member => member.health !== "Caution").length;
  const average = Math.round(demoCrew.reduce((sum, member) => sum + member.readiness, 0) / demoCrew.length);
  const lowest = demoCrew.reduce((a, b) => !a || b.readiness < a.readiness ? b : a, null);
  const visibleCrew = useMemo(
    () => filter === "All crew" ? demoCrew : demoCrew.filter(member => member.id === selectedId),
    [filter, selectedId]
  );

  function exportReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      source: "ZENITH illustrative overview demo data",
      crew: demoCrew,
      alerts: demoAlerts
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "zenith-overview-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <div className="eyebrow"><i /> CREW HEALTH / OVERVIEW</div>
          <h1>Overview<span>.</span></h1>
          <p>Expedition 72 · ISS-042 · Orbit day 128 · <b>SIMULATED TELEMETRY</b></p>
        </div>
        <div className="header-actions">
          <label className="crew-filter">
            <Users size={15} />
            <select value={filter} onChange={event => setFilter(event.target.value)}>
              <option>All crew</option>
              <option>Selected crew</option>
            </select>
            <ChevronDown size={14} />
          </label>
          <button className="export-button" onClick={exportReport}>
            <Download size={15} /> Export report
          </button>
        </div>
      </header>

      <section className="health-banner">
        <div className="health-banner-left">
          <i />
          <div>
            <small>CREW HEALTH STATUS</small>
            <strong>{nominal === demoCrew.length ? "Nominal" : "Nominal · attention required"} · {nominal} of {demoCrew.length} crew within expected parameters</strong>
          </div>
        </div>
        <div className="readiness">
          <div><small>CREW READINESS · AVERAGE</small><span>Lowest: {lowest.name} · {lowest.readiness}%</span></div>
          <div className="readiness-ring" style={{ "--progress": `${average}%` }}><b>{average}%</b></div>
        </div>
      </section>

      <section className="main-grid">
        <article className="panel body-panel">
          <div className="panel-heading"><small>BODY SCAN</small><b>{selected.name} · SELECTED</b></div>
          <div className="body-visual body-visual-3d">
            <div className="scan-grid" />
            <div className="scan-side-label scan-left">
              <span><b>HR</b><strong>72</strong><small>BPM</small></span>
              <span><b>SpO₂</b><strong>98</strong><small>%</small></span>
              <span><b>TEMP</b><strong>36.6</strong><small>°C</small></span>
            </div>
            <HumanBody3D />
            <div className="scan-side-label scan-right"><span>NEURAL</span><span>THORAX</span><span>CARDIAC</span><span>SPINAL</span></div>
            <span className="scan-caption">3D HOLOGRAPHIC BODY SCAN · LIVE SIMULATION</span>
          </div>
          <div className="body-caption"><i /> BODY SCAN VISUAL · SELECT A CREW MEMBER</div>
        </article>

        <article className="panel crew-panel">
          <div className="panel-heading">
            <small>CREW OVERVIEW · {demoCrew.length} MEMBERS</small>
            <b>{nominal} NOMINAL · {demoCrew.length - nominal} NEED ATTENTION</b>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Crew member</th><th>Health</th><th>Risk alerts</th><th>Mental wellness</th><th>Environment</th><th>Ready</th></tr></thead>
              <tbody>
                {visibleCrew.map(member => (
                  <tr key={member.id} className={selectedId === member.id ? "selected" : ""}
                    onClick={() => setSelectedId(member.id)} tabIndex="0"
                    onKeyDown={event => event.key === "Enter" && setSelectedId(member.id)}>
                    <td><strong>{member.name}</strong><small>{member.role}</small></td>
                    <td><Status>{member.health}</Status></td>
                    <td><Status>{member.risk}</Status></td>
                    <td><Status>{member.wellness}</Status></td>
                    <td><Status>{member.environment}</Status></td>
                    <td className="ready-cell">{member.readiness}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel alert-panel">
          <div className="panel-heading">
            <small>ACTIVE ALERTS · CREW</small>
            <button onClick={() => setAllAlerts(value => !value)}>
              {allAlerts ? "Show less" : `View all ${demoAlerts.length}`} <ArrowRight size={13} />
            </button>
          </div>
          <div className="alert-list">
            {(allAlerts ? demoAlerts : demoAlerts.slice(0, 3)).map(alert => (
              <div className="alert-row" key={alert.id}>
                <span><b>{alert.person}</b> · {alert.detail}</span>
                <em className={alert.level.toLowerCase()}>{alert.level}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel insight-panel">
          <div className="panel-heading"><small><Sparkles size={13} /> AI MISSION INSIGHT</small></div>
          <p>{lowest.readiness < 85
            ? `${lowest.name} has the lowest illustrative readiness score (${lowest.readiness}%). Review recovery and workload before the next scheduled operation.`
            : "Crew readiness is within the illustrative target range. Continue routine monitoring and scheduled wellness check-ins."}</p>
          <small>RULE-BASED DEMO INSIGHT · NOT A MEDICAL ASSESSMENT</small>
        </article>
      </section>

      <section className="panel timeline">
        <div><small>MISSION TIMELINE</small></div>
        <div><small>NEXT HEALTH CHECK</small><b>Crew vitals scan</b><span>Tomorrow · 09:00</span></div>
        <div><small>NEXT EVA</small><b>Station exterior task</b><span>In 2 days</span></div>
        <div><small>SUPPLY SYNC</small><b>Cargo and data uplink</b><span>In 4 days</span></div>
      </section>
      <footer className="demo-note"><CircleHelp size={13} /> Demo crew, readiness, alerts and schedule are illustrative, not live astronaut telemetry.</footer>
    </main>
  );
}
