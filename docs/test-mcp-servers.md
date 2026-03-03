# Public MCP Servers for Evaluation Testing

No-auth MCP servers that can be used for AgentTrust evaluation testing.
Last verified: 2026-03-02

## Evaluated & Working (L2 scores verified)

| Server | URL | Score | Tier | Tools | Notes |
|--------|-----|-------|------|-------|-------|
| Mock MCP (local) | `http://localhost:8010/sse` | 89 | Expert | 4 | Local test server (SSE) |
| DeepWiki | `https://mcp.deepwiki.com/mcp` | 88 | Expert | 3 | Wiki/docs reader |
| Cloudflare Docs | `https://docs.mcp.cloudflare.com/sse` | 83 | Proficient | 2 | SSE transport |
| GitMCP | `https://gitmcp.io/docs` | 83 | Proficient | 5 | GitHub repo docs |
| HuggingFace | `https://hf.co/mcp` | 83 | Proficient | ? | ML model search (slow) |
| Context7 | `https://mcp.context7.com/mcp` | 79 | Proficient | 2 | Library documentation |
| Ferryhopper | `https://mcp.ferryhopper.com/mcp` | 67 | Basic | 3 | Ferry booking (slow eval) |
| Manifold Markets | `https://api.manifold.markets/v0/mcp` | 69 | Basic | 5 | Prediction markets (slow eval) |

## Not Yet Evaluated (should work, no auth)

| Server | URL | Notes |
|--------|-----|-------|
| Javadocs | `https://javadocs.dev/mcp` | Java documentation |
| OpenMesh | `https://mcp.openmesh.network/mcp` | Decentralized data |
| CoinGecko | `https://mcp.api.coingecko.com/mcp` | Crypto prices |
| BGPt | `https://mcp.bgpt.co/mcp` | BGP routing info |
| TweetSave | `https://mcp.tweetsave.org/sse` | SSE, tweet extraction (slow) |

## Known Issues (failed during bulk eval 2026-03-02)

| Server | URL | Issue |
|--------|-----|-------|
| Astro Docs | `https://docs.astro.build/mcp` | 404 — endpoint not found |
| Find-A-Domain | `https://api.find-a.domain/mcp` | Connection error (NoneType) |
| OpenZeppelin | `https://mcp.openzeppelin.com/mcp` | 404 — endpoint not found |
| OZ Cairo | `https://cairo.mcp.openzeppelin.com/mcp` | Likely 404 (same infra as OZ main) |
| OZ Stellar | `https://stellar.mcp.openzeppelin.com/mcp` | Likely 404 (same infra as OZ main) |
| OZ Stylus | `https://stylus.mcp.openzeppelin.com/mcp` | Likely 404 (same infra as OZ main) |
| SubwayInfo NYC | `https://mcp.subwayinfo.nyc/mcp` | Connection error (NoneType) |
| zip1.io | `https://api.zip1.io/mcp` | Connection error (NoneType) |

## Require Auth (Skip for automated testing)

| Server | URL | Auth Type |
|--------|-----|-----------|
| Semgrep | `https://mcp.semgrep.ai/mcp` | API key |
| Browserbase | `https://mcp.browserbase.com/mcp` | API key |
| Neon DB | `https://mcp.neon.tech/mcp` | OAuth |
| Firecrawl | `https://mcp.firecrawl.dev/mcp` | API key |
| Stripe | `https://mcp.stripe.com/mcp` | API key |
| Notion | `https://mcp.notion.so/mcp` | OAuth |
| Linear | `https://mcp.linear.app/mcp` | OAuth |
| Sentry | `https://mcp.sentry.dev/mcp` | OAuth |
| Dify | `https://mcp.dify.ai/mcp` | API key |
| Turso | `https://mcp.turso.tech/mcp` | API key |

## Discovery Resources

- [Official MCP Registry](https://registry.modelcontextprotocol.io) — `GET /v0/servers`
- [MCP Security API](https://mcp.kai-agi.com/api/registry?auth=false) — 214 no-auth servers
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) — community list
