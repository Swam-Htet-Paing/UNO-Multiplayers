import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Smile } from 'lucide-react';

export default function ChatBox({ messages = [], onSendMessage }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const quickEmojis = ['🔥', '😂', '🤡', '👏', 'UNO!', 'GG'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-72 sm:h-80 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700/60 flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-200">Room Chat</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
            <span className="font-extrabold text-indigo-400 mr-1">{msg.username}:</span>
            <span className="text-slate-200">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Bar */}
      <div className="flex items-center space-x-1 px-2 py-1 bg-slate-950/60 border-t border-slate-800 overflow-x-auto">
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendMessage(emoji)}
            className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Text Input */}
      <form onSubmit={handleSubmit} className="p-2 bg-slate-900 flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}