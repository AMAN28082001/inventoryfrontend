"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sun, AlertCircle, Loader2 } from "lucide-react"
import { authApi } from "@/lib/api"
import { authService } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface LoginPageProps {
  onLogin: (user: User, token: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    console.log("API URL:", apiUrl)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password")
        setIsLoading(false)
        return
      }

      const response = await authApi.login({ username: username.trim(), password })
      
      // Store token and user data
      authService.setToken(response.token)
      authService.setUser(response.user)

      // Call onLogin callback with user and token
      onLogin(response.user, response.token)
    } catch (err: any) {
      console.error("Login error details:", {
        error: err,
        name: err?.name,
        message: err?.message,
        status: err?.status,
        data: err?.data,
        stack: err?.stack
      })
      
      let errorMessage = "Login failed. Please check your credentials."
      
      // Check if it's an ApiClientError by checking for status property
      if (err && typeof err.status === 'number') {
        // This is an ApiClientError
        if (err.status === 401) {
          errorMessage = err.data?.error || "Invalid username or password."
        } else if (err.status === 0 || err.message?.includes("Network error") || err.message?.includes("Failed to fetch")) {
          errorMessage = "Unable to connect to server. Please check if the API server is running at " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api")
        } else {
          errorMessage = err.data?.error || err.message || `Server error (${err.status}). Please try again.`
        }
      } else if (err instanceof Error) {
        // Standard Error object
        if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed to fetch")) {
          errorMessage = "Network error: Unable to connect to the server. Please check if the API server is running."
        } else {
          errorMessage = err.message || errorMessage
        }
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (err?.error) {
        errorMessage = err.error
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">SolarVault</h1>
          </div>
          <p className="text-slate-400">Solar Inventory Management System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={!username.trim() || !password.trim() || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
