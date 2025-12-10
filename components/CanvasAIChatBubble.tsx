import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CanvasAIChatBubbleProps {
  onAIRequest: (message: string) => Promise<string>;
}

export const CanvasAIChatBubble: React.FC<CanvasAIChatBubbleProps> = ({ onAIRequest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you with clauses, layout, and visual components. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await onAIRequest(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-grit-primary border-2 border-grit-dark shadow-grit-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all font-bold text-grit-dark flex items-center gap-2"
      >
        <MessageSquare size={20} />
        <span className="text-sm">AI</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-grit-white border-4 border-grit-dark shadow-grit-lg flex flex-col max-h-[600px]">
          <div className="p-4 bg-grit-dark text-grit-primary flex justify-between items-center border-b-4 border-grit-dark">
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-grit-primary hover:text-grit-dark p-2 border-2 border-transparent hover:border-grit-primary transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-grit-bg">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 border-2 border-grit-dark ${
                  msg.role === 'user' 
                    ? 'bg-grit-primary text-grit-dark' 
                    : 'bg-white text-grit-dark'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-grit-dark p-3">
                  <Loader className="animate-spin" size={16} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t-2 border-grit-dark flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI for help..."
              className="flex-1 px-3 py-2 border-2 border-grit-dark focus:outline-none focus:ring-2 focus:ring-grit-primary font-mono"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-grit-dark text-grit-primary border-2 border-grit-dark hover:bg-grit-primary hover:text-grit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
