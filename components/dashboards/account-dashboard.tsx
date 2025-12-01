"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, AlertCircle, UserCheck, UserX, Search, Filter } from "lucide-react"
import { usersApi } from "@/lib/api"
import type { User } from "@/lib/auth"

interface AccountDashboardProps {
  userName: string
}

export default function AccountDashboard({ userName }: AccountDashboardProps) {
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data: User[] = []
      
      // Try multiple approaches to fetch agents
      try {
        // First try: Use getAgents method (tries /users/agents endpoint)
        data = await usersApi.getAgents()
      } catch (err1: any) {
        try {
          // Second try: Get all users without role filter and filter on frontend
          const allUsers = await usersApi.getAll()
          data = allUsers.filter(user => user.role === "agent")
        } catch (err2: any) {
          try {
            // Third try: Get with role parameter
            data = await usersApi.getAll("agent")
          } catch (err3: any) {
            // If all fail, throw the most specific error
            throw err3
          }
        }
      }
      
      setAgents(data)
    } catch (err: any) {
      // Check if it's a permission error (403 or access denied message)
      const errorMsg = err.message || "Failed to fetch agents"
      // ApiClientError has a status property
      const statusCode = err.status || err.statusCode
      
      if (statusCode === 403 || statusCode === 401 || errorMsg.includes("Access denied") || errorMsg.includes("Insufficient permissions")) {
        setError("Access denied. Your account role does not have permission to view agents. Please contact your administrator to grant the necessary permissions to the account role.")
      } else {
        setError(errorMsg)
      }
      console.error("Error fetching agents:", { message: errorMsg, status: statusCode, error: err })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleApprove = async (agentId: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(agentId))
      setError(null)
      await usersApi.update(agentId, { is_active: true })
      await fetchAgents()
    } catch (err: any) {
      const errorMsg = err.message || "Failed to approve agent"
      const statusCode = err.status || err.statusCode
      
      if (statusCode === 403 || statusCode === 401 || errorMsg.includes("Access denied") || errorMsg.includes("Insufficient permissions")) {
        setError("Access denied. Your account role does not have permission to approve agents. Please contact your administrator.")
      } else {
        setError(errorMsg)
      }
      console.error("Error approving agent:", err)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(agentId)
        return next
      })
    }
  }

  const handleReject = async (agentId: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(agentId))
      setError(null)
      await usersApi.update(agentId, { is_active: false })
      await fetchAgents()
    } catch (err: any) {
      const errorMsg = err.message || "Failed to reject agent"
      const statusCode = err.status || err.statusCode
      
      if (statusCode === 403 || statusCode === 401 || errorMsg.includes("Access denied") || errorMsg.includes("Insufficient permissions")) {
        setError("Access denied. Your account role does not have permission to reject agents. Please contact your administrator.")
      } else {
        setError(errorMsg)
      }
      console.error("Error rejecting agent:", err)
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(agentId)
        return next
      })
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.username.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && agent.is_active === true) ||
      (statusFilter === "inactive" && agent.is_active === false)

    return matchesSearch && matchesStatus
  })

  const activeCount = agents.filter((a) => a.is_active === true).length
  const inactiveCount = agents.filter((a) => a.is_active === false).length
  const pendingCount = agents.filter((a) => a.is_active === undefined || a.is_active === null).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-400">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome, {userName}
        </h1>
        <p className="text-slate-400">Manage and approve agent accounts</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Agents</p>
              <p className="text-2xl font-bold text-white">{agents.length}</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Inactive</p>
              <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Inactive
            </Button>
          </div>
        </div>
      </Card>

      {/* Agents Table */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="overflow-x-auto">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No agents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Username</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => {
                    const isProcessing = processingIds.has(agent.id)
                    const isActive = agent.is_active === true
                    const isPending = agent.is_active === undefined || agent.is_active === null

                    return (
                      <tr
                        key={agent.id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{agent.name}</p>
                              <p className="text-xs text-slate-400">ID: {agent.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-300">{agent.username}</p>
                        </td>
                        <td className="py-4 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-400 text-sm">
                            {agent.created_at
                              ? new Date(agent.created_at).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {isPending ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(agent.id)}
                                  disabled={isProcessing}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(agent.id)}
                                  disabled={isProcessing}
                                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(agent.id)}
                                disabled={isProcessing}
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Deactivate
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(agent.id)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

