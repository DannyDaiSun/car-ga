#!/bin/bash
# Codex Maintenance Script for car-ga
# This script runs after checking out a branch from a cached container.
# Use this if you need to sync any state after branch changes.

set -e  # Exit on error

echo "=== Codex Maintenance: car-ga ==="

cd /workspace/car-ga

# Ensure dependencies are up to date
# (Compares package-lock.json with installed packages)
echo "Checking dependencies..."
npm ci --prefer-offline --silent 2>/dev/null || npm install --prefer-offline

echo "=== Maintenance complete! ==="
