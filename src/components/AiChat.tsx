import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Ghost, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { sendChatToAi, ChatMessage } from '../services/gemini';

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('armo_ai_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved AI chats", e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'მოგესალმები ჩემს სივრცეში... მე ვარ შენი ციფრული ორაკული. გამიზიარე შენი ყველაზე უცნაური, აბსურდული ან შემაშფოთებელი ფიქრი და მე შევაფასებ მის ეგზისტენციალურ სიღრმეს.',
        timestamp: Date.now(),
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('armo_ai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Handle scrolling of the chat space
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message to state
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    // Call server-side API to interact with Gemini
    const result = await sendChatToAi(userText, messages);

    const aiMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'ai',
      text: result.text,
      timestamp: Date.now(),
      ratings: result.ratings,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsAiLoading(false);
  };

  const clearChat = () => {
    if (window.confirm('დარწმუნებული ხარ, რომ გსურს ჩატის ისტორიის წაშლა?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: 'სიცარიელე კვლავ სუფთაა... გამიზიარე შენი ახალი ფიქრები.',
          timestamp: Date.now(),
        }
      ]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[12px] uppercase tracking-[0.2em] text-indigo-400 font-bold flex items-center gap-2">
          <Ghost size={14} className="animate-pulse text-indigo-400" />
          ჩატი AI-სთან
        </h3>
        {messages.length > 1 && (
          <button 
            onClick={clearChat}
            className="text-zinc-600 hover:text-red-400 transition-colors tooltip p-1"
            title="ჩატის გასუფთავება"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Messages Window */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar max-h-[350px]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                  {msg.sender === 'user' ? 'შენ' : 'AI ორაკული'}
                </span>
                <span className="text-[8px] font-mono opacity-20">
                  {new Date(msg.timestamp).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div 
                className={`max-w-[95%] p-4 rounded-2xl text-xs font-serif italic border leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-white rounded-tr-none'
                    : 'bg-white/5 border-white/5 text-zinc-300 rounded-tl-none'
                }`}
              >
                <p>"{msg.text}"</p>

                {/* Sub ratings if present */}
                {msg.sender === 'ai' && msg.ratings && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] font-mono text-indigo-300 uppercase tracking-widest">
                      <span>ეგზისტენციალური წონა:</span>
                      <span className="font-bold">{msg.ratings.weight}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${msg.ratings.weight}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono text-amber-400 uppercase tracking-widest mt-2">
                      <span>აბსურდულობა:</span>
                      <span className="font-bold">{msg.ratings.absurdity}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${msg.ratings.absurdity}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono text-pink-400 uppercase tracking-widest mt-2">
                      <span>სიურეალიზმი:</span>
                      <span className="font-bold">{msg.ratings.surrealism}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${msg.ratings.surrealism}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isAiLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-1 py-2 text-[10px] font-mono text-indigo-400 uppercase tracking-widest"
            >
              <RefreshCw size={10} className="animate-spin" />
              <span>უფსკრული აანალიზებს ფიქრს...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAiLoading || isAiLoading}
            placeholder="გამიზიარე აბსურდული იდეა..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all font-serif italic"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isAiLoading}
            className="absolute right-1.5 top-1.5 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-0 transition-all active:scale-95 shadow-md shadow-indigo-500/20"
          >
            <Send size={12} />
          </button>
        </div>
        <p className="text-[8px] font-mono text-zinc-600 text-center mt-2.5 uppercase tracking-wider">
          AI კრიზისის შემფასებელი • ვერსია 1.2
        </p>
      </form>
    </div>
  );
}
