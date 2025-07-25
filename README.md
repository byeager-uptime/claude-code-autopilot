# Claude Code AutoPilot

Just add `--auto` to any command in Claude Code for autonomous execution with automatic testing.

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

## Installation

```bash
# One-time global install
npm install -g claude-code-autopilot

# In your project (once per project)
claude-autopilot setup
# OR from inside Claude: /autopilot-setup
```

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

## FAQ

**Do I need Claude Code first?**  
Yes, AutoPilot extends Claude Code. Get it at [claude.ai/code](https://claude.ai/code)

**What languages work?**  
JavaScript/TypeScript, Python, Rust, Go, and more. Auto-detected.

**Is it safe for production code?**  
Yes. AutoPilot validates all changes and rolls back failures.

**How do I remove it?**  
Delete `.claude/` folder from your project.

---

That's it. Just add `--auto` to start working autonomously. 🚀