import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { supabase, SUPABASE_ENABLED } from '../../lib/supabase'

export interface LoginTileUserInfo {
  email: string
  username: string
  id?: string
}

interface LoginTileProps {
  onAuth: (info: LoginTileUserInfo) => void
}

export const LoginTile: React.FC<LoginTileProps> = ({ onAuth }) => {
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
      const displayName = mode === 'signup' ? username : email.split('@')[0]
      onAuth({ email, username: displayName, id: `user-${Date.now()}` })
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(168,85,247,0.15)',
  }

  return (
    <motion.div
      className="glass-tile w-[380px]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-[2] px-6 py-8">
        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <p className="text-sm font-bold text-white font-display">
              {mode === 'login' ? 'Welcome Back' : 'Join SweepX'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' ? 'Sign in to track your impact' : 'Create your eco-warrior account'}
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
              className="mb-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-2xs text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Username (signup) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full h-10 pl-8 pr-3 rounded-lg text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-10 pl-8 pr-3 rounded-lg text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full h-10 pl-8 pr-9 rounded-lg text-xs text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-neo-p/40"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.15)'}
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="group relative w-full h-10 mt-1.5 rounded-lg font-display font-bold text-xs text-white overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white/[0.06] border border-white/10"
            whileTap={loading ? undefined : { scale: 0.97 }}
          >
            {loading ? (
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Loader2 size={14} className="animate-spin" />
              </span>
            ) : (
              <>
                {/* Label slides out */}
                <span className="relative z-10 flex items-center justify-center gap-1.5 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                </span>
                {/* Hover label slides in */}
                <span className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                  <ArrowRight size={13} />
                </span>
                {/* Growing blob */}
                <span className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-neo-v transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]" />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle */}
        <p className="text-center text-2xs text-slate-500 mt-4">
          {mode === 'login' ? 'New here?' : 'Have an account?'}
          {' '}
          <button
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-white font-bold hover:text-neo-p transition-colors"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </motion.div>
  )
}
