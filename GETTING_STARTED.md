# Getting Started with Claude Code AutoPilot 🚀

## What is AutoPilot?

AutoPilot is an extension for Claude Code that makes Claude **autonomous** - it can make changes, test them, and verify they work WITHOUT constantly asking you for permission.

## 🎯 The Key Concept: Just Add --auto

**You still use Claude Code exactly the same way, just add `--auto` at the end!**

```bash
# Without AutoPilot (normal Claude):
claude "fix the login bug"
# Claude: "I found the issue. Should I fix it?" 
# You: "Yes"
# Claude: "Fixed. Please test it."
# You: [manually test]

# With AutoPilot (add --auto):
claude "fix the login bug" --auto
# AutoPilot: Reproduces bug → Fixes it → Tests it → Verifies → "✅ Fixed!"
```

## 📋 Installation Instructions

### 1️⃣ Install AutoPilot Once (Global)

```bash
# Install globally - this works for ALL projects on your Mac
npm install -g claude-code-autopilot

# Verify it worked
claude-autopilot --version
# Should show: 1.0.0
```

### 2️⃣ Setup in Each Project

**IMPORTANT**: You need to run setup once in each project you want to use AutoPilot with.

```bash
# Go to your project
cd ~/Development/my-react-app

# Run setup (takes 10 seconds)
claude-autopilot setup

# You'll see:
# ✅ Detected: javascript project
# ✅ Configured 5 testing agents
# ✅ AutoPilot ready!
```

### 3️⃣ Start Using --auto

Now just add `--auto` to any Claude command:

```bash
# Examples:
claude "add a loading spinner to the submit button" --auto
claude "fix the null pointer error in UserProfile.js" --auto
claude "make the API endpoint faster" --auto
claude "add proper error handling to the login form" --auto
```

## 🤔 What to Expect When Using --auto

### 1. Clarification Questions

```
You: claude "fix the API" --auto
AutoPilot: "Which API endpoint is having issues? What error are you seeing?"
You: "POST /users returns 500 when email is missing"
AutoPilot: "Got it, let me reproduce and fix that..."
```

### 2. Issue Reproduction

AutoPilot will actually run your code to confirm the bug exists:
```
AutoPilot: "Reproducing the issue..."
AutoPilot: "✅ Confirmed: POST /users returns 500 when email field is null"
```

### 3. Automatic Implementation

No more "Should I proceed?" - AutoPilot just does it:
```
AutoPilot: "Applying fix with email validation..."
AutoPilot: "✅ Fix implemented"
```

### 4. Multi-Agent Testing

AutoPilot runs multiple specialized tests:
```
Running validation...
✅ Unit Tests: All 47 tests passing
✅ GUI Tests: Form validation working correctly
✅ API Tests: POST /users now returns 400 for missing email
✅ Security: Input validation secure
```

### 5. Proof of Fix

AutoPilot proves the specific issue is resolved:
```
✅ Original issue fixed!
- Before: POST /users with no email → 500 error
- After: POST /users with no email → 400 validation error
- Tests: All passing
```

## 📱 Common Scenarios

### Scenario 1: Bug Fix
```bash
claude "users report the app crashes when they click submit without filling the form" --auto

# AutoPilot will:
# 1. Ask which form and what kind of crash
# 2. Reproduce the crash
# 3. Add proper validation
# 4. Test all edge cases
# 5. Verify crash is gone
```

### Scenario 2: Feature Addition
```bash
claude "add a dark mode toggle to the settings page" --auto

# AutoPilot will:
# 1. Ask about styling preferences
# 2. Implement the toggle
# 3. Test visual changes
# 4. Verify accessibility
# 5. Ensure persistence works
```

### Scenario 3: Performance
```bash
claude "the user list page is loading too slowly" --auto

# AutoPilot will:
# 1. Measure current performance
# 2. Identify bottlenecks
# 3. Apply optimizations
# 4. Verify improvements
# 5. Show before/after metrics
```

## ⚠️ Important Things to Know

### 1. AutoPilot is NOT a Replacement
- You still use the `claude` command
- AutoPilot is an enhancement via the `--auto` flag
- Without `--auto`, Claude works normally

### 2. One Setup Per Project
```bash
# Each project needs setup:
cd ~/project-1 && claude-autopilot setup
cd ~/project-2 && claude-autopilot setup
# etc...
```

### 3. AutoPilot Asks Questions
- It won't guess what you want
- It clarifies ambiguous requests
- It confirms understanding before starting

### 4. Rollback Protection
- If tests fail, changes are reverted
- Your code is always safe
- You'll see clear error messages

### 5. It's Still Claude
- All Claude commands work
- Just add `--auto` for autonomous mode
- Remove `--auto` for normal interactive mode

## 🎉 You're Ready!

1. ✅ AutoPilot installed globally
2. ✅ Run `claude-autopilot setup` in your project
3. ✅ Use `claude "your request" --auto`
4. ✅ Watch AutoPilot work autonomously!

## 💡 Pro Tips

- **Be specific**: "fix login bug" → "fix login crash when email is empty"
- **Let it clarify**: Answer AutoPilot's questions for better results
- **Trust the tests**: AutoPilot runs comprehensive validation
- **Check the evidence**: AutoPilot shows before/after proof

---

**Remember**: It's just Claude + `--auto` = Autonomous execution! 🚀