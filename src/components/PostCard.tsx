import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Share2, Zap, Plus, Pencil, Check, X } from 'lucide-react';
import { Post, TRANSLATIONS } from '../types';

interface PostCardProps {
  post: Post;
  index: number;
  onShare: (post: Post) => void | Promise<void>;
  onVote: (postId: string, direction: 1 | -1) => void;
  onAddComment: (postId: string, text: string) => void;
  onEdit: (postId: string, newContent: string) => void;
  userVote: 1 | -1 | 0;
  currentUserId: string;
  key?: string | number;
}

export function PostCard({ post, index, onShare, onVote, onAddComment, onEdit, userVote, currentUserId }: PostCardProps) {
  const [corruptedContent, setCorruptedContent] = useState(post.content);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const corrupt = () => {
      if (Math.random() > 0.05) {
        const words = post.content.split(' ');
        if (words.length > 3) {
          const idx = Math.floor(Math.random() * words.length);
          if (Math.random() > 0.8) {
             const original = words[idx];
             words[idx] = original.split('').map(c => Math.random() > 0.9 ? '...' : c).join('');
             setCorruptedContent(words.join(' '));
          }
        }
      } else {
        setCorruptedContent(post.content);
      }
    };
    const interval = setInterval(corrupt, 20000); 
    return () => clearInterval(interval);
  }, [post.content]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment('');
    }
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      onEdit(post.id, editedContent);
      setIsEditing(false);
    }
  };

  const isAuthor = post.authorId === currentUserId;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-3xl p-8 flex flex-col group border border-white/5 hover:border-white/15 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <div className="mb-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono opacity-40">
              {new Date(post.timestamp).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
            <span className="text-[10px] font-mono text-zinc-500 italic">User_{post.id.slice(0, 4)}</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`w-7 h-7 rounded-sm flex items-center justify-center transition-all bg-white/5 border border-white/5 hover:bg-white/10 ${isEditing ? 'text-indigo-400 border-indigo-500/30' : 'text-zinc-600 hover:text-zinc-400'}`}
                title="რედაქტირება"
              >
                {isEditing ? <X size={12} /> : <Pencil size={12} />}
              </button>
            )}
            <span className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[9px] uppercase tracking-tighter text-indigo-400/80">
              {post.tag}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 mb-8">
            <textarea
              autoFocus
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-white/5 border border-indigo-500/20 rounded-2xl p-6 text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none font-display text-lg leading-relaxed"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
                className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
              >
                {TRANSLATIONS.cancel}
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-6 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-indigo-400 active:scale-95 transition-all"
              >
                შენახვა
              </button>
            </div>
          </div>
        ) : (
          <p className="font-display text-lg text-zinc-100 leading-relaxed group-hover:text-white transition-colors duration-500 animate-flicker">
            "{corruptedContent}"
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-8 mt-6 border-t border-white/5">
        <div className="flex gap-4 items-center">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
            <button 
              onClick={() => onVote(post.id, 1)}
              disabled={userVote !== 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all transform active:scale-125 ${
                userVote === 1 
                ? 'bg-indigo-500 text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title="ეგზისტენციალური"
            >
              <Zap size={14} fill={userVote === 1 ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={() => onVote(post.id, -1)}
              disabled={userVote !== 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all transform active:scale-125 ${
                userVote === -1 
                ? 'bg-red-500/50 text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title="არარეალური"
            >
              <Plus size={14} className="rotate-45" />
            </button>
          </div>
          <span className={`text-[10px] font-mono font-bold tracking-widest transition-colors ${userVote === 1 ? 'text-indigo-400' : userVote === -1 ? 'text-red-400' : 'text-zinc-400'}`}>
            {post.votes.toLocaleString()} {TRANSLATIONS.dissociating}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${isCommentsOpen ? 'bg-white text-black' : 'hover:bg-white text-zinc-400 hover:text-black'}`}
          >
            <MessageSquare size={12} />
          </button>
          <button 
            onClick={() => onShare(post)}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white text-zinc-400 hover:text-black transition-all"
            title="გაზიარება"
          >
            <Share2 size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
              <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {post.comments.length === 0 ? (
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center py-4">სიჩუმე...</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {post.comments.map((comment) => (
                      <motion.div 
                        key={comment.id} 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">ანონ_#{comment.id.slice(0, 4)}</span>
                          <span className="text-[8px] font-mono opacity-30">{new Date(comment.timestamp).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-zinc-300 font-serif lowercase italic">"{comment.text}"</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              
              <form onSubmit={handleSubmitComment} className="relative mt-4">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="დატოვე კვალი სიცარიელეში..."
                  className="w-full bg-white/5 border border-white/5 rounded-full py-2.5 px-5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all font-serif italic"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1.5 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-opacity"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
