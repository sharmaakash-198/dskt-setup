# ActiveGraph MCP configuration

MCP authentication has two sides:

- the ActiveGraph server reads `.activegraph/.env`;
- each agent harness reads its own project-level MCP client file.

## Server authentication

`ACTIVEGRAPH_MCP_TOKENS` uses `bearer-secret:caller-identifier`, comma-separated for multiple clients:

```bash
ACTIVEGRAPH_MCP_TOKENS=replace-with-random-token:cursor
```

The bearer secret must match the client's `Authorization: Bearer …` header. The identifier labels the caller for memory scoping and audit; the client does not send it.

If `ACTIVEGRAPH_OWNER` is set, every identifier in `ACTIVEGRAPH_MCP_TOKENS` must appear in that comma-separated list:

```bash
# Correct
ACTIVEGRAPH_MCP_TOKENS=replace-with-random-token:cursor
ACTIVEGRAPH_OWNER=cursor
```

Otherwise MCP calls fail with `invalid token`. For solo local development, `ACTIVEGRAPH_OWNER` may be omitted.

For multiple harnesses:

```bash
ACTIVEGRAPH_MCP_TOKENS=replace-with-random-token:cursor,replace-with-random-token:claude-code,replace-with-random-token:antigravity
ACTIVEGRAPH_OWNER=cursor,claude-code,antigravity
DSKT_ACTIVEGRAPH_TOKEN=replace-with-random-token
```

Restart `./.activegraph/start.sh` after changing `.activegraph/.env`.

## Harness files

| Harness | Identifier | Client config | Committed example |
|---------|------------|---------------|-------------------|
| Cursor | `cursor` | `.cursor/mcp.json` | `.cursor/mcp.json.example` |
| Claude Code | `claude-code` | `.mcp.json` | `.mcp.json.example` |
| Antigravity | `antigravity` | `.agents/mcp_config.json` | `.agents/mcp_config.json.example` |
| Codex | `codex` | tool-specific settings | — |

Skills are shared through `.agents/skills/`; MCP configuration is not shared between harnesses.

### Cursor

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

```json
{
  "mcpServers": {
    "dskt-activegraph": {
      "url": "http://127.0.0.1:7788/mcp",
      "headers": { "Authorization": "Bearer replace-with-random-token" }
    }
  }
}
```

Start the stack and reload MCP in Cursor.

### Claude Code

```bash
cp .mcp.json.example .mcp.json
```

```json
{
  "mcpServers": {
    "dskt-activegraph": {
      "type": "http",
      "url": "http://127.0.0.1:7788/mcp",
      "headers": { "Authorization": "Bearer replace-with-random-token" }
    }
  }
}
```

Start a new Claude Code session in this repo and approve project MCP servers if prompted.

### Antigravity

```bash
cp .agents/mcp_config.json.example .agents/mcp_config.json
```

Antigravity uses `serverUrl`, not `url`:

```json
{
  "mcpServers": {
    "dskt-activegraph": {
      "serverUrl": "http://127.0.0.1:7788/mcp",
      "headers": { "Authorization": "Bearer replace-with-random-token" }
    }
  }
}
```

Refresh MCP servers in Antigravity. Prefer project configuration over the global `~/.gemini/config/mcp_config.json`.

## Verify the connection

With the stack running:

```bash
curl -s -X POST http://127.0.0.1:7788/mcp \
  -H "Authorization: Bearer replace-with-random-token" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

If the response says `invalid token`, align the token identifier with `ACTIVEGRAPH_OWNER` and restart the stack.

Owner-role surfaces include `chat`, `memory_search`, and DSKT tools such as `log_work`, `log_decision`, and `register_bug`.

Before exposing the runtime on a network, set `ACTIVEGRAPH_REPLY_POLICY=known` or `owner_only`.

See [skills-by-tool](../../setup/skills-by-tool.md#activegraph-mcp-by-harness) when switching harnesses.
