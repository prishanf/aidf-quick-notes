---
type: deployment-record
track: C
required_when: "every production release (`release` tag)"
status: draft
owner: ""
environment: production
source-revision: ""
---

# Deployment record: <release name>

## Target

- Environment: <environment>
- Source revision: <commit/tag>
- Deployment/build ID: <identifier>
- Change links: <PR, spec, release>

## Approvals and checks

- PR approval: <reviewer>
- QA sign-off: <link or not applicable>
- Production approval: <reviewer>
- Checks: <summary and links>

## State changes

- Migration plan: <link or none>
- Recovery point: <reference>
- Configuration/feature flags: <changes>

## Verification and observation

- Smoke checks: <result>
- Observation window / owner: <details>
- Rollback trigger: <condition>
- Rollback or forward-fix action: <procedure>

## Result

- Status: `running | healthy | rolled-back | follow-up-required`
- Completed: YYYY-MM-DD HH:MM TZ
- Notes: <notes>
