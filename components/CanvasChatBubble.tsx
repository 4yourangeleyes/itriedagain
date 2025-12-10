/**
 * Canvas Chat Bubble - Floating AI assistant for Canvas
 * 
 * Features:
 * - Suggest clauses
 * - Reorder clauses/blocks/visual components
 * - Add visual components
 * - Quick document modifications
 */

import React, { useState } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Input, TextArea } from './Input';

interface CanvasChatBubbleProps {
  onSuggestClause?: (suggestion: string) => void;
  onReorder?: (instruction: string) => void;
  onAddVisual?: (type: string, data: any) => void;
}

export const CanvasChatBubble: React.FC<CanvasChatBubbleProps> = ({
  onSuggestClause,
  onReorder,
  onAddVisual,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      // TODO: Integrate with Gemini AI for smart suggestions
      // For now, provide simple responses
      let response = "I can help you with:\n";
      response += "• Suggesting contract clauses\n";
      response += "• Reordering sections\n";
      response += "• Adding visual components\n";
      response += "\nTry: 'Add a payment terms clause' or 'Reorder items by price'";

      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50 print:hidden hover:scale-110"
          title="AI Assistant"
        >
          <Sparkles className="text-white" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border-2 border-grit-dark shadow-2xl flex flex-col z-50 print:hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-bold">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Sparkles size={48} className="mx-auto mb-4 text-purple-400" />
                <p className="font-bold mb-2">Hey! I'm your AI assistant</p>
                <p className="text-sm">I can help you:</p>
                <ul className="text-sm mt-2 space-y-1 text-left max-w-xs mx-auto">
                  <li>• Suggest contract clauses</li>
                  <li>• Reorder sections and items</li>
                  <li>• Add visual components</li>
                  <li>• Quick document edits</li>
                </ul>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <Loader size={16} className="animate-spin text-purple-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
