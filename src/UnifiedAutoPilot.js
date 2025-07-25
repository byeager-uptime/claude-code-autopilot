/**
 * Unified AutoPilot - Integrates AutoPilot with Context7 MCP
 * Provides seamless --auto flag handling with enhanced context
 */

const AutoPilotHook = require('./AutoPilotHook');
const Context7MCPAdapter = require('./integrations/Context7MCPAdapter');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class UnifiedAutoPilot {
  constructor(config = {}) {
    // Load configuration
    this.config = this.loadUnifiedConfig(config);
    
    // Initialize components
    this.autopilot = new AutoPilotHook(this.config.autopilot);
    this.context7 = new Context7MCPAdapter(this.autopilot, this.config.mcp);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Track execution state
    this.executionState = {
      isRunning: false,
      currentCommand: null,
      iterations: 0,
      results: []
    };
  }

  /**
   * Load unified configuration from multiple sources
   */
  loadUnifiedConfig(overrides = {}) {
    const defaultConfig = {
      autopilot: {
        enabled: true,
        confidence_threshold: 85,
        agents: ['unit-test', 'integration-test', 'security', 'performance']
      },
      mcp: {
        serverCommand: 'npx',
        serverArgs: ['@context7/mcp-server'],
        timeout: 30000
      },
      integration: {
        auto_flag_behavior: 'autonomous',
        context_enrichment: true,
        iterative_refinement: true,
        max_iterations: 5,
        fallback_on_error: true
      }
    };

    // Try to load from .claude/autopilot-pro.json
    const configPath = path.join(process.cwd(), '.claude', 'autopilot-pro.json');
    let fileConfig = {};
    
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.warn('Could not parse config file:', error.message);
      }
    }

    // Merge configurations
    return this.deepMerge(defaultConfig, fileConfig, overrides);
  }

  /**
   * Main execution entry point
   */
  async execute(command, args = {}, options = {}) {
    if (this.executionState.isRunning) {
      throw new Error('AutoPilot is already running');
    }

    console.log(chalk.blue('🚀 Unified AutoPilot Engaged'));
    console.log(chalk.gray(`Command: ${command}`));

    this.executionState = {
      isRunning: true,
      currentCommand: command,
      iterations: 0,
      results: []
    };

    try {
      // 1. Connect to Context7 MCP if configured
      if (this.config.integration.context_enrichment) {
        console.log(chalk.cyan('📚 Connecting to Context7...'));
        await this.context7.connect();
      }

      // 2. Enhance command with context
      const enhancedContext = await this.enhanceCommand(command, args);
      console.log(chalk.green(`✓ Context enhanced (confidence: ${enhancedContext.contextMetadata.confidence}%)`));

      // 3. Show suggestions if available
      if (enhancedContext.suggestions.length > 0) {
        console.log(chalk.yellow('💡 Suggestions:'));
        enhancedContext.suggestions.forEach(s => {
          console.log(chalk.gray(`  - ${s.message}`));
        });
      }

      // 4. Create execution plan with context
      const plan = await this.createEnhancedPlan(enhancedContext);
      console.log(chalk.yellow('📋 Enhanced Execution Plan:'));
      plan.steps.forEach((step, i) => {
        console.log(chalk.gray(`  ${i + 1}. ${step.name}`));
        if (step.documentation?.length > 0) {
          console.log(chalk.gray(`     📄 Using: ${step.documentation[0].name}`));
        }
      });

      // 5. Execute with iterative refinement
      let finalResults;
      if (this.config.integration.iterative_refinement) {
        finalResults = await this.executeWithRefinement(plan, enhancedContext);
      } else {
        finalResults = await this.executeSinglePass(plan, enhancedContext);
      }

      // 6. Disconnect from Context7
      if (this.context7.isConnected) {
        this.context7.disconnect();
      }

      // 7. Return results
      return {
        success: finalResults.success,
        results: finalResults,
        context: enhancedContext,
        iterations: this.executionState.iterations
      };

    } catch (error) {
      console.error(chalk.red('❌ Unified AutoPilot Error:'), error.message);
      
      // Cleanup
      if (this.context7.isConnected) {
        this.context7.disconnect();
      }
      
      this.executionState.isRunning = false;
      
      // Fallback if configured
      if (this.config.integration.fallback_on_error) {
        console.log(chalk.yellow('⚠️  Falling back to standard AutoPilot...'));
        return this.autopilot.execute(command, args, options);
      }
      
      throw error;
    } finally {
      this.executionState.isRunning = false;
    }
  }

  /**
   * Enhance command with Context7 documentation
   */
  async enhanceCommand(command, args) {
    if (!this.config.integration.context_enrichment) {
      return { command, args, documentation: [], suggestions: [] };
    }

    try {
      return await this.context7.enhanceContext(command, args);
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Context enhancement failed:'), error.message);
      return { command, args, documentation: [], suggestions: [] };
    }
  }

  /**
   * Create execution plan with enhanced context
   */
  async createEnhancedPlan(context) {
    // Let AutoPilot create initial plan
    const basicPlan = await this.autopilot.createExecutionPlan(context);
    
    // Enhance with Context7 information
    if (this.context7.isConnected) {
      return this.context7.enhancePlanWithContext(basicPlan, context);
    }
    
    return basicPlan;
  }

  /**
   * Execute with iterative refinement
   */
  async executeWithRefinement(plan, context) {
    let currentPlan = plan;
    let results = null;
    let iteration = 0;

    while (iteration < this.config.integration.max_iterations) {
      iteration++;
      this.executionState.iterations = iteration;
      
      console.log(chalk.blue(`\n🔄 Iteration ${iteration}/${this.config.integration.max_iterations}`));

      // Execute current plan
      if (this.context7.isConnected && context.documentation.length > 0) {
        results = await this.context7.executeWithContext(currentPlan, context);
      } else {
        results = await this.autopilot.executePlan(currentPlan);
      }

      // Run validation
      const validation = await this.autopilot.runValidationAgents(results);
      console.log(chalk.gray(`Validation confidence: ${validation.confidence.toFixed(1)}%`));

      // Check if we meet confidence threshold
      if (validation.confidence >= this.config.autopilot.confidence_threshold) {
        console.log(chalk.green('✅ Confidence threshold met!'));
        return {
          success: true,
          ...results,
          validation
        };
      }

      // Refine plan based on results
      console.log(chalk.yellow('🔧 Refining plan based on results...'));
      currentPlan = await this.refinePlan(currentPlan, results, validation, context);
      
      // Check if plan changed
      if (JSON.stringify(currentPlan) === JSON.stringify(plan)) {
        console.log(chalk.yellow('⚠️  No further refinements possible'));
        break;
      }
    }

    // Return best results we have
    return {
      success: results.validation?.confidence >= this.config.autopilot.confidence_threshold,
      ...results
    };
  }

  /**
   * Execute single pass (no refinement)
   */
  async executeSinglePass(plan, context) {
    let results;
    
    if (this.context7.isConnected && context.documentation.length > 0) {
      results = await this.context7.executeWithContext(plan, context);
    } else {
      results = await this.autopilot.executePlan(plan);
    }

    const validation = await this.autopilot.runValidationAgents(results);
    
    return {
      success: validation.passed,
      ...results,
      validation
    };
  }

  /**
   * Refine plan based on execution results
   */
  async refinePlan(originalPlan, results, validation, context) {
    const refinedSteps = [];
    
    // Analyze what went wrong
    const failedSteps = results.results?.filter(r => !r.success) || [];
    
    originalPlan.steps.forEach((step, index) => {
      const stepResult = results.results?.[index];
      
      if (!stepResult || !stepResult.success) {
        // This step failed - try to fix it
        refinedSteps.push({
          ...step,
          refined: true,
          refinementReason: stepResult?.error || 'Unknown error',
          alternativeApproach: this.suggestAlternative(step, context)
        });
      } else if (validation.agents?.some(a => !a.passed && a.relatedStep === step.name)) {
        // This step passed but validation failed
        refinedSteps.push({
          ...step,
          refined: true,
          refinementReason: 'Validation failed',
          additionalValidation: true
        });
      } else {
        // Keep successful steps
        refinedSteps.push(step);
      }
    });

    return {
      ...originalPlan,
      steps: refinedSteps,
      refined: true,
      refinementIteration: this.executionState.iterations
    };
  }

  /**
   * Suggest alternative approach for failed step
   */
  suggestAlternative(step, context) {
    // Look for alternative tools in context
    const alternativeTools = context.availableTools?.filter(tool => 
      tool.name !== step.tool && 
      tool.description?.toLowerCase().includes(step.name.toLowerCase())
    );

    if (alternativeTools?.length > 0) {
      return {
        tool: alternativeTools[0],
        approach: `Try using ${alternativeTools[0].name} instead`
      };
    }

    // Generic alternatives based on step type
    if (step.name.toLowerCase().includes('test')) {
      return { approach: 'Try running tests in isolation' };
    } else if (step.name.toLowerCase().includes('build')) {
      return { approach: 'Clear cache and rebuild' };
    }

    return { approach: 'Retry with more specific parameters' };
  }

  /**
   * Set up event handlers for components
   */
  setupEventHandlers() {
    // Context7 events
    this.context7.on('connected', () => {
      console.log(chalk.green('✓ Context7 MCP connected'));
    });

    this.context7.on('step-completed', ({ step, result }) => {
      console.log(chalk.gray(`  ✓ ${step.name} completed`));
    });

    this.context7.on('step-error', ({ step, error }) => {
      console.log(chalk.red(`  ✗ ${step.name} failed: ${error.message}`));
    });
  }

  /**
   * Check if command should use unified AutoPilot
   */
  static shouldIntercept(command, args, options) {
    // Check for --auto flag
    const hasAutoFlag = command.includes('--auto') || 
                       (args && args.auto) || 
                       (options && options.auto);
    
    // Check for --context flag (forces Context7 usage)
    const hasContextFlag = command.includes('--context') ||
                          (args && args.context) ||
                          (options && options.context);
    
    return hasAutoFlag || hasContextFlag;
  }

  /**
   * Deep merge configuration objects
   */
  deepMerge(...objects) {
    const result = {};
    
    for (const obj of objects) {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = this.deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Get execution statistics
   */
  getStats() {
    return {
      totalExecutions: this.executionState.results.length,
      currentlyRunning: this.executionState.isRunning,
      lastCommand: this.executionState.currentCommand,
      averageIterations: this.executionState.iterations
    };
  }
}

module.exports = UnifiedAutoPilot;