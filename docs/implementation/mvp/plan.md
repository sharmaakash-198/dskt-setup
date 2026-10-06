# DSKT MVP implementation plan

**Status:** approved  
**Specification:** [spec.md](spec.md)  
**Ticket directory:** [tickets/](tickets/)

## Planning rules

- Tickets are functional vertical slices. Frontend, backend, database, and tests are included when the behavior needs them.
- Repository boundaries never create separate layer tickets.
- A ticket may start when every entry in `Blocked by` is completed.
- Waves below are derived from those blocking edges; they are not release phases or mandatory synchronization points.
- Cross-repository tickets produce a separate focused commit in every touched repository.
- Start each ticket in a fresh agent context with `/implement @docs/implementation/mvp/tickets/<ticket>.md`.

Repository abbreviations:

- **Setup:** DSKT setup/documentation repository
- **FE:** `dskt-frontend`
- **BE:** `dskt-backend`, including its PostgreSQL schema and migrations

## Milestone 1: complete local product

No ticket in this milestone may require AWS, Microsoft Entra, Vercel, Supabase, or another hosted runtime.

### Wave 1 — runnable spine

- **01 Run DSKT locally** — Setup, FE, BE — no blockers.

### Wave 2 — local identity

- **02 Sign in locally** — FE, BE — blocked by 01.

### Wave 3 — authorization shell

- **03 Enter a role-authorized workspace** — FE, BE — blocked by 02.

### Wave 4 — independent domain frontiers

These may proceed concurrently:

- **04 Manage local users and roles** — FE, BE — blocked by 03.
- **05 Manage Sites** — FE, BE — blocked by 03.
- **07 Create a Template identity** — FE, BE — blocked by 03.
- **21 Preview an Employee workbook** — FE, BE — blocked by 03.

### Wave 5 — deepen each frontier

- **06 Manage Buildings and Floors** — FE, BE — blocked by 05.
- **08 Create an immutable Template Revision** — FE, BE — blocked by 07.
- **22 Diagnose an invalid workbook** — FE, BE — blocked by 21.

### Wave 6 — establish Floor and workforce data

- **09 Diagnose invalid Template geometry** — FE, BE — blocked by 08.
- **11 Create a Draft Floor Plan** — FE, BE — blocked by 06.
- **23 Confirm an Employee import** — FE, BE — blocked by 22.

### Wave 7 — active Templates, editable boundaries, searchable Employees

- **10 Activate and revise a Template** — FE, BE — blocked by 09.
- **12 Edit a Floor Boundary** — FE, BE — blocked by 11.
- **24 Search the Employee directory** — FE, BE — blocked by 23.

### Wave 8 — complete spatial classes

- **13 Place a Physical Space** — FE, BE — blocked by 10 and 12.
- **15 Place Zones and Obstacles** — FE, BE — blocked by 10 and 12.

### Wave 9 — placement transformations

- **14 Transform placed spaces** — FE, BE — blocked by 13.

### Wave 10 — durable editor session

- **16 Autosave a leased edit session** — FE, BE — blocked by 14 and 15.

### Wave 11 — editor recovery

- **17 Undo, redo, and recover conflicts** — FE, BE — blocked by 16.

### Wave 12 — publication preview

- **18 Preview publication validation** — FE, BE — blocked by 17.

### Wave 13 — first publication

- **19 Publish a Floor Plan** — FE, BE — blocked by 18.

### Wave 14 — published read experience

- **20 Browse Published maps and revision history** — FE, BE — blocked by 19.

### Wave 15 — labeling

- **25 Preview and confirm batch labels** — FE, BE — blocked by 20.

### Wave 16 — allocation

- **26 Assign an Employee to a space** — FE, BE — blocked by 24 and 25.

### Wave 17 — assignment lifecycle and revision continuity

These may proceed concurrently:

- **27 End and inspect Assignments** — FE, BE — blocked by 26.
- **28 Carry Assignments into a replacement revision** — FE, BE — blocked by 19 and 26.

### Wave 18 — Viewer journey

- **29 Locate an Employee on the map** — FE, BE — blocked by 24 and 28.

### Wave 19 — local release gate

- **30 Pass the local release gate** — Setup, FE, BE — blocked by 27 and 29.

Ticket 30 proves the complete product runs locally with synthetic data, accessibility coverage, authorization evidence, and representative 2,000-element performance. It is the only gate into AWS work.

## Milestone 2: AWS DEV

### Wave 20 — AWS vertical spine

- **31 Reach an AWS DEV readiness page** — Setup, FE, BE — blocked by 30.

### Wave 21 — independent application delivery

- **32 Deploy application repositories independently** — Setup, FE, BE — blocked by 31.

### Wave 22 — identity and data resilience

These may proceed concurrently:

- **33 Sign in to DEV with Microsoft Entra** — FE, BE — blocked by 32.
- **35 Migrate and recover the DEV database** — Setup, BE — blocked by 32.

### Wave 23 — access administration and secure edge

These may proceed concurrently:

- **34 Administer DEV users and roles** — FE, BE — blocked by 33.
- **36 Secure the DEV edge** — Setup, FE, BE — blocked by 33 and 35.

### Wave 24 — operational diagnosis

- **37 Operate DEV from telemetry** — Setup, BE — blocked by 36.

### Wave 25 — DEV release gate

- **38 Pass the DEV release gate** — Setup, FE, BE — blocked by 34 and 37.

## Current frontier

Before implementation begins, the frontier contains only ticket 01. Update ticket statuses and this section as work completes; do not infer completion from ticket number or file existence.

## Production boundary

Production infrastructure, promotion, real Employee data, support ownership, retention approval, and incident process require a later explicit decision. Ticket 38 does not authorize production deployment.
