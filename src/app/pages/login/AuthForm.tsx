import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

interface AuthFormProps {
  onFocusChange: (field: 'username' | 'password' | 'displayName' | null) => void;
  onSuccess: () => void;
}

const customEase = [0.22, 1, 0.36, 1];

export function AuthForm({ onFocusChange, onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const savedUsername = localStorage.getItem('nexus_remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (mode === 'register' && !displayName) return;
    
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { username, password } 
        : { username, password, displayName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (rememberMe) {
        localStorage.setItem('nexus_remembered_username', username);
      } else {
        localStorage.removeItem('nexus_remembered_username');
      }

      login(data.token, data.user);
      onSuccess();
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1, ease: customEase, duration: 0.8 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: customEase }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customEase } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative z-10 w-full max-w-md mx-auto sm:mx-0 p-8 sm:p-12 rounded-[32px] bg-white/[0.015] border border-white/[0.06] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{ backdropFilter: 'blur(40px) saturate(150%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute inset-0 rounded-[32px] pointer-events-none border border-white/[0.03] mix-blend-overlay" />
      
      <motion.div variants={itemVariants} className="mb-10 relative z-10 text-center">
        <h1 className="text-[2rem] font-medium tracking-tight text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          {mode === 'login' ? 'Welcome back' : 'Create Account'}
        </h1>
        <p className="text-white/40 text-sm font-light tracking-wide font-['Inter']">
          {mode === 'login' ? 'Enter your credentials to continue.' : 'Start your secure cloud workspace.'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10 font-['Inter']">
        <AnimatePresence mode="wait">
          {mode === 'register' && (
            <motion.div
              key="displayName"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative group"
            >
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onFocus={() => onFocusChange('displayName')}
                onBlur={() => onFocusChange(null)}
                className="peer w-full bg-black/20 border border-white/5 rounded-2xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
                placeholder="Full Name"
                required={mode === 'register'}
              />
              <label
                htmlFor="displayName"
                className="absolute left-5 top-5 text-xs font-medium text-white/30 transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/30 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-indigo-400 peer-focus:uppercase tracking-wider peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-wider"
              >
                Full Name
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="relative group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => onFocusChange('username')}
            onBlur={() => onFocusChange(null)}
            className="peer w-full bg-black/20 border border-white/5 rounded-2xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
            placeholder="Username"
            required
          />
          <label
            htmlFor="username"
            className="absolute left-5 top-5 text-xs font-medium text-white/30 transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/30 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-indigo-400 peer-focus:uppercase tracking-wider peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-wider"
          >
            Username
          </label>
        </motion.div>

        <motion.div variants={itemVariants} className="relative group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => onFocusChange('password')}
            onBlur={() => onFocusChange(null)}
            className="peer w-full bg-black/20 border border-white/5 rounded-2xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-indigo-500/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
            placeholder="Password"
            required
          />
          <label
            htmlFor="password"
            className="absolute left-5 top-5 text-xs font-medium text-white/30 transition-all duration-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/30 peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-indigo-400 peer-focus:uppercase tracking-wider peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-wider"
          >
            Password
          </label>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 rounded-md border border-white/10 bg-black/30 group-hover:border-white/30 transition-colors">
              <input 
                type="checkbox" 
                className="opacity-0 absolute inset-0 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {rememberMe && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-2 h-2 rounded-[3px] bg-indigo-400"
                />
              )}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors">Remember me</span>
          </label>
          
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-[11px] uppercase tracking-wider text-indigo-400/70 hover:text-indigo-300 transition-colors"
          >
            {mode === 'login' ? 'Create Account' : 'Back to Login'}
          </button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-red-400 text-xs text-center bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="pt-6">
          <MagneticButton
            type="submit"
            disabled={isLoading || !username || !password}
            isLoading={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3 tracking-wider uppercase text-[11px] font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3 tracking-wider uppercase text-[11px] font-bold">
                {mode === 'login' ? 'Sign In' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </MagneticButton>
        </motion.div>
      </form>
    </motion.div>
  );
}

function MagneticButton({ children, isLoading, ...props }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.15;
    const y = (clientY - (top + height / 2)) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      {...props}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full py-4 px-6 rounded-2xl text-white overflow-hidden transition-all duration-300 ${
        props.disabled ? 'bg-white/5 cursor-not-allowed text-white/30 border border-white/5' : 'bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]'
      }`}
    >
      <AnimatePresence>
        {(isHovered || isLoading) && !props.disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: customEase }}
            className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 mix-blend-screen blur-[8px]"
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
