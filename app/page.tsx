"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleDot,
  FileBarChart, FileStack, Grid2X2, Link2, Moon, MoreVertical, PlusSquare,
  RefreshCw, Search, Settings, Sun, Users, Wrench, X,
} from "lucide-react";

type ProviderName = "asana" | "slack" | "google";
type ModalName = "search" | "meeting" | "client" | "notifications" | "profile" | "sync" | "";
type Horizon = "Day" | "Week" | "Month" | "Quarter" | "Year";
type PlanningHorizon = Exclude<Horizon, "Day" | "Week">;
type CapacityIntensity = "calm" | "steady" | "busy" | "heavy";

type HorizonSignal = {
  provider: "asana" | "google";
  title: string;
  meta: string;
};

type HorizonConfig = {
  intensity: CapacityIntensity;
  intensityLabel: string;
  capacityTitle: string;
  capacityCopy: string;
  stats: string[];
  due: HorizonSignal[];
  periods: Array<{ label:string; range:string; summary:string; signals:HorizonSignal[] }>;
};

const workItems = [
  { provider:"asana" as ProviderName, title:"Homepage revisions overdue", client:"Westwyn", meta:"Due yesterday", flag:"Overdue", tone:"red" },
  { provider:"asana" as ProviderName, title:"August ad creative exports", client:"Sonterra", meta:"Due today", flag:"Due today", tone:"orange" },
  { provider:"google" as ProviderName, title:"Client review starts in 42 minutes", client:"The Practice", meta:"10:00 AM", flag:"In 42 min", tone:"blue" },
  { provider:"google" as ProviderName, title:"Dev handoff", client:"Aurora Dental", meta:"1:30 PM", flag:"In 4h", tone:"blue" },
  { provider:"slack" as ProviderName, title:"Sarah mentioned you", client:"Sonterra", meta:"18 minutes ago", flag:"Mention", tone:"purple" },
  { provider:"asana" as ProviderName, title:"QA feedback on landing page", client:"Westwyn", meta:"2h ago", flag:"", tone:"" },
];

const mentions = [
  ["“Jason, can we make the hero image a bit darker?”","#westwyn-web · 34m"],
  ["“Jason, mind checking the numbers on this one?”","#sonterra-creative · 2h"],
  ["Jason, thoughts on this layout?","#aurora-design · 3h"],
  ["“Hey Jason, quick question on the CTA.”","#thepractice-marketing · 5h"],
  ["“Jason, see my comment below.”","#om-team · 6h"],
];

const projects = [
  ["W","Westwyn","2 overdue · Landing page due today","red"],
  ["S","Sonterra","Feedback received · 1 task due tomorrow","orange"],
  ["TP","The Practice","Client review today · No overdue work","green"],
  ["AD","Aurora Dental","3 tasks due this week","purple"],
  ["SG","Smile Group","No overdue work · On track","blue"],
  ["RD","Redbud Dental","1 overdue · Report due tomorrow","red"],
  ["PD","Peak Dental","Kickoff in 3 days · 2 tasks","green"],
];

const schedule = [
  ["9:00 AM","Design Sync","Google Meet","blue"],
  ["10:00 AM","The Practice — Client Review","Google Meet","purple"],
  ["1:30 PM","Dev Handoff","Google Meet","orange"],
  ["3:00 PM","Sonterra Brainstorm","Google Meet","green"],
  ["4:30 PM","Focus Time","(Block)","grey"],
];

const quietItems = [
  ["Westwyn content audit","Due Aug 27"], ["Sonterra blog draft","Due Aug 28"],
  ["Aurora Dental monthly report","Due Aug 29"], ["Redbud Dental ad variations","Due Sep 1"],
  ["The Practice FAQ updates","Due Sep 2"],
];

const weekCapacity = {
  intensity:"busy" as CapacityIntensity,
  intensityLabel:"Busy week",
  capacityTitle:"Wednesday is your cleanest work window.",
  capacityCopy:"Tuesday carries the most client delivery pressure. Keep Wednesday morning clear for Aurora’s launch QA.",
  stats:["13h focus","12h meetings","9 due"],
};

const horizonViews:Record<PlanningHorizon,HorizonConfig> = {
  Month:{
    intensity:"steady",intensityLabel:"Balanced month",capacityTitle:"The next four weeks stay manageable after launch week.",capacityCopy:"Protect the first full week of September for reporting and Aurora follow-through.",stats:["18 deliverables","11 meetings","3 launches"],
    due:[{provider:"asana",title:"Westwyn launch QA",meta:"Due Aug 27"},{provider:"google",title:"Sonterra launch review",meta:"Sep 4 · 11:00 AM"},{provider:"asana",title:"Aurora monthly report",meta:"Due Sep 8"}],
    periods:[
      {label:"WEEK 1",range:"Aug 24–30",summary:"Launch pressure",signals:[{provider:"asana",title:"Westwyn launch QA",meta:"Due Thu"},{provider:"google",title:"Sonterra campaign launch",meta:"Fri · 11:00 AM"}]},
      {label:"WEEK 2",range:"Aug 31–Sep 6",summary:"Client reviews",signals:[{provider:"google",title:"Sonterra launch review",meta:"Sep 4"},{provider:"asana",title:"Redbud report delivery",meta:"Due Sep 5"}]},
      {label:"WEEK 3",range:"Sep 7–13",summary:"Reporting window",signals:[{provider:"asana",title:"Aurora monthly report",meta:"Due Sep 8"},{provider:"google",title:"The Practice planning",meta:"Sep 10"}]},
      {label:"WEEK 4",range:"Sep 14–20",summary:"Quieter production",signals:[{provider:"asana",title:"Q4 creative briefs",meta:"Due Sep 18"}]},
    ],
  },
  Quarter:{
    intensity:"heavy",intensityLabel:"Heavy quarter",capacityTitle:"October is the quarter’s pressure point.",capacityCopy:"Two launches and a renewal overlap. Keep September decisions tight so October stays executable.",stats:["4 launches","2 renewals","26 milestones"],
    due:[{provider:"asana",title:"Q4 campaign plans",meta:"Due Sep 18"},{provider:"google",title:"Westwyn renewal review",meta:"Oct 6"},{provider:"asana",title:"Holiday creative approval",meta:"Due Oct 16"}],
    periods:[
      {label:"SEPTEMBER",range:"Plan",summary:"Lock scope and creative",signals:[{provider:"asana",title:"Q4 campaign plans",meta:"Due Sep 18"},{provider:"google",title:"Client planning day",meta:"Sep 23"}]},
      {label:"OCTOBER",range:"Peak",summary:"Launch and renewal pressure",signals:[{provider:"google",title:"Westwyn renewal review",meta:"Oct 6"},{provider:"asana",title:"Holiday creative approval",meta:"Due Oct 16"},{provider:"google",title:"Aurora campaign launch",meta:"Oct 22"}]},
      {label:"NOVEMBER",range:"Deliver",summary:"Reporting and optimization",signals:[{provider:"asana",title:"Holiday performance report",meta:"Due Nov 12"},{provider:"google",title:"Quarter close reviews",meta:"Nov 20"}]},
    ],
  },
  Year:{
    intensity:"calm",intensityLabel:"Planned year",capacityTitle:"Peak pressure is concentrated in Q4.",capacityCopy:"The annual view stays intentionally sparse: major launches, renewals, and planning commitments only.",stats:["9 launches","6 renewals","4 planning cycles"],
    due:[{provider:"asana",title:"Annual campaign roadmap",meta:"Q1"},{provider:"google",title:"Midyear planning day",meta:"Jun 18"},{provider:"asana",title:"Holiday launch program",meta:"Q4"}],
    periods:[
      {label:"Q1",range:"Jan–Mar",summary:"Roadmaps and kickoff",signals:[{provider:"asana",title:"Annual campaign roadmap",meta:"January"},{provider:"google",title:"Client kickoff cycle",meta:"February"}]},
      {label:"Q2",range:"Apr–Jun",summary:"Growth campaigns",signals:[{provider:"google",title:"Midyear planning day",meta:"Jun 18"}]},
      {label:"Q3",range:"Jul–Sep",summary:"Preparation and renewals",signals:[{provider:"asana",title:"Renewal preparation",meta:"August"}]},
      {label:"Q4",range:"Oct–Dec",summary:"Peak launch season",signals:[{provider:"asana",title:"Holiday launch program",meta:"October"},{provider:"google",title:"Annual client reviews",meta:"December"}]},
    ],
  },
};

function Provider({ type }: { type: ProviderName }) {
  return <span className={`provider-mark ${type}`} aria-label={type}>{type === "asana" ? "●●●" : type === "slack" ? "✣" : "31"}</span>;
}

function OpenLink({ label = "Open" }: { label?: string }) {
  return <a className="open-link" href="https://example.com" target="_blank" rel="noreferrer">{label} ↗</a>;
}

function Panel({ title, icon, action, children, className="" }: { title:string; icon:React.ReactNode; action?:string; children:React.ReactNode; className?:string }) {
  return <section className={`dash-panel ${className}`}><header><div className="panel-title">{icon}<h2>{title}</h2></div><div>{action && <button>{action}</button>}<MoreVertical size={15}/></div></header>{children}</section>;
}

function WorkList(){return <div className="panel-scroll">{workItems.map((item,i)=><div className="work-item" key={item.title}><Provider type={item.provider}/><div className="item-copy"><b>{item.title}</b><small className="item-context"><strong>{item.client}</strong><span className="item-time">{item.meta}</span><span className="item-source">{item.provider === "google" ? "Google Calendar" : item.provider === "slack" ? "Slack" : "Asana"}</span></small></div><div className="item-action">{item.flag&&<em className={item.tone}>{item.flag}</em>}<OpenLink/></div>{i===workItems.length-1&&<span className="sr-only">Last item</span>}</div>)}<button className="more-row">＋ 4 more items</button></div>}

function providerUrl(provider:"asana"|"google"){return provider==="google"?"https://calendar.google.com":"https://app.asana.com"}

function CapacityRead({intensity,intensityLabel,title,copy,stats}:{intensity:CapacityIntensity;intensityLabel:string;title:string;copy:string;stats:string[]}){
  return <div className="capacity-card capacity-read" data-intensity={intensity}><div className="capacity-eyebrow"><span>CAPACITY READ</span><em>{intensityLabel}</em></div><h2>{title}</h2><p>{copy}</p><div className="capacity-legend">{stats.map((stat,index)=><span key={stat}><i className={["green","purple","orange"][index]}/>{stat}</span>)}</div></div>;
}

function HorizonDueList({items}:{items:HorizonSignal[]}){return <div className="horizon-due-list">{items.map(item=><a href={providerUrl(item.provider)} target="_blank" rel="noreferrer" key={item.title}><Provider type={item.provider}/><div><b>{item.title}</b><small>{item.meta}</small></div><span>{item.provider==="google"?"Calendar":"Asana"} ↗</span></a>)}</div>}

function PlanningView({horizon}:{horizon:PlanningHorizon}){
  const config=horizonViews[horizon];
  return <div className={`planning-view planning-${horizon.toLowerCase()}`}><section className="week-summary-grid"><CapacityRead intensity={config.intensity} intensityLabel={config.intensityLabel} title={config.capacityTitle} copy={config.capacityCopy} stats={config.stats}/><Panel title="COMING DUE" icon={<CalendarDays size={16}/>} action={`View all (${config.due.length})`}><HorizonDueList items={config.due}/></Panel></section><section className="horizon-board"><header><div><CalendarDays size={15}/><h2>{horizon.toUpperCase()} OUTLOOK</h2></div><span>Asana + Google Calendar</span></header><div className="horizon-period-grid">{config.periods.map(period=><article className="horizon-period" key={period.label}><header><div><span>{period.label}</span><b>{period.range}</b></div><em>{period.summary}</em></header><div className="horizon-signals">{period.signals.map(signal=><a href={providerUrl(signal.provider)} target="_blank" rel="noreferrer" key={signal.title}><Provider type={signal.provider}/><div><b>{signal.title}</b><small>{signal.meta}</small></div><ChevronRight size={14}/></a>)}</div></article>)}</div></section></div>;
}

function Mentions(){return <div className="panel-scroll">{mentions.map(([text,meta])=><div className="mention-item" key={text}><Provider type="slack"/><div><b>{text}</b><small>{meta}</small></div><OpenLink/></div>)}<button className="more-row">＋ 7 more mentions</button></div>}

function ProjectPulse(){return <div className="panel-scroll">{projects.map(([initials,name,status,tone])=><a className="project-row" href="https://example.com" target="_blank" rel="noreferrer" key={name}><span className={`client-mark ${tone}`}>{initials}</span><div><b>{name}</b><small className={tone}>{status}</small></div><ChevronRight size={15}/></a>)}<button className="more-row">＋ 4 more projects</button></div>}

function Schedule(){return <div className="schedule-list">{schedule.map(([time,title,place,tone])=><div className="schedule-row" key={time}><time>{time}</time><span className={`timeline-dot ${tone}`}/><div><b>{title}</b><small>{place}</small>{tone !== "grey"&&<OpenLink/>}</div></div>)}<button className="more-row">＋ 2 more events</button></div>}

function WeekCalendar(){
  const days=[["MON","24"],["TUE","25"],["WED","26"],["THU","27"],["FRI","28"]];
  const times=["9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM"];
  const events=[
    {day:0,row:0,span:1,title:"Design Sync",meta:"9:00 AM · Google Calendar",tone:"blue"},
    {day:0,row:1,span:1,title:"The Practice — Client Review",meta:"10:00 AM · Google Calendar",tone:"purple"},
    {day:1,row:1,span:2,title:"Sonterra Brainstorm",meta:"10:30 AM · Google Calendar",tone:"green"},
    {day:2,row:0,span:3,title:"Protected focus window",meta:"Aurora launch QA",tone:"focus"},
    {day:3,row:4,span:1,title:"Dev Handoff",meta:"1:30 PM · Google Calendar",tone:"orange"},
    {day:4,row:2,span:1,title:"Campaign launch review",meta:"11:00 AM · Google Calendar",tone:"blue"},
  ];
  return <section className="week-calendar"><header><div><CalendarDays size={15}/><h2>YOUR WEEK</h2></div><a href="https://calendar.google.com" target="_blank" rel="noreferrer">Open Google Calendar ↗</a></header><div className="week-calendar-scroll"><div className="week-calendar-grid"><div className="week-calendar-corner">EDT</div>{days.map(([day,date],index)=><div className={`week-day-head ${index===0?"today":""}`} key={day}><span>{day}</span><b>{date}</b></div>)}{times.flatMap((time,row)=>[<time className="week-time" style={{gridColumn:1,gridRow:row+2}} key={`time-${time}`}>{time}</time>,...days.map(([day],dayIndex)=><div className="week-slot" style={{gridColumn:dayIndex+2,gridRow:row+2}} key={`${day}-${time}`}/>)])}{events.map(event=><a className={`week-event ${event.tone}`} style={{gridColumn:event.day+2,gridRow:`${event.row+2} / span ${event.span}`}} href="https://calendar.google.com" target="_blank" rel="noreferrer" key={event.title}><b>{event.title}</b><span>{event.meta}</span></a>)}</div></div></section>;
}

function WeekView(){return <div className="week-view"><section className="week-summary-grid"><CapacityRead intensity={weekCapacity.intensity} intensityLabel={weekCapacity.intensityLabel} title={weekCapacity.capacityTitle} copy={weekCapacity.capacityCopy} stats={weekCapacity.stats}/><Panel title="COMING DUE" icon={<CalendarDays size={16}/>} action="View all (9)"><WorkList/></Panel></section><WeekCalendar/></div>}

function Modal({ name, close }: { name:ModalName; close:()=>void }) {
  const content:Record<string,React.ReactNode> = {
    search:<><p className="modal-label">QUICK SEARCH</p><h2>Find anything across your work.</h2><div className="modal-search"><Search size={18}/><input placeholder="Client, campaign, person, or deliverable…"/></div><div className="quick-results"><small>RECENT</small><a href="https://example.com"><Provider type="asana"/>Aurora launch checklist <span>↗</span></a><a href="https://example.com"><Provider type="slack"/>#westwyn-web <span>↗</span></a></div></>,
    meeting:<><p className="modal-label">SCHEDULE</p><h2>Finish scheduling in Google.</h2><p>OM One stays read-only. Create or change the meeting in its source.</p><a className="modal-primary" href="https://calendar.google.com" target="_blank" rel="noreferrer"><CalendarDays size={17}/> Open Google Calendar ↗</a></>,
    client:<><p className="modal-label">CLIENTS</p><h2>Jump to a client.</h2><div className="client-choices">{projects.slice(0,5).map(p=><a href="https://example.com" key={p[1]}><span className={`client-mark ${p[3]}`}>{p[0]}</span>{p[1]}<ChevronRight size={15}/></a>)}</div></>,
    notifications:<><p className="modal-label">NOTIFICATIONS</p><h2>The short list.</h2><div className="notification-line"><i className="red"/><div><b>Homepage revisions are overdue</b><small>Westwyn · 18m ago</small></div></div><div className="notification-line"><i className="purple"/><div><b>Sarah mentioned you</b><small>Sonterra · 24m ago</small></div></div><div className="notification-line"><i className="green"/><div><b>All connections are healthy</b><small>Synced 4m ago</small></div></div></>,
    profile:<><div className="modal-profile"><span>JM</span><div><h2>Jason M.</h2><p>IC Workspace · Verified account</p></div></div><a className="profile-action" href="/auth">Manage authentication <ChevronRight size={15}/></a><a className="profile-action" href="/admin/access">Access requests <ChevronRight size={15}/></a></>,
    sync:<><p className="modal-label">CONNECTIONS</p><h2>Everything is in step.</h2>{[["google","Google Calendar"],["asana","Asana"],["slack","Slack"]].map(([p,n])=><div className="sync-row" key={p}><Provider type={p as ProviderName}/><div><b>{n}</b><small>Healthy · read-only</small></div><em>Synced</em></div>)}<button className="sync-now-button" type="button"><RefreshCw size={15}/>Sync now</button></>,
  };
  return <div className="modal-overlay"><section className="dashboard-modal"><button className="modal-close" onClick={close} aria-label="Close"><X size={18}/></button>{content[name]}</section></div>;
}

export default function Home(){
  const [dark,setDark]=useState(false); const [collapsed,setCollapsed]=useState(false); const [horizon,setHorizon]=useState<Horizon>("Day"); const [modal,setModal]=useState<ModalName>("");
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light"},[dark]);
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setModal("search")}if(e.key==="Escape")setModal("")};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
  return <div className={`om-dashboard ${collapsed?"sidebar-collapsed":""}`}>
    <aside className="om-sidebar"><div className="om-brand"><Image className="logo-light" src="/om-logo-light.svg" alt="OM" width={44} height={30}/><Image className="logo-dark" src="/om-logo-dark.svg" alt="OM" width={44} height={30}/><span>OM One</span></div><nav>
      <a className="active" href="/"><Grid2X2/><span>Overview</span></a><a href="/clients"><Users/><span>Clients</span></a><a href="/team"><Users/><span>Team</span></a><a href="/tools"><Wrench/><span>Tools</span></a><a className="nav-coming" href="#reports" aria-disabled="true" onClick={e=>e.preventDefault()}><FileBarChart/><span>Reports</span><em>Coming Soon</em></a><a className="nav-coming" href="#resources" aria-disabled="true" onClick={e=>e.preventDefault()}><FileStack/><span>Resources</span><em>Coming Soon</em></a>
      <p>MANAGE</p><a className="nav-coming" href="#requests" aria-disabled="true" onClick={e=>e.preventDefault()}><PlusSquare/><span>Requests</span><em>Coming Soon</em></a><p>SETTINGS</p><a className="nav-coming" href="#integrations" aria-disabled="true" onClick={e=>e.preventDefault()}><Link2/><span>Integrations</span><em>Coming Soon</em></a><a className="nav-coming" href="#settings" aria-disabled="true" onClick={e=>e.preventDefault()}><Settings/><span>Settings</span><em>Coming Soon</em></a>
    </nav><div className="sidebar-profile"><span className="profile-photo">JM</span><div><b>Jason M.</b><small>View profile →</small></div></div><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label="Collapse sidebar"><ChevronLeft size={19}/></button></aside>
    <main className="om-main"><header className="om-topbar"><button className="top-search" onClick={()=>setModal("search")}><Search size={20}/><span>Search anything…</span><kbd>⌘K</kbd></button><div className="top-actions"><button className="round-button" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?<Sun size={19}/>:<Moon size={19}/>}</button><button onClick={()=>setModal("meeting")}><CalendarDays size={18}/>Meeting</button><button onClick={()=>setModal("client")}><Users size={18}/>Client</button><button className="notification-button" onClick={()=>setModal("notifications")} aria-label="Notifications"><Bell size={20}/><i>3</i></button><button className="top-profile" onClick={()=>setModal("profile")}><span>JM</span><div><b>Jason M.</b><small>IC Workspace</small></div><ChevronDown size={15}/></button></div></header>
      <div className="dashboard-body"><section className="greeting"><div><p>Monday, August 24</p><h1>Good morning, Jason <span>👋</span></h1><small>Here’s what needs your attention today.</small></div><div className="horizon-tabs">{(["Day","Week","Month","Quarter","Year"] as Horizon[]).map(h=><button className={horizon===h?"active":""} onClick={()=>setHorizon(h)} key={h}><span>{h}</span></button>)}</div></section>
      {horizon==="Day"?<div className="day-grid">
        <Panel title="NEEDS YOU" icon={<span className="panel-icon red"><CircleDot size={15}/></span>} action="View all (10)" className="needs-panel"><WorkList/></Panel>
        <Panel title="NAME MENTIONS" icon={<span className="panel-icon purple">@</span>} action="View all (12)" className="mentions-panel"><Mentions/></Panel>
        <Panel title="CLIENT / PROJECT PULSE" icon={<span className="panel-icon green">⌁</span>} action="View all (10)" className="pulse-panel"><ProjectPulse/></Panel>
        <Panel title="TODAY’S SCHEDULE" icon={<span className="panel-icon blue"><CalendarDays size={14}/></span>} action="View calendar ↗" className="schedule-panel"><Schedule/></Panel>
        <Panel title="LATER / QUIETER" icon={<span className="plain-icon">◷</span>} action="View all (14)" className="quiet-panel"><div className="quiet-list">{quietItems.map(([title,due])=><a href="https://example.com" key={title}><Provider type="asana"/><div><b>{title}</b><small>Asana · {due}</small></div><ChevronRight size={15}/></a>)}<button className="more-row">＋ 9 more items</button></div></Panel>
        <Panel title="UPCOMING THIS WEEK" icon={<span className="plain-icon">▣</span>} className="upcoming-panel"><div className="upcoming-list">{[["TUE","Aug 25","Sonterra ad creative due","Due tomorrow","orange"],["WED","Aug 26","Aurora Dental monthly report","Due in 2 days",""],["THU","Aug 27","Westwyn launch review","In 3 days","blue"],["FRI","Aug 28","Sonterra campaign launch","In 4 days","blue"]].map(r=><a href="https://example.com" key={r[0]}><time><b>{r[0]}</b><small>{r[1]}</small></time><div><b>{r[2]}</b><small>{r[0]==="THU"?"Google Calendar · 2:00 PM":r[0]==="FRI"?"Google Calendar · 11:00 AM":"Asana"}</small></div><em className={r[4]}>{r[3]}</em><ChevronRight size={15}/></a>)}<button className="more-row">＋ 6 more deadlines & events</button></div></Panel>
        <div className="focus-card"><span className="focus-icon">▣</span><h2>Focus on what matters</h2><p>You’re all clear for now. Nice work staying on top of things!</p><div className="focus-wave"/></div>
        <div className="sync-bar"><Provider type="google"/><i/><Provider type="asana"/><i/><Provider type="slack"/><i/><button className="sync-status-button" type="button" onClick={()=>setModal("sync")}><span>Last synced 4m ago</span><RefreshCw size={15}/></button></div>
      </div>:horizon==="Week"?<WeekView/>:<PlanningView horizon={horizon}/>} 
      </div>
    </main>{modal&&<Modal name={modal} close={()=>setModal("")}/>} 
  </div>
}
