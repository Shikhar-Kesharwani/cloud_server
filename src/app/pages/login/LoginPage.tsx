import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluidBackground } from './FluidBackground';
import { AuthForm } from './AuthForm';

export function LoginPage() {
  const [focusField, setFocusField] = useState<'username' | 'password' | 'displayName' | null>(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* 3D Liquid Aurora Background */}
      <div className="absolute inset-0 z-0">
        <FluidBackground />
      </div>

      {/* Dynamic Vignette & Light leak */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${focusField === 'username' ? '30% 30%' : focusField === 'password' ? '70% 70%' : '50% 50%'}, rgba(99, 102, 241, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)
          `
        }}
      />

      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        {/* Logo Mark */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mb-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
          </div>
          <h2 className="text-white text-xl tracking-[0.2em] font-medium opacity-90 uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
            Nexus Cloud
          </h2>
        </motion.div>

        {/* Auth Form Container */}
        <AuthForm 
          onFocusChange={setFocusField} 
          onSuccess={() => {
            // Form handles success and redirects
          }} 
        />

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex gap-6 text-xs text-white/40 tracking-widest uppercase font-medium"
        >
          <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
          <a href="#" className="hover:text-white/80 transition-colors">Help</a>
        </motion.div>
      </div>
    </div>
  );
}
