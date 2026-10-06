# Lavish AXI integration research

Research snapshot: `kunchenguid/lavish-axi` commit [`5b871af`](https://github.com/kunchenguid/lavish-axi/tree/5b871af347444feda1d3002952ec5fc179248629), package version `0.1.64`. Sources are limited to repository documentation, source, and package metadata.

## Conclusions

Lavish is a local HTML review server plus a CLI-mediated feedback queue. **Send to Agent does not address or reactivate an IDE chat session.** It queues feedback until an agent process is already waiting in `lavish-axi poll <file>`. Therefore the safe DSKT integration is a narrowly triggered project skill under `.agents/skills/`, not Lavish's global Cursor plugin or global session hooks.

Lavish owns the review server and normally asks the OS to open its URL in the default browser. It does not launch or own a dedicated Chrome process. Let that human review flow stand alone; use `chrome-agent` only for automated smoke/debug work, with `--no-open` and an explicit navigation to the returned URL.

> **Project decision (supersedes trigger breadth only):** After reviewing the trade-offs documented here, the DSKT team explicitly chose **Lavish as the default alignment surface**, with the narrow exemptions defined in the approved workflow spec. That spec supersedes the **trigger breadth** recommendation in [§5](#5-recommended-dskt-architecture) below; the technical constraints in this research (poll attachment, Send to Agent routing, browser ownership, security boundaries) remain authoritative.
>
> See [Lavish alignment workflow design](design.md).

## 1. Installation, invocation, files, and hooks

The package requires Node 22+, exposes one `lavish-axi` binary, and publishes `dist/`, `plugin.json`, and `skills/lavish` ([package.json](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/package.json)).

Upstream offers four distinct models:

1. **Project skill (recommended upstream):** `npx skills add kunchenguid/lavish-axi --skill lavish`. This installs only the public `lavish` skill; it does not install the CLI. The skill invokes `npx -y lavish-axi`, which downloads/runs the CLI on demand. The destination is chosen by the skills installer/harness; upstream explicitly gives `.claude/skills/` only as an example, so that command alone does not promise DSKT's required layout ([README, Quick Start](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/README.md#quick-start), [published skill](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/skills/lavish/SKILL.md)).
2. **Zero setup:** call `npx -y lavish-axi ...` directly. This creates no repository integration files, but npm uses its normal cache and Lavish creates runtime state under `~/.lavish-axi/` unless `LAVISH_AXI_STATE_DIR` is set.
3. **Global CLI plus hooks:** `npm install -g lavish-axi && lavish-axi setup hooks`. Lavish installs/merges user-level Claude Code `~/.claude/settings.json`, Codex `~/.codex/hooks.json`, Codex `~/.codex/config.toml`, OpenCode `~/.config/opencode/plugins/axi-lavish-axi.js`, and GitHub Copilot CLI `~/.copilot/hooks/lavish-axi.json`. Hooks run the no-argument CLI at `SessionStart`, with a 10-second timeout, and inject its stdout as ambient context. Lavish's command does not expose the SDK's project-scope option; it passes a home directory explicitly ([Lavish setup source](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/cli.js#L1121-L1155), [SDK hook source](https://github.com/kunchenguid/axi/blob/7b94e679675b5b9d42ea9f0715a21ffd58cb8d51/packages/axi-sdk-js/src/hooks.ts#L692-L777)).
4. **Global CLI plus Agent Plugin:** `lavish-axi setup plugin` registers the installed package root. For Cursor it creates/repairs a user-level link at `~/.cursor/plugins/local/lavish-axi`; VS Code gets a `chat.pluginLocations` entry and Copilot CLI runs `copilot plugin install`. The plugin contains the same skill and declares no MCP server, so plugin and project skill are alternatives, not layers ([README, Agent Plugin](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/README.md#agent-plugin), [plugin registration source](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/plugin.js), [plugin manifest](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/plugin.json)).

At runtime the agent writes an HTML artifact (upstream guidance defaults to `.lavish/`), runs `lavish-axi <file>`, then keeps `lavish-axi poll <file>` attached. Lavish starts a detached Node server, stores durable session state and logs in its state directory, and keys sessions by a SHA-256 prefix of the canonical file path ([CLI server spawn](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/cli.js#L1688-L1727), [session store](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/session-store.js#L668-L693)).

## 2. Feedback and Send to Agent

Annotations, selected text, composer messages, optional image attachments, selected layout fixes, and whiteboard summaries first accumulate in browser/session state. **Send to Agent** POSTs the batch to `/api/:key/prompts`; **Send & End** performs the same enqueue plus a user-ended session transition atomically. A successful POST persists the prompts and emits an in-process feedback event. An already ended session rejects late feedback rather than pretending it will be read ([server prompt route](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/server.js#L722-L780)).

The button does not call Cursor, Claude, Gemini, a terminal, or an OS automation API. Delivery occurs only when `lavish-axi poll <file>` is connected or reconnects. The poll drains the durable batch and returns prompts, DOM snapshot, and any fatal artifact failures to the CLI. `--agent-reply "..."` posts the agent's response back into the browser conversation before polling again ([CLI poll output](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/cli.js#L316-L445), [README, feedback and presence](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/README.md#how-it-works)).

Presence (`waiting`, `listening`, `working`) is UI state delivered to browser tabs over SSE. It is not proof that a harness can resume an idle chat. Feedback remains queued after an interrupted poll, but a completed poll consumes the batch, so its complete output must be retained.

## 3. Harness support and session routing

- **Cursor:** supported for skill discovery through Agent Skills and through the optional user-level Agent Plugin. There is no Cursor `SessionStart` hook and no Cursor chat/session API in Lavish.
- **Claude Code:** supported through Agent Skills/slash invocation and a native `SessionStart` hook. The hook supplies ambient context only when a session starts; it does not route later feedback to a particular Claude thread.
- **Antigravity/Gemini:** no native adapter, hook, plugin registration, or Gemini session identifier appears in the current README, manifest, or integration source. It may run the generic CLI if the harness permits shell commands and keeps the poll attached, but that is generic CLI compatibility—not declared native support.

Lavish has **no native active/current-session routing for any of these harnesses**. Its identity is the canonical artifact path, not an IDE conversation ID. The only reliable wake path is a foreground poll, or a harness-native tracked background job whose completion is guaranteed to resume/notify the same turn. Lavish explicitly rejects detached `nohup`, `&`, `disown`, or terminal fire-and-forget as a reliable wake mechanism ([poll wake rules](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/cli.js#L51-L59)).

## 4. Feedback protocol and boundaries

The path is:

`sandboxed artifact iframe` → `postMessage` → `Lavish browser chrome` → same-origin JSON `POST /api/:key/prompts` → durable `state.json` queue → long-polling HTTP `GET /api/poll?file=<canonical-path>` → final TOON on CLI stdout → harness tool result.

Related channels are SSE `/events/:key` from server to browser for reload/chat/presence, stderr banners and optional interactive heartbeats while the CLI waits, and local sidecar files for whiteboard scenes/previews and attachments. Feedback is **not** delivered by shell injection, terminal keystrokes, a Cursor hook, MCP, or a watched repository file. Session-start hooks are discovery/context only.

Security/process boundaries:

- The agent-created HTML runs in an iframe without `allow-same-origin`; communication with trusted chrome is `postMessage`. Artifact responses retain a sandbox CSP even if opened as top-level documents ([server sandbox design](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/server.js#L104-L110)).
- Prompt submission is same-origin checked and the review chrome cannot be framed. The session key is explicitly not treated as a secret ([server request guards](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/server.js#L410-L500)).
- The server/poll control plane has no user authentication. Loopback/allowed-host checks are the principal boundary. Current automatic Tailscale exposure and any explicit non-loopback bind make the unauthenticated local-file-serving server reachable by trusted-tailnet/network peers; do not expose it broadly ([README, network binding](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/README.md#how-it-works)).
- State is machine-global by default, and one server lists sessions from all projects. Local processes with access to the endpoint or state directory are outside Lavish's isolation guarantees.
- `share` is a separate outbound boundary: it uploads an inlined artifact to third-party `ht-ml.app`, public by default. It is not part of the local feedback loop.

## 5. Recommended DSKT architecture

This section preserves the original narrow-trigger recommendation from primary-source research. **Trigger breadth** is superseded by the [approved workflow spec](design.md); technical and architectural constraints here remain authoritative.

1. Add one pinned, repo-owned skill at `.agents/skills/lavish/SKILL.md`; do not create `.claude/skills`, `.cursor/skills`, or `agent/skills`. Keep the body thin and require `npx -y lavish-axi --help`, `design`, and matching `playbook` calls so runtime guidance remains authoritative.
2. Narrow its trigger to: explicit Lavish requests, or an explicit need for a **browser-based, iterative annotation/review loop over HTML**. Do not retain upstream's broad “plan, comparison, diagram, table, report” auto-trigger unchanged.
3. Add a small `.cursor/rules/lavish.mdc` automatic routing rule that loads that skill only under the narrow condition above. It should also require a foreground poll and prohibit claims that Send to Agent will wake an idle harness.
4. Do not run `setup plugin`: its user-level Cursor link duplicates the committed project skill and violates DSKT's project-local-only convention. Do not run `setup hooks` as part of repository setup: it mutates several user-global harness configs, does not support Cursor, and is unnecessary for the narrow workflow.
5. Preserve tool ownership:
   - Use the existing Excalidraw skill for standalone diagrams and diagram deliverables.
   - Use Cursor Canvas for standalone analytical/data-heavy artifacts.
   - Use Lavish only when the deliverable is an HTML review surface and the annotation→agent revision loop is the point. Enable Lavish's Mermaid→Excalidraw whiteboard only when the user explicitly wants editable diagram feedback inside that review.

This creates an automatic trigger without making Lavish the default renderer.

## 6. Browser ownership

`lavish-axi <file>` starts/reuses Lavish's detached server and calls the `open` package on the session URL ([open command](https://github.com/kunchenguid/lavish-axi/blob/5b871af347444feda1d3002952ec5fc179248629/src/cli.js#L262-L313)). Thus Lavish owns the server and review protocol, while the OS/default browser owns the browser process.

For normal human review, do not interpose `chrome-agent`. For automated testing or debugging required by DSKT, run Lavish with `--no-open`, then use `chrome-agent` to navigate and inspect the returned URL. Never run two competing browser-control loops against the same review tab.

## 7. Risks and non-promises

- Cannot promise Send to Agent will resume an idle Cursor, Claude, Antigravity, or Gemini session.
- Cannot promise a background poll will wake the originating turn unless that harness documents and verifies completion routing.
- Cannot claim native Antigravity/Gemini support from current authoritative sources.
- `npx -y` can fail opaquely in restricted subprocess sandboxes; the published skill documents direct installed-copy fallbacks.
- Node 22+ is required. On-demand execution also introduces npm/network/version drift unless a version is pinned.
- The default server/state are shared machine-wide across projects; canonical paths separate sessions, not security principals.
- Non-loopback/Tailscale reachability exposes an unauthenticated local service capable of reading and serving selected local files.
- Agent-authored active HTML is sandboxed but remains untrusted content; links/popups and remote resources can still cross browser/network boundaries.
- Hook/plugin setup mutates user-global configuration and requires a restart/reload; it must remain explicit opt-in.
- Lavish's layout audit intentionally fails open and reports only proven issues; absence of a warning is not a correctness, accessibility, security, or cross-browser guarantee.
- Mermaid whiteboard edits are feedback only. The Mermaid source stays authoritative; there is no scene-to-Mermaid round trip.
- `share` sends content to a third party and is public by default; deletion is not guaranteed by the documented host workflow.
- No guarantee exists that the skills installer will choose `.agents/skills/`; DSKT must enforce that path itself.
