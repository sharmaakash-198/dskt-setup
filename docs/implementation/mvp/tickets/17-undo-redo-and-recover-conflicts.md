# 17: Undo, redo, and recover conflicts

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 16 Autosave a leased edit session  
**Status:** implemented

## What to build

Allow a Facilities Admin to undo and redo semantic editor commands and recover safely when the backend rejects stale local state.

## Acceptance criteria

- [x] Undo and redo operate on semantic geometry commands rather than snapshots of viewport or rendered state.
- [x] Pan, Zoom, selection, and other visual-only actions do not enter domain undo history.
- [x] New edits after undo discard the invalid redo branch.
- [x] A stale concurrency response prevents silent overwrite and offers reload/reapply guidance with unsaved work clearly identified.
- [x] Successful conflict recovery restores a server-confirmed Draft and valid local history boundary.
- [x] Validation failures do not corrupt committed history or report a false saved state.

## Verification

- Unit-test command inversion, redo branching, and viewport exclusion.
- Integration-test stale version and safe retry behavior through HTTP/PostgreSQL.
- Interaction-test multi-step undo/redo and a simulated concurrent edit conflict.
