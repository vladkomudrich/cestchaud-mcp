<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/wordmark-paper.png">
  <img src="assets/wordmark.png" alt="C'est Chaud à Paris" width="300">
</picture>

### Paris, for agents

A public [Model Context Protocol](https://modelcontextprotocol.io) server over the
Paris catalogue behind **[cestchaud.city](https://cestchaud.city)** — events and their
dates, places and how reliably they stay cool, what is free today, and whichever
seasonal moment the city is in.

[![MCP registry](https://img.shields.io/badge/MCP%20registry-city.cestchaud%2Fparis-111111)](https://registry.modelcontextprotocol.io)
[![No key](https://img.shields.io/badge/auth-none-2f6f4e)](https://cestchaud.city/for-agents)
[![Read only](https://img.shields.io/badge/writes-none-2f6f4e)](#tools)
[![License](https://img.shields.io/badge/license-MIT-111111)](LICENSE)

```
https://cestchaud.city/mcp
```

**Read-only. No key. No sign-up.**

[Documentation](https://cestchaud.city/for-agents) ·
[Tools](#tools) ·
[REST twin](#rest-twin) ·
[What the data asks of you](#two-things-the-data-asks-of-you) ·
[Licence](#data-and-licence)

</div>

---

## Install

In Claude Code, one line:

```
/plugin install cestchaud-paris --marketplace vladkomudrich/cestchaud-mcp
```

That installs both halves: the MCP server above, and a skill that teaches an
agent to use it well — which tool answers which question, and the three
obligations the data carries. Requires Claude Code 2.1.275 or later.

Everywhere else, add the endpoint and let your assistant read `tools/list`:

### By hand

**Any client with a JSON config** — `.mcp.json`, `claude_desktop_config.json`
or your client's equivalent:

```json
{
  "mcpServers": {
    "cestchaud-paris": {
      "type": "http",
      "url": "https://cestchaud.city/mcp"
    }
  }
}
```

> **`type` is not optional.** An entry with a `url` and no `type` is read as a
> stdio server, fails for having no `command`, and is dropped — in Claude Code,
> silently. Earlier versions of this README omitted it. If the server never
> appears, this is why.

**A client that only speaks stdio** — [`mcp-remote`](https://www.npmjs.com/package/mcp-remote)
bridges it. We publish no npm package of our own, because it would contain
nothing but this:

```json
{
  "mcpServers": {
    "cestchaud-paris": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://cestchaud.city/mcp"]
    }
  }
}
```

**Check it answers** — a `GET` returns 405 because the protocol speaks POST
(a browser is redirected to the documentation instead):

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -H 'Accept: application/json' https://cestchaud.city/mcp
```

### Or just describe it

Paste this to your assistant and let it do the rest:

```
Add this MCP server to your tools: https://cestchaud.city/mcp

It is a public, read-only server with no key and no authentication, over
streamable HTTP. It gives you the Paris catalogue behind C'est Chaud à Paris:
events and their dates, places, free and discounted things, and whichever
seasonal moment is running.

Then:
1. Call tools/list and summarise what it offers.
2. When I ask you about Paris — what's on tonight, where to work somewhere
   cool, what to do this weekend — use it.

Two things its data asks of you:
— if a record has booking.disclosure.required = true, show the text in
  booking.disclosure.text wherever you show the link;
— credit the sources listed in the attribution field.
```

---

## Tools

<!-- count:start -->
The server exposes **7 tools**:
<!-- count:end -->

<!-- tools:start -->
| Tool | What it answers | Arguments |
| --- | --- | --- |
| `search_events` | Finds dated events in Paris by time window, subject, price, free text or distance from a point. Returns each event with its page URL and, where we hold one, a booking link. Relaxes the window or radius when fewer than three events match, and says so in `relaxed`. | `when, date_from, date_to, interests, free, price_max, query, near, limit, offset, locale` |
| `get_event` | Returns one event by slug: its dates, venue, subject tags, our own description where we have written one, and a booking link where we hold an offer. Use it after search_events, or when you already have an event URL. | `slug, locale` |
| `search_places` | Finds cafés, parks, museums, pools, libraries and other places in Paris by kind, amenity, whether they are open now, or distance from a point. Each place carries how reliably it stays cool, what it suits, and its page URL. | `query, category, good_for, open_now, free_entry, has_air_conditioning, wifi, power_outlets, near, limit, offset, locale` |
| `get_place` | Returns one place by slug with its address, coordinates, amenities, opening hours and how reliably it stays cool, plus the nearest other places. Use it after search_places, or when you already have a place URL. | `slug, locale` |
| `search_all` | Searches events, activities, places and guides at once by name or text, for when the kind of thing is not known in advance. Each hit says which kind it is and carries the slug to pass to get_event or get_place. | `query, type, limit, offset` |
| `moment_now` | Returns the seasonal or cultural moment currently running in Paris — Fashion Week, Christmas, a heatwave — with its hub URL and dates, or the city's seasonal mode when none is running. | `locale` |
| `esim_plans` | Returns prepaid eSIM data plans that work in France, for a given amount of data and trip length. Each plan carries its price with the date that price was checked, and a booking link. Relevant when a reader is travelling to Paris from outside the EU and needs mobile data on arrival. | `gb, unlimited, days, locale` |
<!-- tools:end -->

Every tool is read-only. Nothing here writes, books, pays or changes anything,
and no write tool can exist on this surface — the server's capability type has
no write option and `readOnlyHint` is hardcoded.

---

## REST twin

The same capabilities over plain POST, for an app that does not speak MCP. The
same code underneath: same limits, same errors, same answers.

<!-- rest:start -->
| Capability | Endpoint |
| --- | --- |
| `search_events` | `POST /api/agent/v1/search-events` |
| `get_event` | `POST /api/agent/v1/get-event` |
| `search_places` | `POST /api/agent/v1/search-places` |
| `get_place` | `POST /api/agent/v1/get-place` |
| `search_all` | `POST /api/agent/v1/search-all` |
| `moment_now` | `POST /api/agent/v1/moment-now` |
| `esim_plans` | `POST /api/agent/v1/esim-plans` |
<!-- rest:end -->

`GET https://cestchaud.city/api/agent/v1` returns the machine-readable
catalogue — every capability with its input and output JSON Schema, a valid
example and its rate limit. That is enough to generate a typed client:

```
Fetch https://cestchaud.city/api/agent/v1 and write me a small typed client
for this API. Generate the types from the schemas rather than writing them by
hand, and respect the published limits.
```

Send an `X-Agent-Client` header naming your integration. It is how we can see
it is being used at all, and it is the only thing recorded about you.

---

## Two things the data asks of you

**1. Show the disclosure with the link.** Where we hold a ticket, a record
carries a `booking` block:

```json
"booking": {
  "mode": "affiliate",
  "url": "https://cestchaud.city/go/<id>?s=mcp&l=fr",
  "provider": "Fnac Spectacles",
  "price": { "from": 40, "currency": "EUR", "as_of": "2026-10-25T16:23:00.000Z" },
  "disclosure": { "required": true, "text": "…", "must_be_shown_with_link": true },
  "link_rel": "sponsored nofollow noopener"
}
```

When `disclosure.required` is `true` the link earns us a commission, and
`disclosure.text` must be shown wherever you show the link. The price is the
same for the person booking.

It is a field rather than a footnote because you render your interface, not
ours — no caption of ours reaches your reader. The `disclosure` key is always
present, even when there is nothing to say: `required: false` means a direct
link we earn nothing from, which is not the same as a field somebody forgot.

Ranking is never sold. A partner link does not buy its position.

**2. Credit the sources.** Every response carries an `attribution` block. The
ODbL datasets underneath require credit wherever the data is used — including
inside an answer you write.

### Smaller rules worth knowing

- **Names are never translated.** Event titles and place names come in their
  own language. A translated "Le Trabendo" is an address nobody can ask for at
  a métro station. The `locale` argument changes our own prose only.
- **An absent price does not mean free.** A price is sent only when we verified
  it within the last 24 hours; otherwise the field is `null` and the link
  stays.
- **`relaxed` is the honest part of a search.** When fewer than three events
  match, the window or radius widens and each step is reported. If it is
  non-empty, the answer is no longer exactly what was asked for — say so.

---

## The same catalogue, read by a person

Every record a tool returns carries a `url`, and that page holds what does not
fit in a payload: the map, the opening hours, the photographs, the sources. If
you are deciding whether this data is worth wiring up, these are the pages it
is made of:

| | |
| --- | --- |
| [What's on this weekend](https://cestchaud.city/events/ce-week-end) | The dated agenda, rolling — the same rows `search_events` returns |
| [Things to do in Paris](https://cestchaud.city/activites) | The evergreen half: activities that are not tied to a date |
| [Places](https://cestchaud.city/places) | Cafés, parks, pools, libraries, with amenities and how cool they stay |
| [Guides](https://cestchaud.city/guides) | Our own editorial writing, where a list is not the answer |
| [For agents](https://cestchaud.city/for-agents) | The full technical documentation this README summarises |
| [Affiliate policy](https://cestchaud.city/legal/affiliate) | What a partner link is, and what it does not buy |

The site is in French, English and Spanish; the `locale` argument picks which
prose a tool returns.

---

## Data and licence

Places and events come from Ville de Paris open data, including the
"Que Faire à Paris" agenda (**ODbL**), OpenStreetMap (**ODbL**), and our own
editorial work. ODbL requires attribution wherever the data is used.

The code and documentation in *this repository* are MIT (see `LICENSE`). That
licence covers the examples, not the catalogue the server returns.

The brand mark in `assets/` and the icon in `.claude-plugin/` are ours and are
not covered by that licence.

## Contents

| | |
| --- | --- |
| `skills/cestchaud-paris/` | An agent skill: how to use these tools well |
| `.claude-plugin/` | Marketplace and plugin manifests — what `/plugin install` reads |
| `.mcp.json` | The server entry, in the shape a client config wants |
| `examples/` | curl calls you can paste |
| `server.json` | The MCP registry manifest |
| `scripts/generate.mjs` | Regenerates the tables above from the live catalogue |

Every table and count in this README is stamped from
`GET https://cestchaud.city/api/agent/v1` by that script, which a weekly
workflow re-runs. Nothing here states a fact about the server by hand — the
one sentence that did drifted for twelve days when a seventh tool shipped.
