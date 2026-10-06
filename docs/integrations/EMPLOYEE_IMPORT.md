# Employee Excel Import

## Purpose

Excel import is the MVP integration boundary for employee data. It updates DSKT’s employee directory without coupling the application to HRMS or attendance systems.

## Accepted data

Required columns:

- employee ID;
- full name;
- employment status.

Optional columns:

- email;
- manager employee ID;
- team code and name;
- department code and name;
- preferred site code;
- job title;
- active flag when not derivable from employment status.

The final template must publish exact header names and one example workbook. Column aliases should be deliberately versioned, not guessed through fuzzy matching.

## Stable identity

Employee ID is the stable external key.

- Existing ID: update imported fields.
- New ID: create an Employee.
- ID absent from a later workbook: leave unchanged.
- Explicit inactive or departed status: deactivate.
- Employee ID changes require an explicit correction process; matching by name or email is prohibited.

## Processing lifecycle

1. Validate extension, MIME signature, size, workbook structure, and sheet selection.
2. Compute a SHA-256 hash for duplicate detection.
3. Parse cells into relational staging rows.
4. Normalize whitespace, casing where appropriate, booleans, and status values.
5. Validate every row and cross-row relationship.
6. Persist a preview with creates, updates, deactivations, unchanged rows, warnings, and errors.
7. Require Workplace Planner confirmation.
8. Revalidate the ready import and apply it in one transaction.
9. Record an audit event and delete the temporary source file according to retention policy.

No employee change occurs during preview.

## Validation

Blocking errors include:

- missing or duplicate employee ID;
- missing required field;
- unsupported status;
- malformed email when supplied;
- unknown Site code when supplied;
- manager ID that cannot be resolved in existing data or the same import;
- direct or indirect manager cycle;
- conflicting Team or Department definitions;
- duplicate workbook already applied, unless explicitly approved as a no-op.

Warnings may include:

- Employee has active Assignments but will be deactivated.
- Department differs from the selected Team’s Department.
- Optional email is missing.
- Imported row produces no change.

Warnings require visibility but do not necessarily block confirmation.

## Atomic application

Confirmation must:

- lock the import against duplicate application;
- verify it remains in `READY` state;
- apply reference data and Employees in dependency order;
- resolve manager relationships after Employee upserts;
- retain existing Employees omitted from the workbook;
- roll back every change if any operation fails;
- transition the import to `APPLIED` only after commit.

## Failure reporting

The UI shows source row, column when applicable, stable error code, and an actionable message. Users can download a sanitized error report. Formula contents, workbook internals, and stack traces are not exposed.

## Security and privacy

- Formulas and macros are never executed.
- Macro-enabled workbooks are rejected initially.
- Upload size and row count are bounded.
- Uploaded files use generated server-side names.
- Spreadsheet cells are not written to application logs.
- Temporary workbooks are encrypted by the storage provider and deleted promptly.
- Only Workplace Planners can upload, preview, confirm, or inspect import errors.

## Out of scope

- Scheduled imports.
- Direct HRMS synchronization.
- Attendance, leave, or work-from-home status.
- Automatic deletion based on omission.
- Fuzzy employee matching.
