import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-slate-800 border border-green-500 rounded-lg w-80 h-96 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-green-500">
            <h3 className="text-green-400 font-game text-sm">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="text-gray-300 text-sm">
              Hi! I'm here to help you with your learning journey. Ask me anything!
            </div>
          </div>
          <div className="p-3 border-t border-green-500 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:border-green-400"
            />
            <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}