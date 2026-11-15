import React, { useEffect, useMemo, useState } from "react";
import RiskAlertsEmbedded from "./RiskAlertsEmbedded.jsx";
import MentalWellnessEmbedded from "./MentalWellnessEmbedded.jsx";
import MissionEnvironmentEmbedded from "./MissionEnvironmentEmbedded.jsx";
import zenithLogo from "./assets/zenith-logo.png";
import zenithBody from "./assets/zenith-body-wireframe.png";
import {
  Activity, HeartPulse, Moon, Footprints, Zap, Bell, Search, ChevronDown,
  LayoutDashboard, ChartNoAxesCombined, ShieldAlert, Brain, Radio, Menu,
  ArrowUpRight, ArrowDownRight, Clock3, Download, Sparkles, CircleCheck,
  AlertTriangle, Info, Satellite, UserRound, Settings, ChevronRight, Siren,
  Thermometer, Wind, Radiation, Dumbbell, Wifi, WifiOff, X, Check, Send,
  Command, Orbit, Eye, Bone, Waves, Gauge, CalendarDays
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const baseHeart = Array.from({length:24},(_,i)=>({time:`${String(i).padStart(2,"0")}:00`,bpm:Math.round(68+Math.sin(i/2.7)*7+Math.cos(i/4)*4+(i>16?5:0))}));
const sleepData=[{day:"Mon",hours:7.2},{day:"Tue",hours:6.4},{day:"Wed",hours:7.8},{day:"Thu",hours:5.9},{day:"Fri",hours:7.1},{day:"Sat",hours:8.0},{day:"Sun",hours:7.2}];
const activityData=[{day:"Mon",active:42},{day:"Tue",active:55},{day:"Wed",active:38},{day:"Thu",active:63},{day:"Fri",active:49},{day:"Sat",active:72},{day:"Sun",active:58}];
const bodyInfo={
 brain:{title:"Neurological system",icon:Brain,impact:"Microgravity, sleep disruption and workload can influence sensorimotor adaptation, attention and operational performance.",signal:"Monitor sleep, cognitive workload, balance and reported neurological symptoms.",status:"MONITOR"},
 eyes:{title:"Vision & ocular system",icon:Eye,impact:"Headward fluid shift may contribute to spaceflight-associated neuro-ocular changes, including altered visual acuity.",signal:"Track visual acuity, ocular symptoms and clinician assessments.",status:"MONITOR"},
 lungs:{title:"Respiratory system",icon:Wind,impact:"Cabin atmosphere, exercise load and fluid redistribution can affect respiratory comfort and performance.",signal:"Monitor respiratory rate, oxygen saturation and cabin CO₂ trends.",status:"NOMINAL"},
 heart:{title:"Cardiovascular system",icon:HeartPulse,impact:"Fluid redistribution can alter cardiac loading and cardiovascular conditioning in microgravity.",signal:"Monitor heart rate, rhythm and orthostatic tolerance.",status:"NOMINAL"},
 liver:{title:"Metabolic system",icon:Activity,impact:"Changes in activity, nutrition and circadian routine can influence metabolic health during long-duration missions.",signal:"Review nutrition, hydration, laboratory markers and medication history.",status:"MONITOR"},
 digestive:{title:"Digestive system",icon:Waves,impact:"Adaptation to microgravity, diet changes and altered routines may affect appetite and gastrointestinal comfort.",signal:"Track appetite, hydration, bowel habits and dietary intake.",status:"MONITOR"},
 muscles:{title:"Muscular system",icon:Activity,impact:"Reduced loading can contribute to muscle atrophy and strength loss without consistent resistance and aerobic countermeasures.",signal:"Review resistance and aerobic exercise completion and strength trends.",status:"NOMINAL"},
 bones:{title:"Skeletal system",icon:Bone,impact:"Without normal weight-bearing, some astronauts experience loss of bone mineral density, particularly in load-bearing regions.",signal:"Track bone-health countermeasures, nutrition and exercise compliance.",status:"MONITOR"}
};

function MetricCard({icon:Icon,label,value,unit,status="NOMINAL",detail,active=false}){return <article className={`metric-card ${active?"metric-hero":""}`}><div className="metric-top"><span className="metric-icon cyan"><Icon size={18}/></span><span className="metric-label">{label}</span><span className="live-dot"/></div><div className="metric-value">{value}<small>{unit}</small></div><div className="metric-foot"><span className="metric-detail">{detail}</span><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></div></article>}
function Panel({title,subtitle,action,children,className=""}){return <section className={`panel ${className}`}><div className="panel-heading"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>{children}</section>}
function SpaceScene(){
 const stars=Array.from({length:105},(_,i)=>({left:`${(i*43+7)%100}%`,top:`${(i*67+13)%100}%`,delay:`${(i%13)*.31}s`,duration:`${2+(i%7)*.7}s`,size:i%17===0?3:i%5===0?2:1}));
 return <div className="space-scene" aria-hidden="true">
  <div className="space-stars">{stars.map((s,i)=><i key={i} style={{left:s.left,top:s.top,animationDelay:s.delay,animationDuration:s.duration,width:s.size,height:s.size}}/>)}</div>
  <div className="space-nebula nebula-one"/><div className="space-nebula nebula-two"/><div className="orbit-path orbit-one"/>
  <svg className="space-station" viewBox="0 0 440 190" fill="none">
   <g stroke="#75dce8" strokeWidth="1.7" strokeLinejoin="round">
    <rect x="174" y="64" width="92" height="62" rx="13" fill="#183f54"/><rect x="194" y="77" width="52" height="36" rx="8" fill="#28657a"/>
    <path d="M174 83H139L110 61H35V130H110L139 108H174M266 83H301L330 61H405V130H330L301 108H266" fill="#16364d"/>
    <path d="M35 61V130M52 61V130M70 61V130M88 61V130M405 61V130M388 61V130M370 61V130M352 61V130"/>
    <path d="M110 61V130M330 61V130M220 64V30M204 30H236M220 126V159M204 159H236M174 95H139M266 95H301"/>
    <path d="M184 64L174 51H266L256 64M184 126L174 139H266L256 126" stroke="#b1f7ff" opacity=".55"/>
   </g>
   <g stroke="#c0f8ff" strokeWidth=".8" opacity=".35"><path d="M35 95H110M330 95H405M52 61L88 130M388 61L352 130"/></g>
  </svg>
  <svg className="passing-satellite" viewBox="0 0 180 100" fill="none">
   <g stroke="#a8eaf2" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M67 50L44 28M113 50L136 28M67 50L44 72M113 50L136 72"/>
    <rect x="4" y="20" width="42" height="60" rx="2" fill="#153a58"/><rect x="134" y="20" width="42" height="60" rx="2" fill="#153a58"/>
    {Array.from({length:5},(_,i)=><path key={i} d={`M${12+i*8} 20V80 M4 ${30+i*10}H46 M134 ${30+i*10}H176` } stroke="#4c9cba" strokeWidth=".7"/>)}
    <path d="M70 37L110 37L123 50L110 63H70L57 50Z" fill="#d4eaf0"/><circle cx="90" cy="50" r="12" fill="#39a9c5"/><path d="M90 37V24M90 63V76M78 50H102"/>
   </g>
  </svg>
  <span className="shooting-star shooting-one"/><span className="shooting-star shooting-two"/>
  <span className="scene-caption">LOW EARTH ORBIT · DEMO ENVIRONMENT</span>
 </div>
}

function BodyMap({selected,onSelect}){
 // Coordinates are percentages of the supplied portrait image itself (673 × 1024),
 // not of the wider scan stage. This keeps every marker attached to the anatomy
 // when the panel changes size.
 const points=[
  // Brain marker sits in the cranial centre, not above the skull.
  {id:"brain",x:50,y:12.8,label:"Brain"},
  // Two separate eye markers, aligned with the left and right eye positions.
  {id:"eyes",x:46.1,y:17.4,label:"Left eye"},
  {id:"eyes",x:53.9,y:17.4,label:"Right eye"},
  {id:"lungs",x:48,y:28.5,label:"Lungs"},
  {id:"heart",x:51.5,y:33.2,label:"Heart"},
  {id:"liver",x:52,y:39.2,label:"Liver"},
  {id:"digestive",x:48.5,y:43.5,label:"Digestive system"},
  // Biceps: move inward from the shoulder joints onto the upper-arm muscle belly.
  {id:"muscles",x:29.5,y:29.4,label:"Left biceps"},
  {id:"muscles",x:70.5,y:29.4,label:"Right biceps"},
  {id:"bones",x:43,y:64,label:"Left leg bones"},
  {id:"bones",x:57,y:64,label:"Right leg bones"}
 ];
 return <div className="body-map-wrap zenith-body-map">
  <div className="zenith-human-stage">
   <div className="zenith-anatomy-layer">
    <img className="zenith-human-image" src={zenithBody} alt="Blue luminous wireframe human anatomy, front view" />
    <div className="localized-organ-glow brain-glow" aria-hidden="true"/>
    <div className="localized-organ-glow eyes-glow" aria-hidden="true"/>
    <div className="localized-organ-glow lungs-glow" aria-hidden="true"/>
    <div className="localized-organ-glow liver-glow" aria-hidden="true"/>
    <div className="localized-organ-glow digestive-glow" aria-hidden="true"/>
    <div className="localized-organ-glow muscle-left-glow" aria-hidden="true"/>
    <div className="localized-organ-glow muscle-right-glow" aria-hidden="true"/>
    <div className="localized-organ-glow bone-left-glow" aria-hidden="true"/>
    <div className="localized-organ-glow bone-right-glow" aria-hidden="true"/>
    <div className="heart-organ-overlay" aria-hidden="true">
     <svg viewBox="0 0 120 140" className="anatomical-heart">
      <defs><radialGradient id="heartRed" cx="48%" cy="42%" r="65%"><stop offset="0" stopColor="#ffb0b7"/><stop offset=".34" stopColor="#ff394d"/><stop offset="1" stopColor="#8d061d"/></radialGradient></defs>
      <path className="heart-vessel" d="M56 39 C51 22 49 10 57 7 C64 4 70 12 67 24 M67 24 C68 9 78 6 83 12 C89 20 79 31 75 40"/>
      <path className="heart-shape" d="M61 43 C49 25 20 29 16 55 C11 84 39 112 61 128 C83 111 111 83 105 55 C100 29 72 26 61 43Z"/>
      <path className="heart-detail" d="M61 47 C53 62 54 83 61 105 M61 59 C44 55 35 65 34 79 M65 61 C81 51 94 60 94 75 M60 81 C72 79 80 88 83 99"/>
      <path className="heart-coronary" d="M59 55 C48 48 39 51 34 62 M63 56 C74 48 84 50 90 61 M60 73 L48 86 M67 73 L78 87"/>
     </svg>
    </div>
    <div className="zenith-body-hotspots">{points.map((pt,i)=><button key={`${pt.id}-${i}`} type="button" style={{left:`${pt.x}%`,top:`${pt.y}%`}} className={`zenith-hotspot ${selected===pt.id?"selected":""}`} onClick={()=>onSelect(pt.id)} aria-label={`Inspect ${pt.label || pt.id}`} title={`Inspect ${pt.label || pt.id}`}><i/></button>)}</div>
   </div>
   <div className="body-scan-halo" aria-hidden="true"/>
   <div className="body-scan-ring ring-a" aria-hidden="true"/><div className="body-scan-ring ring-b" aria-hidden="true"/>
   <div className="body-scan-sweep" aria-hidden="true"/>
  </div>
  <div className="body-map-hint"><span className="scan-live-dot"/> LIVE BIOMETRIC SCAN · SELECT A BODY SYSTEM</div>
 </div>
}
function App(){
 const [range,setRange]=useState("24H"),[activeNav,setActiveNav]=useState("Health Analytics"),[mobileOpen,setMobileOpen]=useState(false),[showAll,setShowAll]=useState(false);
 const [riskAlertsMounted,setRiskAlertsMounted]=useState(false);
 const [mentalWellnessMounted,setMentalWellnessMounted]=useState(false),[missionEnvironmentMounted,setMissionEnvironmentMounted]=useState(false);
 const [orbitDay,setOrbitDay]=useState(128),[incident,setIncident]=useState(false),[delayMode,setDelayMode]=useState(false),[crewMode,setCrewMode]=useState(false),[bodyPart,setBodyPart]=useState("heart");
 const [alerts,setAlerts]=useState([{id:1,tier:"CAUTION",title:"Sleep duration below mission target",cause:"Crew member recorded 6.4 hours of sleep against a 7.5-hour planning target on the previous sleep cycle.",time:"09:15 UTC",ack:false,escalated:false},{id:2,tier:"ADVISORY",title:"Exercise compliance approaching target",cause:"Current logged exercise is 105 minutes against the approximately 120-minute daily countermeasure plan.",time:"08:42 UTC",ack:false,escalated:false}]);
 const [selectedAlert,setSelectedAlert]=useState(null),[searchOpen,setSearchOpen]=useState(false),[searchQuery,setSearchQuery]=useState("");
 const dayFactor=(orbitDay-1)/127;
 const heartNow=incident?104:Math.round(70+dayFactor*3+Math.sin(orbitDay/8)*2);
 const sleepNow=incident?5.1:Number((7.4-dayFactor*.3).toFixed(1));
 const fatigueNow=incident?74:Math.round(26+dayFactor*8+Math.sin(orbitDay/13)*4);
 const radiation=incident?68:Number((42+dayFactor*13).toFixed(1));
 const heartData=useMemo(()=>baseHeart.map((d,i)=>({...d,bpm:incident&&i>17?Math.min(112,d.bpm+26):d.bpm+Math.round((orbitDay-128)/45)})),[incident,orbitDay]);
 const navItems=[{name:"Overview",icon:LayoutDashboard},{name:"Health Analytics",icon:ChartNoAxesCombined},{name:"Risk Alerts",icon:ShieldAlert,badge:String(alerts.filter(a=>!a.ack).length)},{name:"Mental Wellness",icon:Brain},{name:"Mission Environment",icon:Radio}];
 const currentBody=bodyInfo[bodyPart];
 useEffect(()=>{const handler=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setSearchOpen(true)}if(e.key==="Escape"){setSearchOpen(false);setSelectedAlert(null)}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[]);
 const addIncident=()=>{if(incident){setIncident(false);return}setIncident(true);setAlerts(prev=>[{id:Date.now(),tier:"WARNING",title:"Solar particle event · simulated",cause:"Demo incident injected: radiation dose rate increased and a temporary heart-rate elevation was simulated. Review crew status, shelter guidance and medical telemetry.",time:"LIVE SIMULATION",ack:false,escalated:false},...prev])};
 const updateAlert=(id,patch)=>setAlerts(prev=>prev.map(a=>a.id===id?{...a,...patch}:a));
 const exportReport=()=>{const rows=[["ZENITH Day",orbitDay],["Heart rate BPM",heartNow],["Sleep hours",sleepNow],["Fatigue index",fatigueNow],["Radiation mission limit %",radiation],["Incident active",incident?"yes":"no"]];const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"}));link.download=`zenith-day-${orbitDay}-health-report.csv`;link.click();URL.revokeObjectURL(link.href)};
 const selectNav=name=>{if(name==="Risk Alerts")setRiskAlertsMounted(true);if(name==="Mental Wellness")setMentalWellnessMounted(true);if(name==="Mission Environment")setMissionEnvironmentMounted(true);setActiveNav(name)};
 const searchItems=["Health Analytics","Risk Alerts","Mental Wellness","Mission Environment","Crew comparison","Mission timeline","Body systems","Simulate incident"];
 return <div className="app-shell"><SpaceScene/><aside className={`sidebar ${mobileOpen?"open":""}`}><div className="brand"><div className="brand-mark"><img src={zenithLogo} alt="Zenith logo" /></div><div><strong>ZENITH<span>.</span></strong><small>MISSION HEALTH SYSTEM</small></div></div><div className="mission-chip"><span className="orbit-dot"/> MISSION ACTIVE <span className="mission-code">ISS-042</span></div><div className="nav-label">WORKSPACE</div><nav>{navItems.map(({name,icon:Icon,badge})=><button key={name} className={`nav-item ${activeNav===name?"active":""}`} onClick={()=>{selectNav(name);setMobileOpen(false)}}><Icon size={18}/><span>{name}</span>{badge&&<b>{badge}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><Sparkles size={17}/></div><strong>AI mission insight</strong><p>{incident?"Solar event simulated. Crew monitoring elevated.":"Fatigue trend is stable. Review recovery before EVA."}</p><span>SIMULATION ENGINE · ACTIVE</span></div><button className="nav-item"><Settings size={18}/><span>Settings</span></button><div className="user-profile"><div className="avatar">MC</div><div><strong>Mission Control</strong><small>Flight medical team</small></div><ChevronDown size={15}/></div></div></aside>
 <main className="main-content"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(!mobileOpen)}><Menu/></button><div className="breadcrumb">MISSION CONTROL <ChevronRight size={13}/> <strong>{activeNav.toUpperCase()}</strong></div><div className="top-actions"><button className={`delay-toggle ${delayMode?"enabled":""}`} onClick={()=>setDelayMode(v=>!v)}>{delayMode?<WifiOff size={14}/>:<Wifi size={14}/>} {delayMode?"20 MIN LINK DELAY":"DIRECT LINK"}</button><button className="icon-button" onClick={()=>setSearchOpen(true)} aria-label="Quick search"><Search size={18}/><kbd>⌘K</kbd></button><button className="icon-button notification" onClick={()=>selectNav("Risk Alerts")}><Bell size={18}/><i/></button><div className="top-avatar">MC</div></div></header>
 {riskAlertsMounted&&<RiskAlertsEmbedded hidden={activeNav!=="Risk Alerts"}/>}
 {mentalWellnessMounted&&<MentalWellnessEmbedded hidden={activeNav!=="Mental Wellness"}/>}
 {missionEnvironmentMounted&&<MissionEnvironmentEmbedded hidden={activeNav!=="Mission Environment"}/>}
 {activeNav!=="Risk Alerts"&&<div className="page-wrap"><div className="page-title-row"><div><div className="eyebrow"><span/> CREW HEALTH / BIOMETRICS</div><h1>Health Analytics<span className="title-period">.</span></h1><p className="page-subtitle">Mission telemetry, crew physiology and operational readiness.</p></div><div className="title-actions"><div className="crew-select"><UserRound size={16}/><span>R. Nithish · Crew Health</span><ChevronDown size={14}/></div><button className="export-btn" onClick={exportReport}><Download size={16}/> Export report</button></div></div>
 <div className={`mission-strip ${incident?"incident-strip":""}`}><div className="mission-strip-left"><span className="strip-icon"><Satellite size={18}/></span><div><strong>EXPEDITION 72 · INTERNATIONAL SPACE STATION</strong><small>CREW MEMBER ID: AST-0042 <i/> ORBIT DAY {orbitDay} <i/> {delayMode?"GROUND LINK BUFFERING · 20 MIN":"TELEMETRY SYNC · LIVE SIMULATION"}</small></div></div><div className="strip-right"><span className="live-pulse"/> {incident?"INCIDENT SIMULATION ACTIVE":"TELEMETRY CONNECTED"}</div></div>
 <div className="mission-status-banner"><div className="mission-status-main"><span className={`status-lamp ${incident?"warning":"nominal"}`}/><div><small>CREW HEALTH STATUS</small><strong>{incident?"CAUTION · SOLAR EVENT RESPONSE":"NOMINAL · CREW WITHIN EXPECTED PARAMETERS"}</strong></div></div><div className="banner-right"><span><Orbit size={15}/> ISS POSITION TRACKING</span><svg className="orbit-globe" viewBox="0 0 72 42" aria-label="ISS orbit position"><defs><clipPath id="earthClip"><circle cx="25" cy="21" r="15"/></clipPath></defs><circle cx="25" cy="21" r="15" fill="#123f5a" stroke="#55cbd5" strokeWidth="1.2"/><g clipPath="url(#earthClip)" fill="#2c8c79" opacity=".9"><path d="M12 12l8-4 5 4-2 5-6 2-3 7-5-4zM29 22l7-3 5 4-4 8-8 2-4-6z"/><path d="M21 1l4 6-3 4-5-3z"/></g><ellipse cx="25" cy="21" rx="34" ry="10" fill="none" stroke="#6babb7" strokeWidth=".8" transform="rotate(-18 25 21)"/><circle cx="58" cy="10" r="3" fill="#5ce0e5" stroke="#d2ffff" strokeWidth=".8"/></svg><button className="incident-button" onClick={addIncident}><Siren size={15}/>{incident?"Clear incident":"Simulate incident"}</button></div></div>
 <div className="section-row"><div><h2>Health at a glance</h2><p>{crewMode?"Crew average · 6 active crew members":"Latest readings compared with personal baseline"}</p></div><div className="section-tools"><div className="compare-toggle"><button className={!crewMode?"chosen":""} onClick={()=>setCrewMode(false)}>My baseline</button><button className={crewMode?"chosen":""} onClick={()=>setCrewMode(true)}>Crew average</button></div><div className="range-tabs">{["24H","7D","30D"].map(r=><button key={r} className={range===r?"selected":""} onClick={()=>setRange(r)}>{r}</button>)}</div></div></div>
 <div className="metrics-grid"><MetricCard icon={HeartPulse} label="HEART RATE" value={crewMode?"74":heartNow} unit=" BPM" detail={incident?"+32 BPM from baseline":crewMode?"Crew mean · 6 crew":"Personal baseline 68–78"} status={incident?"WARNING":"NOMINAL"} active/><MetricCard icon={Moon} label="SLEEP DURATION" value={crewMode?"7.0":sleepNow} unit=" hrs" detail="Mission target · 7.5 hrs" status={sleepNow<6?"CAUTION":"NOMINAL"}/><MetricCard icon={Dumbbell} label="EXERCISE TIME" value={incident?"96":"105"} unit=" min" detail="Daily countermeasure goal · 120 min" status="CAUTION"/><MetricCard icon={Zap} label="FATIGUE INDEX" value={fatigueNow} unit=" /100" detail="Predictive recovery estimate" status={fatigueNow>60?"WARNING":fatigueNow>40?"CAUTION":"NOMINAL"}/></div>
 <div className="analytics-grid"><Panel title="Heart-rate telemetry" subtitle={`BPM · ${range} · ORBIT DAY ${orbitDay}`} className="heart-panel" action={<div className="chart-legend"><span className="legend-dot cyan-dot"/> Live biometric <span className="baseline-key"/> Personal threshold</div>}><div className="chart-summary"><strong>{heartNow} <small>BPM</small></strong><span className={incident?"summary-warning":"summary-positive"}>{incident?"Elevated · review required":"Within expected baseline"}</span><svg className="ecg-mini" viewBox="0 0 130 34"><polyline points="0,18 18,18 25,17 31,18 37,5 43,29 49,13 55,18 78,18 85,17 91,18 97,5 103,29 109,13 115,18 130,18"/></svg></div><div className="chart-area heart-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={heartData} margin={{top:10,right:8,left:-22,bottom:0}}><defs><linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#35d4df" stopOpacity={.22}/><stop offset="100%" stopColor="#35d4df" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1c2a3b" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" tick={{fill:"#a0b0c0",fontSize:11}} axisLine={false} tickLine={false} interval={3}/><YAxis domain={[50,120]} ticks={[50,70,90,110]} tick={{fill:"#a0b0c0",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#101d2c",border:"1px solid #26384d",borderRadius:10,color:"#e9f1fa"}}/><ReferenceLine y={78} stroke="#d8a34f" strokeDasharray="5 5"/><Area type="monotone" dataKey="bpm" stroke={incident?"#e85e61":"#35d4df"} strokeWidth={2.6} fill="url(#heartFill)" activeDot={{r:5}}/></AreaChart></ResponsiveContainer></div><div className="chart-bottom-stats"><div><small>MINIMUM</small><strong>61 <i>BPM</i></strong></div><div><small>AVERAGE</small><strong>{heartNow} <i>BPM</i></strong></div><div><small>MAXIMUM</small><strong>{incident?104:89} <i>BPM</i></strong></div><div><small>BASELINE</small><strong>68–78 <i>BPM</i></strong></div></div></Panel>
 <Panel title="Sleep & recovery" subtitle="Hours per sleep cycle · Last 7 days" action={<span className="panel-tag">TARGET 7.5 HRS</span>}><div className="sleep-total"><strong>{sleepNow} <small>hrs latest</small></strong><span className={`status-badge ${sleepNow<6?"caution":"nominal"}`}>{sleepNow<6?"BELOW TARGET":"ON PLAN"}</span></div><div className="chart-area side-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sleepData} margin={{top:12,right:0,left:-25,bottom:0}}><CartesianGrid stroke="#1c2a3b" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" tick={{fill:"#a0b0c0",fontSize:11}} axisLine={false} tickLine={false}/><YAxis domain={[0,10]} ticks={[0,5,10]} tick={{fill:"#a0b0c0",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#101d2c",border:"1px solid #26384d",borderRadius:10}}/><ReferenceLine y={7.5} stroke="#d8a34f" strokeDasharray="4 4"/><Bar dataKey="hours" fill="#35d4df" radius={[4,4,0,0]} barSize={19}/></BarChart></ResponsiveContainer></div><div className="mini-legend"><span><i className="cyan-swatch"/> Sleep duration</span><span><i className="target-swatch"/> Mission target</span></div></Panel>
 <Panel title="Exercise countermeasures" subtitle="Daily exercise compliance · Target ≈ 120 min" action={<span className="panel-tag">MICROGRAVITY</span>}><div className="activity-summary"><strong>{incident?96:105} <small>/ 120 min</small></strong><span className="summary-warning">{Math.round((incident?96:105)/120*100)}% complete</span></div><div className="compliance-track"><span style={{width:`${(incident?96:105)/120*100}%`}}/></div><div className="exercise-breakdown"><div><span>Aerobic</span><strong>45 min</strong></div><div><span>Resistance</span><strong>60 min</strong></div><div><span>Remaining</span><strong>{incident?24:15} min</strong></div></div><div className="activity-footer"><span><i className="green-swatch"/> Countermeasure logged</span><span>Daily plan</span></div></Panel>
 <Panel title="Mission environment" subtitle="Cabin systems & exposure monitoring" action={<span className="panel-tag">HABITAT</span>}><div className="environment-grid"><div className="env-stat"><Radiation size={17}/><span>RADIATION DOSE</span><strong>{radiation} <small>%</small></strong><div className="env-track"><i style={{width:`${radiation}%`}} className={incident?"amber-fill":""}/></div><small>Mission dose budget</small></div><div className="env-stat"><Wind size={17}/><span>CO₂ LEVEL</span><strong>{incident?0.48:0.42} <small>kPa</small></strong><small className="nominal-text">Within cabin limits</small></div><div className="env-stat"><Thermometer size={17}/><span>CABIN TEMP</span><strong>22.4 <small>°C</small></strong><small className="nominal-text">Nominal range</small></div><div className="env-stat"><Gauge size={17}/><span>FATIGUE RISK</span><strong>{fatigueNow} <small>/100</small></strong><small className={fatigueNow>60?"warning-text":"nominal-text"}>{fatigueNow>60?"Elevated monitoring":"Within expected range"}</small></div></div></Panel></div>
 <div className="lower-grid"><Panel title="Mission timeline" subtitle="Scrub mission history · Orbit Day 1–128" className="timeline-panel" action={<span className="panel-tag">DEMO PLAYBACK</span>}><div className="timeline-readout"><strong>ORBIT DAY {orbitDay}</strong><span>{orbitDay===128?"CURRENT MISSION DAY":`${128-orbitDay} DAYS BEFORE CURRENT`}</span></div><input className="mission-slider" type="range" min="1" max="128" value={orbitDay} onChange={e=>setOrbitDay(Number(e.target.value))}/><div className="timeline-scale"><span>DAY 1 · LAUNCH</span><span>DAY 64 · MID-MISSION</span><span>DAY 128 · CURRENT</span></div><div className="timeline-events"><span><i/> Launch</span><span><i/> EVA 04</span><span className={incident?"event-alert":""}><i/> {incident?"Solar event":"Current telemetry"}</span></div></Panel>
 <Panel title="Crew health comparison" subtitle="Six-person expedition · normalized indicators" action={<span className="panel-tag">CREW VIEW</span>}><div className="crew-rows">{[["S. Poorna","72 BPM",82],["R. Nithish","69 BPM",76],["S. Gargi","75 BPM",88],["M. Annie","71 BPM",80],["U. Vaishnavi","77 BPM",91],["B. Aditya","68 BPM",73]].map(([name,val,score],i)=><div className="crew-row" key={name}><span className="crew-avatar">{name.split(" ").map(x=>x[0]).join("")}</span><span className="crew-name">{name}</span><strong>{i===0?heartNow:val}</strong><div className="crew-bar"><i style={{width:`${incident&&i===0?98:score}%`}}/></div><span className={`crew-state ${incident&&i===0?"warning-text":"nominal-text"}`}>{incident&&i===0?"REVIEW":"NOMINAL"}</span></div>)}</div></Panel>
 <Panel title="Microgravity body systems" subtitle="Select a system to review known spaceflight effects" className="body-panel"><div className="body-layout"><BodyMap selected={bodyPart} onSelect={setBodyPart}/><div className="body-detail"><span className="body-tag">{currentBody.status}</span><h4>{currentBody.title}</h4><p>{currentBody.impact}</p><div className="body-signal"><Info size={15}/><span>{currentBody.signal}</span></div><div className="body-tabs">{Object.keys(bodyInfo).map(k=><button key={k} className={bodyPart===k?"active":""} onClick={()=>setBodyPart(k)}>{k}</button>)}</div></div></div></Panel>
 <Panel title="AI mission insight" subtitle="Predictive decision support · illustrative model output" className="insight-panel"><div className="insight-head"><span className="insight-spark"><Sparkles size={18}/></span><span className={`status-badge ${incident?"caution":"nominal"}`}>{incident?"INCIDENT RESPONSE":"PREDICTIVE ADVISORY"}</span></div><h4>{incident?"Solar event detected in simulated telemetry":"Fatigue trend suggests recovery window before EVA"}</h4><p>{incident?"Radiation exposure and heart rate have increased in this demo scenario. Follow mission radiation procedures, review crew symptoms and route the event to the flight surgeon.":"Fatigue index is trending upward across recent mission days. Consider a rest cycle before the planned EVA window in 14 hours, then reassess readiness."}</p><div className="insight-meta"><span><Clock3 size={13}/> Updated just now</span><span><Info size={13}/> Decision support, not diagnosis</span></div></Panel></div>
 <div className="bottom-grid"><Panel title="Risk alerts & workflow" subtitle="Advisory · Caution · Warning" action={<button className="text-button" onClick={()=>setShowAll(v=>!v)}>{showAll?"Show less":"View all"} <ChevronRight size={14}/></button>}><div className="alert-list">{(showAll?alerts:alerts.slice(0,3)).map(a=><button className={`alert-row alert-click ${a.tier.toLowerCase()}`} key={a.id} onClick={()=>setSelectedAlert(a)}><span className={`alert-icon ${a.tier.toLowerCase()}`}>{a.tier==="WARNING"?<AlertTriangle size={17}/>:a.tier==="CAUTION"?<Info size={17}/>:<CircleCheck size={17}/>}</span><span className="alert-copy"><strong>{a.tier} · {a.title}</strong><p>{a.cause}</p><small><Clock3 size={12}/> {a.time} · {a.ack?"ACKNOWLEDGED":"UNACKNOWLEDGED"}{a.escalated?" · ESCALATED":""}</small></span><ChevronRight size={16} className="alert-chevron"/></button>)}</div></Panel><Panel title="Ground-link autonomy" subtitle="Communication delay simulation"><div className="delay-card"><div className="delay-icon"><Radio size={21}/></div><div><strong>{delayMode?"20:00 MIN · LINK DELAY ACTIVE":"00:00 MIN · DIRECT LINK"}</strong><p>{delayMode?"Ground responses are delayed. Local onboard monitoring and crew procedures remain available.":"Toggle delay mode to demonstrate autonomous onboard health response."}</p></div></div><button className={`delay-action ${delayMode?"active":""}`} onClick={()=>setDelayMode(v=>!v)}>{delayMode?"Disable delay mode":"Enable 20-minute delay"}</button></Panel></div>
 <footer className="page-footer"><span>ZENITH MISSION HEALTH SYSTEM <i/> PROTOTYPE BUILD 2.0</span><span><span className="live-pulse"/> SIMULATED TELEMETRY · NOT FOR CLINICAL USE</span></footer></div>}</main>
 {selectedAlert&&<div className="modal-backdrop" onClick={()=>setSelectedAlert(null)}><div className="alert-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelectedAlert(null)}><X size={18}/></button><span className={`status-badge ${selectedAlert.tier.toLowerCase()}`}>{selectedAlert.tier}</span><h2>{selectedAlert.title}</h2><p>{selectedAlert.cause}</p><div className="modal-meta"><span><Clock3 size={14}/> {selectedAlert.time}</span><span>CREW ID · AST-0042</span></div><div className="modal-actions"><button onClick={()=>{updateAlert(selectedAlert.id,{ack:true});setSelectedAlert(null)}}><Check size={15}/> Acknowledge</button><button className="escalate" onClick={()=>{updateAlert(selectedAlert.id,{escalated:true,ack:true});setSelectedAlert(null)}}><Send size={15}/> Escalate to flight surgeon</button></div>{selectedAlert.ack&&<small className="modal-note">This alert has been acknowledged.</small>}</div></div>}
 {searchOpen&&<div className="modal-backdrop search-backdrop" onClick={()=>setSearchOpen(false)}><div className="quick-search" onClick={e=>e.stopPropagation()}><div className="search-input-row"><Search size={18}/><input autoFocus placeholder="Search mission systems, metrics, actions…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/><kbd>ESC</kbd></div>{searchItems.filter(x=>x.toLowerCase().includes(searchQuery.toLowerCase())).map(item=><button key={item} onClick={()=>{if(item==="Simulate incident")addIncident();else if(item==="Risk Alerts")selectNav(item);else if(item==="Mission timeline")document.querySelector(".timeline-panel")?.scrollIntoView({behavior:"smooth"});else if(item==="Body systems")document.querySelector(".body-panel")?.scrollIntoView({behavior:"smooth"});else setActiveNav(item);setSearchOpen(false)}}><Command size={14}/>{item}<ChevronRight size={14}/></button>)}</div></div>}
 </div>
}
export default App;
