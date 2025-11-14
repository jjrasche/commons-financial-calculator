import { useState } from 'react';
import { CalculatorInputs, CalculationResults } from '../types';

interface AIAssistantProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onUpdateInputs: (updates: Partial<CalculatorInputs>) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedChanges?: Partial<CalculatorInputs>;
}

export default function AIAssistant({ inputs, results, onUpdateInputs, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Tell me your concerns or ideas about the calculator, and I'll help adjust the parameters intelligently. For example:\n\n• \"The sales seem too low\"\n• \"We should pay workers more\"\n• \"Can we make this profitable?\"\n• \"What if we gave members free meals?\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const buildSystemPrompt = () => {
    return `You are an AI assistant helping users explore a cooperative financial calculator. The calculator models a worker-owned restaurant cooperative.

Current state:
- Food Cost per Meal: $${inputs.foodCost.toFixed(2)}
- Public Meal Price: $${inputs.publicPrice.toFixed(2)}
- Member Meal Price: $${inputs.memberPrice.toFixed(2)}
- Base Hourly Wage: $${inputs.baseWage.toFixed(2)}
- Daily Production Volume: ${inputs.dailyVolume} meals
- Member Meal Percentage: ${inputs.memberPercentage}%
- Annual Operating Costs: $${inputs.annualOperating.toLocaleString()}
- Wage Distribution: ${inputs.wageDistribution}%

Current results:
- Monthly Surplus: $${results.surplus.toFixed(0)}
- Wages Pool: $${results.wagesPool.toFixed(0)}
- Savings Pool: $${results.savingsPool.toFixed(0)}
- Effective Wage: $${results.effectiveWage.toFixed(2)}/hr
- Margin of Safety: ${results.marginOfSafety.toFixed(1)}%

When the user expresses a concern or idea, you should:
1. Understand their intent
2. Suggest intelligent parameter adjustments
3. Explain your reasoning
4. Return the suggestions in a structured format

Respond in this exact JSON format:
{
  "explanation": "Your explanation of the changes and reasoning",
  "changes": {
    "foodCost": 5.5,
    "publicPrice": 12,
    "memberPrice": 6,
    "baseWage": 20,
    "dailyVolume": 450,
    "memberPercentage": 25,
    "annualOperating": 100000,
    "wageDistribution": 70
  }
}

Only include the parameters you want to change in the "changes" object. If no changes are needed, return an empty "changes" object.

Constraints to keep in mind:
- Food cost: $2-$12
- Public price: $5-$25
- Member price: $0-$20
- Base wage: $10-$40
- Daily volume: 100-1000 meals
- Member percentage: 5-50%
- Annual operating: $40k-$300k
- Wage distribution: 0-100%

Be creative and helpful. Make realistic adjustments that address the user's concern.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: input },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Try to parse JSON response
      let parsedResponse: { explanation: string; changes?: Partial<CalculatorInputs> };
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        // If not JSON, treat as plain text
        parsedResponse = { explanation: aiResponse };
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: parsedResponse.explanation,
        suggestedChanges: parsedResponse.changes,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = (changes: Partial<CalculatorInputs>) => {
    onUpdateInputs(changes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🤖 AI Assistant
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Tell me your concerns and I'll adjust the calculator
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.suggestedChanges && Object.keys(message.suggestedChanges).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-sm font-semibold mb-2">Suggested Changes:</p>
                    <div className="space-y-1 text-sm">
                      {Object.entries(message.suggestedChanges).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-300">{key}:</span>
                          <span className="font-mono text-green-400">
                            {typeof value === 'number'
                              ? key.includes('Price') || key.includes('Cost') || key.includes('Wage')
                                ? `$${value}`
                                : key.includes('Percentage') || key.includes('Distribution')
                                ? `${value}%`
                                : value
                              : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => applyChanges(message.suggestedChanges!)}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      ✓ Apply These Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your concern or idea..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Example: "This won't work, sales are too low" or "Pay workers more"
          </p>
        </div>
      </div>
    </div>
  );
}
