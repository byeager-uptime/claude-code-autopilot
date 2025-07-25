# Complete Installation Guide for Claude Code AutoPilot

## System Requirements

### macOS
- ✅ **Python 3**: Pre-installed on macOS 10.15+
- ✅ **Node.js 16+**: Install via [nodejs.org](https://nodejs.org) or Homebrew
- ✅ **Claude Code**: Required - get it at [claude.ai/code](https://claude.ai/code)

### Windows
- 🔧 **Python 3**: Download from [python.org](https://python.org)
- 🔧 **Node.js 16+**: Download from [nodejs.org](https://nodejs.org)
- 🔧 **Claude Code**: Required

### Linux
- 🐧 **Python 3**: Usually pre-installed, or `sudo apt install python3`
- 🐧 **Node.js 16+**: Via package manager or [NodeSource](https://github.com/nodesource/distributions)
- 🐧 **Claude Code**: Required

## Step-by-Step Installation

### 1. Verify Prerequisites

```bash
# Check Python 3
python3 --version
# Should show: Python 3.x.x

# Check Node.js
node --version
# Should show: v16.x.x or higher

# Check npm
npm --version
# Should show: 8.x.x or higher
```

### 2. Install AutoPilot Globally

```bash
# Option A: From npm registry
npm install -g claude-code-autopilot

# Option B: From GitHub (latest)
npm install -g github:byeager-uptime/claude-code-autopilot

# Verify installation
claude-autopilot --version
```

### 3. Setup AutoPilot in Your Project

```bash
# Navigate to your project
cd /path/to/your/project

# Run setup
claude-autopilot setup
```

This will:
- ✅ Detect your project type
- ✅ Configure testing agents
- ✅ Install Claude Code hooks
- ✅ Create `.claude/autopilot.json`

### 4. Verify Hook Installation

```bash
# Check global Claude settings
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

### 5. Test AutoPilot

```bash
# In Claude Code, try:
fix a simple bug --auto

# You should see:
# 🤖 AutoPilot Mode Activated!
```

## Alternative Installation Methods

### Using npx (No Global Install)

```bash
# Setup without installing globally
npx claude-code-autopilot setup
```

### From Source

```bash
# Clone the repository
git clone https://github.com/byeager-uptime/claude-code-autopilot.git
cd claude-code-autopilot

# Install dependencies
npm install

# Install globally from source
npm install -g .
```

### For Development

```bash
# Clone and link for development
git clone https://github.com/byeager-uptime/claude-code-autopilot.git
cd claude-code-autopilot
npm install
npm link

# In your project
npm link claude-code-autopilot
```

## Platform-Specific Notes

### macOS

- Python 3 path is usually `/usr/bin/python3` or `/usr/local/bin/python3`
- If using Homebrew Python: `/opt/homebrew/bin/python3` (Apple Silicon)
- Claude settings at: `~/.claude/settings.json`

### Windows

- Python 3 path might be: `C:\Python3x\python.exe`
- Use forward slashes in paths or escape backslashes
- Claude settings at: `%USERPROFILE%\.claude\settings.json`

### Linux

- Python 3 path is usually `/usr/bin/python3`
- Ensure hook script has execute permissions
- Claude settings at: `~/.claude/settings.json`

## Updating AutoPilot

```bash
# Update to latest version
npm update -g claude-code-autopilot

# Reinstall hooks after update
claude-autopilot setup
```

## Uninstalling

### Remove AutoPilot

```bash
# Uninstall global package
npm uninstall -g claude-code-autopilot

# Remove project config
rm -rf .claude/autopilot.json
```

### Remove Hooks

1. Edit `~/.claude/settings.json`
2. Remove the AutoPilot entry from the `PreToolUse` array
3. Save the file

## Common Issues

### "python3: command not found"

- Install Python 3 from [python.org](https://python.org)
- Or use your package manager

### "Hook not triggering"

1. Restart Claude Code
2. Verify `--auto` flag is included
3. Check Python path in settings.json
4. Run `claude-autopilot setup` again

### "Permission denied"

```bash
# Fix permissions
chmod +x ~/.claude/hooks/autopilot-hook.py
```

### "Module not found"

```bash
# Reinstall with dependencies
npm install -g claude-code-autopilot --force
```

## Getting Help

- 📖 [Documentation](https://github.com/byeager-uptime/claude-code-autopilot)
- 🐛 [Report Issues](https://github.com/byeager-uptime/claude-code-autopilot/issues)
- 💬 [Discussions](https://github.com/byeager-uptime/claude-code-autopilot/discussions)

## Next Steps

Once installed, try these commands:

```bash
# Fix issues autonomously
fix the login error --auto

# Add features autonomously
add user profile page --auto

# Run tests autonomously
test the API endpoints --auto
```

Remember: Just add `--auto` to work autonomously! 🚀
