"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRightIcon,
  CardsViewIcon,
  CommandCenterIcon,
  ConvertCompressIcon,
  DentalTrackerIcon,
  DeploysIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
  WrenchIcon,
} from "./icons";
import { ThemeToggle } from "./theme";

type ViewMode = "grid" | "cards" | "list";
type SortMode = "featured" | "name" | "department";

type Tool = {
  name: string;
  description: string;
  department: string;
  author: string;
  url: string;
  tone: string;
  icon: React.ReactNode;
};

/** Live team tools. Array order is the "Featured" sort and drives bento sizing. */
const tools: Tool[] = [
  {
    name: "Convert & Compress",
    description: "File conversion and compression utility.",
    department: "Creative",
    author: "OM DevTeam",
    url: "https://convert-n-compress.om-devteam.workers.dev/",
    tone: "coral",
    icon: <ConvertCompressIcon />,
  },
  {
    name: "Dental Website Tracker",
    description: "Track and monitor dental practice websites.",
    department: "Client Success",
    author: "OM DevTeam",
    url: "https://dental-website-tracker.om-devteam.workers.dev/",
    tone: "blue",
    icon: <DentalTrackerIcon />,
  },
  {
    name: "Deploys",
    description: "Deployment dashboard and status overview.",
    department: "Development",
    author: "OM DevTeam",
    url: "https://deploys.omdigitalagency.com/",
    tone: "purple",
    icon: <DeploysIcon />,
  },
  {
    name: "OM Tools / Command Center",
    description: "Internal tools login / OM Performance Marketing Command Center.",
    department: "Agency-wide",
    author: "OM DevTeam",
    url: "https://tools.omdigitalagency.com/login",
    tone: "green",
    icon: <CommandCenterIcon />,
  },
];

const departments = [
  "All departments",
  ...Array.from(new Set(tools.map((tool) => tool.department))),
];

function host(url: string) {
  return new URL(url).host;
}

function ToolMark({ tool }: { tool: Tool }) {
  return (
    <span className={`tool-mark ${tool.tone}`} aria-hidden="true">
      {tool.icon}
    </span>
  );
}

function ToolMeta({ tool }: { tool: Tool }) {
  return (
    <dl className="tool-meta">
      <div>
        <dt>Author</dt>
        <dd>{tool.author}</dd>
      </div>
      <div>
        <dt>Department</dt>
        <dd>{tool.department}</dd>
      </div>
      <div>
        <dt>Host</dt>
        <dd>{host(tool.url)}</dd>
      </div>
    </dl>
  );
}

function ToolCard({ tool, rank, view }: { tool: Tool; rank: number; view: "grid" | "cards" }) {
  return (
    <a
      className={`tool-card tool-card-link tool-rank-${Math.min(rank, 5)} ${
        view === "grid" ? "bento-card" : "uniform-card"
      }`}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="tool-card-top">
        <ToolMark tool={tool} />
        <span className="department-pill">{tool.department}</span>
      </div>
      <div className="tool-card-copy">
        <h2>{tool.name}</h2>
        <p>{tool.description}</p>
      </div>
      <div className="tool-card-bottom">
        <ToolMeta tool={tool} />
        <span className="tool-hover-tip" aria-hidden="true">
          Open tool <ArrowUpRightIcon size={14} />
        </span>
      </div>
    </a>
  );
}

export default function ToolsDashboard() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [department, setDepartment] = useState("All departments");
  const [sort, setSort] = useState<SortMode>("featured");

  const visibleTools = useMemo(
    () =>
      tools
        .filter(
          (tool) =>
            (department === "All departments" || tool.department === department) &&
            `${tool.name} ${tool.description} ${tool.department} ${tool.author}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "department"
              ? a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
              : tools.indexOf(a) - tools.indexOf(b),
        ),
    [department, query, sort],
  );

  return (
    <div className="tools-body">
      <header className="tools-topbar">
        <label className="top-search">
          <SearchIcon size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools…"
            aria-label="Search tools"
          />
        </label>
        <ThemeToggle />
      </header>

      <section className="tools-heading">
        <div>
          <p>OM DEVTEAM</p>
          <h1>Tools</h1>
          <span>Internal apps and utilities created by the team.</span>
        </div>
        <aside>
          <strong>{tools.length}</strong>
          <span>internal tools</span>
          <small>All open in a new tab</small>
        </aside>
      </section>

      <section className="tools-toolbar" aria-label="Tool controls">
        <div className="tool-filter">
          <label>
            Department
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
            >
              <option value="featured">Featured</option>
              <option value="name">Name A–Z</option>
              <option value="department">Department</option>
            </select>
          </label>
        </div>
        <div className="view-switcher" aria-label="View">
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
          >
            <GridViewIcon size={15} />
            <span>Grid</span>
          </button>
          <button
            className={view === "cards" ? "active" : ""}
            onClick={() => setView("cards")}
            aria-pressed={view === "cards"}
          >
            <CardsViewIcon size={15} />
            <span>Cards</span>
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            <ListViewIcon size={15} />
            <span>List</span>
          </button>
        </div>
      </section>

      <div className="tools-results-line">
        <span>
          {visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"}
        </span>
        <small>
          {view === "grid" && sort === "featured" && visibleTools.length > 1
            ? "Largest card is the featured tool"
            : "Every tool opens in a new tab"}
        </small>
      </div>

      {visibleTools.length === 0 ? (
        <section className="tools-empty">
          <WrenchIcon size={24} />
          <h2>No tools found</h2>
          <p>Try another department or search term.</p>
        </section>
      ) : view === "list" ? (
        <section className="tool-list" aria-label="Tool list">
          <header>
            <span>Tool</span>
            <span>Department</span>
            <span>Author</span>
            <span>Host</span>
            <span />
          </header>
          {visibleTools.map((tool) => (
            <article key={tool.url}>
              <div>
                <ToolMark tool={tool} />
                <span>
                  <b>{tool.name}</b>
                  <small>{tool.description}</small>
                </span>
              </div>
              <span>{tool.department}</span>
              <span>{tool.author}</span>
              <span>{host(tool.url)}</span>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${tool.name}`}
              >
                <ArrowUpRightIcon size={15} />
              </a>
            </article>
          ))}
        </section>
      ) : (
        <section
          className={`tools-collection ${view === "grid" ? "bento-grid" : "card-grid"}`}
          // Lets the bento reflow so a filtered result never leaves a hole.
          data-count={Math.min(visibleTools.length, 5)}
        >
          {visibleTools.map((tool, index) => (
            <ToolCard tool={tool} rank={index} view={view} key={tool.url} />
          ))}
        </section>
      )}
    </div>
  );
}
