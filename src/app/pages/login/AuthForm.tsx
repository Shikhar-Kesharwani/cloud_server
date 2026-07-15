import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

interface AuthFormProps {
  onFocusChange: (field: 'username' | 'password' | 'displayName' | null) => void;
  onSuccess: () => void;
}

const customEase = [0.22, 1, 0.36, 1]; // Premium cubic-bezier

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
      
      // Delay redirect to allow the 3D success animation to play
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: customEase }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customEase } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative z-10 w-full max-w-md mx-auto sm:mx-0 p-8 sm:p-10 rounded-[24px] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Subtle light leak gradient inside the card */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-0 rounded-[24px] pointer-events-none border border-white/5 mix-blend-overlay" />
      
      <motion.div variants={itemVariants} className="mb-8 relative z-10">
        <h1 className="text-4xl font-light tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-heading, "Inter", sans-serif)' }}>
          {mode === 'login' ? 'Welcome back' : 'Create Account'}
        </h1>
        <p className="text-white/50 text-sm font-light tracking-wide">
          {mode === 'login' ? 'Enter your credentials to access your workspace.' : 'Sign up for a new workspace account.'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'register' && (
            <motion.div
              key="displayName"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
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
                className="peer w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 group-hover:bg-white/[0.05]"
                placeholder="Full Name"
                required={mode === 'register'}
              />
              <label
                htmlFor="displayName"
                className="absolute left-4 top-4 text-xs font-medium text-white/40 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
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
            className="peer w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50 transition-all duration-300 group-hover:bg-white/[0.05]"
            placeholder="Username"
            required
          />
          <label
            htmlFor="username"
            className="absolute left-4 top-4 text-xs font-medium text-white/40 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
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
            className="peer w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:outline-none focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/50 transition-all duration-300 group-hover:bg-white/[0.05]"
            placeholder="Password"
            required
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-4 text-xs font-medium text-white/40 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:text-xs peer-focus:text-pink-400 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
          >
            Password
          </label>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-white/5 group-hover:border-white/40 transition-colors">
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
                  className="w-2 h-2 rounded-sm bg-indigo-400"
                />
              )}
            </div>
            <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">Remember me</span>
          </label>
          
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account?'}
          </button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="pt-2">
          <MagneticButton
            type="submit"
            disabled={isLoading || !username || !password}
            isLoading={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </MagneticButton>
        </motion.div>
      </form>
    </motion.div>
  );
}

// Micro-interaction: Magnetic Button
function MagneticButton({ children, isLoading, ...props }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2; // 20% magnetic pull
    const y = (clientY - (top + height / 2)) * 0.2;
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
      whileTap={{ scale: 0.96 }}
      className={`relative w-full py-3.5 px-4 rounded-xl font-medium text-sm text-white overflow-hidden transition-colors duration-300 ${
        props.disabled ? 'bg-white/10 cursor-not-allowed text-white/50' : 'bg-white/10 hover:bg-white/15'
      }`}
    >
      {/* Liquid morph background on hover/loading */}
      <AnimatePresence>
        {(isHovered || isLoading) && !props.disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: customEase }}
            className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 mix-blend-screen blur-md"
          />
        )}
      </AnimatePresence>
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
