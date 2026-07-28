---
type: mcp-capability
track: C
required_when: "the change carries the `mcp-write` tag"
status: draft
owner: ""
updated: YYYY-MM-DD
protocol-revision: ""
---

# MCP capability: <tool name>

## Service and purpose

- Service: <name>
- Environment: <environment>
- Owner: <team/role>
- Linked API contract: <link>
- Capability: `read | write | destructive`

## Contract

- Tool name and version: `<name>@<version>`
- Input schema: <link or JSON Schema>
- Output schema: <link or JSON Schema>
- Required scopes: <scopes>
- Idempotency: <key/behavior or not applicable>
- Rate limits: <rule>

## Safety controls

- Confirmation: `none | explicit human confirmation | dual approval`
- Authorization: <object/tenant/role checks>
- Data class: <classification>
- Audit event: <event and required fields>
- Failure/compensation: <safe retry or undo path>

## Verification

- [ ] Tool schema validated
- [ ] Authorized and unauthorized calls tested
- [ ] Audit event verified
- [ ] Write effect and idempotency tested
- [ ] Human confirmation flow tested where required
