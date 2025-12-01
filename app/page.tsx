"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Loader2 } from "lucide-react"
import LoginPage from "@/components/auth/login-page"
import SuperAdminDashboard from "@/components/dashboards/super-admin-dashboard"
import AdminDashboard from "@/components/dashboards/admin-dashboard"
import AgentDashboard from "@/components/dashboards/agent-dashboard"
import AccountDashboard from "@/components/dashboards/account-dashboard"
import { authService } from "@/lib/auth"
import { authApi } from "@/lib/api"
import type { User } from "@/lib/auth"

export default function Home() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = authService.getToken()
        const storedUser = authService.getUser()
        
        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authApi.getCurrentUser()
            setLoggedInUser(currentUser)
            authService.setUser(currentUser) // Update stored user data
          } catch (error) {
            // Token is invalid, clear auth
            authService.clearAuth()
            setLoggedInUser(null)
          }
        } else {
          setLoggedInUser(null)
        }
      } catch (error) {
        authService.clearAuth()
        setLoggedInUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    authService.clearAuth()
    setLoggedInUser(null)
  }

  const handleLogin = (user: User, token: string) => {
    setLoggedInUser(user)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Chairbord Solar</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Inventory Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* User info */}
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{loggedInUser.name}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 capitalize hidden sm:block">{loggedInUser.role.replace("-", " ")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 md:px-4 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-2 sm:p-4 md:p-6">
        {loggedInUser.role === "super-admin" && <SuperAdminDashboard userName={loggedInUser.name} />}
        {loggedInUser.role === "admin" && <AdminDashboard userName={loggedInUser.name} />}
        {loggedInUser.role === "account" && <AccountDashboard userName={loggedInUser.name} />}
        {loggedInUser.role === "agent" && <AgentDashboard userName={loggedInUser.name} />}
      </main>
    </div>
  )
}
