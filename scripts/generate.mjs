#!/usr/bin/env node
// Regenerates README.md and the skill's tool table from the LIVE catalogue.
//
// The point of generating rather than writing: this repo documents a server it
// does not contain. Anything typed by hand here is a second source of truth
// that drifts the first time a tool changes, and a developer reading it has no
// way to tell a stale table from a current one.
//
//   node scripts/generate.mjs
import { writeFileSync, readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "https://cestchaud.city";
const catalogue = await (await fetch(`${BASE}/api/agent/v1`)).json();

const toolTable = [
  "| Tool | What it answers | Arguments |",
  "| --- | --- | --- |",
  ...catalogue.capabilities.map((c) => {
    const args = Object.keys(c.input_schema?.properties ?? {}).join(", ") || "—";
    return `| \`${c.name}\` | ${c.description} | \`${args}\` |`;
  }),
].join("\n");

const restTable = [
  "| Capability | Endpoint |",
  "| --- | --- |",
  ...catalogue.capabilities.map((c) => `| \`${c.name}\` | \`POST ${c.path}\` |`),
].join("\n");

const stamp = (file, marks) => {
  let text = readFileSync(file, "utf8");
  for (const [name, value] of Object.entries(marks)) {
    const open = `<!-- ${name}:start -->`;
    const close = `<!-- ${name}:end -->`;
    const from = text.indexOf(open);
    const to = text.indexOf(close);
    if (from === -1 || to === -1) throw new Error(`${file}: missing ${name} markers`);
    text = `${text.slice(0, from + open.length)}\n${value}\n${text.slice(to)}`;
  }
  writeFileSync(file, text);
  console.log(`wrote ${file}`);
};

stamp("README.md", { tools: toolTable, rest: restTable });
stamp("skills/cestchaud-paris/SKILL.md", { tools: toolTable });
writeFileSync("server.json", `${JSON.stringify(await (await fetch(`${BASE}/mcp/server.json`)).json(), null, 2)}\n`);
console.log("wrote server.json");
