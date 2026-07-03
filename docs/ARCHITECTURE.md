# Architecture

Keep this document factual and short. Update it only after decisions are stable.

## Current Shape

- App: Next.js with TypeScript
- Database: SQLite on a single VPS
- Auth: Founder-only login with a secure session
- AI: OpenAI API for rough-memory note lookup
- Deployment: Hetzner VPS, reached through Tailscale for admin access and Cloudflare Tunnel for web traffic

## Boundaries

- UI: Capture-first notebook interface with a large text note box
- Server actions/API: Save notes, edit notes, search notes, and call AI
- Database access: Server-only SQLite access
- AI calls: Server-only calls using selected note context, not full database dumps
- Auth/session: Founder-only protected routes and private notes

## Decisions

Use this format:

```markdown
### Decision: <short name>

Context:
Decision:
Reason:
Tradeoff:
Date:
```

### Decision: V1 stack

Context:
The app is founder-only for V1, text-only, and intended to teach real product engineering without SaaS complexity.

Decision:
Use Next.js with TypeScript, SQLite, OpenAI API, and a Hetzner VPS. Admin access will use Tailscale. Public web access will later use Cloudflare Tunnel.

Reason:
This gives a mainstream TypeScript app model while keeping the database and deployment model simple enough to understand. SQLite fits a single-user VPS app better than a hosted database for this learning stage.

Tradeoff:
This is more operational work than Vercel plus Supabase. We become responsible for server setup, backups, logs, updates, and restore practice.

Date:
2026-06-20

### Decision: V1 auth

Context:
The app is founder-only for V1 and protects private notes before note persistence exists.

Decision:
Use one server-checked password from `AUTH_PASSWORD` and a signed HTTP-only session cookie using `SESSION_SECRET`.

Reason:
This keeps auth understandable while still avoiding fake browser-only security. The password and session signing secret stay out of committed code.

Tradeoff:
This is not a multi-user account system and has no email reset or public signup path. If the product becomes public, auth should be redesigned.

Date:
2026-07-01

## Deferred Complexity

List things intentionally not used yet.

- Multi-tenancy
- Billing
- Teams
- Public signup
- Queues
- Redis
- Kubernetes
- Autonomous agents
