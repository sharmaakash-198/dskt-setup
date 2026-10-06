# 17: Undo, redo, and recover conflicts

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 16 Autosave a leased edit session  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to undo and redo semantic editor commands and recover safely when the backend rejects stale local state.

## Acceptance criteria

- [ ] Undo and redo operate on semantic geometry commands rather than snapshots of viewport or rendered state.
- [ ] Pan, Zoom, selection, and other visual-only actions do not enter domain undo history.
- [ ] New edits after undo discard the invalid redo branch.
- [ ] A stale concurrency response prevents silent overwrite and offers reload/reapply guidance with unsaved work clearly identified.
- [ ] Successful conflict recovery restores a server-confirmed Draft and valid local history boundary.
- [ ] Validation failures do not corrupt committed history or report a false saved state.

## Verification

- Unit-test command inversion, redo branching, and viewport exclusion.
- Integration-test stale version and safe retry behavior through HTTP/PostgreSQL.
- Interaction-test multi-step undo/redo and a simulated concurrent edit conflict.
