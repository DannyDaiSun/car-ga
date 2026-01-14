#!/usr/bin/env python3
"""
Initialize TDD workflow structure in a project.

Usage:
    python3 init_tdd.py [--path PATH] [--artifacts-dir DIR] [--framework FRAMEWORK]

Examples:
    python3 init_tdd.py
    python3 init_tdd.py --path ./my-project
    python3 init_tdd.py --artifacts-dir agent --framework vitest
"""

import argparse
import json
import os
from pathlib import Path
from datetime import datetime

DEFAULT_CONFIG = {
    "artifacts_dir": "agent",
    "behavior_id_format": "B-{timestamp}-{slug}",
    "slow_test_threshold_ms": 100,
    "test_framework": "vitest",
    "test_command": "npm run test",
    "commit_after_behavior": True
}

TEMPLATES = {
    "BEHAVIOR_BACKLOG.md": """# Behavior Backlog

## Test Command
```bash
{test_command}
```

## Rules
- Each behavior must have exactly one unit test with one assertion
- Commit after each completed behavior
- Log slow tests (>{threshold}ms) in {runtime_dir}/

## Behaviors

| ID | Status | Behavior | Test File | Test Name |
|----|--------|----------|-----------|-----------|
""",
    
    "LESSONS.md": """# Verified Project Lessons

This is an append-only log of lessons learned during development.
Only add entries when verified by evidence (test results, runtime data, etc.).

## Format
```
## {date} - {title}
**Context**: {what was happening}
**Discovery**: {what was learned}
**Evidence**: {test results, data, or observations}
**Action**: {what to do differently}
```

---
""",

    "TEST_RUNTIME.md": """# Test Runtime Log

**Note**: This is a legacy index. For new slow tests, create individual files in `{runtime_dir}/` to avoid merge conflicts.

## Slow Tests (>{threshold}ms)

| Test File | Test Name | Runtime (ms) | Date Logged |
|-----------|-----------|--------------|-------------|
""",

    "tdd.config.json": """{
  "artifacts_dir": "{artifacts_dir}",
  "behavior_id_format": "{behavior_id_format}",
  "slow_test_threshold_ms": {slow_test_threshold_ms},
  "test_framework": "{test_framework}",
  "test_command": "{test_command}",
  "commit_after_behavior": {commit_after_behavior}
}
""",

    "behavior_template.md": """# {behavior_id}

## Behavior
{behavior_description}

## Status
{status}

## Test
- **File**: {test_file}
- **Name**: {test_name}
- **Assertion**: {assertion}

## Notes
{notes}
"""
}

def create_directory_structure(base_path: Path, config: dict):
    """Create the TDD artifacts directory structure."""
    artifacts_dir = base_path / config["artifacts_dir"]
    
    dirs = [
        artifacts_dir,
        artifacts_dir / "behaviors",
        artifacts_dir / "test-runtime"
    ]
    
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")

def create_templates(base_path: Path, config: dict):
    """Create template files from templates."""
    artifacts_dir = base_path / config["artifacts_dir"]
    runtime_dir = f"{config['artifacts_dir']}/test-runtime"
    
    # Create config file
    config_path = artifacts_dir / "tdd.config.json"
    config_content = TEMPLATES["tdd.config.json"].format(
        artifacts_dir=config["artifacts_dir"],
        behavior_id_format=config["behavior_id_format"],
        slow_test_threshold_ms=config["slow_test_threshold_ms"],
        test_framework=config["test_framework"],
        test_command=config["test_command"],
        commit_after_behavior=str(config["commit_after_behavior"]).lower()
    )
    config_path.write_text(config_content)
    print(f"✅ Created config: {config_path}")
    
    # Create backlog
    backlog_path = artifacts_dir / "BEHAVIOR_BACKLOG.md"
    backlog_content = TEMPLATES["BEHAVIOR_BACKLOG.md"].format(
        test_command=config["test_command"],
        threshold=config["slow_test_threshold_ms"],
        runtime_dir=runtime_dir
    )
    backlog_path.write_text(backlog_content)
    print(f"✅ Created backlog: {backlog_path}")
    
    # Create lessons
    lessons_path = artifacts_dir / "LESSONS.md"
    lessons_content = TEMPLATES["LESSONS.md"]
    lessons_path.write_text(lessons_content)
    print(f"✅ Created lessons: {lessons_path}")
    
    # Create test runtime
    runtime_path = artifacts_dir / "TEST_RUNTIME.md"
    runtime_content = TEMPLATES["TEST_RUNTIME.md"].format(
        threshold=config["slow_test_threshold_ms"],
        runtime_dir=runtime_dir
    )
    runtime_path.write_text(runtime_content)
    print(f"✅ Created test runtime log: {runtime_path}")

def main():
    parser = argparse.ArgumentParser(description="Initialize TDD workflow structure")
    parser.add_argument("--path", type=str, default=".", help="Project root path")
    parser.add_argument("--artifacts-dir", type=str, default="agent", help="Artifacts directory name")
    parser.add_argument("--framework", type=str, default="vitest", help="Test framework (vitest, jest, pytest, junit, etc.)")
    parser.add_argument("--test-command", type=str, help="Test command override")
    parser.add_argument("--threshold", type=int, default=100, help="Slow test threshold in milliseconds")
    
    args = parser.parse_args()
    
    # Build config
    config = DEFAULT_CONFIG.copy()
    config["artifacts_dir"] = args.artifacts_dir
    config["test_framework"] = args.framework
    config["slow_test_threshold_ms"] = args.threshold
    
    # Set default test command based on framework
    if args.test_command:
        config["test_command"] = args.test_command
    else:
        framework_commands = {
            "vitest": "npm run test",
            "jest": "npm test",
            "pytest": "pytest",
            "junit": "mvn test",
            "go": "go test ./...",
            "rspec": "rspec"
        }
        config["test_command"] = framework_commands.get(args.framework, "npm run test")
    
    base_path = Path(args.path).resolve()
    
    print(f"🚀 Initializing TDD workflow at: {base_path}")
    print(f"   Artifacts directory: {config['artifacts_dir']}")
    print(f"   Test framework: {config['test_framework']}")
    print(f"   Test command: {config['test_command']}")
    print()
    
    create_directory_structure(base_path, config)
    create_templates(base_path, config)
    
    print()
    print("✅ TDD workflow initialized successfully!")
    print()
    print("Next steps:")
    print(f"1. Review {config['artifacts_dir']}/tdd.config.json")
    print(f"2. Start adding behaviors to {config['artifacts_dir']}/BEHAVIOR_BACKLOG.md")
    print(f"3. Run tests with: {config['test_command']}")

if __name__ == "__main__":
    main()
