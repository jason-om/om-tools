"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, FileBarChart, FileStack, Grid2X2, Link2, Moon, PlusSquare, RefreshCw, Search, Settings, Sun, Users, Wrench, X } from "lucide-react";
import { Provider, projects, type ProviderName } from "./shared";

type ModalName = "search" | "meeting" | "client" | "notifications" | "profile" | "sync" | "";

/** Routes that render their own full-page chrome and must not get the dashboard shell. */
const BARE_ROUTES = ["/auth", "/admin/access"];

/** Per-route topbar search. Overview opens the quick-search modal instead. */
const SEARCH_BY_ROUTE: Record<string, { className: string; placeholder: string }> = {
  "/clients": { className: "clients-search", placeholder: "Search clients, owners, or projects…" },
  "/team": { className: "team-search", placeholder: "Search the OM team…" },
  "/tools": { className: "tools-top-search", placeholder: "Search tools…" },
};

const WRAPPER_BY_ROUTE: Record<string, string> = {
  "/clients": "clients-dashboard",
  "/team": "team-dashboard",
  "/tools": "tools-dashboard",
};

const PREFS_EVENT = "om-prefs";

function subscribeToPrefs(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PREFS_EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(PREFS_EVENT, callback); };
}

function readPref(key: string, on: string) {
  return () => window.localStorage.getItem(key) === on;
}

function writePref(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

const serverFalse = () => false;

const NAV = [
  { href: "/", label: "Overview", icon: Grid2X2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/team", label: "Team", icon: Users },
  { href: "/tools", label: "Tools", icon: Wrench },
];

const COMING = [
  { href: "#reports", label: "Reports", icon: FileBarChart },
  { href: "#resources", label: "Resources", icon: FileStack },
];

/** The topbar search box lives in the shell, but each page does the filtering. */
const ShellContext = createContext<{ query: string; setQuery: (value: string) => void; openModal: (name: ModalName) => void }>({ query: "", setQuery: () => {}, openModal: () => {} });

export function useShellQuery() {
  return useContext(ShellContext);
}

/** Lets a page open one of the shell-owned modals (Overview’s sync bar uses this). */
export function useShellModal() {
  return useContext(ShellContext).openModal;
}

function Modal({ name, close }: { name: ModalName; close: () => void }) {
  const content: Record<string, React.ReactNode> = {
    search:<><p className="modal-label">QUICK SEARCH</p><h2>Find anything across your work.</h2><div className="modal-search"><Search size={18}/><input placeholder="Client, campaign, person, or deliverable…"/></div><div className="quick-results"><small>RECENT</small><a href="https://example.com" target="_blank" rel="noopener noreferrer"><Provider type="asana"/>Aurora launch checklist <span>↗</span></a><a href="https://example.com" target="_blank" rel="noopener noreferrer"><Provider type="slack"/>#westwyn-web <span>↗</span></a></div></>,
    meeting:<><p className="modal-label">SCHEDULE</p><h2>Finish scheduling in Google.</h2><p>OM One stays read-only. Create or change the meeting in its source.</p><a className="modal-primary" href="https://calendar.google.com" target="_blank" rel="noopener noreferrer"><CalendarDays size={17}/> Open Google Calendar ↗</a></>,
    client:<><p className="modal-label">CLIENTS</p><h2>Jump to a client.</h2><div className="client-choices">{projects.slice(0,5).map(p=><a href="https://example.com" target="_blank" rel="noopener noreferrer" key={p[1]}><span className={`client-mark ${p[3]}`}>{p[0]}</span>{p[1]}<ChevronRight size={15}/></a>)}</div></>,
    notifications:<><p className="modal-label">NOTIFICATIONS</p><h2>The short list.</h2><div className="notification-line"><i className="red"/><div><b>Homepage revisions are overdue</b><small>Westwyn · 18m ago</small></div></div><div className="notification-line"><i className="purple"/><div><b>Sarah mentioned you</b><small>Sonterra · 24m ago</small></div></div><div className="notification-line"><i className="green"/><div><b>All connections are healthy</b><small>Synced 4m ago</small></div></div></>,
    profile:<><div className="modal-profile"><span>JM</span><div><h2>Jason M.</h2><p>IC Workspace · Verified account</p></div></div><a className="profile-action" href="/auth">Manage authentication <ChevronRight size={15}/></a><a className="profile-action" href="/admin/access">Access requests <ChevronRight size={15}/></a></>,
    sync:<><p className="modal-label">CONNECTIONS</p><h2>Everything is in step.</h2>{[["google","Google Calendar"],["asana","Asana"],["slack","Slack"]].map(([p,n])=><div className="sync-row" key={p}><Provider type={p as ProviderName}/><div><b>{n}</b><small>Healthy · read-only</small></div><em>Synced</em></div>)}<button className="sync-now-button" type="button"><RefreshCw size={15}/>Sync now</button></>,
  };
  return <div className="modal-overlay"><section className="dashboard-modal"><button className="modal-close" onClick={close} aria-label="Close"><X size={18}/></button>{content[name]}</section></div>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const dark = useSyncExternalStore(subscribeToPrefs, readPref("om-theme", "dark"), serverFalse);
  const collapsed = useSyncExternalStore(subscribeToPrefs, readPref("om-sidebar", "collapsed"), serverFalse);
  const [modal, setModal] = useState<ModalName>("");
  // Keyed by route so a page's filter text never follows you to the next page.
  const [queries, setQueries] = useState<Record<string, string>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const query = queries[pathname] ?? "";
  const setQuery = useCallback((value: string) => setQueries(current => ({ ...current, [pathname]: value })), [pathname]);

  const search = SEARCH_BY_ROUTE[pathname];
  const isOverview = pathname === "/";

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const toggleDark = useCallback(() => writePref("om-theme", dark ? "light" : "dark"), [dark]);
  const toggleCollapsed = useCallback(() => writePref("om-sidebar", collapsed ? "expanded" : "collapsed"), [collapsed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (searchRef.current) searchRef.current.focus();
        else setModal("search");
      }
      if (event.key === "Escape") setModal("");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (BARE_ROUTES.includes(pathname)) return <>{children}</>;

  const wrapper = ["om-dashboard", WRAPPER_BY_ROUTE[pathname], collapsed ? "sidebar-collapsed" : ""].filter(Boolean).join(" ");

  return <ShellContext.Provider value={{ query, setQuery, openModal: setModal }}>
    <div className={wrapper}>
      <aside className="om-sidebar"><div className="om-brand"><Image className="logo-light" src="/om-logo-light.svg" alt="OM" width={44} height={30}/><Image className="logo-dark" src="/om-logo-dark.svg" alt="OM" width={44} height={30}/><span>OM One</span></div><nav>
        {NAV.map(({href,label,icon:Icon})=><a className={pathname===href?"active":""} href={href} key={href}><Icon/><span>{label}</span></a>)}
        {COMING.map(({href,label,icon:Icon})=><a className="nav-coming" href={href} aria-disabled="true" onClick={event=>event.preventDefault()} key={href}><Icon/><span>{label}</span><em>Coming Soon</em></a>)}
        <p>MANAGE</p><a className="nav-coming" href="#requests" aria-disabled="true" onClick={event=>event.preventDefault()}><PlusSquare/><span>Requests</span><em>Coming Soon</em></a><p>SETTINGS</p><a className="nav-coming" href="#integrations" aria-disabled="true" onClick={event=>event.preventDefault()}><Link2/><span>Integrations</span><em>Coming Soon</em></a><a className="nav-coming" href="#settings" aria-disabled="true" onClick={event=>event.preventDefault()}><Settings/><span>Settings</span><em>Coming Soon</em></a>
      </nav><div className="sidebar-profile"><span className="profile-photo">JM</span><div><b>Jason M.</b><small>View profile →</small></div></div><button className="collapse-button" onClick={toggleCollapsed} aria-label={collapsed?"Expand sidebar":"Collapse sidebar"}><ChevronLeft size={19}/></button></aside>
      <main className="om-main">
        <header className="om-topbar">
          {search
            ? <label className={`top-search ${search.className}`}><Search size={20}/><input ref={searchRef} value={query} onChange={event=>setQuery(event.target.value)} placeholder={search.placeholder}/><kbd>⌘K</kbd></label>
            : <button className="top-search" onClick={()=>setModal("search")}><Search size={20}/><span>Search anything…</span><kbd>⌘K</kbd></button>}
          <div className="top-actions">
            <button className="round-button" onClick={toggleDark} aria-label="Toggle theme">{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
            {isOverview&&<><button onClick={()=>setModal("meeting")}><CalendarDays size={18}/>Meeting</button><button onClick={()=>setModal("client")}><Users size={18}/>Client</button></>}
            <button className="notification-button" onClick={()=>setModal("notifications")} aria-label="Notifications"><Bell size={20}/><i>3</i></button>
            <button className="top-profile" onClick={()=>setModal("profile")}><span>JM</span><div><b>Jason M.</b><small>IC Workspace</small></div><ChevronDown size={15}/></button>
          </div>
        </header>
        {children}
      </main>
      {modal&&<Modal name={modal} close={()=>setModal("")}/>}
    </div>
  </ShellContext.Provider>;
}
