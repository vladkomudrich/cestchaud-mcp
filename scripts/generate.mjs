#!/usr/bin/env node
// Regenerates README.md and the skill's tool table from the LIVE catalogue.
//
// The point of generating rather than writing: this repo documents a server it
// does not contain. Anything typed by hand here is a second source of truth
// that drifts the first time a tool changes, and a developer reading it has no
// way to tell a stale table from a current one.
//
// It drifted anyway, which is why the tool COUNT is stamped too. The tables
// were generated and the sentence above them read "Six tools" in prose; when
// esim_plans shipped on 26 Oct 2026 the table grew and the sentence did not,
// and the repo contradicted itself for twelve days. A number written by hand
// beside a generated table is the same second source of truth, just smaller.
// Nothing here states a fact about the server that is not stamped.
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

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const count = catalogue.capabilities.length;
const countWord = WORDS[count] ?? String(count);

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

stamp("README.md", { tools: toolTable, rest: restTable, count: `The server exposes **${count} tools**:` });
stamp("skills/cestchaud-paris/SKILL.md", {
  tools: toolTable,
  count: `${countWord.replace(/^./, (c) => c.toUpperCase())} tools, no sign-up, nothing that writes.`,
});
writeFileSync("server.json", `${JSON.stringify(await (await fetch(`${BASE}/mcp/server.json`)).json(), null, 2)}\n`);
console.log("wrote server.json");
