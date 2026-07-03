# Security

## Current Stage

Prototype

## Minimum Checks

- One-password auth is required before viewing the notebook
- Secrets are in environment variables, never committed
- Inputs are validated
- AI calls have cost/rate limits
- User-provided text is not trusted as instructions
- Dangerous actions require human approval
- Logs avoid unnecessary private data

## AI-Specific Risks

- Prompt injection:
- Sensitive data exposure:
- Insecure structured output:
- Excessive agency:
- Runaway cost:

## Open Risks

- `AUTH_PASSWORD` is stored as a plain environment variable for prototype simplicity. Before real production use, consider switching to a password hash.
- Login has no application-level rate limit yet. Before accepting public traffic, add app throttling or enforce an equivalent proxy-level limit.
