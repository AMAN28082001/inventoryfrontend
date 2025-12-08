"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2, User } from "lucide-react"
import { authApi } from "@/lib/api"

interface ForgotPasswordModalProps {
  onClose: () => void
  onSuccess?: (token: string | null) => void // Optional callback with reset token
}

function ForgotPasswordModal({ onClose, onSuccess }: ForgotPasswordModalProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.forgotPassword(username.trim())
      setSuccess(true)
      
      // If the API returns a token (for development/testing), store it
      // In production, this would typically be sent via email
      if (response.token) {
        setResetToken(response.token)
      }
      
      // Call onSuccess with token if available
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.token || null)
        }, 1500)
      }
    } catch (err: any) {
      console.error("Forgot password error:", err)
      let errorMessage = "Failed to send reset link. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 404) {
          errorMessage = "Username not found. Please check and try again."
        } else if (err.status === 400) {
          errorMessage = apiError || "Invalid request. Please check your username."
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
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Forgot Password</h2>
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
                  <p className="text-sm sm:text-base text-green-400 font-medium">
                    Reset link sent successfully!
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    {resetToken 
                      ? `Reset token: ${resetToken} (for development only)`
                      : "Please check your email for password reset instructions."
                    }
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-xs sm:text-sm mb-4">
                Enter your username to receive a password reset link.
              </p>

              {error && (
                <div className="p-3 sm:p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!username.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
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

export default ForgotPasswordModal
