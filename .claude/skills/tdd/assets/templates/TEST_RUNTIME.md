# Test Runtime Log

**Note**: This is a legacy index. For new slow tests, create individual files in `test-runtime/` to avoid merge conflicts.

## Slow Tests (>100ms)

| Test File | Test Name | Runtime (ms) | Date Logged |
|-----------|-----------|--------------|-------------|

## How to Log Slow Tests

Instead of adding rows to this table, create individual markdown files:

```bash
# Detect slow tests from test output
npm run test | python3 scripts/detect_slow_tests.py

# Or manually create a file
echo "# test_name
**Runtime**: 150ms
**Test File**: src/component.test.js
**Detected**: 2025-01-14
" > test-runtime/test_name.md
```

Each test gets its own file in `test-runtime/` to prevent merge conflicts.
