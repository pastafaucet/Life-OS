'use client';

import React, { useState } from 'react';
import { useAIEnhancedData } from '../lib/ai/enhanced-data-context';

export default function AITestComponent() {
  const { isAIEnabled, isProcessing, addTask, enhanceTask, getWorkflowSuggestions } = useAIEnhancedData();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAITest = async () => {
    setIsRunningTest(true);
    setTestResults([]);
    
    try {
      addTestResult('🧪 Starting AI Integration Test...');
      
      // Test 1: Check AI Status
      addTestResult(`✅ AI Enabled: ${isAIEnabled ? 'YES' : 'NO'}`);
      
      if (!isAIEnabled) {
        addTestResult('❌ AI is not enabled. Please check your OpenAI API key in .env.local');
        return;
      }

      // Test 2: Create a test task with AI enhancement
      addTestResult('🔄 Creating test task with AI enhancement...');
      const taskId = await addTask({
        title: 'Review contract for Smith vs. Jones case',
        description: 'Need to review the employment contract and identify potential issues',
        priority: 'P2',
        status: 'inbox',
        case_ids: [],
        tags: [],
      });
      
      addTestResult(`✅ Test task created with ID: ${taskId}`);
      
      // Test 3: Manually enhance the task
      addTestResult('🔄 Enhancing task with AI...');
      await enhanceTask(taskId);
      addTestResult('✅ Task enhancement completed');
      
      // Test 4: Generate workflow suggestions
      addTestResult('🔄 Generating workflow suggestions...');
      const suggestions = await getWorkflowSuggestions();
      addTestResult(`✅ Generated ${suggestions.length} workflow suggestions`);
      
      if (suggestions.length > 0) {
        suggestions.slice(0, 3).forEach((suggestion, index) => {
          addTestResult(`   ${index + 1}. ${suggestion}`);
        });
      }
      
      addTestResult('🎉 AI Integration Test Completed Successfully!');
      
    } catch (error) {
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Integration Test</h2>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${isAIEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">AI Status: {isAIEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>AI Processing...</span>
          </div>
        )}
      </div>

      <button
        onClick={runAITest}
        disabled={isRunningTest || isProcessing}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium mb-4"
      >
        {isRunningTest ? 'Running Test...' : 'Run AI Test'}
      </button>

      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <div className="space-y-1 text-sm font-mono">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAIEnabled && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Setup Required</h3>
          <p className="text-yellow-700 text-sm mb-2">
            To enable AI features, you need to:
          </p>
          <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
            <li>Get an OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
            <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in the project root</li>
            <li>Add: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_OPENAI_API_KEY=your_key_here</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      )}
    </div>
  );
}
