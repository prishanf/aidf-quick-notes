# Claude adapter

Follow the adapter-neutral rules in [AGENTS.md](../AGENTS.md).

The command contracts live in [.aidf/commands/](../.aidf/commands/) and are
exposed as slash commands by the files in `.claude/commands/`. Read the
contract matching the role you are performing and follow it as written.

`.aidf/` is the vendored framework: read it, never edit it.
Do not add Claude-specific lifecycle rules here.
