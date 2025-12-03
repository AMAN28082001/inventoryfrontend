"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, CheckCircle2 } from "lucide-react"
import { authApi } from "@/lib/api"

interface ForgotPasswordModalProps {
  onClose: () => void
  onSuccess?: (resetToken?: string) => void // Optional callback with reset token
}

export default function ForgotPasswordModal({ onClose, onSuccess }: ForgotPasswordModalProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!username.trim()) {
        setError("Please enter your username")
        setIsLoading(false)
        return
      }

      const response = await authApi.forgotPassword(username.trim())
      setSuccess(true)
      // Store reset token if provided (for development/testing)
      if (response.resetToken) {
        setResetToken(response.resetToken)
      }
      if (onSuccess) {
        onSuccess(response.resetToken)
      }
    } catch (err: any) {
      console.error("Forgot password error:", err)
      let errorMessage = "Failed to process request. Please try again."
      
      if (err && typeof err.status === 'number') {
        const apiError = err.data?.error || err.message || ""
        if (err.status === 401) {
          errorMessage = apiError || "Account is inactive. Please contact administrator."
        } else if (err.status === 404) {
          // For security, don't reveal if user exists or not
          errorMessage = "If the username exists, a password reset token has been generated."
          setSuccess(true) // Still show success for security
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
            <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
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
                    Password reset token has been generated successfully!
                  </p>
                  {resetToken && (
                    <div className="mt-3 p-3 bg-slate-700 rounded border border-slate-600">
                      <p className="text-xs text-slate-300 mb-2">Reset Token (for testing):</p>
                      <p className="text-xs text-white font-mono break-all bg-slate-900 p-2 rounded">
                        {resetToken}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        In production, this token would be sent via email.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    Please check your email for the reset token. If you don't receive an email, please contact your administrator.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Close
                </Button>
                {resetToken && (
                  <Button
                    onClick={() => {
                      onClose()
                      // You can trigger reset password modal here if needed
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Reset Password
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-400 text-sm mb-4">
                Enter your username and we'll send you a password reset token.
              </p>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="forgot-username" className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  id="forgot-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="username"
                  required
                />
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
                  disabled={!username.trim() || isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Send Reset Token"
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

