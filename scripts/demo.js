const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * AutoPilot Demo - Creates a sample project and demonstrates AutoPilot capabilities
 */

async function runDemo() {
  console.log(chalk.blue('🎬 Claude Code AutoPilot Demo\n'));
  
  const demoDir = path.join(process.cwd(), 'autopilot-demo');
  
  // Clean up any existing demo
  if (await fs.pathExists(demoDir)) {
    await fs.remove(demoDir);
  }
  
  // Create demo project
  await createDemoProject(demoDir);
  
  // Run demo scenarios
  process.chdir(demoDir);
  
  console.log(chalk.blue('\n🚀 Running demo scenarios...\n'));
  
  await demoScenario1_BugFix();
  await demoScenario2_FeatureAddition();
  await demoScenario3_ValidationFailure();
  
  console.log(chalk.green('\n✅ Demo completed!'));
  console.log(chalk.blue('\n📁 Demo project created at:'), demoDir);
  console.log(chalk.blue('💡 Try running AutoPilot commands in the demo directory:'));
  console.log(chalk.white('  cd autopilot-demo'));
  console.log(chalk.white('  claude "add error handling to the login function" --auto'));
  console.log(chalk.white('  claude "make the button more accessible" --auto'));
}

async function createDemoProject(demoDir) {
  console.log(chalk.yellow('📁 Creating demo project...'));
  
  await fs.ensureDir(demoDir);
  
  // Create package.json
  const packageJson = {
    name: 'autopilot-demo',
    version: '1.0.0',
    description: 'Demo project for Claude Code AutoPilot',
    scripts: {
      test: 'jest',
      lint: 'eslint src/',
      build: 'webpack --mode=production'
    },
    devDependencies: {
      jest: '^29.0.0',
      eslint: '^8.0.0',
      playwright: '^1.40.0'
    },
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    }
  };
  
  await fs.writeJson(path.join(demoDir, 'package.json'), packageJson, { spaces: 2 });
  
  // Create sample React component with intentional bug
  const componentCode = `import React, { useState } from 'react';

export function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // BUG: No null checking on email
    if (email.trim() === '') {
      alert('Email is required');
      return;
    }
    
    setLoading(true);
    await onSubmit({ email, password });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      {/* Missing loading state on button */}
      <button type="submit">
        Login
      </button>
    </form>
  );
}`;

  await fs.ensureDir(path.join(demoDir, 'src'));
  await fs.writeFile(path.join(demoDir, 'src', 'LoginForm.jsx'), componentCode);
  
  // Create test file
  const testCode = `import { render, fireEvent, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should handle form submission', () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    expect(mockSubmit).toHaveBeenCalled();
  });
  
  // This test will fail initially - demonstrates validation
  it('should show loading state when submitting', () => {
    const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<LoginForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });
});`;

  await fs.writeFile(path.join(demoDir, 'src', 'LoginForm.test.jsx'), testCode);
  
  // Create AutoPilot configuration
  await fs.ensureDir(path.join(demoDir, '.claude'));
  
  const autopilotConfig = {
    autopilot: {
      enabled: true,
      confidence_threshold: 80,
      validation_timeout: 30,
      auto_rollback: true,
      require_reproduction: true,
      
      agents: {
        'unit-test': { enabled: true },
        'gui-test': { enabled: true },
        'integration-test': { enabled: false },
        'performance-test': { enabled: false },
        'security-test': { enabled: true }
      },
      
      project: {
        type: 'javascript',
        frameworks: ['react'],
        test_command: 'npm test',
        lint_command: 'npm run lint',
        build_command: 'npm run build'
      }
    }
  };
  
  await fs.writeJson(path.join(demoDir, '.claude', 'autopilot.json'), autopilotConfig, { spaces: 2 });
  
  console.log(chalk.green('  ✅ Demo project created'));
}

async function demoScenario1_BugFix() {
  console.log(chalk.blue('📋 Scenario 1: Bug Fix with Issue Verification'));
  console.log(chalk.gray('  Simulating: claude "fix the null pointer error in email validation" --auto\n'));
  
  // Simulate the AutoPilot process
  console.log(chalk.yellow('🔍 AutoPilot: Analyzing request...'));
  await sleep(1000);
  
  console.log(chalk.blue('❓ AutoPilot: I see a null pointer error mention. Can you show me the specific error or describe when it occurs?'));
  await sleep(1000);
  
  console.log(chalk.white('👤 User: When users submit form without entering email, it crashes'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔄 AutoPilot: Reproducing the issue...'));
  await sleep(2000);
  
  console.log(chalk.green('✅ AutoPilot: Issue reproduced - null reference when email is null'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔧 AutoPilot: Applying fix with null checking...'));
  await sleep(2000);
  
  console.log(chalk.yellow('🧪 AutoPilot: Running multi-agent validation...'));
  console.log(chalk.green('  ✅ Unit Test Agent: All tests passing'));
  console.log(chalk.green('  ✅ GUI Test Agent: Form validation working correctly'));
  console.log(chalk.green('  ✅ Security Agent: Input sanitization verified'));
  await sleep(2000);
  
  console.log(chalk.yellow('🎯 AutoPilot: Verifying original issue is resolved...'));
  await sleep(1000);
  
  console.log(chalk.green('✅ AutoPilot: Null pointer error fixed! Confirmed the specific issue is resolved.\n'));
}

async function demoScenario2_FeatureAddition() {
  console.log(chalk.blue('📋 Scenario 2: Feature Addition with GUI Testing'));
  console.log(chalk.gray('  Simulating: claude "add loading spinner to login button" --auto\n'));
  
  console.log(chalk.yellow('🔍 AutoPilot: Analyzing request...'));
  await sleep(1000);
  
  console.log(chalk.blue('❓ AutoPilot: Should the spinner appear immediately on click, or after a delay? What should happen to button text?'));
  await sleep(1000);
  
  console.log(chalk.white('👤 User: Immediately on click, button should be disabled and show spinner instead of text'));
  await sleep(1000);
  
  console.log(chalk.green('✅ AutoPilot: Requirements clear. Confidence: 88%'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔧 AutoPilot: Implementing loading state with spinner...'));
  await sleep(2000);
  
  console.log(chalk.yellow('🧪 AutoPilot: Running multi-agent validation...'));
  console.log(chalk.green('  ✅ Unit Test Agent: Component state tests passing'));
  console.log(chalk.green('  ✅ GUI Test Agent: Visual regression baseline updated'));
  console.log(chalk.green('  ✅ GUI Test Agent: Interaction tests confirm button states'));
  console.log(chalk.green('  ✅ Security Agent: No accessibility issues detected'));
  await sleep(3000);
  
  console.log(chalk.green('✅ AutoPilot: Loading spinner implemented with full accessibility support!\n'));
}

async function demoScenario3_ValidationFailure() {
  console.log(chalk.blue('📋 Scenario 3: Validation Failure with Rollback'));
  console.log(chalk.gray('  Simulating: claude "optimize component performance" --auto\n'));
  
  console.log(chalk.yellow('🔍 AutoPilot: Analyzing request...'));
  await sleep(1000);
  
  console.log(chalk.blue('❓ AutoPilot: What specific performance issue are you seeing? Slow rendering, memory usage, or load times?'));
  await sleep(1000);
  
  console.log(chalk.white('👤 User: Component re-renders too often, should be under 100ms render time'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔄 AutoPilot: Measuring current performance... 180ms average render time'));
  await sleep(2000);
  
  console.log(chalk.green('✅ AutoPilot: Performance target identified. Confidence: 72%'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔧 AutoPilot: Applying React.memo and useMemo optimizations...'));
  await sleep(2000);
  
  console.log(chalk.yellow('🧪 AutoPilot: Running multi-agent validation...'));
  console.log(chalk.green('  ✅ Unit Test Agent: All tests passing'));
  console.log(chalk.red('  ❌ Performance Agent: Render time still 165ms (target: <100ms)'));
  console.log(chalk.green('  ✅ GUI Test Agent: Visual regression passed'));
  await sleep(2000);
  
  console.log(chalk.red('❌ AutoPilot: Performance target not met'));
  await sleep(1000);
  
  console.log(chalk.yellow('🔄 AutoPilot: Rolling back changes...'));
  await sleep(2000);
  
  console.log(chalk.red('❌ AutoPilot: Optimization didn\'t meet performance target (165ms vs 100ms goal). Changes rolled back.'));
  console.log(chalk.blue('💡 AutoPilot: Suggests: Consider virtualizing the list or reducing component complexity.\n'));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runDemo };