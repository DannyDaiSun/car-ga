#!/usr/bin/env python3
"""
Create a new behavior file in the behaviors directory.

Usage:
    python3 create_behavior.py "User can reset the timer" --test-file src/timer.test.js
    python3 create_behavior.py "API returns 404 for invalid ID" --slug invalid-id-404
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path

def load_config(project_root: Path) -> dict:
    """Load TDD configuration from tdd.config.json."""
    config_paths = [
        project_root / "agent" / "tdd.config.json",
        project_root / "tdd.config.json",
    ]
    
    for config_path in config_paths:
        if config_path.exists():
            return json.loads(config_path.read_text())
    
    # Return default config if not found
    return {
        "artifacts_dir": "agent",
        "behavior_id_format": "B-{timestamp}-{slug}",
        "slow_test_threshold_ms": 100,
        "test_framework": "vitest",
        "test_command": "npm run test"
    }

def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def generate_behavior_id(config: dict, slug: str) -> str:
    """Generate a behavior ID based on the configured format."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    format_str = config.get("behavior_id_format", "B-{timestamp}-{slug}")
    
    return format_str.format(
        timestamp=timestamp,
        slug=slug,
        date=datetime.now().strftime("%Y%m%d"),
        time=datetime.now().strftime("%H%M%S")
    )

def create_behavior_file(
    artifacts_dir: Path,
    behavior_id: str,
    description: str,
    test_file: str = "",
    test_name: str = ""
):
    """Create a new behavior file."""
    behaviors_dir = artifacts_dir / "behaviors"
    behaviors_dir.mkdir(parents=True, exist_ok=True)
    
    behavior_path = behaviors_dir / f"{behavior_id}.md"
    
    content = f"""# {behavior_id}

## Behavior
{description}

## Status
🔴 Not Started

## Test
- **File**: {test_file or "TBD"}
- **Name**: {test_name or "TBD"}
- **Assertion**: TBD

## Notes
Created: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
"""
    
    behavior_path.write_text(content)
    return behavior_path

def update_backlog(artifacts_dir: Path, behavior_id: str, description: str, test_file: str):
    """Add the behavior to the backlog table."""
    backlog_path = artifacts_dir / "BEHAVIOR_BACKLOG.md"
    
    if not backlog_path.exists():
        print(f"⚠️  Warning: {backlog_path} not found. Skipping backlog update.")
        return
    
    content = backlog_path.read_text()
    
    # Add new row to the table
    new_row = f"| {behavior_id} | 🔴 Not Started | {description} | {test_file or 'TBD'} | TBD |\n"
    
    # Find the table and append
    if "## Behaviors" in content:
        # Insert after the header row
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('|----|'):
                lines.insert(i + 1, new_row.rstrip())
                break
        content = '\n'.join(lines)
        backlog_path.write_text(content)
        print(f"✅ Updated backlog: {backlog_path}")
    else:
        print(f"⚠️  Warning: Could not find behaviors table in {backlog_path}")

def main():
    parser = argparse.ArgumentParser(description="Create a new behavior file")
    parser.add_argument("description", help="Behavior description (Given/When/Then or plain description)")
    parser.add_argument("--slug", help="Custom slug for behavior ID (auto-generated if not provided)")
    parser.add_argument("--test-file", default="", help="Test file path")
    parser.add_argument("--test-name", default="", help="Test name/description")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    
    args = parser.parse_args()
    
    project_root = Path(args.project_root).resolve()
    config = load_config(project_root)
    artifacts_dir = project_root / config["artifacts_dir"]
    
    # Generate slug and ID
    slug = args.slug or slugify(args.description[:50])
    behavior_id = generate_behavior_id(config, slug)
    
    print(f"🚀 Creating behavior: {behavior_id}")
    print(f"   Description: {args.description}")
    print()
    
    # Create behavior file
    behavior_path = create_behavior_file(
        artifacts_dir,
        behavior_id,
        args.description,
        args.test_file,
        args.test_name
    )
    print(f"✅ Created behavior file: {behavior_path}")
    
    # Update backlog
    update_backlog(artifacts_dir, behavior_id, args.description, args.test_file)
    
    print()
    print("Next steps:")
    print(f"1. Write the test in {args.test_file or '<test file>'}")
    print(f"2. Implement the minimal code to pass the test")
    print(f"3. Update {behavior_path} with test details")
    print(f"4. Commit: git commit -m '{behavior_id}: {args.description}'")

if __name__ == "__main__":
    main()
