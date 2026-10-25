# Paste-and-run examples

Both transports, same answers. `$BASE` is `https://cestchaud.city`.

## MCP (JSON-RPC over streamable HTTP)

```bash
BASE=https://cestchaud.city

# Handshake
curl -s -H 'Content-Type: application/json' \
     -H 'Accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}' \
     "$BASE/mcp"

# What is on offer
curl -s -H 'Content-Type: application/json' \
     -H 'Accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' "$BASE/mcp"

# Concerts this weekend
curl -s -H 'Content-Type: application/json' \
     -H 'Accept: application/json, text/event-stream' \
     -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_events","arguments":{"when":"this_weekend","interests":["concerts"],"limit":5}}}' \
     "$BASE/mcp"
```

Responses come back as `text/event-stream`; strip the `data: ` prefix to get
the JSON.

## REST twin

```bash
BASE=https://cestchaud.city

# The catalogue: every capability, its JSON Schema in and out, its limits
curl -s "$BASE/api/agent/v1" | jq

# Somewhere to work, with air conditioning
curl -s -X POST -H 'Content-Type: application/json' \
     -H 'X-Agent-Client: my-app' \
     -d '{"good_for":"work","limit":5}' \
     "$BASE/api/agent/v1/search-places" | jq '.items[] | {name, url, amenities}'

# One event, with its booking block
curl -s -X POST -H 'Content-Type: application/json' \
     -d '{"when":"this_week","limit":1}' \
     "$BASE/api/agent/v1/search-events" \
  | jq '.items[0] | {title, url, booking}'
```

## Errors

Every error is a JSON body with a machine-readable `error` and a message that
says what to do differently.

| | |
| --- | --- |
| `invalid_body` | An argument was not understood — `issues` names which |
| `unknown_capability` | No capability by that name; `GET /api/agent/v1` lists them |
| `rate_limited` | Too many requests |
| `not_found` | Nothing under that identifier |
| `read_failed` | The catalogue could not be read; retry |
