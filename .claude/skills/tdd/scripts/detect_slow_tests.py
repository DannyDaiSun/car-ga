#!/usr/bin/env python3
"""
Detect slow tests from test runner output and create individual log files.

Usage:
    npm run test | python3 detect_slow_tests.py
    python3 detect_slow_tests.py --input test_output.txt
    python3 detect_slow_tests.py --threshold 50
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

def load_config(project_root: Path) -> dict:
    """Load TDD configuration."""
    config_paths = [
        project_root / "agent" / "tdd.config.json",
        project_root / "tdd.config.json",
    ]
    
    for config_path in config_paths:
        if config_path.exists():
            return json.loads(config_path.read_text())
    
    return {
        "artifacts_dir": "agent",
        "slow_test_threshold_ms": 100
    }

def parse_vitest_output(output: str, threshold: int) -> list:
    """Parse Vitest/Jest output for test timings."""
    slow_tests = []
    
    # Pattern: ✓ test name (123ms)
    # Pattern: PASS test/file.test.js (123ms)
    patterns = [
        r'✓\s+(.+?)\s+\((\d+)ms\)',
        r'✓\s+(.+?)\s+(\d+)ms',
        r'PASS\s+(.+?)\s+\((\d+)ms\)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, output, re.MULTILINE)
        for match in matches:
            test_name = match.group(1).strip()
            runtime = int(match.group(2))
            
            if runtime > threshold:
                slow_tests.append({
                    "test_name": test_name,
                    "runtime_ms": runtime,
                    "test_file": "TBD"  # Vitest usually shows this separately
                })
    
    return slow_tests

def parse_pytest_output(output: str, threshold: int) -> list:
    """Parse pytest output for test timings."""
    slow_tests = []
    
    # Pattern: test_file.py::test_name PASSED [100%] 0.123s
    pattern = r'(.+?)::(.+?)\s+PASSED.*?(\d+\.\d+)s'
    
    matches = re.finditer(pattern, output, re.MULTILINE)
    for match in matches:
        test_file = match.group(1).strip()
        test_name = match.group(2).strip()
        runtime = float(match.group(3)) * 1000  # Convert to ms
        
        if runtime > threshold:
            slow_tests.append({
                "test_name": test_name,
                "runtime_ms": int(runtime),
                "test_file": test_file
            })
    
    return slow_tests

def parse_junit_output(output: str, threshold: int) -> list:
    """Parse JUnit output for test timings."""
    slow_tests = []
    
    # Pattern: testName(ClassName) Time elapsed: 0.123 s
    pattern = r'(\w+)\((.+?)\)\s+Time elapsed:\s+(\d+\.\d+)\s+s'
    
    matches = re.finditer(pattern, output, re.MULTILINE)
    for match in matches:
        test_name = match.group(1).strip()
        class_name = match.group(2).strip()
        runtime = float(match.group(3)) * 1000  # Convert to ms
        
        if runtime > threshold:
            slow_tests.append({
                "test_name": test_name,
                "runtime_ms": int(runtime),
                "test_file": class_name
            })
    
    return slow_tests

def parse_go_test_output(output: str, threshold: int) -> list:
    """Parse Go test output for test timings."""
    slow_tests = []
    
    # Pattern: --- PASS: TestName (0.12s)
    pattern = r'---\s+PASS:\s+(\w+)\s+\((\d+\.\d+)s\)'
    
    matches = re.finditer(pattern, output, re.MULTILINE)
    for match in matches:
        test_name = match.group(1).strip()
        runtime = float(match.group(2)) * 1000  # Convert to ms
        
        if runtime > threshold:
            slow_tests.append({
                "test_name": test_name,
                "runtime_ms": int(runtime),
                "test_file": "TBD"
            })
    
    return slow_tests

def detect_slow_tests(output: str, threshold: int, framework: str = None) -> list:
    """Detect slow tests from test runner output."""
    parsers = {
        "vitest": parse_vitest_output,
        "jest": parse_vitest_output,  # Same format as vitest
        "pytest": parse_pytest_output,
        "junit": parse_junit_output,
        "go": parse_go_test_output,
    }
    
    if framework and framework in parsers:
        return parsers[framework](output, threshold)
    
    # Try all parsers if framework not specified
    all_slow_tests = []
    for parser in parsers.values():
        slow_tests = parser(output, threshold)
        all_slow_tests.extend(slow_tests)
    
    # Remove duplicates
    seen = set()
    unique_tests = []
    for test in all_slow_tests:
        key = (test["test_name"], test["runtime_ms"])
        if key not in seen:
            seen.add(key)
            unique_tests.append(test)
    
    return unique_tests

def create_slow_test_files(artifacts_dir: Path, slow_tests: list):
    """Create individual files for each slow test."""
    runtime_dir = artifacts_dir / "test-runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    for test in slow_tests:
        # Create a safe filename
        safe_name = re.sub(r'[^\w\s-]', '', test["test_name"])
        safe_name = re.sub(r'[-\s]+', '-', safe_name).strip('-')[:50]
        filename = f"{safe_name}.md"
        
        filepath = runtime_dir / filename
        
        content = f"""# {test["test_name"]}

**Runtime**: {test["runtime_ms"]}ms
**Test File**: {test["test_file"]}
**Detected**: {timestamp}

## Notes
This test exceeded the slow test threshold. Consider optimizing or investigating why it's slow.
"""
        
        filepath.write_text(content)
        print(f"📝 Logged slow test: {filepath}")

def main():
    parser = argparse.ArgumentParser(description="Detect slow tests from test runner output")
    parser.add_argument("--input", help="Input file (reads from stdin if not provided)")
    parser.add_argument("--threshold", type=int, help="Slow test threshold in milliseconds")
    parser.add_argument("--framework", choices=["vitest", "jest", "pytest", "junit", "go"], help="Test framework")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    
    args = parser.parse_args()
    
    project_root = Path(args.project_root).resolve()
    config = load_config(project_root)
    artifacts_dir = project_root / config["artifacts_dir"]
    
    threshold = args.threshold or config.get("slow_test_threshold_ms", 100)
    framework = args.framework or config.get("test_framework")
    
    # Read test output
    if args.input:
        with open(args.input, 'r') as f:
            output = f.read()
    else:
        output = sys.stdin.read()
    
    if not output.strip():
        print("⚠️  No test output provided")
        sys.exit(1)
    
    print(f"🔍 Analyzing test output (threshold: {threshold}ms)")
    
    slow_tests = detect_slow_tests(output, threshold, framework)
    
    if not slow_tests:
        print(f"✅ No slow tests detected (all tests < {threshold}ms)")
        return
    
    print(f"⚠️  Found {len(slow_tests)} slow test(s):")
    for test in slow_tests:
        print(f"   - {test['test_name']}: {test['runtime_ms']}ms")
    
    print()
    create_slow_test_files(artifacts_dir, slow_tests)
    
    print()
    print(f"💡 Tip: Review {artifacts_dir}/test-runtime/ to investigate slow tests")

if __name__ == "__main__":
    main()
