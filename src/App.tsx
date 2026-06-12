import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { 
  MessageSquare, 
  Plus, 
  Zap, 
  Ghost, 
  Clock, 
  Share2, 
  ShieldAlert,
  Wind
} from 'lucide-react';
import { Post, TRANSLATIONS, Mood } from './types';
import { generateExistentialThought } from './services/gemini';
import { PostCard } from './components/PostCard';
import { ChatRoom } from './components/ChatRoom';
import { AiChat } from './components/AiChat';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeMood, setActiveMood] = useState<Mood>('existential');
  const [isPosting, setIsPosting] = useState(false);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1>>({});
  const [currentUserId] = useState(() => {
    const saved = localStorage.getItem('existential_userId');
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem('existential_userId', newId);
    return newId;
  });

  // Initial Data
  useEffect(() => {
    // Load votes from localStorage
    const savedVotes = localStorage.getItem('existential_votes');
    if (savedVotes) {
      try {
        setUserVotes(JSON.parse(savedVotes));
      } catch (e) {
        console.error("Failed to parse votes", e);
      }
    }

    const savedPosts = localStorage.getItem('existential_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        console.error("Failed to parse posts", e);
      }
    } else {
      const initialPosts: Post[] = [
        {
          id: '1',
          content: "თუ სარკეები შუქს ირეკლავენ, რატომ არიან ისინი ვერცხლისფერი?",
          tag: 'Probably Nothing',
          timestamp: Date.now() - 3600000,
          votes: 4200,
          comments: [],
          rating: { intensity: 80, distortion: 60, deprivation: 90, weight: 70, likelihood3AM: 95 }
        },
        {
          id: '2',
          content: "ფაქტი, რომ ჩვენ ვერ წარმოვიდგენთ ახალ ფერს, ამტკიცებს, რომ შეზღუდული პალიტრის გარემოში ვცხოვრობთ.",
          tag: 'Simulation Theory',
          timestamp: Date.now() - 7200000,
          votes: 1800,
          comments: [],
          rating: { intensity: 92, distortion: 85, deprivation: 70, weight: 80, likelihood3AM: 80 }
        }
      ];
      setPosts(initialPosts);
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('existential_posts', JSON.stringify(posts));
    }
  }, [posts]);

  // Periodic Anomaly effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setAnomalyCount(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addPost = (content: string, tag: string) => {
    const newPost: Post = {
      id: uuidv4(),
      content,
      tag,
      timestamp: Date.now(),
      votes: 0,
      comments: [],
      rating: {
        intensity: Math.floor(Math.random() * 100),
        distortion: Math.floor(Math.random() * 100),
        deprivation: Math.floor(Math.random() * 100),
        weight: Math.floor(Math.random() * 100),
        likelihood3AM: Math.floor(Math.random() * 100)
      },
      authorId: currentUserId
    };
    setPosts([newPost, ...posts]);
    setIsPosting(false);
  };

  const handleVote = (postId: string, direction: 1 | -1) => {
    if (userVotes[postId]) return; // Single vote per session/user

    const newUserVotes = { ...userVotes, [postId]: direction };
    setUserVotes(newUserVotes);
    localStorage.setItem('existential_votes', JSON.stringify(newUserVotes));

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, votes: p.votes + direction };
      }
      return p;
    }));
  };

  const handleEditPost = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.authorId === currentUserId) {
        return {
          ...post,
          content: newContent
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: uuidv4(),
      text,
      timestamp: Date.now(),
      corruptionLevel: Math.random()
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `"${post.content}" - ეგზისტენციალური კრიზისი #RateMyCrisis`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rate My Existential Crisis',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('ბმული კოპირებულია!');
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col overflow-hidden select-none liminal-gradient transition-all duration-1000 ${anomalyCount % 5 === 0 && anomalyCount > 0 ? 'grayscale-[0.2] brightness-90' : ''}`}>
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* Navigation */}
      <nav className="h-16 flex items-center justify-between px-8 border-b border-white/5 z-20 glass">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"
          ></motion.div>
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white drop-shadow-sm" style={{ fontFamily: '"Inter", "Noto Sans Georgian", sans-serif' }}>
            {TRANSLATIONS.siteName}
          </span>
        </div>
        <div className="flex gap-8 text-[11px] uppercase tracking-widest text-zinc-500 font-medium items-center">
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase">{TRANSLATIONS.void}</a>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`transition-colors uppercase ${isChatOpen ? 'text-indigo-400' : 'hover:text-zinc-300'}`}
          >
            {TRANSLATIONS.whispers}
          </button>
          <a href="#" className="hover:text-zinc-300 transition-colors uppercase">{TRANSLATIONS.oracle}</a>
          <button 
            onClick={() => setIsPosting(true)}
            className="px-6 py-2 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-300 font-bold"
          >
            {TRANSLATIONS.postAnonymously}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex gap-6 p-6 relative overflow-hidden">
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Featured Thought */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[280px] glass rounded-3xl p-8 pt-12 disturbing-shadow flex flex-col justify-center relative border border-white/10"
          >
            <div className="absolute top-6 left-8 text-[10px] font-mono uppercase text-indigo-400 tracking-tighter flex items-center gap-2">
              <ShieldAlert size={12} className="animate-pulse" />
              {TRANSLATIONS.mostDisturbing} — ID: #{(Math.random() * 9000 + 1000).toFixed(0)}
            </div>
            <p className="font-display text-2xl text-white leading-tight mt-4 max-w-2xl">
              "რა მოხდება, თუ შენი ანარეკლი სარკეში მხოლოდ იმ დღეს ელოდება, როცა ჩახედვას დაივიწყებ, რომ საბოლოოდ წავიდეს?"
            </p>
            <div className="mt-8 flex items-center gap-4">
              <span className="text-[11px] uppercase tracking-widest text-zinc-500">{TRANSLATIONS.existentialWeight}:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-1.5 bg-indigo-500 rounded-full"></div>)}
                <div className="w-10 h-1.5 bg-white/10 rounded-full"></div>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 ml-auto">92% {TRANSLATIONS.unsettling}</span>
            </div>
          </motion.div>

          {/* Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            <AnimatePresence>
              {posts.map((post, idx) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  index={idx} 
                  onShare={handleShare}
                  onVote={handleVote}
                  onAddComment={handleAddComment}
                  onEdit={handleEditPost}
                  userVote={userVotes[post.id] || 0}
                  currentUserId={currentUserId}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 flex flex-col gap-6">
          <div className="flex-1 glass rounded-3xl p-6 border border-white/10 flex flex-col">
            <AiChat />
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col border border-white/10 space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full border border-indigo-500/20 flex items-center justify-center mb-4 relative"
              >
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <div className="absolute inset-0 border-t border-indigo-500 rounded-full scale-110 opacity-40"></div>
              </motion.div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 mb-1 tracking-[0.2em]">{TRANSLATIONS.activeSeekers}</span>
              <span className="text-3xl font-light text-white tracking-tighter">142,003</span>
              <span className="text-[9px] text-zinc-600 mt-2 italic font-serif opacity-70">{TRANSLATIONS.staringIntoAbyss}</span>
            </div>

            <div className="w-full pt-6 border-t border-white/5 space-y-4">
              <div className="text-[10px] font-mono uppercase opacity-50 tracking-[0.1em] text-left">კოლექტიური განწყობა</div>
              <div className="flex flex-wrap gap-1.5 justify-start">
                {(Object.keys(TRANSLATIONS.moods) as Array<keyof typeof TRANSLATIONS.moods>).map(m => (
                  <button
                    key={m}
                    onClick={() => setActiveMood(m as Mood)}
                    className={`px-3 py-1.5 text-[10px] border transition-all duration-300 rounded-sm font-medium ${
                      activeMood === m 
                      ? 'bg-zinc-100 text-black border-zinc-100' 
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:bg-white/10'
                    } ${m === 'existential' && activeMood === m ? 'animate-pulse' : ''}`}
                  >
                    {TRANSLATIONS.moods[m]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-white/5 px-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 bg-black/40 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/40"></div>
          {TRANSLATIONS.systemStatus}
        </div>
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <span className="opacity-40">{TRANSLATIONS.session}:</span> 
            <span className="text-zinc-400">Anonym_#{(Math.random() * 9999).toFixed(0)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock size={10} />
            {TRANSLATIONS.uptime}
          </span>
        </div>
      </footer>

      {/* Posting Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosting(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl glass rounded-3xl p-10 relative z-10 border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-serif italic text-white mb-8 border-b border-white/10 pb-4">
                {TRANSLATIONS.postAnonymously}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const content = formData.get('content') as string;
                if (content.trim()) addPost(content, 'Anon');
              }}>
                <textarea 
                  name="content"
                  autoFocus
                  required
                  placeholder={TRANSLATIONS.placeholder}
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none font-display text-lg leading-relaxed mb-6"
                />
                <div className="flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsPosting(false)}
                    className="px-6 py-2 text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-[11px] uppercase tracking-widest"
                  >
                    {TRANSLATIONS.cancel}
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all duration-300 font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    {TRANSLATIONS.submit}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Room */}
      <ChatRoom isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
