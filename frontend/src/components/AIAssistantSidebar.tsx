import React, { useState } from 'react';

const AIAssistantSidebar: React.FC<{ context?: string }> = ({ context }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything about your document.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages([...messages, { role: 'user', content: input }]);
    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      setMessages(msgs => [...msgs, { role: 'assistant', content: `AI response to: "${input}"` }]);
      setLoading(false);
      setInput('');
    }, 1200);
  };

  return (
    <div className="w-80 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm flex flex-col">
      <div className="font-bold text-purple-700 mb-2">AI Assistant</div>
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 text-sm ${msg.role === 'assistant' ? 'text-purple-700' : 'text-gray-700'}`}>{msg.content}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask the AI..."
          className="border px-3 py-2 rounded w-full"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
          disabled={loading}
        >Send</button>
      </div>
      {context && <div className="mt-2 text-xs text-gray-400">Context: {context}</div>}
    </div>
  );
};

export default AIAssistantSidebar;
