#!/bin/bash
# Codex Setup Script for car-ga
# This script runs during container creation (with network access)
# to install all dependencies needed for the project.

set -e  # Exit on error

echo "=== Codex Setup: car-ga ==="

# Navigate to workspace
cd /workspace/car-ga

# ============================================
# 1. Install Node.js project dependencies
# ============================================
echo "[1/4] Installing npm dependencies..."
npm install

# ============================================
# 2. Install Playwright for browser testing
# ============================================
echo "[2/4] Installing Playwright for browser-based QA..."
npx -y playwright install --with-deps chromium

# ============================================
# 3. Verify all dependencies
# ============================================
echo "[3/4] Verifying installation..."
npm list --depth=0

# ============================================
# 4. Run tests to verify setup
# ============================================
echo "[4/4] Running unit tests to verify setup..."
npx vitest run --reporter=verbose || echo "Warning: Some tests may have failed, but setup continues"

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Available commands:"
echo "  npm run dev        - Start dev server (http://localhost:5173)"
echo "  npm run test       - Run unit tests"
echo "  npm run test:e2e   - Run E2E tests with Playwright"
echo "  npm run test:all   - Run all tests (unit + E2E)"
echo "  npm run lint       - Lint source code"
echo "  npm run build      - Build for production"
