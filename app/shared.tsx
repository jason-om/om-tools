"use client";

/** Source-app marks and the representative client list, shared by the app shell
 *  and the Overview page so neither owns a private copy. */

export type ProviderName = "asana" | "slack" | "google";

export function Provider({ type }: { type: ProviderName }) {
  return <span className={`provider-mark ${type}`} aria-label={type}>{type === "asana" ? "●●●" : type === "slack" ? "✣" : "31"}</span>;
}

export const projects = [
  ["W","Westwyn","2 overdue · Landing page due today","red"],
  ["S","Sonterra","Feedback received · 1 task due tomorrow","orange"],
  ["TP","The Practice","Client review today · No overdue work","green"],
  ["AD","Aurora Dental","3 tasks due this week","purple"],
  ["SG","Smile Group","No overdue work · On track","blue"],
  ["RD","Redbud Dental","1 overdue · Report due tomorrow","red"],
  ["PD","Peak Dental","Kickoff in 3 days · 2 tasks","green"],
];
