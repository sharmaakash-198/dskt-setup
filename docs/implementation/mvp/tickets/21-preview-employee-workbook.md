# 21: Preview an Employee workbook

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** ready-for-agent

## What to build

Allow a Workplace Planner to upload a bounded `.xlsx` workbook and inspect normalized proposed Employee changes before domain data is altered.

## Acceptance criteria

- [ ] Only Workplace Planner can upload supported bounded Excel workbooks.
- [ ] The backend records import metadata and normalized relational staging rows without a generic payload column.
- [ ] Employee ID is treated as the stable Employee key.
- [ ] Preview distinguishes proposed create, update, unchanged, and invalid rows with summary counts.
- [ ] No Employee domain row changes before explicit confirmation.
- [ ] Workbook rows, unrestricted personal data, and file contents are absent from logs.

## Verification

- Test upload authorization, file type/size bounds, normalization, preview counts, and unchanged domain tables through HTTP against PostgreSQL.
- Component-test upload progress, summary, and preview states.
- Use synthetic Employee workbooks only.
