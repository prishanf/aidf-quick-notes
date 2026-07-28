# Database Change Lifecycle

This framework supports versioned Drizzle migrations and versioned raw SQL migrations. The same safety properties apply regardless of ORM or database provider.

## Migration contract

- Store migrations in source control and apply them in order.
- A released migration is immutable; correct mistakes with a new migration.
- Use forward-compatible expand-and-contract changes for production behavior.
- Require a migration plan for every schema, backfill, data-retention, or permission change.
- Run migrations with a dedicated migration role, not the normal application role.

## Preview lifecycle

1. Provision isolated database state from the approved baseline.
2. Apply the PR’s pending migrations.
3. Run a deterministic seed profile and synthetic additions.
4. Run migration, integration, authorization, and smoke checks.
5. Record the schema difference and data-policy decision in the PR.
6. Clean up isolated state when the PR closes.

## Production lifecycle

1. Confirm the approved source revision, migration list, rollback/forward-fix plan, and production gate.
2. Capture the project’s approved recovery point before mutation.
3. Apply compatible expand migrations.
4. Deploy the application revision.
5. Run read-only and safe write smoke checks.
6. Monitor for the declared observation window.
7. Schedule contract cleanup only after all supported application versions no longer rely on the old shape.

## Clone and seed policy

A production clone may be used for Preview or QA only when allowed by the project manifest. Synthetic seed data is added through an idempotent script or fixture bundle.

- Seed profiles must be named, versioned, and repeatable.
- Seed output must identify synthetic users, accounts, and credentials clearly.
- Production seeding is prohibited unless a separately approved reference-data action exists.
- Clones containing regulated or sensitive data must have access, retention, and masking controls documented.

## Rollback rule

Application rollback may be immediate. Database rollback is usually a forward-compatible fix, not an automatic down migration. Never assume an application rollback safely reverses a data migration.
