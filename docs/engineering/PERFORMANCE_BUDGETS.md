# Performance and Interaction Budgets

This document specifies the target loading, processing, and interaction budgets for DSKT on the baseline development profile (standard multi-core workstation with Docker-based local PostgreSQL).

## Representative Scale: 2,000 Placed Elements Floor

A typical enterprise campus floor plan at Arrise scale contains up to 2,000 interactive placed elements (workstations, private offices, collaborative zones, and amenities).

### Backend Budgets

| Metric | Budget Target | Release Gate Threshold | Verification Method |
|---|---|---|---|
| **Query & Serialization** (`GET /floors/:id/floor-plan/revisions/:revId/placements`) | ≤ 150ms | < 500ms | Real PostgreSQL integration test with 2,000 placements |
| **Batch Publication Validation** | ≤ 250ms | < 1,000ms | Boundary containment and spatial collision check over 2,000 elements |
| **Memory Footprint** | ≤ 256MB heap | < 512MB heap | Monitored during 2,000-element revision operations |

### Frontend Budgets

| Metric | Budget Target | Release Gate Threshold | Verification Method |
|---|---|---|---|
| **Placements Ingestion & Spatial Sort** | ≤ 50ms | < 300ms | In-memory spatial class priority sorting for 2,000 items |
| **Component Mount & Initial Render** | ≤ 200ms | < 500ms | React component mount with 2,000 elements |
| **Element Selection & Inspector Open** | ≤ 16ms | < 50ms | Selection state update and occupancy inspector render |
| **Non-Canvas Element List Render** | ≤ 100ms | < 300ms | Accessible HTML space list for keyboard and assistive tech |

### Development Profile

- **Processor:** 4+ cores, 2.4GHz+
- **RAM:** 8GB+ available
- **Database:** Local containerized PostgreSQL 16
- **Network:** Local loopback (`127.0.0.1`)
