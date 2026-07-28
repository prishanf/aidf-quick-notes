# Application Security Baseline

This baseline applies to every project and can be strengthened by a project-specific threat model. It aligns with established application-security verification practices without requiring a particular security vendor.

It covers the security of **the software being built**. The security of **building it with agents** — prompt injection, source and data egress to model providers, agent credential scope, MCP supply chain — is a separate and equally required chapter: [ai-safety.md](ai-safety.md).

## Input and output safety

- Validate input on the server at every trust boundary using explicit schemas and allowlists.
- Reject or safely ignore unknown fields according to the API contract; never silently reinterpret them.
- Enforce type, length, format, range, nesting, and file-size limits before processing.
- Normalize data where appropriate before authorization or comparison.
- Use parameterized database access and context-aware output encoding.
- Apply file type validation, malware scanning where relevant, and safe storage rules to uploads.

## Identity and authorization

- Authenticate before protected operations and authorize every object-level access.
- Keep user, tenant, role, and permission checks on the server.
- Test denied paths as deliberately as allowed paths.
- Use least-privilege service accounts and separate application, migration, CI, and human credentials.

## Delivery and dependency safety

- Scan source, dependencies, and configuration changes before merge.
- Prevent secrets from entering source control; rotate any exposed secret immediately.
- Require review for authentication, authorization, cryptography, database permissions, infrastructure, and MCP write capability changes.
- Restrict production deployment credentials to approved release jobs.

## Security evidence

High-risk changes include a threat model, changed trust boundaries, abuse cases, test evidence, monitoring considerations, and a named reviewer. Exceptions require an expiry date and follow-up owner.
