import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CloudSync,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useNetwork } from '../../hooks/useNetwork'
import MilkDropsBackground from './MilkDropsBackground'
import Logo from '../../assets/images/logo/pragati-logo.jpg'
import softnet from '../../assets/images/s-powered-black.png'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { isOnline, verifyConnection } = useNetwork()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Plant Sync States
  const [showSyncInput, setShowSyncInput] = useState<boolean>(false)
  const [plantCode, setPlantCode] = useState<string>('')
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )
  const [hasUsers, setHasUsers] = useState<boolean>(false)
  const [checkingUsers, setCheckingUsers] = useState<boolean>(true)

  const checkUsersExist = async (): Promise<void> => {
    try {
      setCheckingUsers(true)
      const exists = await window.api.usersExist()
      const found = Boolean(exists)
      setHasUsers(found)
      setShowSyncInput(!found)
    } catch (error) {
      console.error('Failed to check usersExist:', error)
    } finally {
      setCheckingUsers(false)
    }
  }

  useEffect(() => {
    checkUsersExist()
  }, [])

  // 1. Triggered on "Submit" click: Opens Confirmation Popup
  const handleOpenConfirm = () => {
    const trimmed = plantCode.trim()
    if (!trimmed) {
      toast.warn('Please enter a valid Plant ID.')
      return
    }
    setSyncStatus(null)
    setShowConfirmModal(true)
  }

  // 2. Triggered when user confirms sync in the popup
  const handleConfirmSync = async () => {
    const trimmedPlant = plantCode.trim()
    // 1. Double check real internet reachability before initiating sync
    const hasNet = await verifyConnection()
    if (!hasNet) {
      toast.error('Cannot sync: No internet connection! Please check your network.')
      setShowConfirmModal(false)
      setSyncStatus({
        type: 'error',
        text: 'Offline: Internet connection is required to sync plant data.'
      })
      return
    }
    // 2. Internet is OK -> proceed with sync
    try {
      setIsSyncing(true)

      const res = await window.api.syncUser(trimmedPlant)
      if (res && res.success === 1) {
        const successMsg = res.message || 'User batch sync completed successfully'
        toast.success(successMsg)
        setSyncStatus({
          type: 'success',
          text: `${successMsg}${res.total !== undefined ? ` (Total: ${res.total})` : ''}`
        })
        setPlantCode('')
        setShowConfirmModal(false)
        const existsAfterSync = await window.api.usersExist()
        const foundAfterSync = Boolean(existsAfterSync)
        setHasUsers(foundAfterSync)
        if (foundAfterSync) {
          setTimeout(() => {
            setShowSyncInput(false)
            setSyncStatus(null)
          }, 1500)
        }
      } else {
        toast.error(res?.message || 'Sync failed from server.')
        setShowConfirmModal(false)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to sync users.')
      setShowConfirmModal(false)
    } finally {
      setIsSyncing(false)
    }
  }
  //3
  // Real login authentication
  const handleLogin = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault()
    if (!hasUsers) {
      toast.warn('Please sync plant users first.')
      return
    }
    const trimmedUser = username.trim()
    if (!trimmedUser || !password) {
      toast.warn('Please enter Username and Password.')
      return
    }
    try {
      setIsLoggingIn(true)
      const loggedUser = await login(trimmedUser, password)
      toast.success(`Welcome back, ${loggedUser.userName}!`)
      navigate('/admin')
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error?.message || 'Invalid username or password. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      <MilkDropsBackground />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Alert Icon */}
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Modal Heading & Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">Confirm Plant Sync</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-1">
                Make sure your plant id is correct and have internet connection to sync data.
              </p>
              <div className="py-1 px-3 bg-slate-100 rounded-lg inline-block text-xs font-semibold text-slate-700">
                Plant ID: <span className="text-slate-900 font-bold">{plantCode}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleConfirmSync}
                className="w-1/2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <span>Yes, Sync</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[2.5rem] bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(30,64,115,0.12)] p-8 sm:p-10 transition-all duration-300">
        <div className="flex justify-center items-center">
          <img src={Logo} alt="logo" className="w-30 rounded-b-md" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-7">
          <p className="text-xs text-slate-500 leading-relaxed px-2 font-normal">
            Make sure you have sync the user first
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* User Name Input */}
          {/* User Name Input */}
          <div
            className={`flex items-center gap-3 border border-slate-200/60 rounded-xl px-4 py-3.5 transition-all ${
              checkingUsers || !hasUsers
                ? 'bg-slate-200/70 opacity-60 cursor-not-allowed'
                : 'bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300'
            }`}
          >
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={username}
              disabled={checkingUsers || !hasUsers || isLoggingIn}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="UserName"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-3 border border-slate-200/60 rounded-xl px-4 py-3.5 transition-all ${
                checkingUsers || !hasUsers
                  ? 'bg-slate-200/70 opacity-60 cursor-not-allowed'
                  : 'bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300'
              }`}
            >
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={checkingUsers || !hasUsers || isLoggingIn}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={checkingUsers || !hasUsers || isLoggingIn}
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Sync Plant User Trigger or Expandable Input Field */}
            {!showSyncInput ? (
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  disabled={checkingUsers || hasUsers}
                  onClick={() => {
                    setShowSyncInput(true)
                    setSyncStatus(null)
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500"
                >
                  <CloudSync size={14} className="text-primary" />
                  <span>Sync Plant User !</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50/95 border border-slate-200 rounded-xl space-y-2 shadow-xs transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CloudSync size={14} className="text-primary" />
                    Sync Plant User
                  </span>
                  {hasUsers && (
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => {
                        setShowSyncInput(false)
                        setSyncStatus(null)
                      }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={plantCode}
                    disabled={isSyncing}
                    onChange={(e) => setPlantCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleOpenConfirm()
                      }
                    }}
                    placeholder="Plant Code (e.g. 1102)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    disabled={isSyncing || !plantCode.trim()}
                    onClick={handleOpenConfirm}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>Submit</span>
                  </button>
                </div>

                {/* Inline Status Message */}
                {syncStatus && (
                  <div
                    className={`text-[11px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${
                      syncStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {syncStatus.type === 'success' ? (
                      <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle size={13} className="shrink-0 text-rose-600" />
                    )}
                    <span className="truncate">{syncStatus.text}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#1e2025] hover:bg-[#111215] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="my-6 flex items-center justify-center gap-2">
          <a
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/80 hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors shadow-2xs"
            href="https://softnet.co.in/"
            target="_blank"
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              POWERED BY
            </span>
            <img alt="Softnet" className="h-4 object-contain" src={softnet} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
