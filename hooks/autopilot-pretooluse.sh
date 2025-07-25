#!/bin/bash

# AutoPilot PreToolUse Hook
# This intercepts commands with --auto flag and handles them autonomously

# Read the hook input from stdin
INPUT=$(cat)

# Extract tool name and input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // {}')

# Check if this is a command with --auto flag
if [[ "$TOOL_NAME" == "Bash" ]] || [[ "$TOOL_NAME" == "Task" ]]; then
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // .prompt // ""')
    
    if [[ "$COMMAND" == *"--auto"* ]]; then
        echo "🤖 AutoPilot intercepting command: $COMMAND" >&2
        
        # Remove --auto flag for processing
        CLEAN_COMMAND=$(echo "$COMMAND" | sed 's/--auto//g' | xargs)
        
        # Load AutoPilot configuration
        CONFIG_FILE="$PWD/.claude/autopilot.json"
        if [[ ! -f "$CONFIG_FILE" ]]; then
            echo "⚠️  AutoPilot not configured. Run /autopilot-setup first." >&2
            exit 0
        fi
        
        # Parse the command to understand intent
        if [[ "$CLEAN_COMMAND" == *"fix"* ]]; then
            echo "🔧 AutoPilot Mode: Fix Issue" >&2
            echo "📋 Plan:" >&2
            echo "  1. Identify the issue" >&2
            echo "  2. Reproduce the problem" >&2
            echo "  3. Implement fix" >&2
            echo "  4. Run tests" >&2
            
            # Block the original command and provide instructions
            cat <<EOF
{
  "action": "block",
  "feedback": "AutoPilot is handling this autonomously. Instead of using interactive mode:\n\n1. Search for files related to: ${CLEAN_COMMAND}\n2. Read and analyze the code\n3. Make necessary fixes\n4. Run tests to verify\n\nProceed without asking for permission at each step."
}
EOF
            exit 0
            
        elif [[ "$CLEAN_COMMAND" == *"add"* ]] || [[ "$CLEAN_COMMAND" == *"implement"* ]]; then
            echo "✨ AutoPilot Mode: Add Feature" >&2
            echo "📋 Plan:" >&2
            echo "  1. Design the feature" >&2
            echo "  2. Implement the code" >&2
            echo "  3. Add tests" >&2
            echo "  4. Update documentation" >&2
            
            cat <<EOF
{
  "action": "block",
  "feedback": "AutoPilot is handling this autonomously. For feature: ${CLEAN_COMMAND}\n\n1. Analyze existing code structure\n2. Create necessary files\n3. Implement the feature\n4. Add comprehensive tests\n5. Run validation\n\nExecute all steps without interactive prompts."
}
EOF
            exit 0
            
        elif [[ "$CLEAN_COMMAND" == *"test"* ]]; then
            echo "🧪 AutoPilot Mode: Testing" >&2
            
            cat <<EOF
{
  "action": "block",
  "feedback": "AutoPilot testing mode. Execute these commands in sequence:\n\n1. npm test (or appropriate test command)\n2. npm run lint\n3. npm run typecheck\n\nRun all tests and report results without asking for permission."
}
EOF
            exit 0
        fi
    fi
fi

# Let other commands pass through
exit 0
