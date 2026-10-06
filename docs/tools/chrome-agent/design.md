# chrome-agent integration design

## Decision

`chrome-agent` is the default browser adapter for agent-driven browser, page, UI, localhost smoke, and web debugging work in **DSKT**.

It drives a real Chrome instance over the Chrome DevTools Protocol and allows the human and agent to share the same browser state.

## Trigger contract

| Trigger | Behavior |
|---------|----------|
| Explicit `/chrome-agent` | Read `.agents/skills/chrome-agent/SKILL.md` and use the CLI |
| Browser-related task | `.cursor/rules/chrome-agent.mdc` automatically directs Cursor to the skill |
| CLI execution | Launch from the DSKT-setup root so instances are named `DSKT-setup-NN` |

The skill and rule remain in harness-required locations. This document records why they exist; it does not duplicate their instructions.

## Why not Playwright by default

| Concern | chrome-agent | Playwright MCP |
|---------|--------------|----------------|
| Protocol access | Full CDP | Curated browser tools |
| Browser | Real Chrome shared with the human | Separate automation browser |
| DSKT default | Yes | Fallback only |

Playwright remains available globally. Agents fall back only if `chrome-agent` is unavailable and the user declines installation, or when the user explicitly requests Playwright.

## Lavish seam

Normal Lavish review sessions are excluded. Lavish opens and manages its own review tab, and two control loops must never drive the same tab.

For sanctioned Lavish testing or debugging:

1. Start Lavish with `--no-open`.
2. Navigate chrome-agent to the returned URL.
3. Keep Lavish's normal browser control out of that tab.

## Repository surfaces

| Surface | Path |
|---------|------|
| Human setup and CLI use | `docs/tools/chrome-agent/README.md` |
| Agent skill | `.agents/skills/chrome-agent/SKILL.md` |
| Automatic Cursor trigger | `.cursor/rules/chrome-agent.mdc` |
