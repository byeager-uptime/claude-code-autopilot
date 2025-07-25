# Claude Code AutoPilot

Just add `--auto` to any command in Claude Code for autonomous execution with automatic testing.

**🎆 NEW: AutoPilot now uses Claude Code's official hook system for seamless integration!**

## Quick Start

**If Claude is already running** (most users):
```bash
> fix the login bug --auto
```

**If starting fresh**:
```bash
claude "fix the login bug" --auto
```

## What It Does

Adding `--auto` makes Claude:
- ✅ Fix issues and test automatically
- ✅ Ask clarifying questions first
- ✅ Roll back if tests fail

## Prerequisites

- **Claude Code** - Get it at [claude.ai/code](https://claude.ai/code)
- **Python 3** - Required for the AutoPilot hook (comes pre-installed on macOS)
- **Node.js 16+** - For the npm package

## Installation

### Step 1: Install AutoPilot
```bash
# One-time global install
npm install -g claude-code-autopilot
```

### Step 2: Setup in Your Project
```bash
# Navigate to your project
cd /path/to/your/project

# Run setup (choose one):
claude-autopilot setup      # From terminal
/autopilot-setup           # From inside Claude
```

### Step 3: Verify Installation
```bash
# Check that hooks are installed
cat ~/.claude/settings.json

# You should see:
# "hooks": {
#   "PreToolUse": [{
#     "matcher": "Bash|Task",
#     "hooks": [{"type": "command", "command": "python3 ..."}]
#   }]
# }
```

✨ **AutoPilot uses Claude Code's PreToolUse hooks** to intercept commands with `--auto` and guide Claude to work autonomously.

## Examples

```bash
# Fix a bug
> fix null pointer when user submits empty email --auto

# Add a feature  
> add dark mode toggle to settings --auto

# Improve performance
> optimize the database queries in UserService --auto

# Safe first try
> explain what changes would fix the login timeout --auto --dry-run
```

## How It Works

1. **You request**: `fix the API 500 error --auto`
2. **AutoPilot clarifies**: "Which endpoint? What error?"
3. **You specify**: "POST /users returns 500 on missing email"
4. **AutoPilot**:
   - Reproduces the bug
   - Fixes with validation
   - Runs all tests
   - Confirms fix works

## Safety

- 🛡️ **Automatic rollback** if tests fail
- 🔍 **Shows all changes** before applying
- 🎯 **Asks permission** for risky operations
- 📝 **Full audit trail** of actions taken

## New/Empty Projects

AutoPilot handles empty directories intelligently:
```bash
mkdir my-new-app
cd my-new-app
> /autopilot-setup

# Guides you through creating a Product Requirements Doc
# Future --auto commands use this context for better decisions
```

## Commands

| Command | Description |
|---------|-------------|
| `/autopilot-setup` | Setup from inside Claude |
| `--auto` | Enable autonomous execution |
| `--dry-run` | Preview without executing |

## Troubleshooting

**AutoPilot not working?**
```bash
# 1. Verify Python 3 is installed
python3 --version

# 2. Check hooks are registered
cat ~/.claude/settings.json | grep -A5 "PreToolUse"

# 3. Reinstall hooks if needed
claude-autopilot setup
```

**"Command not found" error?**
```bash
# Reinstall globally
npm install -g claude-code-autopilot

# Or use npx
npx claude-autopilot setup
```

**Hook not triggering?**
- Make sure you're using `--auto` flag
- Restart Claude Code after installation
- Check that Python path in settings.json is correct

## FAQ

**Do I need Claude Code first?**  
Yes, AutoPilot extends Claude Code. Get it at [claude.ai/code](https://claude.ai/code)

**What languages work?**  
JavaScript/TypeScript, Python, Rust, Go, and more. Auto-detected.

**Is it safe for production code?**  
Yes. AutoPilot validates all changes and rolls back failures.

**How do I remove it?**  
```bash
# Remove project config
rm -rf .claude/

# Remove global hook (edit ~/.claude/settings.json)
# Remove the AutoPilot entry from PreToolUse array
```

---

That's it. Just add `--auto` to start working autonomously. 🚀