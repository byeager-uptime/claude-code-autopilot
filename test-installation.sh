#!/bin/bash

# AutoPilot Installation Test Script
# This verifies that AutoPilot is properly installed and configured

set -e

echo "🧪 Testing AutoPilot Installation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Test function
test_item() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# 1. Test Python 3
test_item "Python 3" "python3 --version"

# 2. Test Node.js
test_item "Node.js" "node --version"

# 3. Test npm
test_item "npm" "npm --version"

# 4. Test AutoPilot command
test_item "AutoPilot CLI" "which claude-autopilot"

# 5. Test AutoPilot version
test_item "AutoPilot version" "claude-autopilot --version"

# 6. Test Claude settings file
test_item "Claude settings" "test -f ~/.claude/settings.json"

# 7. Test hook registration
echo -n "Testing hook registration... "
if grep -q "autopilot-hook.py" ~/.claude/settings.json 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# 8. Test hook script
echo -n "Testing hook script... "
HOOK_PATH=$(grep -o 'python3 [^"]*autopilot-hook.py' ~/.claude/settings.json 2>/dev/null | cut -d' ' -f2)
if [ -n "$HOOK_PATH" ] && [ -f "$HOOK_PATH" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Hook script not found at expected path"
    ((FAILED++))
fi

# 9. Test hook execution
echo -n "Testing hook execution... "
if echo '{"tool_name": "Bash", "tool_input": {"command": "test --auto"}}' | python3 "$HOOK_PATH" 2>/dev/null | grep -q "AutoPilot Mode Activated"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# 10. Test project config
echo -n "Testing project config... "
if [ -f ".claude/autopilot.json" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - No project config (run 'claude-autopilot setup')"
fi

echo ""
echo "=============================="
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=============================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! AutoPilot is ready to use.${NC}"
    echo ""
    echo "Try it out:"
    echo "  fix a bug --auto"
    echo "  add a feature --auto"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the installation.${NC}"
    echo ""
    echo "To fix:"
    echo "  1. Run: npm install -g claude-code-autopilot"
    echo "  2. Run: claude-autopilot setup"
    echo "  3. Restart Claude Code"
    exit 1
fi
