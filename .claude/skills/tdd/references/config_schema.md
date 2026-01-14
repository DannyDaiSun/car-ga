# TDD Configuration Reference

The `tdd.config.json` file configures the TDD workflow for your project.

## Schema

```json
{
  "artifacts_dir": "agent",
  "behavior_id_format": "B-{timestamp}-{slug}",
  "slow_test_threshold_ms": 100,
  "test_framework": "vitest",
  "test_command": "npm run test",
  "commit_after_behavior": true
}
```

## Fields

### artifacts_dir
**Type**: `string`  
**Default**: `"agent"`  
**Description**: Directory where TDD artifacts are stored (backlog, behaviors, lessons, test runtime logs)

**Examples**:
```json
"artifacts_dir": "agent"
"artifacts_dir": ".tdd"
"artifacts_dir": "docs/tdd"
```

### behavior_id_format
**Type**: `string`  
**Default**: `"B-{timestamp}-{slug}"`  
**Description**: Template for generating behavior IDs. Available placeholders:
- `{timestamp}`: Full timestamp `YYYYMMDD-HHMMSS`
- `{date}`: Date only `YYYYMMDD`
- `{time}`: Time only `HHMMSS`
- `{slug}`: URL-safe slug from behavior description

**Examples**:
```json
"behavior_id_format": "B-{timestamp}-{slug}"          // B-20250114-153045-user-can-login
"behavior_id_format": "behavior-{date}-{slug}"        // behavior-20250114-user-can-login
"behavior_id_format": "{slug}-{timestamp}"            // user-can-login-20250114-153045
"behavior_id_format": "B{date}{time}-{slug}"          // B20250114153045-user-can-login
```

### slow_test_threshold_ms
**Type**: `integer`  
**Default**: `100`  
**Description**: Threshold in milliseconds. Tests slower than this are logged as "slow tests"

**Recommendations by framework**:
```json
// Unit tests (fast)
"slow_test_threshold_ms": 50

// Unit tests (moderate)
"slow_test_threshold_ms": 100

// Integration tests
"slow_test_threshold_ms": 500

// E2E tests
"slow_test_threshold_ms": 2000
```

### test_framework
**Type**: `string`  
**Default**: `"vitest"`  
**Description**: Test framework used in the project. Helps with output parsing and framework-specific behaviors.

**Supported values**:
```json
"test_framework": "vitest"      // JavaScript/TypeScript
"test_framework": "jest"        // JavaScript/TypeScript
"test_framework": "mocha"       // JavaScript/TypeScript
"test_framework": "pytest"      // Python
"test_framework": "unittest"    // Python
"test_framework": "junit"       // Java
"test_framework": "go"          // Go
"test_framework": "rspec"       // Ruby
"test_framework": "xunit"       // C#
"test_framework": "cargo"       // Rust
```

### test_command
**Type**: `string`  
**Default**: Varies by framework  
**Description**: Command to run tests

**Examples by framework**:
```json
// JavaScript/TypeScript
"test_command": "npm run test"
"test_command": "npm test"
"test_command": "yarn test"
"test_command": "pnpm test"
"test_command": "vitest"
"test_command": "jest"

// Python
"test_command": "pytest"
"test_command": "python -m pytest"
"test_command": "python -m unittest discover"

// Java
"test_command": "mvn test"
"test_command": "gradle test"

// Go
"test_command": "go test ./..."

// Ruby
"test_command": "rspec"
"test_command": "bundle exec rspec"

// C#
"test_command": "dotnet test"

// Rust
"test_command": "cargo test"
```

### commit_after_behavior
**Type**: `boolean`  
**Default**: `true`  
**Description**: Whether to remind/enforce commits after each completed behavior

```json
"commit_after_behavior": true   // Remind to commit after each behavior
"commit_after_behavior": false  // Allow batching multiple behaviors per commit
```

## Complete Configuration Examples

### JavaScript Project (Vitest)
```json
{
  "artifacts_dir": "agent",
  "behavior_id_format": "B-{timestamp}-{slug}",
  "slow_test_threshold_ms": 50,
  "test_framework": "vitest",
  "test_command": "npm run test",
  "commit_after_behavior": true
}
```

### Python Project (Pytest)
```json
{
  "artifacts_dir": "tests/tdd",
  "behavior_id_format": "behavior-{date}-{slug}",
  "slow_test_threshold_ms": 100,
  "test_framework": "pytest",
  "test_command": "pytest -v",
  "commit_after_behavior": true
}
```

### Java Project (JUnit + Maven)
```json
{
  "artifacts_dir": "tdd",
  "behavior_id_format": "B{timestamp}-{slug}",
  "slow_test_threshold_ms": 200,
  "test_framework": "junit",
  "test_command": "mvn test",
  "commit_after_behavior": true
}
```

### Go Project
```json
{
  "artifacts_dir": "agent",
  "behavior_id_format": "{slug}-{timestamp}",
  "slow_test_threshold_ms": 100,
  "test_framework": "go",
  "test_command": "go test ./...",
  "commit_after_behavior": true
}
```

### Monorepo with Multiple Test Suites
```json
{
  "artifacts_dir": ".tdd",
  "behavior_id_format": "B-{timestamp}-{slug}",
  "slow_test_threshold_ms": 150,
  "test_framework": "vitest",
  "test_command": "npm run test:all",
  "commit_after_behavior": true
}
```

## Location

The config file can be placed in either:
1. `<artifacts_dir>/tdd.config.json` (recommended)
2. `<project_root>/tdd.config.json`

Scripts will search both locations, preferring the artifacts directory.

## Initializing

Use the `init_tdd.py` script to create a default config:

```bash
# With defaults
python3 scripts/init_tdd.py

# With custom options
python3 scripts/init_tdd.py \
  --artifacts-dir .tdd \
  --framework pytest \
  --test-command "pytest -v" \
  --threshold 150
```
