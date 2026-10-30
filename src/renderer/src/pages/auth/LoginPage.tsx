import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Directly navigate to admin panel without any validation
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    login('admin', email || 'admin@pragatimilk.com');
    navigate('/admin');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none bg-gradient-to-b from-[#bfe3fa] via-[#dcf0fc] to-[#eef7fd]">
      {/* Decorative Cloud & Atmosphere Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/40 rounded-full blur-3xl pointer-events-none"
          style={{ width: '700px', height: '500px' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 pointer-events-none"
          style={{ width: '650px', height: '650px' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 pointer-events-none"
          style={{ width: '850px', height: '850px' }}
        />
        <div
          className="absolute -bottom-24 -left-20 bg-white/60 rounded-full blur-2xl"
          style={{ width: '450px', height: '300px' }}
        />
        <div
          className="absolute -bottom-20 -right-20 bg-white/70 rounded-full blur-2xl"
          style={{ width: '550px', height: '350px' }}
        />
      </div>

      {/* Center Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[2.5rem] bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(30,64,115,0.12)] p-8 sm:p-10 transition-all duration-300">
        
        {/* Top Floating Squircle Badge */}
        <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/80 flex items-center justify-center mx-auto -mt-2 mb-6 text-slate-800 transition-transform hover:scale-105">
          <LogIn className="w-6 h-6 text-slate-700 stroke-[2.2]" />
        </div>

        {/* Heading & Subtitle matching Reference Image 1 */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Sign in with email
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed px-2 font-normal">
            Make a new doc to bring your words, data, and teams together. For free
          </p>
        </div>

        {/* Login Form (No validations, direct entry on submit/click) */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="flex items-center gap-3 bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 border border-slate-200/60 rounded-xl px-4 py-3.5 transition-all">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 border border-slate-200/60 rounded-xl px-4 py-3.5 transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pr-1">
              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Primary Action Button (Immediately navigates to AdminLayout) */}
          <button
            type="submit"
            className="w-full bg-[#1e2025] hover:bg-[#111215] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 opacity-80" />
          </button>
        </form>

        {/* Or sign in with divider */}
        <div className="my-6 flex items-center justify-center gap-2">
          <div className="h-px flex-1 border-b border-dotted border-slate-300" />
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            Or sign in with
          </span>
          <div className="h-px flex-1 border-b border-dotted border-slate-300" />
        </div>

        {/* Social / Alternate Quick Sign-in Buttons (Also navigate to AdminLayout) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleLogin()}
            className="flex items-center justify-center py-2.5 px-4 bg-white/90 hover:bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleLogin()}
            className="flex items-center justify-center py-2.5 px-4 bg-white/90 hover:bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <svg
              className="w-4 h-4 text-[#1877F2] fill-current transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleLogin()}
            className="flex items-center justify-center py-2.5 px-4 bg-white/90 hover:bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <svg
              className="w-4 h-4 text-slate-900 fill-current transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-1 .04-2.14.65-2.8 1.41-.58.67-1.09 1.76-.95 2.83 1.11.09 2.16-.54 2.79-1.28" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
