# Claude Code AutoPilot

**If Claude is running, just add `--auto` to any command.** That's it. Really.

## What is AutoPilot?

AutoPilot transforms Claude from an assistant into an autonomous partner. Instead of waiting for your approval at every step, Claude completes entire workflows independently—then shows you what was done.

### The Magic of `--auto`

```bash
# Without AutoPilot (lots of back-and-forth)
/implement user authentication

# With AutoPilot (Claude handles everything)
/implement user authentication --auto
```

## Your First AutoPilot Experience

Let's start with something simple and safe:

```bash
/analyze src/components --auto
```

Claude will:
- 🔍 Scan all your components
- 📊 Create a comprehensive analysis
- 📝 Save the report for you
- ✅ Show you everything that was done

**No surprises, no overwrites, just helpful automation.**

## When Should I Use AutoPilot?

### Perfect for AutoPilot ✨
- **Analysis & Reports**: `/analyze --auto`, `/document --auto`
- **Testing**: `/test --auto` 
- **Safe Improvements**: `/improve --safe-mode --auto`
- **Build Tasks**: `/build --auto` (new files only)

### Use With Caution ⚡
- **Major Refactoring**: `/refactor --auto` (consider `--dry-run` first)
- **System-wide Changes**: Add `--validate` for extra safety
- **Production Code**: Always use `--safe-mode --auto`

### Think Twice 🤔
- Deleting files (AutoPilot won't do this anyway)
- Changing critical infrastructure
- Anything you're not comfortable reviewing after

## Building Confidence

### Start Small
```bash
# 1. Try a read-only command first
/explain architecture --auto

# 2. Then something that creates new files
/test UserService --auto

# 3. Finally, try improvements with safety on
/improve Button.tsx --safe-mode --auto
```

### Safety Features That Protect You

AutoPilot includes multiple safety layers:

- **🛡️ No Destructive Actions**: Won't delete files or remove code
- **📸 Snapshot Before Changes**: Can rollback if needed
- **✅ Validation Steps**: Runs tests and checks before finishing
- **📋 Detailed Logs**: See exactly what was done and why

### The `--dry-run` Safety Net

Not sure what AutoPilot will do? Preview it first:

```bash
/improve src/ --auto --dry-run
```

This shows you the plan without making any changes. Perfect for building trust!

## Power User Features

Once you're comfortable, unlock more capabilities:

### Batch Operations
```bash
# Analyze multiple directories
/analyze src/ tests/ docs/ --auto

# Generate tests for all services
/test services/**/*Service.ts --auto
```

### Smart Context
```bash
# AutoPilot remembers your project structure
/implement dark mode --auto
# Claude knows your existing theme system!
```

### Progressive Enhancement
```bash
# Start conservative
/improve --safe-mode --auto

# Get more aggressive
/improve --performance --auto

# Go all in (with validation)
/improve --comprehensive --validate --auto
```

## Common Questions

### "What if it makes a mistake?"

Every AutoPilot session creates a detailed log. You can:
- Review all changes before committing
- Rollback with included snapshots
- Use `--safe-mode` for extra caution

### "How do I know what it did?"

AutoPilot always ends with a summary:
```
✅ AutoPilot Complete!

Created:
  - src/auth/LoginForm.tsx
  - src/auth/auth.service.ts
  - tests/auth/login.test.ts

Modified:
  - src/App.tsx (added auth provider)
  - package.json (added dependencies)

Tests: ✅ All passing
Lint: ✅ No issues
```

### "Can I customize its behavior?"

Absolutely! AutoPilot respects all flags:
```bash
# Your style preferences
/implement header --auto --style minimal --no-animations

# Your safety preferences  
/improve --auto --safe-mode --validate --max-changes 5
```

## The AutoPilot Mindset

Think of AutoPilot as a trusted junior developer who:
- ✅ Follows your project's patterns
- ✅ Writes tests for their code
- ✅ Documents their work
- ✅ Asks for help when unsure (falls back to interactive mode)

## Quick Reference

| Command | What Happens | Trust Level |
|---------|--------------|-------------|
| `/analyze --auto` | Generates reports | ⭐⭐⭐⭐⭐ Very Safe |
| `/test --auto` | Creates test files | ⭐⭐⭐⭐⭐ Very Safe |
| `/document --auto` | Writes documentation | ⭐⭐⭐⭐⭐ Very Safe |
| `/build --auto` | Creates new features | ⭐⭐⭐⭐ Safe |
| `/improve --safe-mode --auto` | Careful improvements | ⭐⭐⭐⭐ Safe |
| `/improve --auto` | Standard improvements | ⭐⭐⭐ Use with review |
| `/refactor --auto` | Major changes | ⭐⭐ Review carefully |

## Your Journey with AutoPilot

1. **Day 1**: Try `/analyze --auto` - completely safe, shows AutoPilot's capabilities
2. **Week 1**: Use for testing and documentation - build trust with read/create operations  
3. **Week 2**: Enable for improvements with `--safe-mode` - let it help with real work
4. **Month 1**: Remove training wheels - use for complex workflows, trust the validation

## Get Started Now

Ready? Try this completely safe command:

```bash
/analyze --auto
```

Claude will analyze your project and show you exactly what AutoPilot can do. No changes, no risks, just insights.

**Remember: If Claude is running, just add `--auto`. It's that simple.**

---

*Pro tip: Start every session with `/status` to see if AutoPilot is available and which safety features are active.*