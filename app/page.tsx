import {
  CommandCenterIcon,
  ConvertCompressIcon,
  DentalTrackerIcon,
  DeploysIcon,
} from "./icons";

type Tool = {
  name: string;
  description: string;
  url: string;
  tone: "coral" | "blue" | "purple" | "green";
  icon: React.ReactNode;
};

const tools: Tool[] = [
  {
    name: "Convert & Compress",
    description: "File conversion and compression utility.",
    url: "https://convert-n-compress.om-devteam.workers.dev/",
    tone: "coral",
    icon: <ConvertCompressIcon />,
  },
  {
    name: "Dental Website Tracker",
    description: "Track and monitor dental practice websites.",
    url: "https://dental-website-tracker.om-devteam.workers.dev/",
    tone: "blue",
    icon: <DentalTrackerIcon />,
  },
  {
    name: "Deploys",
    description: "Deployment dashboard and status overview.",
    url: "https://deploys.omdigitalagency.com/",
    tone: "purple",
    icon: <DeploysIcon />,
  },
  {
    name: "OM Tools / Command Center",
    description: "Internal tools login / OM Performance Marketing Command Center.",
    url: "https://tools.omdigitalagency.com/login",
    tone: "green",
    icon: <CommandCenterIcon />,
  },
];

export default function ToolsDashboard() {
  return (
    <div className="page">
      <header className="page-head">
        <p>OM DEVTEAM</p>
        <h1>OM Tools Dashboard</h1>
        <span>Internal apps and utilities built by the team.</span>
      </header>

      <main>
        <ul className="tool-grid">
          {tools.map((tool) => (
            <li className="tool-card" key={tool.url}>
              <span className={`tool-mark ${tool.tone}`}>{tool.icon}</span>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <a
                className="tool-open"
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Tool <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
