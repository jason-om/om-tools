"use client";
import { useShellQuery } from "../shell";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  CalendarDays, Columns3, LayoutGrid, List, MessageSquare, Users
} from "lucide-react";
import "./team.css";

type ViewMode = "card" | "column" | "list";
type GroupMode = "department" | "schedule";
type ScheduleKey = "Flexible" | "Light" | "Focused" | "Packed";
type OmEvent = { time:string; title:string };
type Employee = {
  name:string;
  initials:string;
  title:string;
  department:string;
  timeZone:string;
  timeZoneLabel:string;
  slackUserId:string;
  tone:string;
  omEvents:OmEvent[];
};

const OM_TIME_ZONE="America/Detroit";
const employees:Employee[]=[
  {name:"Maya Chen",initials:"MC",title:"Senior Designer",department:"Creative",timeZone:"America/Los_Angeles",timeZoneLabel:"Pacific Time (PT)",slackUserId:"UOMMAYA",tone:"violet",omEvents:[{time:"10:30 AM",title:"Sonterra creative review"},{time:"2:00 PM",title:"Westwyn launch assets"}]},
  {name:"Jordan Ellis",initials:"JE",title:"Client Success Manager",department:"Client Success",timeZone:"America/New_York",timeZoneLabel:"Eastern Time (ET)",slackUserId:"UOMJORDAN",tone:"blue",omEvents:[{time:"9:30 AM",title:"Aurora weekly check-in"},{time:"12:00 PM",title:"Client success working session"},{time:"3:30 PM",title:"The Practice launch review"}]},
  {name:"Avery Brooks",initials:"AB",title:"Web Developer",department:"Development",timeZone:"America/Denver",timeZoneLabel:"Mountain Time (MT)",slackUserId:"UOMAVERY",tone:"green",omEvents:[{time:"1:30 PM",title:"Development handoff"}]},
  {name:"Priya Shah",initials:"PS",title:"Operations Lead",department:"Operations",timeZone:"America/Chicago",timeZoneLabel:"Central Time (CT)",slackUserId:"UOMPRIYA",tone:"orange",omEvents:[{time:"9:00 AM",title:"OM planning huddle"},{time:"10:30 AM",title:"Launch resourcing review"},{time:"1:00 PM",title:"Operations working session"},{time:"3:00 PM",title:"Campaign delivery review"}]},
  {name:"Theo Martin",initials:"TM",title:"Growth Strategist",department:"Growth",timeZone:"America/Detroit",timeZoneLabel:"Eastern Time (ET)",slackUserId:"UOMTHEO",tone:"coral",omEvents:[]},
  {name:"Nia Okafor",initials:"NO",title:"Analytics Strategist",department:"Analytics",timeZone:"America/Phoenix",timeZoneLabel:"Arizona Time (MST)",slackUserId:"UOMNIA",tone:"amber",omEvents:[{time:"11:00 AM",title:"Campaign reporting review"},{time:"4:00 PM",title:"Attribution working session"}]},
  {name:"Sam Rivera",initials:"SR",title:"Senior Developer",department:"Development",timeZone:"America/Los_Angeles",timeZoneLabel:"Pacific Time (PT)",slackUserId:"UOMSAM",tone:"navy",omEvents:[{time:"10:00 AM",title:"Design and development sync"},{time:"1:30 PM",title:"Website launch QA"},{time:"4:30 PM",title:"OM DevTeam review"}]},
  {name:"Leah Kim",initials:"LK",title:"Content Designer",department:"Creative",timeZone:"America/New_York",timeZoneLabel:"Eastern Time (ET)",slackUserId:"UOMLEAH",tone:"pink",omEvents:[]},
];

const scheduleCopy:Record<ScheduleKey,string>={
  Flexible:"Looks like a flexible day – good window for a quick sync if needed.",
  Light:"A couple of OM touchpoints today – potential openings around them.",
  Focused:"Day is focused on OM priorities – may be better to catch them later or check tomorrow.",
  Packed:"Packed with OM commitments today – recommend scheduling for another day.",
};

function scheduleKey(events:OmEvent[]):ScheduleKey{return events.length===0?"Flexible":events.length<=2?"Light":events.length===3?"Focused":"Packed"}
function displayTime(date:Date,timeZone:string){return new Intl.DateTimeFormat("en-US",{timeZone,hour:"numeric",minute:"2-digit",hour12:true}).format(date)}
function shortZone(label:string){return label.match(/\(([^)]+)\)/)?.[1]||label}
function slackUrl(userId:string){return `https://slack.com/app_redirect?channel=${userId}`}
function getViewPreference():ViewMode{const saved=window.localStorage.getItem("om-team-view");return saved==="column"||saved==="list"?saved:"card"}
function getServerViewPreference():ViewMode{return "card"}
function subscribeToViewPreference(callback:()=>void){window.addEventListener("storage",callback);window.addEventListener("om-team-view",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("om-team-view",callback)}}
function saveViewPreference(view:ViewMode){window.localStorage.setItem("om-team-view",view);window.dispatchEvent(new Event("om-team-view"))}

function PersonHead({employee}:{employee:Employee}){return <div className="person-head"><span className={`employee-avatar ${employee.tone}`}>{employee.initials}</span><div><h2>{employee.name}</h2><p>{employee.title}</p><em>{employee.department}</em></div><a className="slack-dm" href={slackUrl(employee.slackUserId)} target="_blank" rel="noopener noreferrer" aria-label={`Direct message ${employee.name} in Slack`}><MessageSquare size={15}/><span>Slack DM</span></a></div>}

function OmSchedule({employee}:{employee:Employee}){const key=scheduleKey(employee.omEvents);return <div className="om-schedule"><p className={`schedule-note ${key.toLowerCase()}`}><strong>OM day at a glance</strong><span>{scheduleCopy[key]}</span></p><header><div><CalendarDays size={14}/><b>Today’s OM calendar</b></div><span>{employee.omEvents.length} {employee.omEvents.length===1?"event":"events"}</span></header>{employee.omEvents.length>0&&<div className="om-events">{employee.omEvents.map(event=><div key={`${event.time}-${event.title}`}><time>{event.time}</time><span>{event.title}</span></div>)}</div>}</div>}

function EmployeeCard({employee,now,compact=false}:{employee:Employee;now:Date;compact?:boolean}){return <article className={`employee-card ${compact?"compact":""}`}><PersonHead employee={employee}/><OmSchedule employee={employee}/><footer className="card-timezones"><span title={employee.timeZoneLabel}><b suppressHydrationWarning>{displayTime(now,employee.timeZone)}</b><small>Local · {shortZone(employee.timeZoneLabel)}</small></span><span title="OM standard · Eastern Time (ET)"><b suppressHydrationWarning>{displayTime(now,OM_TIME_ZONE)}</b><small>OM · ET</small></span></footer></article>}

function EmployeeList({items,now}:{items:Employee[];now:Date}){return <section className="employee-list" aria-label="All OM employees list"><header><span>Employee</span><span>Time zones</span><span>Today’s OM calendar</span><span>Schedule context</span><span>Contact</span></header>{items.map(employee=>{const key=scheduleKey(employee.omEvents);return <article key={employee.name}><div><span className={`employee-avatar ${employee.tone}`}>{employee.initials}</span><span><b>{employee.name}</b><small>{employee.title} · {employee.department}</small></span></div><div className="list-times"><span><b suppressHydrationWarning>{displayTime(now,employee.timeZone)}</b> local</span><small>{employee.timeZoneLabel}</small><span><b suppressHydrationWarning>{displayTime(now,OM_TIME_ZONE)}</b> OM</span></div><div className="list-events">{employee.omEvents.length?employee.omEvents.map(event=><span key={`${event.time}-${event.title}`}><time>{event.time}</time>{event.title}</span>):<span>No OM events today</span>}</div><p>{scheduleCopy[key]}</p><a className="slack-dm" href={slackUrl(employee.slackUserId)} target="_blank" rel="noopener noreferrer"><MessageSquare size={15}/>Slack DM</a></article>})}</section>}

export default function TeamPage(){
  const {query}=useShellQuery();
  const view=useSyncExternalStore(subscribeToViewPreference,getViewPreference,getServerViewPreference);
  const [group,setGroup]=useState<GroupMode>("department");
  const [department,setDepartment]=useState("All departments");
  const [now]=useState(()=>new Date());
  const departments=["All departments",...Array.from(new Set(employees.map(employee=>employee.department)))];
  const visibleEmployees=useMemo(()=>employees.filter(employee=>(department==="All departments"||employee.department===department)&&`${employee.name} ${employee.title} ${employee.department}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)),[department,query]);
  const groups=useMemo(()=>{const grouped=new Map<string,Employee[]>();visibleEmployees.forEach(employee=>{const key=group==="department"?employee.department:scheduleKey(employee.omEvents);grouped.set(key,[...(grouped.get(key)||[]),employee])});return [...grouped.entries()]},[group,visibleEmployees]);

  return <div className="team-body"><section className="team-heading"><div><p>TEAM</p><h1>All OM Employees</h1><span>A meeting-friendly view of the team’s OM calendar context. Personal calendar items are never shown.</span></div><aside><strong>{employees.length}</strong><span>OM employees</span><small>Representative directory</small></aside></section>
        <section className="team-toolbar" aria-label="Team directory controls"><div className="team-filters"><label>Department<select value={department} onChange={event=>setDepartment(event.target.value)}>{departments.map(item=><option key={item}>{item}</option>)}</select></label>{view==="column"&&<label>Group columns by<select value={group} onChange={event=>setGroup(event.target.value as GroupMode)}><option value="department">Department</option><option value="schedule">Today’s OM schedule</option></select></label>}</div><div className="team-view-switcher" aria-label="View"><button className={view==="card"?"active":""} onClick={()=>saveViewPreference("card")} aria-pressed={view==="card"}><LayoutGrid size={15}/>Cards</button><button className={view==="column"?"active":""} onClick={()=>saveViewPreference("column")} aria-pressed={view==="column"}><Columns3 size={15}/>Columns</button><button className={view==="list"?"active":""} onClick={()=>saveViewPreference("list")} aria-pressed={view==="list"}><List size={15}/>List</button></div></section>
        <div className="team-context-line"><span>{visibleEmployees.length} {visibleEmployees.length===1?"employee":"employees"}</span><small><CalendarDays size={12}/>Today’s event times use OM time · Eastern Time</small></div>
        {visibleEmployees.length===0?<section className="team-empty"><Users size={25}/><h2>No employees found</h2><p>Try another department or search.</p></section>:view==="card"?<section className="employee-grid">{visibleEmployees.map(employee=><EmployeeCard employee={employee} now={now} key={employee.name}/>)}</section>:view==="column"?<section className="team-columns">{groups.map(([label,items])=><div className="team-column" key={label}><header><span>{label}</span><b>{items.length}</b></header><div>{items.map(employee=><EmployeeCard employee={employee} now={now} compact key={employee.name}/>)}</div></div>)}</section>:<EmployeeList items={visibleEmployees} now={now}/>} 
      </div>;
}
