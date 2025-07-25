#!/usr/bin/env node

/**
 * Test script for Claude Code AutoPilot
 * This simulates how Claude Code would interact with AutoPilot
 */

const { AutoPilotHook } = require('./index');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue('🧪 Testing Claude Code AutoPilot\n'));

// Test scenarios
const testScenarios = [
  {
    name: 'Basic Command',
    command: 'fix the login bug --auto',
    expectedBehavior: 'Should engage AutoPilot and execute autonomously'
  },
  {
    name: 'Feature Addition',
    command: 'add dark mode toggle to settings --auto',
    expectedBehavior: 'Should create feature plan and implement'
  },
  {
    name: 'Analysis Task',
    command: 'analyze performance bottlenecks --auto',
    expectedBehavior: 'Should run analysis and generate report'
  },
  {
    name: 'Without Auto Flag',
    command: 'fix the login bug',
    expectedBehavior: 'Should NOT engage AutoPilot'
  }
];

async function runTests() {
  // Load config if available
  let config = {};
  const configPath = path.join(process.cwd(), '.claude', 'autopilot.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(chalk.green('✓ Found AutoPilot configuration'));
  } else {
    console.log(chalk.yellow('⚠️  No AutoPilot configuration found, using defaults'));
  }

  // Create AutoPilot instance
  const autopilot = new AutoPilotHook(config);

  // Run test scenarios
  for (const scenario of testScenarios) {
    console.log(chalk.cyan(`\n🧪 Test: ${scenario.name}`));
    console.log(chalk.gray(`Command: ${scenario.command}`));
    console.log(chalk.gray(`Expected: ${scenario.expectedBehavior}`));
    
    // Check if AutoPilot should intercept
    const shouldIntercept = AutoPilotHook.shouldIntercept(scenario.command);
    
    if (shouldIntercept) {
      console.log(chalk.green('✓ AutoPilot intercepted command'));
      
      // Execute with AutoPilot
      try {
        const result = await autopilot.execute(scenario.command);
        
        if (result.success) {
          console.log(chalk.green('✓ AutoPilot execution successful'));
          if (result.validation) {
            console.log(chalk.gray(`  Confidence: ${result.validation.confidence.toFixed(1)}%`));
          }
        } else {
          console.log(chalk.red('✗ AutoPilot execution failed'));
          if (result.error) {
            console.log(chalk.red(`  Error: ${result.error}`));
          }
        }
      } catch (error) {
        console.log(chalk.red('✗ AutoPilot error:'), error.message);
      }
    } else {
      console.log(chalk.yellow('⚠️  AutoPilot not engaged (no --auto flag)'));
    }
  }

  // Test agent validation
  console.log(chalk.cyan('\n🧪 Test: Agent Validation'));
  const mockResults = {
    filesModified: ['src/login.js'],
    filesCreated: ['src/login.test.js'],
    testsRun: ['npm test']
  };
  
  const validation = await autopilot.runValidationAgents(mockResults);
  console.log(chalk.green(`✓ Validation complete - Confidence: ${validation.confidence.toFixed(1)}%`));
  
  validation.agents.forEach(agent => {
    const status = agent.passed ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${status} ${agent.name}: ${agent.confidence.toFixed(1)}%`);
  });

  console.log(chalk.blue('\n🎆 Testing complete!'));
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
});