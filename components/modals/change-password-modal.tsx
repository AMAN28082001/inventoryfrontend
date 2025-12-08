"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess?: () => void // Optional callback after successful change
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!currentPassword.trim()) {
      setError("Current password is required")
      return
    }

    if (!newPassword.trim()) {
      setError("New password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error("Change password error:", err)
      let errorMessage = "Failed to change password. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Current password is incorrect"
        } else if (err.status === 400) {
          errorMessage = apiError || errorMessage
        } else {
          errorMessage = apiError || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-400 font-medium">
                    Password changed successfully!
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Your password has been updated. Please login again with your new password.
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your current password and choose a new password.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-new-password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="change-new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="change-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="change-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
