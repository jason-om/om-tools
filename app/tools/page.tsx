"use client";
import { useShellQuery } from "../shell";

import { useMemo, useState } from "react";
import { AppWindow, ArrowUpRight, Database, ImageDown, LayoutGrid, List, MapPinned, Rocket, Rows3, Wrench } from "lucide-react";
import "./tools.css";

type ViewMode = "grid" | "cards" | "list";
type SortMode = "used" | "updated" | "name";
type Tool = {
  name: string;
  description: string;
  department: string;
  author: string;
  updated: string;
  updatedValue: string;
  opens: number;
  url: string;
  tone: string;
  icon: React.ReactNode;
};

const tools: Tool[] = [
  { name:"convert-n-compress", description:"Batch-convert JPG, PNG, and WebP images, then tune compression quality before downloading.", department:"Creative", author:"OM DevTeam", updated:"Aug 24, 2026", updatedValue:"2026-08-24", opens:742, url:"https://github.com/OM-DevTeam/convert-n-compress", tone:"coral", icon:<ImageDown/> },
  { name:"dental-website-tracker", description:"Internal database of dental clients and website information.", department:"Client Success", author:"OM DevTeam", updated:"Aug 22, 2026", updatedValue:"2026-08-22", opens:418, url:"https://github.com/OM-DevTeam/dental-website-tracker", tone:"blue", icon:<Database/> },
  { name:"deploy-dash", description:"Review and track OM application deployments from one internal dashboard.", department:"Development", author:"OM DevTeam", updated:"Aug 20, 2026", updatedValue:"2026-08-20", opens:306, url:"https://github.com/OM-DevTeam/deploy-dash", tone:"purple", icon:<Rocket/> },
  { name:"map-screenshot-exporter", description:"Search an address, frame a map, and export a customizable image at 1× or 2×.", department:"Creative", author:"OM DevTeam", updated:"Aug 18, 2026", updatedValue:"2026-08-18", opens:248, url:"https://github.com/OM-DevTeam/map-screenshot-exporter", tone:"amber", icon:<MapPinned/> },
  { name:"om-app-directory", description:"The internal directory for OM DevTeam applications and utilities.", department:"Agency-wide", author:"OM DevTeam", updated:"Aug 24, 2026", updatedValue:"2026-08-24", opens:173, url:"https://github.com/OM-DevTeam/om-app-directory", tone:"green", icon:<AppWindow/> },
];

const departments = ["All departments", ...Array.from(new Set(tools.map(tool=>tool.department)))];
const formatter = new Intl.NumberFormat("en-US");

function ToolMark({ tool }: { tool:Tool }) {
  return <span className={`tool-mark ${tool.tone}`} aria-hidden="true">{tool.icon}</span>;
}

function ToolCard({ tool, rank, view }: { tool:Tool; rank:number; view:"grid"|"cards" }) {
  return <a className={`tool-card tool-card-link tool-rank-${Math.min(rank,5)} ${view === "grid" ? "bento-card" : "uniform-card"}`} href={tool.url} target="_blank" rel="noopener noreferrer">
    <div className="tool-card-top"><ToolMark tool={tool}/><span className="department-pill">{tool.department}</span></div>
    <div className="tool-card-copy"><h2>{tool.name}</h2><p>{tool.description}</p></div>
    <div className="tool-card-bottom"><dl className="tool-meta"><div><dt>Author</dt><dd>{tool.author}</dd></div><div><dt>Updated</dt><dd>{tool.updated}</dd></div><div><dt>Opens</dt><dd>{formatter.format(tool.opens)}</dd></div></dl><span className="tool-hover-tip" aria-hidden="true">Open tool <ArrowUpRight size={14}/></span></div>
  </a>;
}

export default function ToolsPage(){
  const {query}=useShellQuery();
  const [view,setView]=useState<ViewMode>("grid");
  const [department,setDepartment]=useState("All departments");
  const [sort,setSort]=useState<SortMode>("used");
  const visibleTools=useMemo(()=>tools.filter(tool=>(department==="All departments"||tool.department===department)&&`${tool.name} ${tool.description} ${tool.author}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="used"?b.opens-a.opens:sort==="updated"?b.updatedValue.localeCompare(a.updatedValue):a.name.localeCompare(b.name)),[department,query,sort]);

  return <div className="tools-body"><section className="tools-heading"><div><p>OM DEVTEAM</p><h1>Tools</h1><span>Internal apps and utilities created by the team, ranked by representative usage.</span></div><aside><strong>{tools.length}</strong><span>internal tools</span><small>Representative usage</small></aside></section>
        <section className="tools-toolbar" aria-label="Tool controls"><div className="tool-filter"><label>Department<select value={department} onChange={event=>setDepartment(event.target.value)}>{departments.map(item=><option key={item}>{item}</option>)}</select></label><label>Sort by<select value={sort} onChange={event=>setSort(event.target.value as SortMode)}><option value="used">Most used</option><option value="updated">Recently updated</option><option value="name">Name A–Z</option></select></label></div><div className="view-switcher" aria-label="View"><button className={view==="grid"?"active":""} onClick={()=>setView("grid")} aria-pressed={view==="grid"}><LayoutGrid size={15}/><span>Grid</span></button><button className={view==="cards"?"active":""} onClick={()=>setView("cards")} aria-pressed={view==="cards"}><Rows3 size={15}/><span>Cards</span></button><button className={view==="list"?"active":""} onClick={()=>setView("list")} aria-pressed={view==="list"}><List size={15}/><span>List</span></button></div></section>
        <div className="tools-results-line"><span>{visibleTools.length} {visibleTools.length===1?"tool":"tools"}</span><small>{sort==="used"?"Largest cards reflect representative opens":"Usage remains available on every item"}</small></div>
        {visibleTools.length===0?<section className="tools-empty"><Wrench size={24}/><h2>No tools found</h2><p>Try another department or search term.</p></section>:view==="list"?<section className="tool-list" aria-label="Tool list"><header><span>Tool</span><span>Department</span><span>Author</span><span>Last updated</span><span>Opens</span><span/></header>{visibleTools.map(tool=><article key={tool.name}><div><ToolMark tool={tool}/><span><b>{tool.name}</b><small>{tool.description}</small></span></div><span>{tool.department}</span><span>{tool.author}</span><time dateTime={tool.updatedValue}>{tool.updated}</time><strong>{formatter.format(tool.opens)}</strong><a href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${tool.name}`}><ArrowUpRight size={15}/></a></article>)}</section>:<section className={`tools-collection ${view==="grid"?"bento-grid":"card-grid"}`}>{visibleTools.map((tool,index)=><ToolCard tool={tool} rank={index} view={view} key={tool.name}/>)}</section>}
      </div>;
}
