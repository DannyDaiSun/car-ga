#!/bin/bash
# Codex Setup Script for car-ga
# This script runs during container creation (with network access)
# to install all dependencies needed for the project.

set -e  # Exit on error

echo "=== Codex Setup: car-ga ==="

# Navigate to workspace
cd /workspace/car-ga

# Install Node.js dependencies
echo "Installing npm dependencies..."
npm install

# Verify installation
echo "Verifying installation..."
npm list --depth=0

echo "=== Setup complete! ==="
