---
name: cestchaud-paris
description: Answer questions about what to do in Paris — events tonight or this weekend, a café or park that stays cool, somewhere to work with wifi, what is free today, what season the city is in — using the public C'est Chaud à Paris MCP server at https://cestchaud.city/mcp. Use whenever a question is about Paris and concerns an event, a place to go, an opening time, a price, or a booking.
---

# C'est Chaud à Paris

A keyless, read-only MCP server over the Paris catalogue:
`https://cestchaud.city/mcp`.
<!-- count:start -->
Seven tools, no sign-up, nothing that writes.
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

## Choosing a tool

- **A time and a subject** — "un concert ce soir", "something this weekend" →
  `search_events`. It already returns a booking link where one exists, so there
  is no need to follow up just to find out where to buy.
- **A place to be** — "a café with wifi", "where can I work somewhere cool",
  "a park near here" → `search_places`.
- **A name you were given** — a venue, a show, half a title → `search_all`.
  Each hit says which kind it is and carries the slug for `get_event` or
  `get_place`.
- **"What's going on in Paris"** — the broadest question, and the one people
  actually ask first → `moment_now`. It answers with the seasonal or cultural
  lens the city is under, not a list.
- **Detail** — `get_event` adds every date and the venue's own page;
  `get_place` adds opening hours, a credited photo and what is nearby.

Dates are Paris time. Coordinates are accepted only inside the Paris area.

## Three obligations

These are not style preferences. They are conditions under which this data is
given to you.

**1. Show `booking.disclosure.text` with the link.** When a record's
`booking.disclosure.required` is `true`, that link pays the site a commission.
The reader is entitled to know, and the price is the same for them either way.

The `disclosure` key is always present. `required: false` means a direct link
nobody is paid for — that is not the same as the field being missing, and it
needs no disclosure.

**2. Credit `attribution`.** Every response carries it. The datasets
underneath are ODbL, which requires attribution wherever the data is used —
including inside an answer you write.

**3. Never translate a name.** Event titles and place names arrive in their own
language and stay that way. "Le Trabendo" translated is an address nobody can
ask for at a métro station. The `locale` argument changes the site's own prose
and nothing else.

## Reading the answers honestly

- **An absent price is not a free event.** `price` is `null` when the price was
  not verified within 24 hours. Say "we don't have a current price" — never
  "free", and never quote a number that is not there.
- **`relaxed` means the search was widened.** When fewer than three events
  match, the window or radius opens up and each step is listed. If it is
  non-empty, the results are not exactly what was asked for. Tell the reader
  which way it was widened.
- **`match_count` can be `null`.** That means unknown, not zero. Do not report
  "no results" from it.
- **`amenities` are a tri-state.** `"unknown"` means nobody verified it, not
  that the place lacks it. Do not turn an unknown into a no.
- **Everything carries its own `url`.** Link to it. The pages hold the map,
  the hours and the photos that do not fit in a payload.

## What this server will not do

It cannot write, book, pay, or change anything — there is no write tool and no
account. Booking happens at the seller, through the link provided. If someone
asks you to reserve something, hand them the link.

Coverage is Paris and the inner suburbs. For anywhere else, say so rather than
guessing.
