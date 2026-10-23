# 21: Preview an Employee workbook

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** completed

## What to build

Allow a Workplace Planner to upload a bounded `.xlsx` workbook and inspect normalized proposed Employee changes before domain data is altered.

## Acceptance criteria

- [x] Only Workplace Planner can upload supported bounded Excel workbooks.
- [x] The backend records import metadata and normalized relational staging rows without a generic payload column.
- [x] Employee ID is treated as the stable Employee key.
- [x] Preview distinguishes proposed create, update, unchanged, and invalid rows with summary counts.
- [x] No Employee domain row changes before explicit confirmation.
- [x] Workbook rows, unrestricted personal data, and file contents are absent from logs.

## Verification

- Test upload authorization, file type/size bounds, normalization, preview counts, and unchanged domain tables through HTTP against PostgreSQL.
- Component-test upload progress, summary, and preview states.
- Use synthetic Employee workbooks only.
