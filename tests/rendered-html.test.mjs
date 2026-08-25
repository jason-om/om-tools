import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server renders the tools dashboard", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /OM Tools Dashboard/);
  // Every tool must be an external link that opens in a new tab.
  for (const url of [
    "https://convert-n-compress.om-devteam.workers.dev/",
    "https://dental-website-tracker.om-devteam.workers.dev/",
    "https://deploys.omdigitalagency.com/",
    "https://tools.omdigitalagency.com/login",
  ]) {
    assert.ok(html.includes(url), `missing tool link ${url}`);
  }
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
