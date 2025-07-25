# Testing AutoPilot with Claude Code Hooks

## How to Test AutoPilot

### 1. Install the Hook
```bash
node scripts/install-hooks.js
```

This installs a PreToolUse hook that intercepts commands with `--auto`.

### 2. Test Commands

Try these commands in Claude Code:

```bash
# This will trigger AutoPilot
fix the login bug --auto

# This will also trigger AutoPilot
add dark mode toggle --auto

# This won't trigger AutoPilot (no --auto flag)
fix the login bug
```

### 3. What Happens

When you use `--auto`, the hook:
1. **Blocks** the original command
2. **Provides feedback** that guides Claude to work autonomously
3. **Creates a plan** for autonomous execution
4. **Instructs Claude** to execute without asking permission

### 4. Expected Behavior

Without `--auto`:
- Claude asks for permission at each step
- Uses interactive Task() calls
- Waits for user confirmation

With `--auto`:
- Claude receives instructions to work autonomously
- Executes the entire plan without prompting
- Only reports back when complete

### 5. Verify Hook Installation

Check that the hook is installed:
```bash
cat ~/.claude/settings.json
```

You should see:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Task",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /path/to/autopilot-hook.py"
          }
        ]
      }
    ]
  }
}
```

### 6. Debug the Hook

To see what the hook returns:
```bash
echo '{"tool_name": "Bash", "tool_input": {"command": "test --auto"}}' | python3 hooks/autopilot-hook.py
```

## Important Notes

1. **Hook Location**: The hook must be accessible from the path in settings.json
2. **Python Required**: The hook requires Python 3
3. **Feedback Quality**: The effectiveness depends on how well Claude follows the autonomous instructions
4. **Not Magic**: The hook provides guidance, but Claude still makes the decisions

## Troubleshooting

### Hook Not Triggering
- Verify hook is in settings.json
- Check Python path is correct
- Ensure hook file is executable

### Claude Still Interactive
- The hook provides guidance but can't force behavior
- Claude may still choose to be interactive
- Try more specific commands

### Error Messages
- Check Claude Code logs
- Run the hook manually to test
- Verify all dependencies
