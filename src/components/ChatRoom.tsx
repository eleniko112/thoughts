import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  user: string;
  timestamp: number;
}

export function ChatRoom({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userId] = useState(() => `Seeker_${Math.random().toString(36).substr(2, 4)}`);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the same host
    socketRef.current = io();

    socketRef.current.on('init_messages', (initialMessages: ChatMessage[]) => {
      setMessages(initialMessages);
    });

    socketRef.current.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message].slice(-50));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('send_message', {
        text: input,
        user: userId,
      });
      setInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-6 bottom-24 w-80 h-[450px] glass rounded-3xl border border-white/10 flex flex-col shadow-2xl z-40 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-indigo-500/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400 font-bold">ჩურჩულის დარბაზი</h3>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-2">
                <MessageCircle size={32} />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">სიჩუმე...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.user === userId ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[8px] font-mono text-zinc-500">{msg.user}</span>
                    <span className="text-[8px] font-mono opacity-20">
                      {new Date(msg.timestamp).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div 
                    className={`max-w-[90%] p-3 rounded-2xl text-xs font-serif italic ${
                      msg.user === userId 
                        ? 'bg-indigo-500/20 border border-indigo-500/30 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-black/20">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ჩაჩურჩულე რამე..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 pr-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-serif italic"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1 top-1 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-400 disabled:opacity-0 transition-all active:scale-95"
              >
                <Send size={12} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
