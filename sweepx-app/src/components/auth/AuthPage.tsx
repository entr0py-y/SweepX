import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { supabase, SUPABASE_ENABLED } from '../../lib/supabase'

// ── Animated purple ribbon blobs (background) ─────────────────────────────────
const BG_BLOBS = [
  { top: '-15%', left: '20%',  w: 700, h: 700, rotate: -20, gradient: 'rgba(124,58,237,0.35)', delay: 0 },
  { top: '25%',  left: '-12%', w: 550, h: 550, rotate: 30,  gradient: 'rgba(168,85,247,0.22)', delay: 0.4 },
  { top: '55%',  right: '-8%', w: 600, h: 600, rotate: -15, gradient: 'rgba(147,51,234,0.25)', delay: 0.8 },
  { top: '10%',  right: '5%',  w: 400, h: 400, rotate: 45,  gradient: 'rgba(139,92,246,0.18)', delay: 1.2 },
  { top: '75%',  left: '30%',  w: 500, h: 500, rotate: 10,  gradient: 'rgba(124,58,237,0.20)', delay: 0.6 },
]

export interface AuthUserInfo {
  email: string
  username: string
  id?: string
}

interface AuthPageProps {
  onAuth: (info: AuthUserInfo) => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (SUPABASE_ENABLED) {
        if (mode === 'login') {
          const { error: err } = await supabase.auth.signInWithPassword({ email, password })
          if (err) throw err
        } else {
          const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          })
          if (err) throw err
        }
      }
      // Success — proceed to dashboard
      const displayName = mode === 'signup' ? username : email.split('@')[0]
      onAuth({ email, username: displayName, id: `user-${Date.now()}` })
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'))
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: '#08080f' }}>

      {/* ── Animated purple ribbon blobs ── */}
      {BG_BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[40%_60%_55%_45%/45%_50%_50%_55%] pointer-events-none"
          style={{
            top: b.top, left: (b as any).left, right: (b as any).right,
            width: b.w, height: b.h,
            background: `radial-gradient(ellipse at 40% 40%, ${b.gradient}, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          initial={{ opacity: 0, rotate: b.rotate - 10, scale: 0.85 }}
          animate={{
            opacity: [0, 1, 0.8, 1],
            rotate: [b.rotate - 10, b.rotate, b.rotate + 5, b.rotate],
            scale: [0.85, 1, 1.05, 1],
          }}
          transition={{
            delay: b.delay,
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Noise grain overlay ── */}
      <div className="absolute inset-0 bg-hero-grain opacity-40 pointer-events-none" />

      {/* ── Glass Card ── */}
      <motion.div
        className="relative w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative rounded-[28px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(15,15,25,0.65) 50%, rgba(168,85,247,0.08) 100%)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            border: '1px solid rgba(168,85,247,0.18)',
            boxShadow: '0 8px 60px rgba(124,58,237,0.15), 0 1px 0 rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top highlight edge */}
          <div
            className="absolute inset-x-0 top-0 h-20 rounded-t-[28px] pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(168,85,247,0.08) 0%, transparent 100%)' }}
          />

          {/* Inner content */}
          <div className="relative px-8 py-10 sm:px-10 sm:py-12">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(168,85,247,0.15) 100%)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.2)',
                }}
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Zap size={28} className="text-neo-p fill-neo-p" />
              </motion.div>
              <h1 className="text-lg font-bold font-display text-white tracking-wide">
                Sweep<span className="text-neo-p">X</span>
              </h1>
            </div>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white font-display">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-slate-400 mt-1.5">
                  {mode === 'login'
                    ? 'Sign in to continue your eco-journey'
                    : 'Join 47,000+ eco-warriors today'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Username (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Username</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="eco_warrior"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(168,85,247,0.15)',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(168,85,247,0.15)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full h-12 pl-10 pr-11 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(168,85,247,0.15)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Forgot password (login only) */}
              {mode === 'login' && (
                <div className="text-right -mt-1">
                  <button type="button" className="text-2xs text-slate-500 hover:text-neo-p transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 mt-2 rounded-xl font-display font-bold text-sm text-white overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 60%, #a855f7 100%)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.35), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                  border: '1px solid rgba(168,85,247,0.3)',
                }}
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button top shine */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-xl"
                  style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 100%)' }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Login' : 'Sign Up'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Toggle */}
            <p className="text-center text-sm text-slate-500 mt-8">
              {mode === 'login' ? 'Are You New Member?' : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-white font-bold hover:text-neo-p transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
