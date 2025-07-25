/**
 * Context7 MCP Adapter for AutoPilot Integration
 * Bridges Context7's documentation capabilities with AutoPilot's autonomous execution
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');

class Context7MCPAdapter extends EventEmitter {
  constructor(autopilot, config = {}) {
    super();
    this.autopilot = autopilot;
    this.config = {
      serverCommand: config.serverCommand || 'npx',
      serverArgs: config.serverArgs || ['@context7/mcp-server'],
      timeout: config.timeout || 30000,
      ...config
    };
    this.mcpProcess = null;
    this.isConnected = false;
  }

  /**
   * Start the Context7 MCP server
   */
  async connect() {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      this.mcpProcess = spawn(this.config.serverCommand, this.config.serverArgs, {
        env: {
          ...process.env,
          ...this.config.env
        }
      });

      this.mcpProcess.stdout.on('data', (data) => {
        const message = data.toString();
        if (message.includes('MCP server ready')) {
          this.isConnected = true;
          this.emit('connected');
          resolve();
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('Context7 MCP Error:', data.toString());
      });

      this.mcpProcess.on('error', (error) => {
        reject(new Error(`Failed to start Context7 MCP: ${error.message}`));
      });

      // Timeout connection
      setTimeout(() => {
        if (!this.isConnected) {
          this.disconnect();
          reject(new Error('Context7 MCP connection timeout'));
        }
      }, this.config.timeout);
    });
  }

  /**
   * Disconnect from MCP server
   */
  disconnect() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.isConnected = false;
      this.emit('disconnected');
    }
  }

  /**
   * Enhance command context with Context7 documentation
   */
  async enhanceContext(command, args = {}) {
    if (!this.isConnected) {
      await this.connect();
    }

    // Extract key terms from command for documentation search
    const searchTerms = this.extractSearchTerms(command);
    
    // Fetch relevant documentation
    const documentation = await this.fetchDocumentation(searchTerms);
    
    // Get available tools from MCP
    const tools = await this.listAvailableTools();
    
    // Build enhanced context
    return {
      command,
      args,
      documentation,
      availableTools: tools,
      contextMetadata: {
        timestamp: new Date().toISOString(),
        confidence: this.calculateContextConfidence(documentation),
        sources: documentation.map(d => d.source)
      },
      suggestions: this.generateSuggestions(command, documentation, tools)
    };
  }

  /**
   * Execute plan with Context7 MCP tools
   */
  async executeWithContext(plan, context) {
    const results = [];
    const enhancedPlan = this.enhancePlanWithContext(plan, context);

    for (const step of enhancedPlan.steps) {
      try {
        // Select appropriate tool based on step and context
        const tool = this.selectTool(step, context.availableTools);
        
        // Execute tool with parameters
        const result = await this.executeTool(tool, {
          ...step.params,
          context: context.documentation
        });
        
        results.push({
          step: step.name,
          tool: tool.name,
          success: true,
          result
        });

        // Emit progress
        this.emit('step-completed', { step, result });
      } catch (error) {
        results.push({
          step: step.name,
          success: false,
          error: error.message
        });
        
        // Emit error but continue
        this.emit('step-error', { step, error });
      }
    }

    return {
      plan: enhancedPlan,
      results,
      summary: this.generateExecutionSummary(results)
    };
  }

  /**
   * Extract search terms from command
   */
  extractSearchTerms(command) {
    // Remove common words and extract meaningful terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = command.toLowerCase().split(/\s+/);
    
    return words.filter(word => 
      !stopWords.includes(word) && 
      word.length > 2 &&
      !word.startsWith('--')
    );
  }

  /**
   * Fetch documentation from Context7
   */
  async fetchDocumentation(searchTerms) {
    // Send request to MCP server
    return this.sendRequest('resources.list', {
      type: 'documentation',
      query: searchTerms.join(' '),
      limit: 10
    });
  }

  /**
   * List available MCP tools
   */
  async listAvailableTools() {
    return this.sendRequest('tools.list', {});
  }

  /**
   * Execute a specific tool
   */
  async executeTool(tool, params) {
    return this.sendRequest('tools.execute', {
      name: tool.name,
      arguments: params
    });
  }

  /**
   * Send request to MCP server
   */
  async sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      };

      // In real implementation, this would use proper IPC
      // For now, simulate the response
      setTimeout(() => {
        if (method === 'resources.list') {
          resolve([
            {
              uri: 'context7://docs/api/authentication',
              name: 'Authentication API',
              source: 'Context7',
              relevance: 0.95,
              content: 'Authentication documentation...'
            },
            {
              uri: 'context7://docs/guides/best-practices',
              name: 'Best Practices Guide',
              source: 'Context7',
              relevance: 0.87,
              content: 'Best practices for implementation...'
            }
          ]);
        } else if (method === 'tools.list') {
          resolve([
            { name: 'file.read', description: 'Read file contents' },
            { name: 'file.write', description: 'Write file contents' },
            { name: 'search.code', description: 'Search codebase' },
            { name: 'test.run', description: 'Run tests' }
          ]);
        } else {
          resolve({ success: true, data: 'Tool executed' });
        }
      }, 100);
    });
  }

  /**
   * Calculate context confidence score
   */
  calculateContextConfidence(documentation) {
    if (!documentation || documentation.length === 0) return 50;
    
    const avgRelevance = documentation.reduce((sum, doc) => sum + (doc.relevance || 0), 0) / documentation.length;
    return Math.round(avgRelevance * 100);
  }

  /**
   * Generate suggestions based on context
   */
  generateSuggestions(command, documentation, tools) {
    const suggestions = [];

    // Add documentation-based suggestions
    documentation.forEach(doc => {
      if (doc.relevance > 0.8) {
        suggestions.push({
          type: 'documentation',
          message: `Consider reviewing: ${doc.name}`,
          uri: doc.uri
        });
      }
    });

    // Add tool-based suggestions
    if (command.includes('test')) {
      const testTool = tools.find(t => t.name.includes('test'));
      if (testTool) {
        suggestions.push({
          type: 'tool',
          message: `Use ${testTool.name} for testing`,
          tool: testTool
        });
      }
    }

    return suggestions;
  }

  /**
   * Enhance plan with contextual information
   */
  enhancePlanWithContext(plan, context) {
    const enhancedSteps = plan.steps.map(step => {
      // Find relevant documentation for this step
      const relevantDocs = context.documentation.filter(doc => 
        step.toLowerCase().includes(doc.name.toLowerCase()) ||
        doc.content.toLowerCase().includes(step.toLowerCase())
      );

      return {
        ...step,
        documentation: relevantDocs,
        suggestedTools: this.suggestToolsForStep(step, context.availableTools)
      };
    });

    return {
      ...plan,
      steps: enhancedSteps,
      contextEnhanced: true
    };
  }

  /**
   * Select appropriate tool for a step
   */
  selectTool(step, availableTools) {
    // Simple matching logic - can be made more sophisticated
    const stepLower = step.name.toLowerCase();
    
    if (stepLower.includes('test')) {
      return availableTools.find(t => t.name.includes('test')) || availableTools[0];
    } else if (stepLower.includes('write') || stepLower.includes('create')) {
      return availableTools.find(t => t.name.includes('write')) || availableTools[0];
    } else if (stepLower.includes('read') || stepLower.includes('analyze')) {
      return availableTools.find(t => t.name.includes('read')) || availableTools[0];
    }
    
    return availableTools[0];
  }

  /**
   * Suggest tools for a specific step
   */
  suggestToolsForStep(step, tools) {
    const suggestions = [];
    const stepLower = step.toLowerCase();

    tools.forEach(tool => {
      const toolLower = tool.name.toLowerCase();
      const descLower = (tool.description || '').toLowerCase();
      
      if (stepLower.includes(toolLower) || descLower.includes(stepLower)) {
        suggestions.push(tool);
      }
    });

    return suggestions;
  }

  /**
   * Generate execution summary
   */
  generateExecutionSummary(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      total: results.length,
      successful,
      failed,
      successRate: (successful / results.length) * 100,
      failedSteps: results.filter(r => !r.success).map(r => r.step)
    };
  }
}

module.exports = Context7MCPAdapter;