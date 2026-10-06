# chrome-agent — browser CLI for agents

[chrome-agent](https://github.com/captivus/chrome-agent) drives a real Chrome via the Chrome DevTools Protocol. In **DSKT** it is the **preferred** browser tool (over Playwright MCP).

## Install (once per machine)

Requires Google Chrome or Chromium on the system.

```bash
uv tool install chrome-agent
chrome-agent --version
```

## Agent manual

The project skill is `.agents/skills/chrome-agent/SKILL.md`. Trigger behavior and tool boundaries are documented in [design.md](design.md).

Read the upstream manual matching the installed version:

```bash
chrome-agent guide --path
```

## Day-to-day

```bash
# from DSKT-setup root (instance names like DSKT-setup-01)
chrome-agent launch
chrome-agent status
chrome-agent DSKT-setup-01 Page.navigate '{"url":"http://localhost:5173"}'
chrome-agent stop DSKT-setup-01
```

Local applications will be started from their independent repositories after they are scaffolded. Default development URLs should be documented there; the current planning defaults are frontend `http://localhost:5173` and API `http://localhost:3001`.

Do not use chrome-agent until an application is running.

## Files in this folder

| File | Contents |
|------|----------|
| `README.md` | Installation and day-to-day commands |
| [design.md](design.md) | Trigger contract, Playwright decision, and Lavish boundary |
