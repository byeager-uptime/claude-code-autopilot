#!/usr/bin/env node

/**
 * Improved AutoPilot hooks installer for Claude Code
 * This properly configures hooks in both user and project settings
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

console.log(chalk.blue('🔧 Installing AutoPilot Hooks with proper Claude Code integration...\n'));

async function installHooks() {
  // Paths
  const claudeDir = path.join(os.homedir(), '.claude');
  const userSettingsPath = path.join(claudeDir, 'settings.json');
  const projectDir = path.join(process.cwd(), '.claude');
  const projectSettingsPath = path.join(projectDir, 'settings.json');
  const projectLocalSettingsPath = path.join(projectDir, 'settings.local.json');
  const hookScriptPath = path.join(__dirname, '..', 'hooks', 'autopilot-hook.py');
  
  // Ensure directories exist
  await fs.ensureDir(claudeDir);
  await fs.ensureDir(projectDir);
  
  // Make hook script executable
  await fs.chmod(hookScriptPath, '755');
  
  // Step 1: Install user-level hooks for global AutoPilot support
  console.log(chalk.yellow('📝 Configuring user-level hooks...'));
  let userSettings = {};
  if (await fs.pathExists(userSettingsPath)) {
    userSettings = await fs.readJson(userSettingsPath);
  }
  
  // Ensure hooks structure exists
  if (!userSettings.hooks) {
    userSettings.hooks = {};
  }
  if (!userSettings.hooks.PreToolUse) {
    userSettings.hooks.PreToolUse = [];
  }
  
  // Check if AutoPilot hook already exists
  const existingHook = userSettings.hooks.PreToolUse.find(
    h => h.hooks && h.hooks[0] && h.hooks[0].command && h.hooks[0].command.includes('autopilot-hook.py')
  );
  
  if (existingHook) {
    console.log(chalk.yellow('  ⚠️  AutoPilot hook already installed in user settings'));
  } else {
    // Add AutoPilot hook
    const autoPilotHook = {
      "matcher": "Bash|Task",
      "hooks": [
        {
          "type": "command",
          "command": `python3 ${hookScriptPath}`
        }
      ]
    };
    
    userSettings.hooks.PreToolUse.push(autoPilotHook);
    
    // Save settings
    await fs.writeJson(userSettingsPath, userSettings, { spaces: 2 });
    console.log(chalk.green('  ✓ Installed AutoPilot hook to user settings'));
  }
  
  // Step 2: Create project-specific hooks and configuration
  console.log(chalk.yellow('\n📝 Creating project-specific configuration...'));
  
  // Create settings.local.json for project-specific hooks
  let projectLocalSettings = {};
  if (await fs.pathExists(projectLocalSettingsPath)) {
    projectLocalSettings = await fs.readJson(projectLocalSettingsPath);
  }
  
  // Add project hooks
  if (!projectLocalSettings.hooks) {
    projectLocalSettings.hooks = {};
  }
  
  // Add pre-submit hook to suggest --auto usage
  projectLocalSettings.hooks["user-prompt-submit"] = [
    {
      "matcher": ".*",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-submit.sh"
        }
      ]
    }
  ];
  
  // Add edit hook to warn about sensitive files
  projectLocalSettings.hooks["Edit"] = [
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-edit.sh"
        }
      ]
    }
  ];
  
  // Add Git hooks
  if (!projectLocalSettings.hooks["Bash"]) {
    projectLocalSettings.hooks["Bash"] = [];
  }
  
  projectLocalSettings.hooks["Bash"].push(
    {
      "matcher": "Bash\\(git commit.*\\)",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-commit.sh"
        }
      ]
    },
    {
      "matcher": "Bash\\(git push.*\\)",
      "hooks": [
        {
          "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pre-push.sh"
        }
      ]
    }
  );
  
  await fs.writeJson(projectLocalSettingsPath, projectLocalSettings, { spaces: 2 });
  console.log(chalk.green('  ✓ Created project-specific hooks configuration'));
  
  // Step 3: Create hook scripts
  console.log(chalk.yellow('\n📝 Creating hook scripts...'));
  const hooksDir = path.join(projectDir, 'hooks');
  await fs.ensureDir(hooksDir);
  
  // Create pre-submit hook
  const preSubmitHook = `#!/bin/bash
# Claude Code AutoPilot - Pre-submit Hook
# Analyzes user prompts and suggests autopilot usage when appropriate

# Read the JSON input from stdin
input=$(cat)

# Extract the prompt from the JSON (simplified extraction)
prompt=$(echo "$input" | grep -o '"prompt":"[^"]*' | sed 's/"prompt":"//')

# Check if the prompt contains keywords that suggest AutoPilot could help
if echo "$prompt" | grep -qiE "(fix|debug|resolve|error|bug|test|implement|add|create|refactor|optimize)" && ! echo "$prompt" | grep -qi "\\-\\-auto"; then
    echo "💡 Tip: You can add '--auto' to automatically run tests and checks with AutoPilot agents!" >&2
fi

# Always allow the command to proceed
exit 0`;
  
  await fs.writeFile(path.join(hooksDir, 'pre-submit.sh'), preSubmitHook);
  await fs.chmod(path.join(hooksDir, 'pre-submit.sh'), '755');
  console.log(chalk.green('  ✓ Created pre-submit.sh'));
  
  // Create pre-edit hook
  const preEditHook = `#!/bin/bash
# Claude Code AutoPilot - Pre-edit Hook
# Checks for potential issues before editing files

# Read the JSON input from stdin
input=$(cat)

# Extract file path from the JSON
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*' | sed 's/"file_path":"//')

# Check if editing critical files
if echo "$file_path" | grep -qE "(\\.env|config\\.json|database\\.json|secrets|credentials)"; then
    echo "⚠️  Warning: Editing sensitive file. Please ensure no secrets are exposed." >&2
fi

# Check if file has tests
if echo "$file_path" | grep -qE "\\.(ts|tsx|js|jsx)$" && ! echo "$file_path" | grep -qE "\\.(test|spec)\\."; then
    test_file=$(echo "$file_path" | sed -E 's/\\.(ts|tsx|js|jsx)$/.test.\\1/')
    if [ ! -f "$test_file" ]; then
        echo "📝 Note: No test file found for $file_path. Consider adding tests." >&2
    fi
fi

# Always allow the edit to proceed
exit 0`;
  
  await fs.writeFile(path.join(hooksDir, 'pre-edit.sh'), preEditHook);
  await fs.chmod(path.join(hooksDir, 'pre-edit.sh'), '755');
  console.log(chalk.green('  ✓ Created pre-edit.sh'));
  
  // Create pre-commit hook
  const preCommitHook = `#!/bin/bash
# Claude Code AutoPilot - Pre-commit Hook
# Automatically runs linting and type checking before commits

echo "🔧 Running Claude Code AutoPilot pre-commit checks..."

# Run linter if available
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
    echo "📝 Running linter..."
    npm run lint
    LINT_EXIT=$?
    
    if [ $LINT_EXIT -ne 0 ]; then
        echo "❌ Linting failed. Please fix the errors before committing."
        exit 1
    fi
fi

# Run type checker if available
if [ -f "tsconfig.json" ] || [ -f "package.json" ] && grep -q '"typecheck"' package.json; then
    echo "🔍 Running type checker..."
    if grep -q '"typecheck"' package.json; then
        npm run typecheck
    else
        npx tsc --noEmit
    fi
    TYPE_EXIT=$?
    
    if [ $TYPE_EXIT -ne 0 ]; then
        echo "❌ Type checking failed. Please fix the errors before committing."
        exit 1
    fi
fi

echo "✅ All pre-commit checks passed!"
exit 0`;
  
  await fs.writeFile(path.join(hooksDir, 'pre-commit.sh'), preCommitHook);
  await fs.chmod(path.join(hooksDir, 'pre-commit.sh'), '755');
  console.log(chalk.green('  ✓ Created pre-commit.sh'));
  
  // Create pre-push hook
  const prePushHook = `#!/bin/bash
# Claude Code AutoPilot - Pre-push Hook
# Automatically runs tests and security checks before pushing

echo "🚀 Running Claude Code AutoPilot pre-push checks..."

# Run tests if available
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "🧪 Running tests..."
    npm test
    TEST_EXIT=$?
    
    if [ $TEST_EXIT -ne 0 ]; then
        echo "❌ Tests failed. Please fix the failing tests before pushing."
        exit 1
    fi
fi

# Run security audit (non-blocking)
if [ -f "package.json" ]; then
    echo "🔒 Running security audit..."
    npm audit || echo "⚠️  Security vulnerabilities found. Consider running 'npm audit fix' to resolve them."
fi

echo "✅ Pre-push checks completed!"
exit 0`;
  
  await fs.writeFile(path.join(hooksDir, 'pre-push.sh'), prePushHook);
  await fs.chmod(path.join(hooksDir, 'pre-push.sh'), '755');
  console.log(chalk.green('  ✓ Created pre-push.sh'));
  
  // Step 4: Create AutoPilot configuration
  console.log(chalk.yellow('\n📝 Creating AutoPilot configuration...'));
  
  const autopilotConfig = {
    "version": "1.0.0",
    "projectType": "Auto-detected",
    "description": "AutoPilot configuration for autonomous execution",
    "agents": {
      "test-runner": {
        "enabled": true,
        "type": "test-runner",
        "description": "Runs project tests",
        "commands": {
          "test": "npm test"
        }
      },
      "linter": {
        "enabled": true,
        "type": "linter",
        "description": "Runs code quality checks",
        "commands": {
          "lint": "npm run lint",
          "fix": "npm run lint -- --fix"
        }
      },
      "type-checker": {
        "enabled": true,
        "type": "type-checker",
        "description": "Runs type checking",
        "commands": {
          "check": "npm run typecheck || npx tsc --noEmit"
        }
      },
      "security-scanner": {
        "enabled": true,
        "type": "security-scanner",
        "description": "Scans for security vulnerabilities",
        "commands": {
          "audit": "npm audit",
          "fix": "npm audit fix"
        }
      }
    },
    "hooks": {
      "pre-commit": {
        "enabled": true,
        "actions": [
          {
            "agent": "linter",
            "command": "lint",
            "stopOnError": true
          },
          {
            "agent": "type-checker",
            "command": "check",
            "stopOnError": true
          }
        ]
      },
      "pre-push": {
        "enabled": true,
        "actions": [
          {
            "agent": "test-runner",
            "command": "test",
            "stopOnError": true
          },
          {
            "agent": "security-scanner",
            "command": "audit",
            "stopOnError": false
          }
        ]
      }
    },
    "autoFix": {
      "enabled": true,
      "strategies": {
        "lintErrors": {
          "autoFix": true,
          "agent": "linter",
          "command": "fix"
        }
      }
    }
  };
  
  await fs.writeJson(path.join(projectDir, 'autopilot.json'), autopilotConfig, { spaces: 2 });
  console.log(chalk.green('  ✓ Created autopilot.json'));
  
  // Step 5: Test the installation
  console.log(chalk.blue('\n🧪 Testing hook installation...'));
  
  // Test pre-submit hook
  try {
    const { execSync } = require('child_process');
    const testResult = execSync(
      `echo '{"prompt":"fix the login bug"}' | ${path.join(hooksDir, 'pre-submit.sh')}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    console.log(chalk.green('  ✓ Pre-submit hook working correctly'));
  } catch (error) {
    if (error.stderr && error.stderr.includes('Tip:')) {
      console.log(chalk.green('  ✓ Pre-submit hook working correctly'));
    } else {
      console.log(chalk.yellow('  ⚠️  Pre-submit hook test failed'));
    }
  }
  
  // Show summary
  console.log(chalk.green('\n✅ AutoPilot hooks installed successfully!'));
  console.log(chalk.blue('\n📋 What was configured:'));
  console.log(chalk.gray('  • User-level AutoPilot hook for --auto flag'));
  console.log(chalk.gray('  • Project-specific hooks for Git operations'));
  console.log(chalk.gray('  • Pre-submit hook to suggest --auto usage'));
  console.log(chalk.gray('  • Pre-edit hook for sensitive file warnings'));
  console.log(chalk.gray('  • Pre-commit and pre-push hooks for validation'));
  
  console.log(chalk.yellow('\n💡 Usage:'));
  console.log(chalk.gray('  • Add --auto to any command: fix the bug --auto'));
  console.log(chalk.gray('  • Git hooks will run automatically on commit/push'));
  console.log(chalk.gray('  • Edit hooks will warn about sensitive files'));
  
  console.log(chalk.blue('\n📁 Created files:'));
  console.log(chalk.gray(`  • ${projectLocalSettingsPath}`));
  console.log(chalk.gray(`  • ${path.join(projectDir, 'autopilot.json')}`));
  console.log(chalk.gray(`  • ${path.join(hooksDir, '*.sh')}`));
}

// Run installation
installHooks().catch(error => {
  console.error(chalk.red('❌ Installation failed:'), error);
  process.exit(1);
});