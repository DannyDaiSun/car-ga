#!/usr/bin/env python3
"""
Validate the behavior backlog and behaviors directory for consistency.

Usage:
    python3 validate_backlog.py
    python3 validate_backlog.py --project-root /path/to/project
"""

import argparse
import json
import re
from pathlib import Path
from typing import List, Tuple

class ValidationError:
    def __init__(self, severity: str, message: str, location: str = ""):
        self.severity = severity  # ERROR, WARNING
        self.message = message
        self.location = location
    
    def __str__(self):
        prefix = "❌" if self.severity == "ERROR" else "⚠️ "
        location = f" ({self.location})" if self.location else ""
        return f"{prefix} {self.message}{location}"

def load_config(project_root: Path) -> dict:
    """Load TDD configuration."""
    config_paths = [
        project_root / "agent" / "tdd.config.json",
        project_root / "tdd.config.json",
    ]
    
    for config_path in config_paths:
        if config_path.exists():
            return json.loads(config_path.read_text())
    
    return {"artifacts_dir": "agent"}

def validate_behavior_file(filepath: Path) -> List[ValidationError]:
    """Validate individual behavior file structure."""
    errors = []
    content = filepath.read_text()
    
    required_sections = ["## Behavior", "## Status", "## Test"]
    for section in required_sections:
        if section not in content:
            errors.append(ValidationError(
                "ERROR",
                f"Missing required section: {section}",
                filepath.name
            ))
    
    # Check status format
    status_match = re.search(r'## Status\s*\n([^\n]+)', content)
    if status_match:
        status = status_match.group(1).strip()
        valid_statuses = ["🔴 Not Started", "🟡 In Progress", "🟢 Complete", "⚪ Deferred"]
        if status not in valid_statuses:
            errors.append(ValidationError(
                "WARNING",
                f"Status '{status}' not standard. Expected one of: {', '.join(valid_statuses)}",
                filepath.name
            ))
    
    return errors

def validate_backlog_table(backlog_path: Path) -> Tuple[List[str], List[ValidationError]]:
    """Validate backlog table structure and extract behavior IDs."""
    errors = []
    behavior_ids = []
    
    if not backlog_path.exists():
        errors.append(ValidationError(
            "ERROR",
            "BEHAVIOR_BACKLOG.md not found",
            str(backlog_path)
        ))
        return behavior_ids, errors
    
    content = backlog_path.read_text()
    
    # Check for behaviors table
    if "## Behaviors" not in content:
        errors.append(ValidationError(
            "ERROR",
            "Behaviors table section not found",
            "BEHAVIOR_BACKLOG.md"
        ))
        return behavior_ids, errors
    
    # Extract table rows
    in_table = False
    for line in content.split('\n'):
        if line.startswith('|----|'):
            in_table = True
            continue
        
        if in_table and line.startswith('|'):
            parts = [p.strip() for p in line.split('|')[1:-1]]
            if len(parts) >= 5:
                behavior_id = parts[0]
                if behavior_id and not behavior_id.startswith('-'):
                    behavior_ids.append(behavior_id)
            elif parts:
                errors.append(ValidationError(
                    "WARNING",
                    f"Table row has {len(parts)} columns, expected 5",
                    f"Row: {line[:50]}"
                ))
    
    if not behavior_ids:
        errors.append(ValidationError(
            "WARNING",
            "No behaviors found in backlog table",
            "BEHAVIOR_BACKLOG.md"
        ))
    
    return behavior_ids, errors

def validate_consistency(artifacts_dir: Path, backlog_ids: List[str]) -> List[ValidationError]:
    """Validate consistency between backlog and behavior files."""
    errors = []
    behaviors_dir = artifacts_dir / "behaviors"
    
    if not behaviors_dir.exists():
        errors.append(ValidationError(
            "ERROR",
            "behaviors/ directory not found",
            str(behaviors_dir)
        ))
        return errors
    
    # Get all behavior files
    behavior_files = list(behaviors_dir.glob("*.md"))
    file_ids = [f.stem for f in behavior_files]
    
    # Check for behaviors in backlog but not in files
    for bid in backlog_ids:
        if bid not in file_ids:
            errors.append(ValidationError(
                "WARNING",
                f"Behavior '{bid}' in backlog but no file found",
                "behaviors/"
            ))
    
    # Check for files not in backlog
    for fid in file_ids:
        if fid not in backlog_ids:
            errors.append(ValidationError(
                "WARNING",
                f"Behavior file '{fid}.md' exists but not in backlog",
                f"behaviors/{fid}.md"
            ))
    
    return errors

def main():
    parser = argparse.ArgumentParser(description="Validate TDD artifacts")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    
    args = parser.parse_args()
    
    project_root = Path(args.project_root).resolve()
    config = load_config(project_root)
    artifacts_dir = project_root / config["artifacts_dir"]
    
    print(f"🔍 Validating TDD artifacts at: {artifacts_dir}")
    print()
    
    all_errors = []
    
    # Validate backlog
    backlog_path = artifacts_dir / "BEHAVIOR_BACKLOG.md"
    backlog_ids, backlog_errors = validate_backlog_table(backlog_path)
    all_errors.extend(backlog_errors)
    
    # Validate individual behavior files
    behaviors_dir = artifacts_dir / "behaviors"
    if behaviors_dir.exists():
        for behavior_file in behaviors_dir.glob("*.md"):
            file_errors = validate_behavior_file(behavior_file)
            all_errors.extend(file_errors)
    
    # Validate consistency
    consistency_errors = validate_consistency(artifacts_dir, backlog_ids)
    all_errors.extend(consistency_errors)
    
    # Report results
    if not all_errors:
        print("✅ All validations passed!")
        return 0
    
    errors = [e for e in all_errors if e.severity == "ERROR"]
    warnings = [e for e in all_errors if e.severity == "WARNING"]
    
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"  {warning}")
        print()
    
    if errors:
        print("Errors:")
        for error in errors:
            print(f"  {error}")
        print()
        return 1
    
    if args.strict and warnings:
        print("❌ Validation failed (strict mode: warnings treated as errors)")
        return 1
    
    print("✅ Validation passed with warnings")
    return 0

if __name__ == "__main__":
    exit(main())
