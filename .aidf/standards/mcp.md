# MCP Readiness

MCP support is a capability layer over the application’s domain APIs. It must not bypass business rules, authorization, validation, audit logging, or change controls.

## Service catalog

Projects that expose services to agents maintain a catalog using `templates/mcp-capability.md`. It lets an agent discover available services without guessing endpoints or privileges.

Each capability declares:

- service owner and environment;
- stable tool name and version;
- read, write, or destructive classification;
- JSON input/output schema;
- required user and service scopes;
- confirmation policy;
- idempotency behavior and rate limits;
- data classification, audit event, and rollback/compensation action;
- linked API contract and operational runbook.

## Authenticated writes

Authenticated writes are supported only through narrow, domain-specific tools. Direct database tools are prohibited by default.

- The server validates the caller identity and each requested scope.
- The application performs the same authorization checks used by its human UI or API.
- Write tools require an idempotency key when retries could duplicate work.
- Destructive or high-impact operations require explicit human confirmation and a visible summary of effect.
- Each invocation writes an audit record containing actor, tool, inputs summary, result, source revision, and correlation ID.
- Tool discovery may expose only capabilities the caller is authorized to see.

## Agent behavior

Agents may discover and use read tools within the current task’s authorization. Before calling a write tool, they must show the intended action, affected scope, and expected result, then obtain the required confirmation. A tool failure is evidence; it must not be hidden or retried blindly.

## Protocol evolution

Pin the protocol revision and SDK version in the project manifest. Review tool schemas, authorization, and audit controls when either changes.
