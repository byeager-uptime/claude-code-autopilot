---
name: autopilot-setup
version: 1.0.0
author: Claude Code AutoPilot
description: Setup AutoPilot for the current project from within Claude Code
category: setup
keywords: [autopilot, setup, configuration, install]
---

# /autopilot-setup

Setup Claude Code AutoPilot for the current project directly from within Claude.

## Usage

```
/autopilot-setup
```

## What it does

1. Detects your project type (JavaScript, Python, Rust, Go, etc.)
2. Configures appropriate testing agents
3. Creates `.claude/autopilot.json` configuration
4. Installs necessary hooks
5. Validates the installation

## Example

```
> /autopilot-setup

🔧 Setting up Claude Code AutoPilot...
✅ Detected: React project
✅ Configured 5 testing agents
✅ Created .claude/autopilot.json
✅ AutoPilot ready!

Now you can use: fix the bug --auto
```

## After Setup

Once setup is complete, just add `--auto` to any command:
- `fix the login bug --auto`
- `add loading spinner --auto`
- `optimize the API --auto`