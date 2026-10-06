---
name: chrome-agent
description: >-
  Drive a real Chrome browser via chrome-agent CLI (Chrome DevTools Protocol).
  Use whenever the agent or user needs a browser: open pages, click, type, screenshot,
  read DOM, watch network/console, debug UI, smoke-test localhost, or inspect web apps.
  Prefer this over Playwright MCP, browser_* tools, or screenshot-only workflows.
  Also use when the user says /chrome-agent, "use chrome", "open in browser", or
  "test in Chrome".
---

# chrome-agent (DSKT)

Primary browser tool for this repo. Full CDP access through the `chrome-agent` CLI — not Playwright MCP.

Upstream guide (authoritative mechanics):

```bash
chrome-agent guide --path   # then Read that file
# or: chrome-agent guide
```

Setup: [docs/tools/chrome-agent/](../../../docs/tools/chrome-agent/README.md).

## Prefer this over Playwright

If Playwright / `browser_*` MCP tools are available, **do not use them** for this project unless `chrome-agent` is missing from PATH or the user explicitly asks for Playwright. chrome-agent shares a real Chrome window, supports human+agent collaboration, and exposes the full CDP surface.

## Lavish exclusion

Normal Lavish review sessions are not chrome-agent tasks. Lavish opens and manages its own review tab, so do not drive that tab with chrome-agent. For sanctioned Lavish testing or debugging, start Lavish with `--no-open`, then navigate chrome-agent to the returned URL. Never run two competing control loops on one review tab.

## Trigger / first steps

1. Ensure CLI exists: `chrome-agent --version` (install: `uv tool install chrome-agent`).
2. From the **DSKT-setup root** (so the instance is named `DSKT-setup-NN`):

```bash
chrome-agent status
# if none running:
chrome-agent launch
```

3. Use the printed instance name (e.g. `DSKT-setup-01`). If only one instance is up, the name may be omitted.

## Sense ⇄ act loop

- **Sense (default):** DOM / Accessibility / Runtime / Network / screenshot as last resort for content.
- **Act:** `Page.navigate`, trusted `Input.*` events, `Runtime.evaluate`.
- After every act, **sense again** — do not trust the act return alone.
- After navigate, wait for readiness (`document.readyState === "complete"` or `attach +Page.loadEventFired`), not a fixed sleep.

### Common one-shots

```bash
chrome-agent DSKT-setup-01 status
chrome-agent DSKT-setup-01 Page.navigate '{"url":"http://localhost:5173"}'
chrome-agent DSKT-setup-01 Runtime.evaluate '{"expression":"document.body.innerText","returnByValue":true}'
chrome-agent DSKT-setup-01 Page.captureScreenshot '{"format":"png"}'
chrome-agent DSKT-setup-01 help Page
```

Locate → trusted click:

```bash
chrome-agent DSKT-setup-01 Runtime.evaluate '{"expression":"(()=>{const r=document.querySelector(\"SELECTOR\").getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()","returnByValue":true}'
chrome-agent DSKT-setup-01 Input.dispatchMouseEvent '{"type":"mousePressed","x":X,"y":Y,"button":"left","clickCount":1}'
chrome-agent DSKT-setup-01 Input.dispatchMouseEvent '{"type":"mouseReleased","x":X,"y":Y,"button":"left","clickCount":1}'
```

### Observe events

```bash
chrome-agent attach DSKT-setup-01 +Page.loadEventFired +Network.requestWillBeSent > /tmp/dskt-chrome-events.jsonl &
```

In Cursor, prefer Shell with `block_until_ms: 0` + `notify_on_output` / AwaitShell rather than blind sleeps.

## DSKT conventions

| Concern | Practice |
|---------|----------|
| Working directory | Launch / run `chrome-agent` from the DSKT workspace root |
| Local applications | Start the frontend or backend from its independent repository; use its documented local URL |
| Cleanup | `chrome-agent stop DSKT-setup-01` or `chrome-agent cleanup` when done |
| Secrets | Never dump cookies/tokens into chat or commit logs |

## When the user types `/chrome-agent`

Treat that as an explicit request to use this skill now: check status, launch if needed, then perform the browser task they describe (or ask what URL/flow to exercise).
