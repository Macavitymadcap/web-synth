# Project Tracking

Web Synth uses GitHub Issues and the **Web Synth Roadmap** project to track planned work.

## Identifiers

Use sequential `synth-*` identifiers in issue titles and branches.

- Current backlog starts at `synth-0023`.
- Issue titles should begin with `synth-0000:`.
- Branch names should use the same identifier, for example `synth-0028`.
- Do not reuse identifiers from merged pull requests or closed issues.

## Issue Types

- `type: epic` groups related tickets behind one outcome.
- `type: ticket` marks an independently reviewable implementation change.
- `type: spike` marks time-boxed discovery before implementation.
- `bug` marks broken behaviour.

Prefer small tickets with their own acceptance criteria and verification steps. Use epics for work that needs several reviewable pull requests.

## Project Fields

The **Web Synth Roadmap** project uses these fields:

- `Status`: `Todo`, `In Progress`, or `Done`.
- `Track`: `Sequencing`, `Redesign`, `Docs`, `Workflow`, or `QA`.
- `Type`: `Epic`, `Feature`, `Refactor`, `Test`, `Docs`, or `Spike`.
- `Priority`: `P0`, `P1`, `P2`, or `P3`.
- `Effort`: `S`, `M`, `L`, or `XL`.
- `Target`: planned release slice, such as `v0.4`.
- `Risk`: `Low`, `Medium`, or `High`.

Native GitHub sub-issues are the source of truth for parent and child relationships. Native blocked-by links are the source of truth for dependencies.

## Milestones

- `v0.4 Sequencing foundation`: workflow hygiene, transport, and arpeggiator foundation.
- `v0.5 Step sequencing`: step sequencer schema, engine, UI, and persistence.
- `v0.6 Instrument redesign`: instrument stack, effects rack, and module popovers.
- `v0.7 Docs site MVP`: docs site work, held until the redesigned feature experience is in place.

## Starting Work

1. Pick a ticket whose dependencies are clear.
2. Move the project item to `In Progress`.
3. Create a branch named after the identifier.
4. Keep changes scoped to the issue.
5. Verify with the checks listed on the ticket.
6. Link the pull request back to the issue.

## Docs Hold

Docs-site implementation is intentionally deferred until `synth-0040` lands. Keep docs planning visible, but avoid building docs pages before the redesigned feature experience is stable.
