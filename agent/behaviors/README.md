# Behavior Entries

To reduce merge conflicts, each behavior is captured in its own file.

## File naming

- `B-<id>.md` with globally unique IDs to avoid conflicts.
- Recommended format: `B-YYYYMMDD-HHMMSS-<slug>.md` (e.g., `B-20250110-153045-reset-camera.md`)

## Required fields

```
Behavior: <Given/When/Then statement>
Status: <pending | in-progress | done>
Test File: <path or description>
```

Keep each file append-only after creation; update only the `Status` field when the behavior is completed.
